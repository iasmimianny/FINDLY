// Tipos das solicitações de retirada.

export type RequestUpdate = {
  id: number;
  item: {
    public_code: string;
    title: string;
  };
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  decision_note: string;
  message: string;
  created_at: string;
  updated_at: string;
  withdrawal: {
    is_valid: boolean;
    used_at: string | null;
    expires_at: string;
  } | null;
};

export type UpdatePage = {
  count: number;
  results: RequestUpdate[];
  next: string | null;
  previous: string | null;
};

export function updateSummary(update: RequestUpdate) {
  if (update.withdrawal?.used_at) {
    return {
      title: "Retirada confirmada",
      text: `A retirada de ${update.item.title} foi registrada.`,
      date: update.withdrawal.used_at,
    };
  }

  if (update.status === "APPROVED") {
    return {
      title: update.withdrawal?.is_valid
        ? "Pedido aprovado"
        : "Autorização indisponível",

      text: update.withdrawal?.is_valid
        ? `Seu pedido para ${update.item.title} foi aprovado. Consulte o e-mail com a autorização de retirada.`
        : `Seu pedido para ${update.item.title} foi aprovado, mas a autorização não está válida. Procure o ponto de coleta.`,

      date: update.updated_at,
    };
  }

  const statuses = {
    PENDING: ["Pedido enviado", "está aguardando análise"],
    REJECTED: ["Pedido recusado", "foi recusado"],
    CANCELLED: ["Pedido cancelado", "foi cancelado"],
  } as const;

  const [title, detail] = statuses[update.status] ?? [
    "Pedido atualizado",
    "foi atualizado",
  ];

  return {
    title,
    text: `Seu pedido para ${update.item.title} ${detail}.`,
    date: update.updated_at,
  };
}

export function validUpdates(
  value: unknown
): value is UpdatePage {
  if (!value || typeof value !== "object") return false;

  const data = value as UpdatePage;

  return (
    Number.isInteger(data.count) &&
    data.count >= 0 &&
    Array.isArray(data.results) &&
    data.results.every(
      (entry) =>
        entry &&
        Number.isInteger(entry.id) &&
        typeof entry.item?.title === "string" &&
        typeof entry.item?.public_code === "string" &&
        ["PENDING", "APPROVED", "REJECTED", "CANCELLED"].includes(
          entry.status
        ) &&
        typeof entry.updated_at === "string"
    )
  );
}

// ======================================================
// NOTIFICAÇÕES INTERNAS
// ======================================================

export type Notification = {
  id: number;
  kind: string;
  title: string;
  message: string;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
};

export type NotificationPage = {
  count: number;
  results: Notification[];
  next: string | null;
  previous: string | null;
};

export type UnreadCount = {
  count: number;
};

// Validar uma notificação recebida do backend.

export function validNotification(
  value: unknown
): value is Notification {
  if (!value || typeof value !== "object") return false;

  const data = value as Notification;

  return (
    Number.isInteger(data.id) &&
    data.id > 0 &&
    typeof data.kind === "string" &&
    typeof data.title === "string" &&
    typeof data.message === "string" &&
    typeof data.is_read === "boolean" &&
    typeof data.created_at === "string" &&
    (
      data.read_at === null ||
      typeof data.read_at === "string"
    )
  );
}

// Validar a resposta paginada.

export function validNotifications(
  value: unknown
): value is NotificationPage {
  if (!value || typeof value !== "object") return false;

  const data = value as NotificationPage;

  return (
    Number.isInteger(data.count) &&
    data.count >= 0 &&
    Array.isArray(data.results) &&
    data.results.every(validNotification) &&
    (data.next === null || typeof data.next === "string") &&
    (data.previous === null ||
      typeof data.previous === "string")
  );
}

// Padronizar as informações exibidas no sininho.

export function notificationSummary(
  notification: Notification
) {
  return {
    title: notification.title,
    text: notification.message,
    date: notification.created_at,
  };
}

// Buscar as notificações do usuário autenticado.

export async function getNotifications(
  page = 1,
  unreadOnly = false
): Promise<NotificationPage> {
  const params = new URLSearchParams({
    page: String(page),
  });

  if (unreadOnly) {
    params.set("unread", "true");
  }

  const response = await fetch(
    `/api/notifications/?${params.toString()}`,
    {
      method: "GET",
      cache: "no-store",
      credentials: "same-origin",
    }
  );

  if (!response.ok) {
    throw new Error("Não foi possível carregar as notificações.");
  }

  const data: unknown = await response.json();

  if (!validNotifications(data)) {
    throw new Error("Resposta de notificações inválida.");
  }

  return data;
}

// Buscar a quantidade de notificações não lidas.

export async function getUnreadCount(): Promise<number> {
  const response = await fetch(
    "/api/notifications/unread-count/",
    {
      method: "GET",
      cache: "no-store",
      credentials: "same-origin",
    }
  );

  if (!response.ok) {
    throw new Error(
      "Não foi possível consultar as notificações não lidas."
    );
  }

  const data = (await response.json()) as UnreadCount;

  if (!data || !Number.isInteger(data.count) || data.count < 0) {
    throw new Error("Contador de notificações inválido.");
  }

  return data.count;
}

// Marcar uma notificação como lida.

export async function markNotificationAsRead(
  id: number
): Promise<void> {
  if (!Number.isInteger(id) || id <= 0) {
    throw new Error("Identificador de notificação inválido.");
  }

  const response = await fetch(
    `/api/notifications/${id}/read/`,
    {
      method: "PATCH",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Não foi possível marcar a notificação como lida."
    );
  }
}

// Marcar todas as notificações como lidas.

export async function markAllNotificationsAsRead(): Promise<void> {
  const response = await fetch(
    "/api/notifications/read-all/",
    {
      method: "PATCH",
      credentials: "same-origin",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    }
  );

  if (!response.ok) {
    throw new Error(
      "Não foi possível marcar todas as notificações como lidas."
    );
  }
}