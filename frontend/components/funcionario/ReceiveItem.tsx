"use client";

import Link from "next/link";
import FindlyModal from "../FindlyModal";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { CheckCircle2, MapPin, PackageCheck, Search } from "lucide-react";
import { useStaff } from "./StaffContext";
import FindlyLoading from "../FindlyLoading";
import { readItemResponse, ItemApiError } from "../../lib/items";
import { pointsJson, capacityLabel, type CollectionPoint, type Page } from "../../lib/collection-points";

type Custody = { id: number; item: { public_code: string; title: string }; collection_point: { id: number; name: string } | null; held_by_user: { full_name: string } | null; note: string; started_at: string; ended_at: string | null; is_active: boolean };
const input = "mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 disabled:opacity-50";
const message = (reason: unknown) => reason instanceof Error ? reason.message : "Não foi possível concluir a operação.";
function validRecord(value: Custody, code: string) { return value && Number.isInteger(value.id) && value.item?.public_code === code && typeof value.item.title === "string" && typeof value.is_active === "boolean"; }

function Reception({ employee }: { employee: { id: number; role: string } }) {
  const [code, setCode] = useState("");
  const [loadedCode, setLoadedCode] = useState("");
  const [records, setRecords] = useState<Custody[] | null>(null);
  const [points, setPoints] = useState<Page<CollectionPoint> | null>(null);
  const [page, setPage] = useState(1);
  const [version, setVersion] = useState(0);
  const [pointId, setPointId] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState("");
  const [pointsError, setPointsError] = useState("");
  const [expired, setExpired] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const [success, setSuccess] = useState<Custody | null>(null);
  const lock = useRef(false);
  useEffect(() => {
    const controller = new AbortController();
    const params = new URLSearchParams({ is_active: "true", ordering: "name", page: String(page) });
    if (employee.role === "operator") params.set("operator", String(employee.id));
    async function load() {
      try {
        const data = await pointsJson<Page<CollectionPoint>>(await fetch(`/api/collection-points/?${params}`, { cache: "no-store", signal: controller.signal }));
        if (!Array.isArray(data.results) || !Number.isInteger(data.count) || data.results.some((point) => !point.is_active || (employee.role === "operator" && !point.operators.includes(employee.id)))) throw new Error("Não foi possível confirmar seus pontos de coleta.");
        if (!controller.signal.aborted) { setPoints(data); setPointsError(""); }
      } catch (reason) { if (!controller.signal.aborted) setPointsError(message(reason)); }
    }
    void load(); return () => controller.abort();
  }, [employee.id, employee.role, page, version]);
  const current = records?.find((record) => record.is_active);
  const selected = points?.results.find((point) => String(point.id) === pointId);
  async function lookup(event: FormEvent) {
    event.preventDefault(); if (lock.current) return;
    const normalized = code.trim().toUpperCase();
    if (!/^[A-Z2-9]{10}$/.test(normalized)) { setError("Informe o código de 10 caracteres do item encontrado."); return; }
    lock.current = true; setBusy(true); setError(""); setExpired(false); setSuccess(null); setRecords(null); setLoadedCode("");
    try {
      const data = await readItemResponse<Custody[]>(await fetch(`/api/custody/${normalized}/`, { cache: "no-store" }));
      if (!Array.isArray(data) || !data.length || data.some((record) => !validRecord(record, normalized))) throw new Error("O servidor não retornou uma custódia válida para esse item.");
      setRecords(data); setLoadedCode(normalized); setUncertain(false);
      setPoints(null); setPointId(""); setVersion((value) => value + 1);
    } catch (reason) { setError(message(reason)); setExpired(reason instanceof ItemApiError && reason.status === 401); }
    finally { lock.current = false; setBusy(false); }
  }
  async function receive() {
    if (lock.current || uncertain || !loadedCode || !selected?.has_capacity || current?.collection_point?.id === selected.id) return;
    lock.current = true; setBusy(true); setError(""); setSuccess(null); setExpired(false);
    try {
      const result = await readItemResponse<Custody>(await fetch(`/api/custody/${loadedCode}/transfer/`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ collection_point: selected.id, note: note.trim() }), cache: "no-store" }));
      if (!validRecord(result, loadedCode) || !result.is_active || result.collection_point?.id !== selected.id) throw new Error("Não foi possível confirmar o recebimento.");
      setSuccess(result); setRecords(null); setLoadedCode(""); setNote(""); setPointId(""); setPoints(null); setVersion((value) => value + 1);
    } catch (reason) {
      setError(message(reason)); setExpired(reason instanceof ItemApiError && reason.status === 401);
      if (!(reason instanceof ItemApiError) || reason.status >= 500 || reason.status < 400) setUncertain(true);
    } finally { lock.current = false; setBusy(false); setConfirming(false); }
  }
  return <div className="w-full min-w-0 text-gray-900">
    <p className="text-xs font-bold uppercase tracking-widest findly-page-label">Ponto de coleta</p><h1 className="mt-2 text-3xl font-bold">Receber item</h1><p className="mb-7 mt-3 text-sm text-gray-600">Consulte um objeto encontrado e confirme a entrega física no seu ponto de coleta.</p>
    <form onSubmit={lookup} className="rounded-2xl border border-gray-200 bg-white p-6"><label htmlFor="receive-code" className="text-sm font-semibold">Código do item encontrado</label><div className="mt-2 flex flex-wrap gap-3"><input id="receive-code" required maxLength={10} value={code} disabled={busy} autoComplete="off" placeholder="Ex.: 85X7C925S6" onChange={(event) => { setCode(event.target.value.toUpperCase()); setRecords(null); setLoadedCode(""); setSuccess(null); }} className={`${input} mt-0 min-w-0 flex-1 uppercase`} /><button disabled={busy} className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white disabled:opacity-50"><Search size={17} />{busy ? "Aguarde…" : "Consultar item"}</button></div></form>
    {error && <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}{expired && <Link href="/login" className="ml-2 underline">Entrar novamente</Link>}</div>}
    {uncertain && <p role="status" className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">A resposta não foi confirmada. Consulte o código novamente para conferir a custódia antes de repetir o recebimento.</p>}
    {success && <div role="status" className="mt-5 rounded-2xl border border-green-200 bg-green-50 p-6 text-green-900"><CheckCircle2 className="mb-3" /><h2 className="text-xl font-bold">Recebimento confirmado!</h2><p className="mt-2">{success.item.title} está em {success.collection_point?.name}.</p><p className="mt-2 text-sm">Registro #{success.id} · {new Date(success.started_at).toLocaleString("pt-BR")}</p></div>}
    {records && <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-6"><h2 className="text-xl font-bold">{records[0].item.title}</h2><p className="mt-2 font-mono text-sm text-gray-600">{loadedCode}</p><p className="mt-4 text-sm">Custódia atual: <strong>{current?.collection_point?.name ?? current?.held_by_user?.full_name ?? "Não informada"}</strong></p>
      <form onSubmit={(event) => { event.preventDefault(); setConfirming(true); }} className="mt-6 space-y-4"><label className="block text-sm font-semibold"><span className="flex items-center gap-2"><MapPin size={17} />Ponto de destino</span><select required value={pointId} disabled={busy || !points} onChange={(event) => setPointId(event.target.value)} className={input}><option value="">Selecione o ponto de coleta</option>{points?.results.map((point) => <option key={point.id} value={point.id} disabled={!point.has_capacity || current?.collection_point?.id === point.id}>{point.name}{!point.has_capacity ? " — lotado" : current?.collection_point?.id === point.id ? " — item já recebido aqui" : ""}</option>)}</select></label>
      {selected && <p className="text-sm text-gray-600">{selected.address} · {capacityLabel(selected)}</p>}
      {pointsError ? <div role="alert" className="text-sm text-red-700">{pointsError} <button type="button" disabled={busy} onClick={() => setVersion((value) => value + 1)} className="underline">Tentar novamente</button></div> : !points ? <p role="status" className="text-sm text-gray-600">Consultando pontos…</p> : !points.count && <p className="text-sm text-gray-600">Nenhum ponto ativo vinculado. Peça ao administrador para conferir seu vínculo.</p>}
      {points && (points.next || points.previous) && <nav aria-label="Páginas de pontos de coleta" className="flex items-center gap-4 text-sm"><button type="button" disabled={busy || !points.previous} onClick={() => { setPoints(null); setPointId(""); setPage(page - 1); }} className="underline disabled:opacity-40">Anterior</button><span>Página {page}</span><button type="button" disabled={busy || !points.next} onClick={() => { setPoints(null); setPointId(""); setPage(page + 1); }} className="underline disabled:opacity-40">Próxima</button></nav>}
      <label className="block text-sm font-semibold">Observação (opcional)<textarea maxLength={255} value={note} disabled={busy} onChange={(event) => setNote(event.target.value)} className={input} placeholder="Condição do objeto e detalhes da entrega" /></label><p className="text-sm text-gray-600">Confirme apenas depois de receber o objeto fisicamente.</p><button disabled={busy || uncertain || !selected?.has_capacity || current?.collection_point?.id === selected?.id} className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white disabled:opacity-40"><PackageCheck size={18} />{busy ? "Confirmando…" : "Confirmar recebimento"}</button></form>
      <details className="mt-7 border-t border-gray-100 pt-5"><summary className="cursor-pointer text-sm font-semibold">Histórico de custódia</summary><ol className="mt-4 space-y-3">{records.map((record) => <li key={record.id} className="rounded-xl bg-gray-50 p-4 text-sm"><strong>{record.collection_point?.name ?? record.held_by_user?.full_name ?? "Responsável não informado"}</strong><p className="mt-1 text-gray-600">{new Date(record.started_at).toLocaleString("pt-BR")} · {record.is_active ? "Atual" : "Encerrada"}</p>{record.note && <p className="mt-2 whitespace-pre-wrap break-words">{record.note}</p>}</li>)}</ol></details>
    </section>}
    <FindlyModal open={confirming} onClose={() => setConfirming(false)} busy={busy} title="Confirmar recebimento do item"><p className="text-sm leading-6">Confirma que recebeu <strong>{records?.[0]?.item.title}</strong> fisicamente em <strong>{selected?.name}</strong>?</p><p className="mt-3 text-sm text-gray-600">{note.trim() || "Sem observação adicional."}</p><div className="mt-6 flex gap-3"><button type="button" disabled={busy} onClick={() => void receive()} className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{busy ? "Confirmando…" : "Confirmar recebimento"}</button><button type="button" disabled={busy} onClick={() => setConfirming(false)} className="rounded-xl border px-4 py-3 text-sm">Cancelar</button></div></FindlyModal>
  </div>;
}
export default function ReceiveItem() {
  const staff = useStaff();
  if (!staff || staff.state.status === "loading") return <FindlyLoading message="Consultando sua área de trabalho…" />;
  if (staff.state.status === "error") return <div role="alert"><p>{staff.state.error.message}</p><button onClick={staff.reload} className="mt-3 underline">Tentar novamente</button></div>;
  if (!["operator", "admin"].includes(staff.state.user.role)) return <p role="alert">Esta área é exclusiva de funcionários e administradores.</p>;
  return <Reception key={staff.state.user.id} employee={{ id: Number(staff.state.user.id), role: staff.state.user.role }} />;
}
