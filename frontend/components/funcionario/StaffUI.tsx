"use client";
import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { readItemResponse } from "../../lib/items";
import { useStaff } from "./StaffContext";
import FindlyLoading from "../FindlyLoading";

export const box = "rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6";
export const field = "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900";
export const button = "inline-flex items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white disabled:opacity-40";
export type Page<T> = { count: number; results: T[]; next: string | null; previous: string | null };
export function useResource<T>(url: string | null, version = 0) {
  const [state, setState] = useState<{ key: string; data?: T; error?: string }>({ key: "" });
  const key = `${url}:${version}`;
  useEffect(() => {
    if (!url) return;
    const controller = new AbortController();
    async function load() {
      try {
        const data = await readItemResponse<T>(await fetch(url!, { cache: "no-store", signal: controller.signal }));
        if (!controller.signal.aborted) setState({ key, data });
      } catch (reason) { if (!controller.signal.aborted) setState({ key, error: reason instanceof Error ? reason.message : "Não foi possível consultar os dados." }); }
    }
    void load(); return () => controller.abort();
  }, [url, key]);
  return state.key === key ? state : { key };
}
export function Failure({ message, retry }: { message: string; retry: () => void }) { return <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800"><p>{message}</p><div className="mt-3 flex gap-4"><button onClick={retry} className="font-semibold underline">Tentar novamente</button><Link href="/login" className="underline">Ir ao login</Link></div></div>; }
export function StaffGate({ children }: { children: ReactNode }) {
  const staff = useStaff();
  if (!staff || staff.state.status === "loading") return <FindlyLoading message="Preparando sua área de trabalho…" />;
  if (staff.state.status === "error") return <Failure message={staff.state.error.message} retry={staff.reload} />;
  if (!["operator", "admin"].includes(staff.state.user.role)) return <p role="alert">Acesso exclusivo para funcionários e administradores.</p>;
  return children;
}
export function Heading({ title, description }: { title: string; description: string }) { return <header className="mb-7"><p className="text-xs font-bold uppercase tracking-widest findly-page-label">Área do funcionário</p><h1 className="mt-2 text-3xl font-bold text-gray-950">{title}</h1><p className="mt-3 max-w-3xl text-sm leading-6 text-gray-600">{description}</p></header>; }
export function Pagination({ data, page, onChange }: { data: { next: string | null; previous: string | null }; page: number; onChange: (page: number) => void }) { return data.next || data.previous ? <nav aria-label="Paginação" className="mt-6 flex items-center justify-between gap-4 text-sm"><button disabled={!data.previous} onClick={() => onChange(page - 1)} className={`${button} bg-gray-800`}>Anterior</button><span>Página {page}</span><button disabled={!data.next} onClick={() => onChange(page + 1)} className={button}>Próxima</button></nav> : null; }
export function Empty({ children }: { children: ReactNode }) { return <p className={`${box} py-10 text-center text-sm text-gray-600`}>{children}</p>; }
