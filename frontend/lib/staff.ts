import { pointsJson, type CollectionPoint, type Page } from "./collection-points";
import { ProfileApiError, readProfileResponse, type Profile } from "./profile";

export type StaffAssignment = { user: Profile; points: Page<CollectionPoint> };

export function loginDestination(role?: string) {
  return role === "operator" || role === "admin" ? "/funcionario/pontos-coleta" : "/dashboard";
}

export function assignmentPath(user: Pick<Profile, "id" | "role">) {
  if (user.role !== "operator" && user.role !== "admin") throw new ProfileApiError("Esta área é exclusiva de funcionários e administradores.", 403);
  const params = new URLSearchParams({ ordering: "name", page: "1" });
  if (user.role === "operator") {
    const id = String(user.id);
    if (!/^[1-9]\d*$/.test(id)) throw new ProfileApiError("Não foi possível identificar sua conta.", 502);
    params.set("operator", id);
  }
  return `/api/collection-points/?${params}`;
}

export async function loadStaffAssignment(signal?: AbortSignal): Promise<StaffAssignment> {
  // Read identity before querying assignments; never take an employee id from a URL or storage.
  const user = await readProfileResponse(await fetch("/api/account/me/", { signal, cache: "no-store", credentials: "same-origin" }));
  const points = await pointsJson<Page<CollectionPoint>>(await fetch(assignmentPath(user), { signal, cache: "no-store", credentials: "same-origin" }));
  if (!Number.isInteger(points?.count) || points.count < 0 || !Array.isArray(points.results)
    || points.count < points.results.length || (points.count > 0 && points.results.length === 0)) throw new ProfileApiError("Não foi possível confirmar os pontos designados.", 502);
  if (user.role === "operator" && points.results.some((point) => !Array.isArray(point.operators) || !point.operators.includes(Number(user.id)))) {
    throw new ProfileApiError("A consulta retornou um ponto sem vínculo com sua conta. Tente novamente.", 502);
  }
  return { user, points };
}
