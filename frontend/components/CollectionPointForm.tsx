"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { pointsJson, PointsError, type CollectionPoint, type Page, type PointInput, type Responsible, type ResponsibleOption } from "../lib/collection-points";

const inputClass = "mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

function ResponsibleResults({ query, selected, onChange, onNames, onPage }: {
  query: { role: string; search: string; page: number }; selected: number[];
  onChange: (ids: number[]) => void; onNames: (users: Responsible[]) => void; onPage: (page: number) => void;
}) {
  const [data, setData] = useState<Page<ResponsibleOption> | null>(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const params = new URLSearchParams({ role: query.role, search: query.search, page: String(query.page) });
        const result = await pointsJson<Page<ResponsibleOption>>(await fetch(`/api/collection-points/operators/?${params}`, { cache: "no-store", signal: controller.signal }));
        if (!Array.isArray(result?.results)) throw new Error("Lista de responsáveis inválida.");
        if (!controller.signal.aborted) setData(result);
      } catch (reason) { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Não foi possível consultar os responsáveis."); }
    }
    void load();
    return () => controller.abort();
  }, [query, attempt]);
  if (error) return <div role="alert" className="mt-3 text-sm text-red-700"><p>{error}</p><button type="button" className="mt-2 font-semibold underline" onClick={() => { setError(""); setAttempt((value) => value + 1); }}>Tentar novamente</button></div>;
  if (!data) return <p role="status" className="mt-3 text-sm text-gray-600">Consultando responsáveis…</p>;
  return <div className="mt-3">
    <p className="mb-2 text-xs text-gray-600">{data.count} {data.count === 1 ? "pessoa disponível" : "pessoas disponíveis"}</p>
    {data.results.length ? <div className="max-h-60 space-y-2 overflow-y-auto rounded-xl border border-gray-200 bg-white p-3">{data.results.map((user) => <label key={user.id} className="flex cursor-pointer items-start gap-3 rounded-lg p-2 hover:bg-gray-50"><input type="checkbox" checked={selected.includes(user.id)} className="mt-1" onChange={(event) => { onNames([{ id: user.id, full_name: user.full_name || user.email }]); onChange(event.target.checked ? [...new Set([...selected, user.id])] : selected.filter((id) => id !== user.id)); }} /><span className="min-w-0 text-sm"><span className="block break-words font-semibold">{user.full_name || user.email}{!user.is_active && " (conta inativa)"}</span><span className="break-all text-xs text-gray-600">{user.email}</span></span></label>)}</div> : <p className="text-sm text-gray-600">Nenhuma pessoa encontrada nesta busca.</p>}
    {(data.next || data.previous) && <div className="mt-3 flex items-center justify-between gap-2 text-sm"><button type="button" disabled={!data.previous} className="rounded-lg border px-3 py-2 disabled:opacity-40" onClick={() => onPage(query.page - 1)}>Anterior</button><span>Página {query.page}</span><button type="button" disabled={!data.next} className="rounded-lg border px-3 py-2 disabled:opacity-40" onClick={() => onPage(query.page + 1)}>Próxima</button></div>}
  </div>;
}

