import { refreshSession } from "./session-refresh";
import { NextRequest, NextResponse } from "next/server";
import type { DashboardRecord, DashboardSummary } from "./dashboard";
import type { Item, ItemPage, ItemKind } from "./items";

const API_URL = (
  process.env.DJANGO_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");
const headers = { "Cache-Control": "private, no-store" };
const cookieOptions = {
  httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/",
} as const;

class DashboardError extends Error {
  constructor(public status: number) { super("Dashboard API error"); }
}

type PointPage = { count: number; results: { id: number; name: string; address: string; opening_hours: string }[] };

function checkPage<T extends { count: number; results: unknown[] }>(data: T): T {
  if (!data || !Number.isInteger(data.count) || data.count < 0 || !Array.isArray(data.results)) throw new DashboardError(502);
  return data;
}

function recentRecords(found: Item[], lost: Item[]): DashboardRecord[] {
  const map = (items: Item[], kind: ItemKind): DashboardRecord[] => items.map((item) => ({
    kind, public_code: item.public_code, title: item.title,
    category: item.category_display, status: item.status_display,
    location: item.found_location ?? item.lost_location ?? "",
    occurred_at: item.found_at ?? item.lost_at ?? "", created_at: item.created_at,
  }));
  return [...map(found, "found"), ...map(lost, "lost")]
    .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
    .slice(0, 6);
}

export async function dashboardResponse(request: NextRequest) {
  let access = request.cookies.get("findly_access")?.value;
  const refresh = request.cookies.get("findly_refresh")?.value;
  let renewed: { access: string; refresh: string } | undefined;
  const finish = (response: NextResponse) => {
    if (renewed) {
      response.cookies.set("findly_access", renewed.access, { ...cookieOptions, maxAge: 30 * 60 });
      response.cookies.set("findly_refresh", renewed.refresh, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 });
    }
    return response;
  };

  async function get<T>(path: string): Promise<T> {
    if (!access) throw new DashboardError(401);
    const response = await fetch(`${API_URL}${path}`, {
      headers: { Authorization: `Bearer ${access}`, Accept: "application/json" },
      cache: "no-store", redirect: "error", signal: AbortSignal.timeout(12000),
    });
    if (!response.ok) throw new DashboardError(response.status);
    return response.json();
  }

  async function summary(): Promise<DashboardSummary> {
    // Validate the session before requesting independent read-only summaries.
    const user = await get<{ full_name: string }>("/api/users/me/");
    if (typeof user.full_name !== "string") throw new DashboardError(502);
    const pointsRequest = get<PointPage>("/api/operations/points/?is_active=true&ordering=name")
      .then(checkPage)
      .catch((error) => {
        if (error instanceof DashboardError && error.status === 401) throw error;
        return null;
      });
    const [found, lost, openLost, returnedFound, points] = await Promise.all([
      get<ItemPage>("/api/items/found/?mine=true&ordering=-created_at").then(checkPage),
      get<ItemPage>("/api/items/lost/?mine=true&ordering=-created_at").then(checkPage),
      get<ItemPage>("/api/items/lost/?mine=true&status=ABERTO").then(checkPage),
      get<ItemPage>("/api/items/found/?mine=true&status=DEVOLVIDO").then(checkPage),
      pointsRequest,
    ]);
    return {
      user: { full_name: user.full_name },
      counts: { found: found.count, lost: lost.count, openLost: openLost.count, returnedFound: returnedFound.count },
      recent: recentRecords(found.results, lost.results),
      points: points ? {
        count: points.count,
        results: points.results.slice(0, 3).map(({ id, name, address, opening_hours }) => ({ id, name, address, opening_hours })),
      } : null,
    };
  }

  try {
    let data: DashboardSummary;
    try { data = await summary(); }
    catch (error) {
      if (!(error instanceof DashboardError) || error.status !== 401 || !refresh) throw error;
      const response = await refreshSession(API_URL, refresh);
      if ([400, 401, 403].includes(response.status)) throw new DashboardError(401);
      if (!response.ok) throw new DashboardError(502);
      const tokens = await response.json();
      if (typeof tokens.access !== "string" || !tokens.access || typeof tokens.refresh !== "string" || !tokens.refresh) throw new DashboardError(502);
      renewed = { access: tokens.access, refresh: tokens.refresh };
      access = renewed.access;
      data = await summary();
    }
    return finish(NextResponse.json(data, { headers }));
  } catch (error) {
    const status = error instanceof DashboardError && [401, 403, 429].includes(error.status) ? error.status : 502;
    const detail = status === 401 ? "Sua sessão expirou. Entre novamente."
      : status === 403 ? "Não foi possível acessar os dados desta conta."
      : status === 429 ? "Muitas consultas. Aguarde um pouco e tente novamente."
      : "Não foi possível carregar seu painel. Tente novamente em instantes.";
    return finish(NextResponse.json({ detail }, { status, headers }));
  }
}
