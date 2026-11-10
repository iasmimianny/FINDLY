
import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.DJANGO_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000";

export async function POST(request: NextRequest) {
  try {
    const dados = await request.json();

    if (
      typeof dados.email !== "string" ||
      typeof dados.password !== "string" ||
      !dados.email.trim() ||
      !dados.password
    ) {
      return NextResponse.json(
        { detail: "Informe seu e-mail e sua senha." },
        { status: 400 }
      );
    }

    const resposta = await fetch(`${API_URL}/api/auth/login/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email: dados.email.trim(),
        password: dados.password,
      }),
      cache: "no-store",
    });

    const resultado = await resposta.json();

    if (!resposta.ok) {
      return NextResponse.json(
        {
          detail:
            resultado.detail ??
            "Não foi possível realizar o login.",
        },
        { status: resposta.status }
      );
    }

    if (!resultado.access || !resultado.refresh || !resultado.user) {
      return NextResponse.json(
        { detail: "Resposta de autenticação inválida." },
        { status: 502 }
      );
    }

    const response = NextResponse.json({
      detail: "Login realizado com sucesso.",
      user: resultado.user,
    });

    response.cookies.set("findly_access", resultado.access, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 30 * 60,
    });

    response.cookies.set("findly_refresh", resultado.refresh, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });

    return response;
  } catch {
    return NextResponse.json(
      { detail: "Não foi possível conectar ao servidor." },
      { status: 500 }
    );
  }
}