function ResponsiblePicker({ selected, initialNames, onChange }: { selected: number[]; initialNames: Responsible[]; onChange: (ids: number[]) => void }) {
  const [query, setQuery] = useState({ role: "operator", search: "", page: 1 });
  const [search, setSearch] = useState("");
  const [names, setNames] = useState<Record<number, string>>(Object.fromEntries(initialNames.map((user) => [user.id, user.full_name])));
  return <section aria-label="Responsáveis pelo ponto" className="rounded-xl border border-gray-200 bg-gray-50 p-4">
    <h3 className="text-sm font-semibold">Funcionários responsáveis</h3><p className="mt-1 text-xs leading-5 text-gray-600">Vincule as contas individuais dos funcionários ao ponto deste bloco. Administradores também podem ser responsáveis. As seleções são mantidas ao trocar de página ou pesquisa.</p>
    {selected.length > 0 && <ul className="my-3 flex flex-wrap gap-2">{selected.map((id) => <li key={id} className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-xs"><span>{names[id] || `Responsável ${id}`}</span><button type="button" aria-label={`Remover ${names[id] || `responsável ${id}`}`} className="font-bold" onClick={() => onChange(selected.filter((value) => value !== id))}>×</button></li>)}</ul>}
    <div className="mt-3 grid gap-3 sm:grid-cols-2"><label className="text-xs font-semibold">Tipo de responsável<select value={query.role} className={inputClass} onChange={(event) => setQuery((previous) => ({ ...previous, role: event.target.value, page: 1 }))}><option value="operator">Funcionários</option><option value="admin">Administradores</option></select></label><label className="text-xs font-semibold">Nome ou e-mail<input value={search} className={inputClass} onChange={(event) => setSearch(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); setQuery((previous) => ({ ...previous, search: search.trim(), page: 1 })); } }} /></label></div>
    <button type="button" className="mt-3 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-semibold" onClick={() => setQuery((previous) => ({ ...previous, search: search.trim(), page: 1 }))}>Pesquisar responsáveis</button>
    <ResponsibleResults key={JSON.stringify(query)} query={query} selected={selected} onChange={onChange} onNames={(users) => setNames((previous) => ({ ...previous, ...Object.fromEntries(users.map((user) => [user.id, user.full_name])) }))} onPage={(page) => setQuery((previous) => ({ ...previous, page }))} />
  </section>;
}

export default function CollectionPointForm({ point, onSaved, onCancel }: { point?: CollectionPoint; onSaved: (point: CollectionPoint) => void; onCancel: () => void }) {
  const [name, setName] = useState(point?.name ?? "");
  const [address, setAddress] = useState(point?.address ?? "");
  const [hours, setHours] = useState(point?.opening_hours ?? "");
  const [capacity, setCapacity] = useState(point?.capacity == null ? "" : String(point.capacity));
  const [active, setActive] = useState(point?.is_active ?? true);
  const [operators, setOperators] = useState<number[]>(point?.operators ?? []);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [expired, setExpired] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const lock = useRef(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current || uncertain) return;
    if (!name.trim() || !address.trim()) { setError("Preencha o nome e o endereço do ponto."); return; }
    const limit = capacity.trim() === "" ? null : Number(capacity);
    if (limit !== null && (!Number.isSafeInteger(limit) || limit < 0)) { setError("Informe uma capacidade inteira igual ou maior que zero, ou deixe em branco."); return; }
    lock.current = true; setPending(true); setError(""); setExpired(false);
    try {
      const body: PointInput = { name: name.trim(), address: address.trim(), opening_hours: hours.trim(), capacity: limit, is_active: active, operators };
      const saved = await pointsJson<CollectionPoint>(await fetch(`/api/collection-points/${point ? `${point.id}/` : ""}`, { method: point ? "PATCH" : "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body), cache: "no-store" }));
      if (!saved?.id) throw new Error("Não foi possível confirmar o cadastro.");
      onSaved(saved);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível salvar o ponto.");
      setExpired(reason instanceof PointsError && reason.status === 401);
      setUncertain(!point && (!(reason instanceof PointsError) || reason.status >= 500));
    } finally { lock.current = false; setPending(false); }
  }

  return <section className="mb-6 rounded-2xl border border-blue-200 bg-white p-5 shadow-sm sm:p-6">
    <h2 className="text-xl font-bold">{point ? "Editar ponto de coleta" : "Cadastrar ponto de coleta"}</h2>
    <form onSubmit={submit} className="mt-5"><fieldset disabled={pending} className="min-w-0 space-y-5">
      <div className="grid gap-5 sm:grid-cols-2"><label className="text-sm font-semibold">Nome do ponto<input value={name} onChange={(event) => setName(event.target.value)} maxLength={120} required className={inputClass} /></label><label className="text-sm font-semibold">Endereço<input value={address} onChange={(event) => setAddress(event.target.value)} maxLength={255} required className={inputClass} /></label><label className="text-sm font-semibold">Horários de funcionamento<input value={hours} onChange={(event) => setHours(event.target.value)} maxLength={120} placeholder="Ex.: Seg a sex, 08h às 18h" className={inputClass} /></label><label className="text-sm font-semibold">Capacidade<input type="number" min={0} step={1} value={capacity} onChange={(event) => setCapacity(event.target.value)} placeholder="Sem limite" className={inputClass} /><span className="mt-2 block text-xs font-normal text-gray-600">Deixe vazio para capacidade ilimitada. Zero significa nenhuma vaga.</span></label></div>
      <label className="flex items-center gap-3 text-sm font-semibold"><input type="checkbox" checked={active} onChange={(event) => setActive(event.target.checked)} />Ponto ativo</label>
      <ResponsiblePicker selected={operators} initialNames={point?.operators_display ?? []} onChange={setOperators} />
      <div className="flex flex-wrap gap-3"><button disabled={pending || uncertain} className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white disabled:opacity-50">{pending ? "Salvando…" : "Salvar ponto"}</button><button type="button" onClick={onCancel} className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold">{uncertain ? "Consultar a lista antes de repetir" : "Cancelar"}</button></div>
    </fieldset>
    {error && <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><p>{error}</p>{uncertain && <p className="mt-2">Consulte a lista antes de iniciar outro cadastro, para evitar duplicação.</p>}{expired && <Link href="/login" className="mt-2 inline-block font-semibold underline">Entrar novamente</Link>}</div>}
    </form>
  </section>;
}
