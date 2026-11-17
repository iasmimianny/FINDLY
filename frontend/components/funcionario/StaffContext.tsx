"use client";

import { finishLoadingCycle } from "../../lib/loading-cycle";
import Link from "next/link";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { MapPin, RefreshCw } from "lucide-react";
import { loadStaffAssignment, type StaffAssignment } from "../../lib/staff";

type StaffState = { status: "loading" } | { status: "error"; error: Error } | ({ status: "ready" } & StaffAssignment);
type StaffContextValue = { state: StaffState; reload: () => void };
const StaffContext = createContext<StaffContextValue | null>(null);

export function useStaff() { return useContext(StaffContext); }

export function StaffProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<StaffState>({ status: "loading" });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      const startedAt = performance.now();
      try {
        const data = await loadStaffAssignment(controller.signal);
        await finishLoadingCycle(startedAt, controller.signal);
        if (!controller.signal.aborted) setState({ status: "ready", ...data });
      } catch (reason) {
        if (!controller.signal.aborted) setState({ status: "error", error: reason instanceof Error ? reason : new Error("Não foi possível consultar sua conta.") });
      }
    }
    void load();
    return () => controller.abort();
  }, [attempt]);
  function reload() { setState({ status: "loading" }); setAttempt((value) => value + 1); }
  return <StaffContext value={{ state, reload }}>{children}</StaffContext>;
}

export function StaffPointSummary() {
  const staff = useStaff();
  if (!staff) return null;
  const { state } = staff;
  return <div className="mb-5 mt-8 rounded-2xl border border-gray-800 bg-[#1e2022] p-4">
    <div className="mb-2 flex items-center gap-2 text-sm font-bold"><MapPin size={18} className="shrink-0 text-blue-400" aria-hidden="true" />
      {state.status === "loading" ? "Consultando seus pontos…" : state.status === "error" ? "Vínculo indisponível" : state.user.role === "admin" ? "Administração dos pontos" : state.points.count === 0 ? "Sem ponto designado" : state.points.count === 1 ? state.points.results[0]?.name : `${state.points.count} pontos designados`}
    </div>
    {state.status === "error" && <p role="status" className="text-xs leading-5 text-gray-400">Não foi possível carregar os pontos. Tente atualizar.</p>}
    {state.status === "ready" && state.user.role === "operator" && state.points.count === 0 && <p className="text-xs leading-5 text-gray-400">Peça ao administrador para vincular sua conta ao ponto do seu bloco.</p>}
    {state.status === "ready" && state.user.role === "operator" && state.points.count === 1 && <p className="text-xs text-gray-400">Ponto de coleta · {state.points.results[0]?.is_active ? "Ativo" : "Inativo"}</p>}
    {state.status === "ready" && state.user.role === "operator" && state.points.count > 1 && <ul className="space-y-1 text-xs leading-5 text-gray-400">{state.points.results.slice(0, 3).map((point) => <li key={point.id}>{point.name}{!point.is_active && " · Inativo"}</li>)}</ul>}
    {state.status === "ready" && state.user.role === "admin" && <p className="text-xs text-gray-400">Gerencie os locais e os funcionários responsáveis.</p>}
    <div className="mt-3 flex flex-wrap items-center gap-3"><Link href="/funcionario/pontos-coleta" className="text-xs font-semibold text-blue-300 underline underline-offset-4">{state.status === "ready" && state.user.role === "admin" ? "Gerenciar pontos" : "Ver meus pontos"}</Link><button type="button" onClick={staff.reload} disabled={state.status === "loading"} className="rounded p-1 text-gray-300 hover:bg-gray-700 disabled:opacity-40" aria-label="Atualizar vínculo com os pontos"><RefreshCw size={14} aria-hidden="true" /></button></div>
  </div>;
}
