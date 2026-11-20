"use client";

import Link from "next/link";
import { User, MapPin } from "lucide-react";
import { NotificationDropdown } from "../NotificationCenter";
import { accountLinks } from "../../lib/navigation";
import { useStaff } from "./StaffContext";

export default function HeaderFuncionario() {
  const staff = useStaff();
  const state = staff?.state;
  const user = state?.status === "ready" ? state.user : null;
  const location = state?.status === "ready"
    ? state.user.role === "admin" ? "Administração dos pontos de coleta"
      : state.points.count === 0 ? "Nenhum ponto designado"
      : state.points.count === 1 ? state.points.results[0]?.name
      : `${state.points.count} pontos designados`
    : state?.status === "error" ? "Não foi possível consultar seu vínculo" : "Consultando seus pontos…";

  return <header className="flex min-h-[74px] shrink-0 flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-5 py-4 text-gray-900 sm:px-8">
    <div className="min-w-0"><h2 className="text-sm font-bold">{user?.role === "admin" ? "Administração" : "Área do funcionário"}</h2><p className="mt-1 flex items-center gap-1 text-xs text-gray-500"><MapPin size={12} className="shrink-0" aria-hidden="true" />{location}</p></div>
    <div className="flex min-w-0 items-center gap-3"><div className="hidden min-w-0 text-right sm:block"><p className="truncate text-sm font-bold">{user?.full_name || (state?.status === "loading" ? "Carregando conta…" : "Minha conta")}</p>{user && <p className="truncate text-xs text-gray-500">{user.email}</p>}</div><NotificationDropdown area="staff" /><Link href={accountLinks("staff").profile} aria-label="Meu perfil" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-900 hover:bg-gray-100"><User size={22} strokeWidth={2.5} aria-hidden="true" /></Link></div>
  </header>;
}
