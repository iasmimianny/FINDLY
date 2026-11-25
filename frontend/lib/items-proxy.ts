import { NextRequest, NextResponse } from "next/server";

const API_URL = (
  process.env.DJANGO_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000"
).replace(/\/+$/, "");

const headers = {
  "Cache-Control": "private, no-store",
};

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
} as const;

const codePattern = /^[A-Z2-9]{10}$/;

export function validItemPath(
  segments: string[],
  method: string
) {
  // Listagem e cadastro de itens.
  if (
    segments.length === 1 &&
    ["found", "lost"].includes(segments[0])
  ) {
    return ["GET", "POST"].includes(method);
  }

  // Listagem das solicitações de retirada.
  if (
    segments.length === 1 &&
    segments[0] === "claims"
  ) {
    return method === "GET";
  }

  if (
    segments.length === 3 &&
    segments[0] === "found" &&
    codePattern.test(segments[1])
  ) {
    // Upload de fotos.
    if (segments[2] === "photos") {
      return method === "POST";
    }

    // Solicitações de retirada de um item.
    if (segments[2] === "claims") {
      return ["GET", "POST"].includes(method);
    }
  }

  return false;
}

function itemTarget(segments: string[]) {
  // Solicitações de retirada.
  if (
    segments.length === 1 &&
    segments[0] === "claims"
  ) {
    return "/api/operations/claims/";
  }

  // Solicitações relacionadas a um objeto encontrado.
  if (
    segments.length === 3 &&
    segments[0] === "found" &&
    segments[2] === "claims"
  ) {
    return `/api/operations/items/found/${segments[1]}/claims/`;
  }

  // Rotas originais de itens.
  return `/api/items/${segments.join("/")}/`;
}

function upstream(
  path: string,
  access: string,
  body: BodyInit | undefined,
  contentType: string | null,
  method: string
) {
  return fetch(`${API_URL}${path}`, {
    method,
    body,
    headers: {
      Authorization: `Bearer ${access}`,
      ...(contentType
        ? { "Content-Type": contentType }
        : {}),
      Accept: "application/json",
    },
    cache: "no-store",
    redirect: "error",
    signal: AbortSignal.timeout(20000),
  });
}

export async function proxyItems(
  request: NextRequest,
  segments: string[]
) {
  if (!validItemPath(segments, request.method)) {
    return NextResponse.json(
      { detail: "Rota não encontrada." },
      { status: 404, headers }
    );
  }

  if (
    request.method === "POST" &&
    request.headers.get("origin") !==
      request.nextUrl.origin
  ) {
    return NextResponse.json(
      { detail: "Origem da solicitação inválida." },
      { status: 403, headers }
    );
  }

  let tokens:
    | { access: string; refresh: string }
    | undefined;

  const finish = (response: NextResponse) => {
    if (tokens) {
      response.cookies.set(
        "findly_access",
        tokens.access,
        {
          ...cookieOptions,
          maxAge: 30 * 60,
        }
      );

      response.cookies.set(
        "findly_refresh",
        tokens.refresh,
        {
          ...cookieOptions,
          maxAge: 7 * 24 * 60 * 60,
        }
      );
    }

    return response;
  };

  try {
    const refresh =
      request.cookies.get("findly_refresh")?.value;

    const access =
      request.cookies.get("findly_access")?.value;

    if (!access && !refresh) {
      return NextResponse.json(
        {
          detail: "Entre na sua conta para continuar.",
        },
        { status: 401, headers }
      );
    }

    let body: BodyInit | undefined;
    let contentType: string | null = null;

    if (request.method === "POST") {
      // Upload de fotos.
      if (
        segments.length === 3 &&
        segments[2] === "photos"
      ) {
        const data = await request.formData();
        const image = data.get("image");

        if (
          !(image instanceof File) ||
          image.size > 5 * 1024 * 1024
        ) {
          return NextResponse.json(
            { detail: "Envie uma foto de até 5 MB." },
            { status: 400, headers }
          );
        }

        const form = new FormData();

        form.set("image", image);

        body = form;
      } else {
        contentType = "application/json";

        try {
          const data = await request.json();

          // Validação da solicitação de retirada.
          if (
            segments.length === 3 &&
            segments[2] === "claims"
          ) {
            if (
              !data ||
              typeof data.message !== "string" ||
              !data.message.trim() ||
              data.message.trim().length > 4000
            ) {
              return NextResponse.json(
                {
                  detail:
                    "Informe características que comprovem a propriedade do objeto, com até 4000 caracteres.",
                },
                { status: 400, headers }
              );
            }

            body = JSON.stringify({
              message: data.message.trim(),
            });
          } else {
            // Cadastro normal dos itens.
            body = JSON.stringify(data);
          }
        } catch {
          return NextResponse.json(
            {
              detail: "Dados da solicitação inválidos.",
            },
            { status: 400, headers }
          );
        }
      }
    }

    const params = new URLSearchParams();

    const isClaimRoute = segments.includes("claims");

    const allowedParams = isClaimRoute
      ? ["page", "search", "status", "ordering"]
      : [
          "page",
          "search",
          "category",
          "status",
          "mine",
          "ordering",
        ];

    for (const key of allowedParams) {
      const value =
        request.nextUrl.searchParams.get(key);

      if (value !== null) {
        params.set(key, value);
      }
    }

    if (isClaimRoute && request.method === "GET") {
      params.set("ordering", "-created_at");
      params.set("mine", "true");
    }

    const target = itemTarget(segments);

    const path = `${target}${
      params.size ? `?${params}` : ""
    }`;

    let result = access
      ? await upstream(
          path,
          access,
          body,
          contentType,
          request.method
        )
      : undefined;

    if (!result || result.status === 401) {
      if (!refresh) {
        return NextResponse.json(
          {
            detail:
              "Sua sessão expirou. Entre novamente.",
          },
          { status: 401, headers }
        );
      }

      const renewed = await fetch(
        `${API_URL}/api/auth/refresh/`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({ refresh }),
          cache: "no-store",
          redirect: "error",
          signal: AbortSignal.timeout(10000),
        }
      );

      if ([400, 401, 403].includes(renewed.status)) {
        return NextResponse.json(
          {
            detail:
              "Sua sessão expirou. Entre novamente.",
          },
          { status: 401, headers }
        );
      }

      if (!renewed.ok) {
        throw new Error("Refresh indisponível");
      }

      const data = await renewed.json();

      if (
        typeof data.access !== "string" ||
        !data.access ||
        typeof data.refresh !== "string" ||
        !data.refresh
      ) {
        throw new Error("Refresh inválido");
      }

      tokens = {
        access: data.access,
        refresh: data.refresh,
      };

      result = await upstream(
        path,
        tokens.access,
        body,
        contentType,
        request.method
      );
    }

    if (result.status >= 500) {
      throw new Error("API indisponível");
    }

    const data = await result.json();

    const response = NextResponse.json(data, {
      status: result.status,
      headers,
    });

    const retry = result.headers.get("retry-after");

    if (retry) {
      response.headers.set("Retry-After", retry);
    }

    return finish(response);
  } catch {
    return finish(
      NextResponse.json(
        {
          detail:
            "Não foi possível obter a resposta do servidor. Verifique sua conexão e consulte seus registros antes de repetir a operação.",
        },
        { status: 502, headers }
      )
    );
  }
}