"use client";
import Link from "next/link";
import FindlyModal from "../FindlyModal";
import { useRef, useState, type FormEvent } from "react";
import { readItemResponse, ItemApiError } from "../../lib/items";
import FindlyLoading from "../FindlyLoading";
import { StaffGate, Heading, useResource, Failure, Pagination, Empty, box, field, button, type Page } from "./StaffUI";
type Claim = { id: number; item: { public_code: string; title: string }; claimant: { full_name: string }; status: string; status_display: string; message: string; decision_note: string; created_at: string };
function Decision({ claim, onChanged }: { claim: Claim; onChanged: () => void }) {
  const [note, setNote] = useState("");
  const [choice, setChoice] = useState<"approve" | "reject" | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [uncertain, setUncertain] = useState(false);
  const lock = useRef(false);
  async function decide(event: FormEvent) {
    event.preventDefault(); if (!choice || lock.current || uncertain) return;
    lock.current = true; setBusy(true); setError("");
    try {
      const result = await readItemResponse<Claim>(await fetch(`/api/staff/claims/${claim.id}/${choice}/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ decision_note: note.trim() }) }));
      if (result.id !== claim.id || result.status !== (choice === "approve" ? "APPROVED" : "REJECTED")) throw new Error("Resposta de decisão inválida.");
      onChanged();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Não foi possível confirmar a decisão."); if (!(reason instanceof ItemApiError) || reason.status >= 500 || reason.status < 400) setUncertain(true); }
    finally { lock.current = false; setBusy(false); }
  }
  return <div className="mt-4"><div className="flex flex-wrap gap-3"><button onClick={() => setChoice("approve")} className={button}>Analisar aprovação</button><button onClick={() => setChoice("reject")} className="rounded-xl border px-4 py-3 text-sm font-semibold">Analisar recusa</button></div>
    <FindlyModal open={choice !== null} onClose={() => setChoice(null)} busy={busy} title={choice === "approve" ? "Aprovar reivindicação" : "Recusar reivindicação"}>
      <p className="mb-4 text-sm text-gray-600">{claim.item.title} · {claim.claimant.full_name}</p>{error && <p role="alert" className="mb-4 text-sm text-red-700">{error}</p>}
      {uncertain ? <div><p className="text-sm text-amber-800">A resposta ficou incerta. Consulte a lista antes de repetir.</p><button onClick={onChanged} className={`${button} mt-4`}>Atualizar reivindicações</button></div> : <form onSubmit={decide} className="space-y-4"><p className="text-sm leading-6">{choice === "approve" ? "A aprovação emite a autorização de retirada. A entrega física ainda precisa ser confirmada com o token." : "Confirma a recusa deste pedido de propriedade?"}</p><label className="block text-sm font-semibold">Justificativa (opcional)<textarea value={note} disabled={busy} onChange={(event) => setNote(event.target.value)} maxLength={4000} className={`${field} mt-2`} /></label><div className="flex flex-wrap gap-3"><button disabled={busy} className={button}>{busy ? "Salvando…" : choice === "approve" ? "Confirmar aprovação" : "Confirmar recusa"}</button><button type="button" disabled={busy} onClick={() => setChoice(null)} className="rounded-xl border px-4 py-3 text-sm">Cancelar</button></div></form>}
    </FindlyModal>
  </div>;
}
function Withdrawal({ onChanged }: { onChanged: () => void }) {
  const [token, setToken] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uncertain, setUncertain] = useState(false);
  const lock = useRef(false);
  async function submit(event: FormEvent) {
    event.preventDefault(); if (lock.current || uncertain || !token.trim()) return;
    lock.current = true; setBusy(true); setError(""); setSuccess("");
    try {
      const result = await readItemResponse<{ item: { title: string; status: string; public_code: string }; claim: Claim }>(await fetch("/api/staff/withdrawal/", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token: token.trim() }) }));
      if (!result.item?.public_code || result.item.status !== "DEVOLVIDO" || !result.claim?.id) throw new Error("Não foi possível confirmar a retirada.");
      setSuccess(`Retirada confirmada: ${result.item.title} (${result.item.public_code}).`); setToken(""); onChanged();
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Não foi possível confirmar a retirada."); if (!(reason instanceof ItemApiError) || reason.status >= 500 || reason.status < 400) setUncertain(true); }
    finally { lock.current = false; setBusy(false); }
  }
  return <section className={`${box} mb-7`}><h2 className="text-xl font-bold">Confirmar entrega ao proprietário</h2><p className="my-3 text-sm text-gray-600">Confira a autorização apresentada e confirme somente no momento da entrega física. Cole o token ou o conteúdo do QR de retirada.</p><form onSubmit={submit} className="space-y-3"><label htmlFor="withdrawal-token" className="text-sm font-semibold">Token de retirada</label><input id="withdrawal-token" type="password" autoComplete="off" maxLength={255} value={token} onChange={(event) => setToken(event.target.value)} disabled={busy || uncertain} required className={field} /><label className="flex items-start gap-2 text-sm text-gray-700"><input type="checkbox" required disabled={busy || uncertain} className="mt-1" />Conferi o proprietário e estou entregando o objeto.</label><button disabled={busy || uncertain} className={button}>{busy ? "Confirmando…" : "Confirmar retirada"}</button></form>{success && <p role="status" className="mt-4 rounded-xl bg-green-50 p-4 text-sm text-green-800">{success}</p>}{error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}{uncertain && <p className="mt-3 text-sm text-amber-900">A resposta ficou incerta. Consulte o item no inventário e o histórico antes de repetir a operação.</p>}</section>;
}
function Returns({ initialCode }: { initialCode: string }) {
  const [filters, setFilters] = useState({ search: "", status: "PENDING", item: /^[A-Z2-9]{10}$/.test(initialCode) ? initialCode : "", page: 1 });
  const [search, setSearch] = useState("");
  const [version, setVersion] = useState(0);
  const [notice, setNotice] = useState("");
  const params = new URLSearchParams({ ...filters, page: String(filters.page), ordering: "-created_at" });
  const { data, error } = useResource<Page<Claim>>(`/api/staff/claims/?${params}`, version);
  function changed() { setNotice("Dados atualizados. Confira a situação na lista."); setVersion((value) => value + 1); }
  return <div className="mx-auto max-w-5xl"><Heading title="Reivindicações e devoluções" description="Analise pedidos de propriedade e confirme retiradas autorizadas. A consulta inclui as reivindicações disponíveis para sua conta no campus." /><Withdrawal onChanged={changed} />
    <form onSubmit={(event) => { event.preventDefault(); setFilters({ ...filters, search: search.trim(), page: 1 }); }} className={`${box} mb-6 grid gap-4 sm:grid-cols-3`}><label className="text-sm font-semibold">Pesquisar<input value={search} onChange={(event) => setSearch(event.target.value)} className={`${field} mt-2`} placeholder="Item ou solicitante" /></label><label className="text-sm font-semibold">Situação<select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value, page: 1 })} className={`${field} mt-2`}><option value="">Todas</option>{[["PENDING", "Pendentes"], ["APPROVED", "Aprovadas"], ["REJECTED", "Recusadas"], ["CANCELLED", "Canceladas"]].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><div className="flex items-end gap-3"><button className={button}>Buscar</button><button type="button" onClick={() => { setFilters({ search: "", status: "", item: "", page: 1 }); setSearch(""); setVersion(version + 1); }} className="rounded-xl border px-3 py-3 text-sm">Ver todas</button></div></form>
    {notice && <p role="status" className="mb-4 text-sm text-green-800">{notice}</p>}{error ? <Failure message={error} retry={() => setVersion(version + 1)} /> : !data ? <FindlyLoading /> : !Array.isArray(data.results) ? <Failure message="Lista de reivindicações inválida." retry={() => setVersion(version + 1)} /> : <><p className="mb-4 text-sm text-gray-600">{data.count} reivindicações{filters.item && ` · Item ${filters.item}`}</p>{data.results.length ? <div className="space-y-4">{data.results.map((claim) => <article key={`${claim.id}-${version}`} className={box}><div className="flex flex-wrap justify-between gap-3"><Link href={`/funcionario/inventario/${claim.item.public_code}`} className="font-bold underline">{claim.item.title}</Link><span className="text-sm text-gray-600">{claim.status_display}</span></div><p className="mt-3 text-sm">Solicitante: <strong>{claim.claimant.full_name || "Não informado"}</strong></p><p className="mt-2 text-xs text-gray-500">{claim.item.public_code} · {new Date(claim.created_at).toLocaleString("pt-BR")}</p><p className="mt-4 whitespace-pre-wrap break-words text-sm">{claim.message || "Sem mensagem de comprovação."}</p>{claim.decision_note && <p className="mt-3 whitespace-pre-wrap break-words text-sm text-gray-600">Decisão: {claim.decision_note}</p>}{claim.status === "PENDING" && <Decision claim={claim} onChanged={changed} />}</article>)}</div> : <Empty>Nenhuma reivindicação encontrada.</Empty>}<Pagination data={data} page={filters.page} onChange={(page) => setFilters({ ...filters, page })} /></>}
  </div>;
}
export default function StaffReturns({ initialCode = "" }: { initialCode?: string }) { return <StaffGate><Returns initialCode={initialCode} /></StaffGate>; }
