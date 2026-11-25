import { NextRequest, NextResponse } from "next/server";

const API_URL = (process.env.DJANGO_API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/, "");
const headers = { "Cache-Control": "private, no-store" };
export async function POST(request: NextRequest) {
  if (request.headers.get("origin") !== request.nextUrl.origin) return NextResponse.json({ detail: "Origem da solicitação inválida." }, { status: 403, headers });
  let body;
  try { body = await request.json(); } catch { return NextResponse.json({ detail: "Link de verificação inválido." }, { status: 400, headers }); }
  if (!body || typeof body.uid !== "string" || !/^[A-Za-z0-9_-]{1,128}$/.test(body.uid) || typeof body.token !== "string" || !/^[A-Za-z0-9_-]{1,256}$/.test(body.token)) return NextResponse.json({ detail: "Link de verificação inválido ou incompleto." }, { status: 400, headers });
  try {
    const response = await fetch(`${API_URL}/api/auth/verify-email/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ uid: body.uid, token: body.token }), cache: "no-store", redirect: "error", signal: AbortSignal.timeout(15000) });
    if (response.status >= 500) throw new Error("API indisponível");
    const data = await response.json();
    const result = NextResponse.json(data, { status: response.status, headers });
    const retry = response.headers.get("retry-after");
    if (retry) result.headers.set("Retry-After", retry);
    return result;
  } catch { return NextResponse.json({ detail: "Não foi possível confirmar o e-mail agora. Tente abrir o link novamente mais tarde." }, { status: 502, headers }); }
}
