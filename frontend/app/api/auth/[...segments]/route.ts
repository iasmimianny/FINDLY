import { NextResponse, type NextRequest } from "next/server";

const backend = (process.env.DJANGO_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/, "");
const allowed = new Set(["register", "resend-verification", "password-reset", "password-reset/confirm"]);
const headers = { "Cache-Control": "no-store" };

export async function POST(request: NextRequest, context: { params: Promise<{ segments: string[] }> }) {
  const { segments } = await context.params;
  const operation = segments.join("/");
  if (!allowed.has(operation) || !segments.every((segment) => /^[a-z-]+$/.test(segment))) {
    return NextResponse.json({ detail: "Rota não encontrada." }, { status: 404, headers });
  }
  if (request.headers.get("origin") !== request.nextUrl.origin) {
    return NextResponse.json({ detail: "Origem inválida." }, { status: 403, headers });
  }

  let data: unknown;
  try {
    data = await request.json();
  } catch {
    return NextResponse.json({ detail: "Dados inválidos." }, { status: 400, headers });
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    return NextResponse.json({ detail: "Dados inválidos." }, { status: 400, headers });
  }

  try {
    const upstream = await fetch(`${backend}/api/auth/${operation}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      cache: "no-store",
      redirect: "error",
      signal: AbortSignal.timeout(15000),
    });
    const retryAfter = upstream.headers.get("retry-after");
    return NextResponse.json(await upstream.json(), {
      status: upstream.status,
      headers: retryAfter ? { ...headers, "Retry-After": retryAfter } : headers,
    });
  } catch {
    return NextResponse.json({ detail: "O serviço de conta está indisponível. Tente novamente." }, { status: 502, headers });
  }
}
