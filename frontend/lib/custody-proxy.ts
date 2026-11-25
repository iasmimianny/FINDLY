import { refreshSession } from "./session-refresh";
import { NextRequest, NextResponse } from "next/server";

const API_URL = (process.env.DJANGO_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/, "");
const headers = { "Cache-Control": "private, no-store" };
const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" } as const;

export function custodyTarget(segments: string[], method: string) {
  if (!/^[A-Z2-9]{10}$/.test(segments[0] ?? "")) return null;
  if (segments.length === 1 && method === "GET") return `/api/operations/items/found/${segments[0]}/custody/`;
  if (segments.length === 2 && segments[1] === "transfer" && method === "POST") return `/api/operations/items/found/${segments[0]}/custody/transfer/`;
  return null;
}
export function validCustodyInput(data: unknown) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return false;
  const input = data as Record<string, unknown>;
  return Object.keys(input).every((key) => ["collection_point", "note"].includes(key))
    && typeof input.collection_point === "number" && Number.isSafeInteger(input.collection_point) && input.collection_point > 0
    && (input.note === undefined || (typeof input.note === "string" && input.note.length <= 255));
}

export async function custodyResponse(request: NextRequest, segments: string[] = []) {
  const target = custodyTarget(segments, request.method);
  if (!target) return NextResponse.json({ detail: "Operação não disponível." }, { status: 404, headers });
  const write = request.method !== "GET";
  if (write && request.headers.get("origin") !== request.nextUrl.origin) return NextResponse.json({ detail: "Origem da solicitação inválida." }, { status: 403, headers });
  let tokens: { access: string; refresh: string } | undefined;
  const finish = (response: NextResponse) => {
    if (tokens) {
      response.cookies.set("findly_access", tokens.access, { ...cookieOptions, maxAge: 30 * 60 });
      response.cookies.set("findly_refresh", tokens.refresh, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 });
    }
    return response;
  };
  try {
    const access = request.cookies.get("findly_access")?.value;
    const refresh = request.cookies.get("findly_refresh")?.value;
    if (!access && !refresh) return NextResponse.json({ detail: "Entre na sua conta para continuar." }, { status: 401, headers });
    let body: string | undefined;
    if (write) {
      let data: unknown;
      try { data = await request.json(); } catch { return NextResponse.json({ detail: "Dados inválidos." }, { status: 400, headers }); }
      if (!validCustodyInput(data)) return NextResponse.json({ detail: "Confira o ponto de coleta e a observação." }, { status: 400, headers });
      body = JSON.stringify(data);
    }
    const url = `${API_URL}${target}`;
    const send = (token: string) => fetch(url, {
      method: request.method, body, headers: { Authorization: `Bearer ${token}`, Accept: "application/json", ...(body ? { "Content-Type": "application/json" } : {}) },
      cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15000),
    });
    let result = access ? await send(access) : undefined;
    if (!result || result.status === 401) {
      if (!refresh) return NextResponse.json({ detail: "Sua sessão expirou. Entre novamente." }, { status: 401, headers });
      const renewed = await refreshSession(API_URL, refresh);
      if ([400, 401, 403].includes(renewed.status)) return NextResponse.json({ detail: "Sua sessão expirou. Entre novamente." }, { status: 401, headers });
      if (!renewed.ok) throw new Error("Session unavailable");
      const data = await renewed.json();
      if (typeof data.access !== "string" || !data.access || typeof data.refresh !== "string" || !data.refresh) throw new Error("Invalid session");
      tokens = { access: data.access, refresh: data.refresh };
      result = await send(tokens.access);
    }
    if (result.status >= 500) throw new Error("API unavailable");
    const response = NextResponse.json(await result.json(), { status: result.status, headers });
    const retry = result.headers.get("retry-after");
    if (retry) response.headers.set("Retry-After", retry);
    return finish(response);
  } catch {
    return finish(NextResponse.json({ detail: "Não foi possível confirmar a resposta do servidor. Consulte novamente a custódia do item antes de repetir o recebimento." }, { status: 502, headers }));
  }
}
