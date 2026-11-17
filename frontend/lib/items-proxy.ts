import { NextRequest, NextResponse } from "next/server";

const API_URL = (
  process.env.DJANGO_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000"
).replace(/\/+$/, "");
const headers = { "Cache-Control": "private, no-store" };
const cookieOptions = {
  httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/",
} as const;

export function validItemPath(segments: string[], method: string) {
  if (segments.length === 1 && ["found", "lost"].includes(segments[0])) return ["GET", "POST"].includes(method);
  return method === "POST" && segments.length === 3 && segments[0] === "found"
    && /^[A-Z2-9]{10}$/.test(segments[1]) && segments[2] === "photos";
}

function upstream(path: string, access: string, body: BodyInit | undefined, contentType: string | null, method: string) {
  return fetch(`${API_URL}/api/items/${path}`, {
    method, body, headers: {
      Authorization: `Bearer ${access}`,
      ...(contentType ? { "Content-Type": contentType } : {}),
      Accept: "application/json",
    },
    cache: "no-store", redirect: "error", signal: AbortSignal.timeout(20000),
  });
}

export async function proxyItems(request: NextRequest, segments: string[]) {
  if (!validItemPath(segments, request.method)) {
    return NextResponse.json({ detail: "Rota não encontrada." }, { status: 404, headers });
  }
  if (request.method === "POST" && request.headers.get("origin") !== request.nextUrl.origin) {
    return NextResponse.json({ detail: "Origem da solicitação inválida." }, { status: 403, headers });
  }
  let tokens: { access: string; refresh: string } | undefined;
  const finish = (response: NextResponse) => {
    // Mesmo uma validação 400 precisa guardar o refresh rotacionado.
    if (tokens) {
      response.cookies.set("findly_access", tokens.access, { ...cookieOptions, maxAge: 30 * 60 });
      response.cookies.set("findly_refresh", tokens.refresh, { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 });
    }
    return response;
  };
  try {
    const refresh = request.cookies.get("findly_refresh")?.value;
    const access = request.cookies.get("findly_access")?.value;
    if (!access && !refresh) {
      return NextResponse.json({ detail: "Entre na sua conta para continuar." }, { status: 401, headers });
    }
    let body: BodyInit | undefined;
    let contentType: string | null = null;
    if (request.method === "POST") {
      if (segments.length === 3) {
        const data = await request.formData();
        const image = data.get("image");
        if (!(image instanceof File) || image.size > 5 * 1024 * 1024) {
          return NextResponse.json({ detail: "Envie uma foto de até 5 MB." }, { status: 400, headers });
        }
        const form = new FormData();
        form.set("image", image);
        body = form;
      } else {
        contentType = "application/json";
        try { body = JSON.stringify(await request.json()); }
        catch { return NextResponse.json({ detail: "Dados de cadastro inválidos." }, { status: 400, headers }); }
      }
    }
    const params = new URLSearchParams();
    for (const key of ["page", "search", "category", "status", "mine", "ordering"]) {
      const value = request.nextUrl.searchParams.get(key);
      if (value !== null) params.set(key, value);
    }
    const path = `${segments.join("/")}/${params.size ? `?${params}` : ""}`;
    let result = access ? await upstream(path, access, body, contentType, request.method) : undefined;
    if (!result || result.status === 401) {
      if (!refresh) return NextResponse.json({ detail: "Sua sessão expirou. Entre novamente." }, { status: 401, headers });
      const renewed = await fetch(`${API_URL}/api/auth/refresh/`, {
        method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ refresh }), cache: "no-store", redirect: "error", signal: AbortSignal.timeout(10000),
      });
      if ([400, 401, 403].includes(renewed.status)) {
        return NextResponse.json({ detail: "Sua sessão expirou. Entre novamente." }, { status: 401, headers });
      }
      if (!renewed.ok) throw new Error("Refresh indisponível");
      const data = await renewed.json();
      if (typeof data.access !== "string" || !data.access || typeof data.refresh !== "string" || !data.refresh) throw new Error("Refresh inválido");
      tokens = { access: data.access, refresh: data.refresh };
      result = await upstream(path, tokens.access, body, contentType, request.method);
    }
    if (result.status >= 500) throw new Error("API indisponível");
    const data = await result.json();
    const response = NextResponse.json(data, { status: result.status, headers });
    const retry = result.headers.get("retry-after");
    if (retry) response.headers.set("Retry-After", retry);
    return finish(response);
  } catch {
    return finish(NextResponse.json({ detail: "Não foi possível obter a resposta do servidor. Verifique sua conexão. Antes de repetir um cadastro, confira Meus itens." }, { status: 502, headers }));
  }
}
