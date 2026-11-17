"use client";

import { finishLoadingCycle } from "../lib/loading-cycle";
import FindlyLoading from "./FindlyLoading";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { Clock, ExternalLink, MapPin, Plus, RefreshCw, Search, Users } from "lucide-react";
import CollectionPointForm from "./CollectionPointForm";
import { readProfileResponse, type Profile } from "../lib/profile";
import { useStaff } from "./funcionario/StaffContext";
import { capacityLabel, pointsJson, pointsPath, PointsError, type CollectionPoint, type Page, type PointQuery } from "../lib/collection-points";

const inputClass = "mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

function Failure({ error, retry }: { error: Error; retry: () => void }) {
  const expired = "status" in error && error.status === 401;
  return <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><p>{error.message}</p>{expired ? <Link href="/login" className="mt-3 inline-block font-semibold underline">Entrar novamente</Link> : <button type="button" onClick={retry} className="mt-3 rounded-lg border border-red-300 px-4 py-2 font-semibold">Tentar novamente</button>}</div>;
}

function PointInformation({ point, detail = false }: { point: CollectionPoint; detail?: boolean }) {
  return <>
    <div className="flex flex-wrap items-start justify-between gap-3"><h3 className="break-words text-lg font-bold">{point.name}</h3><span className={`rounded-lg px-3 py-1 text-xs font-semibold ${point.is_active ? "bg-green-50 text-green-800" : "bg-gray-100 text-gray-600"}`}>{point.is_active ? "Ativo" : "Inativo"}</span></div>
    <p className="mt-3 flex items-start gap-2 break-words text-sm leading-6 text-gray-600"><MapPin size={17} className="mt-1 shrink-0" aria-hidden="true" />{point.address}</p>
    <p className="mt-2 flex items-center gap-2 text-sm text-gray-600"><Clock size={16} className="shrink-0" aria-hidden="true" />{point.opening_hours || "Horário não informado"}</p>
    <p className="mt-3 text-sm font-medium">{capacityLabel(point)}</p><p className="mt-1 text-xs text-gray-600">{point.has_capacity ? "Com vagas disponíveis" : "Capacidade atingida"}</p>
    {detail && <>
      <h4 className="mt-5 flex items-center gap-2 text-sm font-semibold"><Users size={17} aria-hidden="true" />Responsáveis</h4>
      {point.operators_display.length ? <ul className="mt-2 space-y-1 text-sm text-gray-600">{point.operators_display.map((user) => <li key={user.id}>{user.full_name || "Responsável"} <span className="text-xs">· Código {user.id}</span></li>)}</ul> : <p className="mt-2 text-sm text-gray-600">Nenhum responsável vinculado.</p>}
      <dl className="mt-4 space-y-2 text-xs text-gray-500"><div><dt className="inline font-semibold">Cadastrado: </dt><dd className="inline">{new Date(point.created_at).toLocaleString("pt-BR")}</dd></div><div><dt className="inline font-semibold">Atualizado: </dt><dd className="inline">{new Date(point.updated_at).toLocaleString("pt-BR")}</dd></div></dl>
    </>}
    <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${point.name}, ${point.address}`)}`} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4">Abrir endereço no mapa<ExternalLink size={14} aria-hidden="true" /></a>
  </>;
}

function PointDetails({ id, admin, onEdit, onChanged, onClose }: { id: number; admin: boolean; onEdit: (point: CollectionPoint) => void; onChanged: (point: CollectionPoint) => void; onClose: () => void }) {
  const [point, setPoint] = useState<CollectionPoint | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [pending, setPending] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const result = await pointsJson<CollectionPoint>(await fetch(`/api/collection-points/${id}/`, { cache: "no-store", signal: controller.signal }));
        if (!result?.id || !Array.isArray(result.operators_display)) throw new Error("Resposta do ponto inválida.");
        if (!controller.signal.aborted) setPoint(result);
      } catch (reason) { if (!controller.signal.aborted) setError(reason instanceof Error ? reason : new Error("Não foi possível consultar o ponto.")); }
    }
    void load(); return () => controller.abort();
  }, [id, attempt]);
  async function toggle() {
    if (!point || pending) return;
    setPending(true); setError(null);
    try {
      const result = await pointsJson<CollectionPoint>(await fetch(`/api/collection-points/${point.id}/`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ is_active: !point.is_active }), cache: "no-store" }));
      setPoint(result); onChanged(result);
    } catch (reason) { setError(reason instanceof Error ? reason : new Error("Não foi possível alterar a situação.")); }
    finally { setPending(false); }
  }
  return <section aria-label="Detalhes do ponto de coleta" className="mb-6 rounded-2xl border border-blue-200 bg-white p-5 shadow-sm sm:p-6">
    <div className="mb-4 flex items-center justify-between gap-3"><h2 className="text-xl font-bold">Detalhes do ponto</h2><button type="button" disabled={pending} onClick={onClose} className="rounded-lg border border-gray-300 px-3 py-2 text-sm font-semibold disabled:opacity-40">Fechar</button></div>
    {error && <Failure error={error} retry={() => { setError(null); setAttempt((value) => value + 1); }} />}
    {point ? <><PointInformation point={point} detail />{admin && <div className="mt-5 flex flex-wrap gap-3"><button type="button" disabled={pending} onClick={() => onEdit(point)} className="rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white disabled:opacity-50">Editar ponto</button><button type="button" disabled={pending} onClick={toggle} className="rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold disabled:opacity-50">{pending ? "Salvando…" : point.is_active ? "Desativar ponto" : "Ativar ponto"}</button></div>}</> : !error && <p role="status" className="text-sm text-gray-600">Carregando detalhes…</p>}
  </section>;
}

