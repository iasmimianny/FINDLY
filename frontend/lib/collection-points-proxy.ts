import { NextRequest, NextResponse } from "next/server";

const API_URL = (process.env.DJANGO_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/, "");
const headers = { "Cache-Control": "private, no-store" };
const cookieOptions = { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/" } as const;

export function pointTarget(segments: string[], method: string) {
  if (!segments.length && ["GET", "POST"].includes(method)) return "/api/operations/points/";
  if (segments.length === 1 && /^[1-9]\d*$/.test(segments[0]) && ["GET", "PUT", "PATCH"].includes(method)) return `/api/operations/points/${segments[0]}/`;
  if (segments.length === 1 && segments[0] === "operators" && method === "GET") return "/api/users/";
  return null;
}

export function validPointInput(data: unknown) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return false;
  const entries = Object.entries(data);
  return entries.length > 0 && entries.every(([key, value]) => {
    if (["name", "address", "opening_hours"].includes(key)) return typeof value === "string";
    if (key === "is_active") return typeof value === "boolean";
    if (key === "capacity") return value === null || (typeof value === "number" && Number.isInteger(value) && value >= 0);
    if (key === "operators") return Array.isArray(value) && value.every((id) => typeof id === "number" && Number.isInteger(id) && id > 0);
    return false;
  });
}

export async function collectionPointsResponse(request: NextRequest, segments: string[] = []) {
  const target = pointTarget(segments, request.method);
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
      if (!validPointInput(data)) return NextResponse.json({ detail: "Confira os campos do ponto de coleta." }, { status: 400, headers });
      body = JSON.stringify(data);
    }
    const params = new URLSearchParams();
    if (target === "/api/users/") {
      const role = request.nextUrl.searchParams.get("role") ?? "operator";
      if (!["operator", "admin"].includes(role)) return NextResponse.json({ detail: "Selecione operadores ou administradores." }, { status: 400, headers });
      params.set("role", role);
      params.set("ordering", "full_name");
      for (const key of ["page", "search"]) { const value = request.nextUrl.searchParams.get(key); if (value !== null) params.set(key, value); }
    } else if (!segments.length && !write) {
      for (const key of ["page", "search", "is_active", "has_capacity", "operator", "ordering"]) {
        const value = request.nextUrl.searchParams.get(key); if (value !== null) params.set(key, value);
      }
    }
    const url = `${API_URL}${target}${params.size ? `?${params}` : ""}`;
    const send = (token: string) => fetch(url, {
      method: request.method, body, headers: { Authorization: `Bearer ${token}`, Accept: "application/json", ...(body ? { "Content-Type": "application/json" } : {}) },
      cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15000),
    });
    let result = access ? await send(access) : undefined;
    if (!result || result.status === 401) {
      if (!refresh) return NextResponse.json({ detail: "Sua sessão expirou. Entre novamente." }, { status: 401, headers });
      const renewed = await fetch(`${API_URL}/api/auth/refresh/`, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ refresh }),
        cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10000),
      });
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
    return finish(NextResponse.json({ detail: "Não foi possível confirmar a resposta do servidor. Antes de repetir um cadastro, consulte a lista de pontos." }, { status: 502, headers }));
  }
}
