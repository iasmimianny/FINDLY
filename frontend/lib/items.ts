export type ItemKind = "found" | "lost";

export const categories = [
  ["eletronicos", "Eletrônicos"],
  ["documentos", "Documentos"],
  ["vestuario", "Vestuário e acessórios"],
  ["chaves", "Chaves"],
  ["carteiras", "Carteiras e bolsas"],
  ["moveis", "Móveis e utensílios"],
  ["outros", "Outros"],
] as const;

export const statuses = {
  found: [
    ["REPORTADO", "Reportado"],
    ["EM_CUSTODIA", "Em custódia"],
    ["AGUARDANDO_RETIRADA", "Aguardando retirada"],
    ["DEVOLVIDO", "Devolvido"],
    ["EXPIRADO", "Expirado"],
    ["ENCAMINHADO", "Encaminhado"],
  ],
  lost: [
    ["ABERTO", "Aberto"],
    ["ENCONTRADO", "Encontrado"],
    ["CANCELADO", "Cancelado"],
    ["EXPIRADO", "Expirado"],
  ],
} as const;

export type ItemPhoto = {
  id: number;
  image: string;
};

export type ItemUser = {
  id: number;
  full_name: string;
};

export type Item = {
  id: number;
  public_code: string;
  title: string;
  description: string;
  category: string;
  category_display: string;
  status: string;
  status_display: string;
  reported_by?: ItemUser;
  owner?: ItemUser;
  found_at?: string;
  lost_at?: string;
  found_location?: string;
  lost_location?: string;
  contact_note?: string;
  photos?: ItemPhoto[];
  created_at: string;
};

export function muralActions(item: Item, kind: ItemKind, viewerId?: number | string) {
  const author = kind === "lost" ? item.owner : item.reported_by;
  const identified = viewerId !== undefined && viewerId !== null && author?.id != null;
  const own = identified && String(author.id) === String(viewerId);
  return {
    own,
    canReportFound: identified && !own && kind === "lost" && item.status === "ABERTO",
    canRequestClaim: identified && !own && kind === "found" && item.status === "EM_CUSTODIA",
  };
}

export type ItemPage = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Item[];
};

export type ItemQuery = {
  kind: ItemKind;
  search: string;
  category: string;
  status: string;
  page: number;
  mine: boolean;
};

// Autorização de retirada gerada após a aprovação.
export type Withdrawal = {
  id: number;
  token: string;
  expires_at: string;
  used_at: string | null;
  is_valid: boolean;
  qr_image: string | null;
  created_at: string;
};

// Solicitação de retirada.
export type Claim = {
  id: number;
  item: {
    id: number;
    public_code: string;
    title: string;
    status: string;
  };
  claimant: ItemUser;
  status: string;
  status_display: string;
  message: string;
  decision_note: string;
  reviewed_by: ItemUser | null;
  reviewed_at: string | null;
  withdrawal: Withdrawal | null;
  created_at: string;
  updated_at: string;
};

export type ClaimPage = {
  count: number;
  next: string | null;
  previous: string | null;
  results: Claim[];
};

export class ItemApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "ItemApiError";
  }
}

const fieldLabels: Record<string, string> = {
  title: "Nome",
  description: "Descrição",
  category: "Categoria",
  found_at: "Data",
  lost_at: "Data",
  found_location: "Local",
  lost_location: "Local",
  image: "Foto",
  contact_note: "Contato",
  message: "Comprovação de propriedade",
  non_field_errors: "Registro",
};

export async function readItemResponse<T>(
  response: Response
): Promise<T> {
  let data: unknown;

  try {
    data = await response.json();
  } catch {
    throw new ItemApiError(
      "O servidor não respondeu corretamente. Tente novamente.",
      response.status
    );
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new ItemApiError(
        "Sua sessão expirou. Entre novamente para continuar.",
        401
      );
    }

    const body =
      data && typeof data === "object"
        ? (data as Record<string, unknown>)
        : {};

    const detail =
      typeof body.detail === "string"
        ? body.detail
        : undefined;

    const fields = Object.entries(body).flatMap(
      ([key, value]) => {
        if (key === "detail") return [];

        const messages = Array.isArray(value)
          ? value
              .filter((v) => typeof v === "string")
              .join(" ")
          : typeof value === "string"
          ? value
          : "";

        return messages
          ? [`${fieldLabels[key] ?? key}: ${messages}`]
          : [];
      }
    );

    throw new ItemApiError(
      detail ||
        fields.join(" ") ||
        "Não foi possível concluir a solicitação.",
      response.status
    );
  }

  return data as T;
}

export function itemListPath(query: ItemQuery) {
  const params = new URLSearchParams({
    page: String(query.page),
    ordering: "-created_at",
  });

  if (query.mine) params.set("mine", "true");

  if (query.search.trim()) {
    params.set("search", query.search.trim());
  }

  if (query.category) {
    params.set("category", query.category);
  }

  if (query.status) {
    params.set("status", query.status);
  }

  return `/api/items/${query.kind}/?${params}`;
}

export function itemDate(value?: string) {
  if (!value) return "Data não informada";

  const date = new Date(value);

  return Number.isNaN(date.getTime())
    ? "Data não informada"
    : date.toLocaleDateString("pt-BR");
}

export function occurrenceDate(value: string) {
  const date = new Date(`${value}T00:00:00`);

  if (Number.isNaN(date.getTime())) {
    throw new Error("Informe uma data válida.");
  }

  return date.toISOString();
}

export function photoError(file: File) {
  if (!/\.(jpe?g|png|webp)$/i.test(file.name)) {
    return "Envie fotos JPG, PNG ou WebP.";
  }

  if (file.size > 5 * 1024 * 1024) {
    return "Cada foto deve ter no máximo 5 MB.";
  }

  return "";
}

export async function uploadItemPhoto(
  code: string,
  file: File
) {
  const error = photoError(file);

  if (error) throw new Error(error);

  const body = new FormData();

  body.set("image", file);

  return readItemResponse<ItemPhoto>(
    await fetch(
      `/api/items/found/${encodeURIComponent(code)}/photos/`,
      {
        method: "POST",
        body,
        credentials: "same-origin",
        cache: "no-store",
      }
    )
  );
}

// Enviar uma solicitação de retirada.
export async function createClaim(
  code: string,
  message: string
) {
  const description = message.trim();

  if (!description) {
    throw new Error(
      "Informe características que comprovem que o objeto pertence a você."
    );
  }

  return readItemResponse<Claim>(
    await fetch(
      `/api/items/found/${encodeURIComponent(code)}/claims/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: description,
        }),
        credentials: "same-origin",
        cache: "no-store",
      }
    )
  );
}

// Consultar as solicitações do usuário.
export async function getMyClaims(
  page = 1,
  signal?: AbortSignal
) {
  const params = new URLSearchParams({
    page: String(page),
  });

  return readItemResponse<ClaimPage>(
    await fetch(`/api/items/claims/?${params}`, {
      method: "GET",
      credentials: "same-origin",
      cache: "no-store",
      signal,
    })
  );
}

// Registrar um objeto encontrado.
export async function createFoundItem(data: {
  title: string;
  description: string;
  category: string;
  found_at: string;
  found_location: string;
}) {
  return readItemResponse<Item>(
    await fetch("/api/items/found/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
      credentials: "same-origin",
      cache: "no-store",
    })
  );
}