function PointResults({ query, onDetails, onPage }: { query: PointQuery; onDetails: (id: number) => void; onPage: (page: number) => void }) {
  const [data, setData] = useState<Page<CollectionPoint> | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      const startedAt = performance.now();
      try {
        const result = await pointsJson<Page<CollectionPoint>>(await fetch(pointsPath(query), { cache: "no-store", signal: controller.signal }));
        if (!Array.isArray(result?.results) || typeof result.count !== "number") throw new Error("Resposta da lista inválida.");
        await finishLoadingCycle(startedAt, controller.signal);
        if (!controller.signal.aborted) setData(result);
      } catch (reason) { if (!controller.signal.aborted) setError(reason instanceof Error ? reason : new Error("Não foi possível consultar os pontos.")); }
    }
    void load(); return () => controller.abort();
  }, [query, attempt]);
  if (error) return <Failure error={error} retry={() => { setError(null); setAttempt((value) => value + 1); }} />;
  if (!data) return <FindlyLoading message="Carregando pontos de coleta…" />;
  return <section aria-label="Lista de pontos de coleta">
    <p aria-live="polite" className="mb-4 text-sm text-gray-600">{data.count} {data.count === 1 ? "ponto de coleta" : "pontos de coleta"}</p>
    {data.results.length ? <div className="grid items-start gap-4 lg:grid-cols-2">{data.results.map((point) => <article key={point.id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><PointInformation point={point} /><div className="mt-4"><button type="button" onClick={() => onDetails(point.id)} className="rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold">Ver detalhes e responsáveis</button></div></article>)}</div> : <div className="rounded-2xl border border-gray-200 bg-white p-9 text-center"><MapPin size={32} className="mx-auto mb-3 text-gray-400" aria-hidden="true" /><h2 className="font-semibold">Nenhum ponto encontrado</h2><p className="mt-2 text-sm text-gray-600">Altere os filtros ou aguarde o cadastro de um ponto pela equipe.</p></div>}
    {(data.next || data.previous) && <nav aria-label="Paginação dos pontos" className="mt-5 flex items-center justify-between gap-3 text-sm"><button disabled={!data.previous} className="rounded-xl border border-gray-300 bg-white px-4 py-3 font-semibold disabled:opacity-40" onClick={() => onPage(query.page - 1)}>Anterior</button><span>Página {query.page}</span><button disabled={!data.next} className="rounded-xl border border-gray-300 bg-white px-4 py-3 font-semibold disabled:opacity-40" onClick={() => onPage(query.page + 1)}>Próxima</button></nav>}
  </section>;
}

