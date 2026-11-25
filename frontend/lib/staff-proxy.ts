import { refreshSession } from "./session-refresh";
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
const idPattern = /^[1-9]\d*$/;

export function staffTarget(parts: string[], method: string) {
  if (method === "GET") {
    if (parts.length === 1 && parts[0] === "updates")
      return "/api/operations/claims/";

    if (parts.length === 1 && parts[0] === "items")
      return "/api/items/found/";

    if (
      parts.length === 2 &&
      parts[0] === "items" &&
      codePattern.test(parts[1])
    )
      return `/api/items/found/${parts[1]}/`;

    if (
      parts.length === 3 &&
      parts[0] === "items" &&
      codePattern.test(parts[1]) &&
      parts[2] === "history"
    )
      return `/api/items/found/${parts[1]}/history/`;

    if (
      parts.length === 3 &&
      parts[0] === "items" &&
      codePattern.test(parts[1]) &&
      parts[2] === "label"
    )
      return `/api/operations/items/found/${parts[1]}/label/`;

    if (parts.length === 1 && parts[0] === "claims")
      return "/api/operations/claims/";

    if (parts.length === 1 && parts[0] === "audit")
      return "/api/audit/";

    // Listar notificações internas.
    if (parts.length === 1 && parts[0] === "notifications")
      return "/api/notifications/";

    // Contar notificações não lidas.
    if (
      parts.length === 2 &&
      parts[0] === "notifications" &&
      parts[1] === "unread-count"
    )
      return "/api/notifications/unread-count/";
  }

  if (method === "POST") {
    if (
      parts.length === 3 &&
      parts[0] === "claims" &&
      idPattern.test(parts[1]) &&
      ["approve", "reject", "reissue"].includes(parts[2])
    )
      return `/api/operations/claims/${parts[1]}/${parts[2]}/`;

    if (parts.length === 1 && parts[0] === "withdrawal")
      return "/api/operations/withdrawals/confirm/";
  }

  if (method === "PATCH") {
    // Marcar todas as notificações como lidas.
    if (
      parts.length === 2 &&
      parts[0] === "notifications" &&
      parts[1] === "read-all"
    )
      return "/api/notifications/read-all/";

    // Marcar uma notificação específica como lida.
    if (
      parts.length === 3 &&
      parts[0] === "notifications" &&
      idPattern.test(parts[1]) &&
      parts[2] === "read"
    )
      return `/api/notifications/${parts[1]}/read/`;
  }

  return null;
}

export function validStaffInput(
  parts: string[],
  value: unknown
) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value)
  )
    return false;

  const data = value as Record<string, unknown>;

  // As operações de leitura não precisam receber campos.
  if (parts[0] === "notifications") {
    return Object.keys(data).length === 0;
  }

  if (parts[0] === "withdrawal")
    return (
      Object.keys(data).length === 1 &&
      typeof data.token === "string" &&
      data.token.trim().length > 0 &&
      data.token.length <= 255
    );

  return (
    Object.keys(data).every(
      (key) => key === "decision_note"
    ) &&
    (
      data.decision_note === undefined ||
      (
        typeof data.decision_note === "string" &&
        data.decision_note.length <= 4000
      )
    )
  );
}

export async function staffResponse(
  request: NextRequest,
  segments: string[] = []
) {
  const target = staffTarget(segments, request.method);

  if (!target)
    return NextResponse.json(
      { detail: "Operação não disponível." },
      { status: 404, headers }
    );

  const write = request.method !== "GET";

  if (
    write &&
    request.headers.get("origin") !== request.nextUrl.origin
  )
    return NextResponse.json(
      { detail: "Origem da solicitação inválida." },
      { status: 403, headers }
    );

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
    const access = request.cookies.get("findly_access")?.value;
    const refresh = request.cookies.get("findly_refresh")?.value;

    if (!access && !refresh)
      return NextResponse.json(
        { detail: "Entre na sua conta para continuar." },
        { status: 401, headers }
      );

    let body: string | undefined;

    if (write) {
      let data: unknown;

      try {
        // As notificações aceitam PATCH sem corpo ou com um objeto vazio.
        if (segments[0] === "notifications") {
          const rawBody = await request.text();

          data = rawBody.trim()
            ? JSON.parse(rawBody)
            : {};
        } else {
          data = await request.json();
        }
      } catch {
        return NextResponse.json(
          { detail: "Dados inválidos." },
          { status: 400, headers }
        );
      }

      if (!validStaffInput(segments, data))
        return NextResponse.json(
          { detail: "Confira os dados da operação." },
          { status: 400, headers }
        );

      body = JSON.stringify(data);
    }

    const params = new URLSearchParams();

    const keys =
      segments.length === 1
        ? segments[0] === "items"
          ? [
              "page",
              "search",
              "category",
              "status",
              "ordering",
            ]
          : segments[0] === "claims"
          ? [
              "page",
              "search",
              "status",
              "item",
              "ordering",
            ]
          : segments[0] === "notifications"
          ? ["page", "unread"]
          : [
              "page",
              "search",
              "item",
              "action",
              "collection_point",
              "date_from",
              "date_to",
              "ordering",
            ]
        : [];

    if (!write) {
      for (const key of keys) {
        const value = request.nextUrl.searchParams.get(key);

        if (value !== null) {
          params.set(key, value);
        }
      }
    }

    if (segments[0] === "updates") {
      for (const key of [...params.keys()]) {
        if (key !== "page") {
          params.delete(key);
        }
      }

      params.set("mine", "true");

      // The existing API supports ordering by creation time, not updated_at.
      params.set("ordering", "-created_at");
    }

    const url = `${API_URL}${target}${
      params.size ? `?${params}` : ""
    }`;

    const send = (token: string) =>
      fetch(url, {
        method: request.method,
        body,
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          ...(body
            ? { "Content-Type": "application/json" }
            : {}),
        },
        cache: "no-store",
        redirect: "error",
        signal: AbortSignal.timeout(15000),
      });

    let result = access
      ? await send(access)
      : undefined;

    if (!result || result.status === 401) {
      if (!refresh)
        return NextResponse.json(
          { detail: "Sua sessão expirou. Entre novamente." },
          { status: 401, headers }
        );

      const renewed = await refreshSession(API_URL, refresh);

      if ([400, 401, 403].includes(renewed.status))
        return NextResponse.json(
          { detail: "Sua sessão expirou. Entre novamente." },
          { status: 401, headers }
        );

      if (!renewed.ok)
        throw new Error("Session unavailable");

      const data = await renewed.json();

      if (
        typeof data.access !== "string" ||
        !data.access ||
        typeof data.refresh !== "string" ||
        !data.refresh
      )
        throw new Error("Invalid session");

      tokens = {
        access: data.access,
        refresh: data.refresh,
      };

      result = await send(tokens.access);
    }

    if (result.status >= 500)
      throw new Error("API unavailable");

    if (target.endsWith("/label/") && result.ok) {
      if (
        !result.headers
          .get("content-type")
          ?.startsWith("image/png")
      )
        throw new Error("Invalid label");

      return finish(
        new NextResponse(await result.arrayBuffer(), {
          headers: {
            ...headers,
            "Content-Type": "image/png",
            "Content-Disposition":
              `inline; filename="findly-${segments[1]}.png"`,
            "X-Content-Type-Options": "nosniff",
          },
        })
      );
    }

    const response = NextResponse.json(
      await result.json(),
      {
        status: result.status,
        headers,
      }
    );

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
            "Não foi possível confirmar a resposta do servidor. Atualize os dados antes de repetir uma operação.",
        },
        {
          status: 502,
          headers,
        }
      )
    );
  }
}