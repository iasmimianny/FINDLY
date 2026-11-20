"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useStaff } from "./StaffContext";
import FindlyLoading from "../FindlyLoading";
import { StaffGate, Heading, useResource, Failure, Pagination, Empty, box, field, button, type Page } from "./StaffUI";
type Event = { id: number; item: { public_code: string; title: string }; action_display: string; previous_status: string; new_status: string; responsible: { full_name: string } | null; collection_point: { name: string } | null; created_at: string };
function History({ initialCode }: { initialCode: string }) {
  const staff = useStaff();
  const admin = staff?.state.status === "ready" && staff.state.user.role === "admin";
  const [draft, setDraft] = useState(initialCode);
  const [code, setCode] = useState(/^[A-Z2-9]{10}$/.test(initialCode) ? initialCode : "");
  const [validation, setValidation] = useState("");
  const [page, setPage] = useState(1);
  const [version, setVersion] = useState(0);
  const url = code ? `/api/staff/items/${code}/history/` : admin ? `/api/staff/audit/?page=${page}&ordering=-created_at` : null;
  const { data, error } = useResource<Event[] | Page<Event>>(url, version);
  function search(event: FormEvent) { event.preventDefault(); const value = draft.trim().toUpperCase(); if (!/^[A-Z2-9]{10}$/.test(value)) { setValidation("Informe um código de item com 10 caracteres."); return; } setValidation(""); setCode(value); setVersion(version + 1); }
  const events = Array.isArray(data) ? data : data?.results;
  return <div className="mx-auto max-w-5xl"><Heading title="Histórico de movimentações" description={admin ? "Consulte a auditoria geral do campus ou pesquise o histórico de um objeto." : "Informe o código do item para consultar a trilha de movimentações registrada pelo backend."} /><form onSubmit={search} className={`${box} mb-6 flex flex-wrap items-end gap-3`}><label className="min-w-0 flex-1 text-sm font-semibold">Código do item<input value={draft} maxLength={10} onChange={(event) => setDraft(event.target.value.toUpperCase())} className={`${field} mt-2`} placeholder="Código de 10 caracteres" /></label><button className={button}>Consultar histórico</button>{admin && <button type="button" onClick={() => { setCode(""); setDraft(""); setPage(1); setVersion(version + 1); }} className="rounded-xl border px-4 py-3 text-sm">Auditoria geral</button>}</form>{validation && <p role="alert" className="mb-4 text-sm text-red-700">{validation}</p>}
    {!url ? <Empty>Pesquise um item para ver as movimentações.</Empty> : error ? <Failure message={error} retry={() => setVersion(version + 1)} /> : !data ? <FindlyLoading /> : !Array.isArray(events) ? <Failure message="Histórico inválido." retry={() => setVersion(version + 1)} /> : events.length ? <ol className="space-y-4">{events.map((event) => <li key={event.id} className={box}><div className="flex flex-wrap justify-between gap-3"><h2 className="font-bold">{event.action_display}</h2><time className="text-xs text-gray-500">{new Date(event.created_at).toLocaleString("pt-BR")}</time></div><Link href={`/funcionario/inventario/${event.item.public_code}`} className="mt-2 inline-block text-sm underline">{event.item.title} · {event.item.public_code}</Link><p className="mt-3 text-sm text-gray-600">{event.responsible?.full_name || "Sistema"}{event.collection_point && ` · ${event.collection_point.name}`}</p>{(event.previous_status || event.new_status) && <p className="mt-2 text-xs text-gray-500">{event.previous_status || "Cadastro"} → {event.new_status || "Sem alteração de situação"}</p>}</li>)}</ol> : <Empty>Nenhuma movimentação encontrada.</Empty>}
    {data && !Array.isArray(data) && <Pagination data={data} page={page} onChange={setPage} />}
  </div>;
}
export default function StaffHistory({ initialCode = "" }: { initialCode?: string }) { return <StaffGate><History initialCode={initialCode} /></StaffGate>; }
