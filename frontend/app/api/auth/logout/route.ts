import { NextResponse, type NextRequest } from "next/server";

const API_URL = (
  process.env.DJANGO_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000"
).replace(/\/+$/, "");
const headers = { "Cache-Control": "private, no-store" };

function postToDjango(path: string, refresh: string, access?: string) {
  return fetch(`${API_URL}/api/auth/${path}/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(access ? { Authorization: `Bearer ${access}` } : {}),
    },
    body: JSON.stringify({ refresh }),
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(5000),
  });
}

async function revoke(refresh: string, access?: string) {
  if (access) {
    const result = await postToDjango("logout", refresh, access);
    if (result.status !== 401) return result.ok;
  }

  // Django exige um access válido e invalida o refresh antigo ao renová-lo.
  const result = await postToDjango("refresh", refresh);
  if (result.status === 401) return true;
  if (!result.ok) return false;

  const tokens = await result.json();
  if (
    typeof tokens?.access !== "string" || !tokens.access ||
    typeof tokens?.refresh !== "string" || !tokens.refresh
  ) return false;

  return (await postToDjango("logout", tokens.refresh, tokens.access)).ok;
}

export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) {
    return new NextResponse("Origem da solicitação inválida.", { status: 403, headers });
  }

  const access = request.cookies.get("findly_access")?.value;
  const refresh = request.cookies.get("findly_refresh")?.value;
  let revoked = !refresh;
  if (refresh) {
    try {
      revoked = await revoke(refresh, access);
    } catch {
      revoked = false;
    }
  }

  const response = revoked
    ? NextResponse.redirect(new URL("/login", request.url), { status: 303, headers })
    : new NextResponse(
        '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><title>Encerrar sessão</title><p>Você saiu deste navegador, mas o servidor não confirmou a invalidação da sessão.</p><a href="/login">Ir para o login</a></html>',
        { status: 503, headers: { ...headers, "Content-Type": "text/html; charset=utf-8" } },
      );

  for (const name of ["findly_access", "findly_refresh"]) {
    response.cookies.set(name, "", {
      path: "/",
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    });
  }
  return response;
}
