"use client";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { type Item, categories, statuses, itemDate } from "../../lib/items";
import FindlyLoading from "../FindlyLoading";
import { StaffGate, Heading, useResource, Failure, Pagination, Empty, box, field, button, type Page } from "./StaffUI";

function Inventory() {
  const [filters, setFilters] = useState({ search: "", status: "", category: "", page: 1 });
  const [draft, setDraft] = useState("");
  const [version, setVersion] = useState(0);
  const params = new URLSearchParams({ ...filters, page: String(filters.page), ordering: "-created_at" });
  const { data, error } = useResource<Page<Item>>(`/api/staff/items/?${params}`, version);
  function search(event: FormEvent) { event.preventDefault(); setFilters({ ...filters, search: draft.trim(), page: 1 }); }
  const valid = data && Array.isArray(data.results) && Number.isInteger(data.count);
  return <div className="w-full min-w-0"><Heading title="Inventário" description="Consulte os itens encontrados no campus. Abra um item para verificar o ponto que mantém sua custódia e suas movimentações." />
    <form onSubmit={search} className={`${box} mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4`}><label className="text-sm font-semibold">Nome ou código<input value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="Pesquisar itens" className={`${field} mt-2`} /></label><label className="text-sm font-semibold">Situação<select value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value, page: 1 })} className={`${field} mt-2`}><option value="">Todas</option>{statuses.found.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className="text-sm font-semibold">Categoria<select value={filters.category} onChange={(event) => setFilters({ ...filters, category: event.target.value, page: 1 })} className={`${field} mt-2`}><option value="">Todas</option>{categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><div className="flex items-end gap-2"><button className={button}>Buscar</button><button type="button" onClick={() => { setDraft(""); setFilters({ search: "", category: "", status: "", page: 1 }); setVersion(version + 1); }} className="rounded-xl border px-3 py-3 text-sm">Limpar</button></div></form>
    {error ? <Failure message={error} retry={() => setVersion(version + 1)} /> : !data ? <FindlyLoading /> : !valid ? <Failure message="Lista de itens inválida." retry={() => setVersion(version + 1)} /> : <><p className="mb-4 text-sm text-gray-600">{data.count} registros · Campus inteiro</p>{data.results.length ? <div className="grid gap-4 lg:grid-cols-2">{data.results.map((item) => <article key={item.public_code} className={box}><div className="flex items-start justify-between gap-3"><h2 className="text-lg font-bold">{item.title}</h2><span className="rounded-lg bg-gray-100 px-2 py-1 text-xs">{item.status_display}</span></div><p className="mt-2 text-sm text-gray-600">{item.category_display} · {item.found_location}</p><p className="mt-2 text-xs text-gray-500">{item.public_code} · {itemDate(item.found_at)}</p><Link href={`/funcionario/inventario/${item.public_code}`} className={`${button} mt-5`}>Ver item e custódia</Link></article>)}</div> : <Empty>Nenhum item encontrado. Os objetos cadastrados aparecerão aqui.</Empty>}<Pagination data={data} page={filters.page} onChange={(page) => setFilters({ ...filters, page })} /></>}
  </div>;
}
export default function StaffInventory() { return <StaffGate><Inventory /></StaffGate>; }
