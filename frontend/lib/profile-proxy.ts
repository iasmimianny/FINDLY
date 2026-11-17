import { NextRequest, NextResponse } from "next/server";
import type { Profile } from "./profile";

const API_URL = (
  process.env.DJANGO_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");
const headers = { "Cache-Control": "private, no-store" };
const cookieOptions = {
  httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/",
} as const;

function publicProfile(data: Profile): Profile {
  if (!data || !["number", "string"].includes(typeof data.id)
    || typeof data.full_name !== "string" || typeof data.email !== "string"
    || typeof data.phone !== "string" || typeof data.role !== "string"
    || typeof data.is_active !== "boolean" || typeof data.date_joined !== "string") {
    throw new Error("Invalid profile response");
  }
  const { id, full_name, email, phone, role, is_active, date_joined } = data;
  return { id, full_name, email, phone, role, is_active, date_joined };
}

export async function profileResponse(request: NextRequest) {
  if (!["GET", "PATCH"].includes(request.method)) {
    return NextResponse.json({ detail: "Operação não permitida." }, { status: 405, headers });
  }
  if (request.method === "PATCH" && request.headers.get("origin") !== request.nextUrl.origin) {
    return NextResponse.json({ detail: "Origem da solicitação inválida." }, { status: 403, headers });
  }
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
    if (!access && !refresh) {
      return NextResponse.json({ detail: "Entre na sua conta para continuar." }, { status: 401, headers });
    }
    let body: string | undefined;
    if (request.method === "PATCH") {
      let data: unknown;
      try { data = await request.json(); }
      catch { return NextResponse.json({ detail: "Os dados enviados são inválidos." }, { status: 400, headers }); }
      if (!data || typeof data !== "object" || Array.isArray(data)) {
        return NextResponse.json({ detail: "Os dados enviados são inválidos." }, { status: 400, headers });
      }
      const entries = Object.entries(data);
      if (!entries.length || entries.some(([key, value]) => !["full_name", "phone"].includes(key) || typeof value !== "string")) {
        return NextResponse.json({ detail: "Informe apenas nome completo e telefone." }, { status: 400, headers });
      }
      body = JSON.stringify(Object.fromEntries(entries.map(([key, value]) => [key, (value as string).trim()])));
    }
    const send = (token: string) => fetch(`${API_URL}/api/users/me/`, {
      method: request.method, body,
      headers: { Authorization: `Bearer ${token}`, Accept: "application/json", ...(body ? { "Content-Type": "application/json" } : {}) },
      cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15000),
    });
    let result = access ? await send(access) : undefined;
    if (!result || result.status === 401) {
      if (!refresh) return NextResponse.json({ detail: "Sua sessão expirou. Entre novamente." }, { status: 401, headers });
      const renewed = await fetch(`${API_URL}/api/auth/refresh/`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refresh }),
        cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10000),
      });
      if ([400, 401, 403].includes(renewed.status)) {
        return NextResponse.json({ detail: "Sua sessão expirou. Entre novamente." }, { status: 401, headers });
      }
      if (!renewed.ok) throw new Error("Session unavailable");
      const data = await renewed.json();
      if (typeof data.access !== "string" || !data.access || typeof data.refresh !== "string" || !data.refresh) throw new Error("Invalid session");
      tokens = { access: data.access, refresh: data.refresh };
      result = await send(tokens.access);
    }
    if (result.status >= 500) throw new Error("Profile unavailable");
    const data = await result.json();
    const response = NextResponse.json(result.ok ? publicProfile(data) : data, { status: result.status, headers });
    const retry = result.headers.get("retry-after");
    if (retry) response.headers.set("Retry-After", retry);
    return finish(response);
  } catch {
    return finish(NextResponse.json({ detail: "Não foi possível confirmar os dados no servidor. Tente novamente ou recarregue a página." }, { status: 502, headers }));
  }
}
