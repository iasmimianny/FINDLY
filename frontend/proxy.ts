import { NextResponse, type NextRequest } from "next/server";

const API_URL = (
  process.env.DJANGO_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000"
).replace(/\/+$/, "");

const responseHeaders = { "Cache-Control": "private, no-store" };
const fetchOptions = { cache: "no-store", redirect: "error" } as const;
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
} as const;

function validate(access: string) {
  return fetch(`${API_URL}/api/users/me/`, {
    ...fetchOptions,
    headers: { Authorization: `Bearer ${access}` },
    signal: AbortSignal.timeout(5000),
  });
}

function rejected(status: number) {
  return status === 401 || status === 403;
}

export async function proxy(request: NextRequest) {
  const login = () =>
    NextResponse.redirect(new URL("/login", request.url), {
      status: 303,
      headers: responseHeaders,
    });

  const unavailable = () =>
    new NextResponse("NÃ£o foi possÃ­vel validar a sessÃ£o. Tente novamente.", {
      status: 503,
      headers: responseHeaders,
    });

  try {
    const access = request.cookies.get("findly_access")?.value;
    let session = access ? await validate(access) : undefined;
    let renewed: { access: string; refresh: string } | undefined;

    if (!session || rejected(session.status)) {
      const refresh = request.cookies.get("findly_refresh")?.value;
      if (!refresh) return login();

      const response = await fetch(`${API_URL}/api/auth/refresh/`, {
        ...fetchOptions,
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
        signal: AbortSignal.timeout(5000),
      });
      if (rejected(response.status) || response.status === 400) return login();
      if (response.status !== 200) return unavailable();

      const tokens = await response.json();
      if (
        typeof tokens?.access !== "string" || !tokens.access ||
        typeof tokens?.refresh !== "string" || !tokens.refresh
      ) return unavailable();

      renewed = { access: tokens.access, refresh: tokens.refresh };
      session = await validate(renewed.access);
    }

    if (rejected(session.status)) return login();
    if (session.status !== 200) return unavailable();

    const { pathname } = request.nextUrl;
    let response = NextResponse.next({ headers: responseHeaders });
    if (pathname === "/funcionario" || pathname.startsWith("/funcionario/")) {
      const { role } = await session.json();
      if (role !== "operator" && role !== "admin") {
        response = new NextResponse("Acesso restrito a funcionÃ¡rios.", {
          status: 403,
          headers: responseHeaders,
        });
      }
    }

    if (renewed) {
      response.cookies.set("findly_access", renewed.access, {
        ...cookieOptions,
        maxAge: 30 * 60,
      });
      response.cookies.set("findly_refresh", renewed.refresh, {
        ...cookieOptions,
        maxAge: 7 * 24 * 60 * 60,
      });
    }

    return response;
  } catch {
    return unavailable();
  }
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/perfil/:path*",
    "/configuracao/:path*",
    "/meus-itens/:path*",
    "/itens-favoritos/:path*",
    "/itens-perdidos/:path*",
    "/cadastrar-item/:path*",
    "/cadastro-itens-perdidos/:path*",
    "/funcionario/:path*",
  ],
};