function PointsWorkspace({ admin, assignedTo }: { admin: boolean; assignedTo?: string }) {
  const empty: PointQuery = { search: "", active: "true", capacity: false, operator: assignedTo ?? "", ordering: "name", page: 1 };
  const [query, setQuery] = useState(empty);
  const [search, setSearch] = useState("");
  const [operator, setOperator] = useState(assignedTo ?? "");
  const [version, setVersion] = useState(0);
  const [detail, setDetail] = useState<number | null>(null);
  const [editor, setEditor] = useState<CollectionPoint | "new" | null>(null);
  const [notice, setNotice] = useState("");
  function refresh() { setVersion((value) => value + 1); }
  function changed(point: CollectionPoint) { setNotice(`Ponto “${point.name}” ${point.is_active ? "ativado" : "desativado"}.`); setQuery((previous) => ({ ...previous, page: 1 })); refresh(); }
  function saved(point: CollectionPoint) { setNotice(`Ponto “${point.name}” salvo com sucesso.`); setEditor(null); setDetail(point.id); setQuery((previous) => ({ ...previous, page: 1 })); refresh(); }
  function filter(event: FormEvent<HTMLFormElement>) { event.preventDefault(); setQuery((previous) => ({ ...previous, search: search.trim(), operator: assignedTo ?? operator, page: 1 })); }
  return <>
    <div className="mb-6 flex flex-wrap gap-3"><button type="button" onClick={refresh} className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold"><RefreshCw size={16} aria-hidden="true" />Atualizar pontos</button>{admin && <button type="button" onClick={() => { setEditor("new"); setDetail(null); setNotice(""); }} className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white"><Plus size={17} aria-hidden="true" />Cadastrar ponto</button>}</div>
    {notice && <p role="status" className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">{notice}</p>}
    {editor !== null && <CollectionPointForm key={editor === "new" ? "new" : editor.id} point={editor === "new" ? undefined : editor} onSaved={saved} onCancel={() => { setEditor(null); refresh(); }} />}
    {detail !== null && editor === null && <PointDetails key={`${detail}-${version}`} id={detail} admin={admin} onEdit={setEditor} onChanged={changed} onClose={() => setDetail(null)} />}
    <form onSubmit={filter} className="mb-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"><div className="grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <label className="text-sm font-semibold sm:col-span-2">Pesquisar ponto<input type="search" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Nome ou endereço" className={inputClass} /></label>
      <label className="text-sm font-semibold">Situação<select value={query.active} onChange={(event) => setQuery((previous) => ({ ...previous, active: event.target.value, page: 1 }))} className={inputClass}><option value="">Todos</option><option value="true">Ativos</option><option value="false">Inativos</option></select></label>
      <label className="text-sm font-semibold">Ordenação<select value={query.ordering} onChange={(event) => setQuery((previous) => ({ ...previous, ordering: event.target.value, page: 1 }))} className={inputClass}><option value="name">Nome: A–Z</option><option value="-name">Nome: Z–A</option><option value="-created_at">Mais recentes</option><option value="created_at">Mais antigos</option><option value="capacity">Menor capacidade</option><option value="-capacity">Maior capacidade</option></select></label>
      {!assignedTo && <label className="text-sm font-semibold">Código do responsável<input type="number" min={1} step={1} value={operator} onChange={(event) => setOperator(event.target.value)} className={inputClass} placeholder="Opcional" /><span className="mt-1 block text-xs font-normal text-gray-600">Consulte o código nos detalhes do ponto.</span></label>}
      <label className="flex items-center gap-3 pb-3 text-sm font-medium"><input type="checkbox" checked={query.capacity} onChange={(event) => setQuery((previous) => ({ ...previous, capacity: event.target.checked, page: 1 }))} />Somente com vagas</label>
    </div><div className="mt-4 flex flex-wrap gap-3"><button className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white"><Search size={16} aria-hidden="true" />Buscar</button><button type="button" className="rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold" onClick={() => { setSearch(""); setOperator(assignedTo ?? ""); setQuery(empty); }}>Limpar filtros</button></div></form>
    <PointResults key={`${JSON.stringify(query)}-${version}`} query={query} onDetails={(id) => { setDetail(id); setEditor(null); }} onPage={(page) => setQuery((previous) => ({ ...previous, page }))} />
  </>;
}

export default function CollectionPoints({ staffMode = false }: { staffMode?: boolean }) {
  const staff = useStaff();
  const [user, setUser] = useState<Profile | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    if (staffMode) return;
    const controller = new AbortController();
    async function load() {
      const startedAt = performance.now();
      try {
        const profile = await readProfileResponse(await fetch("/api/account/me/", { cache: "no-store", signal: controller.signal }));
        await finishLoadingCycle(startedAt, controller.signal);
        if (!controller.signal.aborted) setUser(profile);
      } catch (reason) { if (!controller.signal.aborted) setError(reason instanceof Error ? reason : new PointsError("Não foi possível consultar sua conta.", 502)); }
    }
    void load(); return () => controller.abort();
  }, [attempt, staffMode]);
  if (staffMode) {
    if (!staff) return <p role="alert">Não foi possível identificar a área de trabalho.</p>;
    if (staff.state.status === "loading") return <FindlyLoading message="Consultando os pontos da sua conta…" />;
    if (staff.state.status === "error") return <Failure error={staff.state.error} retry={staff.reload} />;
    const employee = staff.state.user;
    return <PointsWorkspace key={`${employee.id}-${employee.role}`} admin={employee.role === "admin"} assignedTo={employee.role === "operator" ? String(employee.id) : undefined} />;
  }
  if (error) return <Failure error={error} retry={() => { setError(null); setAttempt((value) => value + 1); }} />;
  if (user === null) return <FindlyLoading message="Verificando acesso…" />;
  return <PointsWorkspace admin={user.role === "admin"} />;
}
