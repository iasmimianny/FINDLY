export type Profile = {
  id: number | string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  is_active: boolean;
  date_joined: string;
};

export class ProfileApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
    this.name = "ProfileApiError";
  }
}

export async function readProfileResponse(response: Response): Promise<Profile> {
  let data: unknown;
  try { data = await response.json(); }
  catch { throw new ProfileApiError("O servidor não respondeu corretamente. Tente novamente.", response.status); }
  const body = data && typeof data === "object" ? data as Record<string, unknown> : {};
  if (!response.ok) {
    if (response.status === 401) throw new ProfileApiError("Sua sessão expirou. Entre novamente para continuar.", 401);
    const messages = Object.entries({ full_name: "Nome completo", phone: "Telefone" }).flatMap(([field, label]) => {
      const value = body[field];
      const text = typeof value === "string" ? value : Array.isArray(value) ? value.filter((v) => typeof v === "string").join(" ") : "";
      return text ? [`${label}: ${text}`] : [];
    });
    throw new ProfileApiError(messages.join(" ") || (typeof body.detail === "string" ? body.detail : "Não foi possível concluir a solicitação."), response.status);
  }
  if (typeof body.full_name !== "string" || typeof body.email !== "string" || typeof body.phone !== "string") {
    throw new ProfileApiError("Não foi possível confirmar os dados da conta. Recarregue a página.", 502);
  }
  return body as Profile;
}
