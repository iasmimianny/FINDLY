export type Responsible = { id: number; full_name: string };
export type CollectionPoint = {
  id: number;
  name: string;
  address: string;
  opening_hours: string;
  capacity: number | null;
  occupancy: number;
  has_capacity: boolean;
  is_active: boolean;
  operators: number[];
  operators_display: Responsible[];
  created_at: string;
  updated_at: string;
};
export type ResponsibleOption = Responsible & { email: string; role: string; is_active: boolean };
export type Page<T> = { count: number; results: T[]; next: string | null; previous: string | null };
export type PointQuery = { search: string; active: string; capacity: boolean; operator: string; ordering: string; page: number };
export type PointInput = Pick<CollectionPoint, "name" | "address" | "opening_hours" | "capacity" | "is_active" | "operators">;

export class PointsError extends Error {
  constructor(message: string, public status: number) { super(message); this.name = "PointsError"; }
}

export async function pointsJson<T>(response: Response): Promise<T> {
  let body: unknown;
  try { body = await response.json(); }
  catch { throw new PointsError("O servidor não respondeu corretamente. Tente novamente.", response.status); }
  if (!response.ok) {
    if (response.status === 401) throw new PointsError("Sua sessão expirou. Entre novamente.", 401);
    const data = body && typeof body === "object" ? body as Record<string, unknown> : {};
    const fields: Record<string, string> = { name: "Nome", address: "Endereço", opening_hours: "Horários", capacity: "Capacidade", operators: "Responsáveis", is_active: "Situação", non_field_errors: "Ponto de coleta" };
    const messages = Object.entries(fields).flatMap(([key, label]) => {
      const value = data[key];
      const text = typeof value === "string" ? value : Array.isArray(value) ? value.filter((v) => typeof v === "string").join(" ") : "";
      return text ? [`${label}: ${text}`] : [];
    });
    throw new PointsError(messages.join(" ") || (typeof data.detail === "string" ? data.detail : "Não foi possível concluir a solicitação."), response.status);
  }
  return body as T;
}

export function pointsPath(query: PointQuery) {
  const params = new URLSearchParams({ page: String(query.page), ordering: query.ordering });
  if (query.search.trim()) params.set("search", query.search.trim());
  if (query.active !== "") params.set("is_active", query.active);
  if (query.capacity) params.set("has_capacity", "true");
  if (query.operator) params.set("operator", query.operator);
  return `/api/collection-points/?${params}`;
}

export function capacityLabel(point: Pick<CollectionPoint, "capacity" | "occupancy">) {
  return point.capacity === null ? `${point.occupancy} itens · Capacidade sem limite` : `${point.occupancy} de ${point.capacity} vagas ocupadas`;
}
