export type RequestUpdate = {
  id: number;
  item: { public_code: string; title: string };
  status: "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";
  decision_note: string;
  message: string;
  created_at: string;
  updated_at: string;
  withdrawal: { is_valid: boolean; used_at: string | null; expires_at: string } | null;
};
export type UpdatePage = { count: number; results: RequestUpdate[]; next: string | null; previous: string | null };
export function updateSummary(update: RequestUpdate) {
  if (update.withdrawal?.used_at) return { title: "Retirada confirmada", text: `A retirada de ${update.item.title} foi registrada.`, date: update.withdrawal.used_at };
  if (update.status === "APPROVED") return { title: update.withdrawal?.is_valid ? "Pedido aprovado" : "Autorização indisponível", text: update.withdrawal?.is_valid ? `Seu pedido para ${update.item.title} foi aprovado. Consulte o e-mail com a autorização de retirada.` : `Seu pedido para ${update.item.title} foi aprovado, mas a autorização não está válida. Procure o ponto de coleta.`, date: update.updated_at };
  const statuses = { PENDING: ["Pedido enviado", "está aguardando análise"], REJECTED: ["Pedido recusado", "foi recusado"], CANCELLED: ["Pedido cancelado", "foi cancelado"] } as const;
  const [title, detail] = statuses[update.status] ?? ["Pedido atualizado", "foi atualizado"];
  return { title, text: `Seu pedido para ${update.item.title} ${detail}.`, date: update.updated_at };
}
export function validUpdates(value: unknown): value is UpdatePage {
  if (!value || typeof value !== "object") return false;
  const data = value as UpdatePage;
  return Number.isInteger(data.count) && data.count >= 0 && Array.isArray(data.results) && data.results.every((entry) => entry && Number.isInteger(entry.id) && typeof entry.item?.title === "string" && typeof entry.item?.public_code === "string" && ["PENDING", "APPROVED", "REJECTED", "CANCELLED"].includes(entry.status) && typeof entry.updated_at === "string");
}
