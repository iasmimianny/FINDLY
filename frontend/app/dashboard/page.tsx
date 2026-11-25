"use client";
import CreateItemButton from "../../components/CreateItemButton";

import { finishLoadingCycle } from "../../lib/loading-cycle";
import FindlyLoading from "../../components/FindlyLoading";
import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight, Bell, CheckCircle2, ExternalLink, LayoutDashboard, MapPin,
  Package, PlusCircle, RefreshCw, Search, SearchX,
} from "lucide-react";
import PrivateLayout from "../components/funcionario/PrivateLayout";
import type { DashboardSummary } from "../../lib/dashboard";
import { itemDate, readItemResponse, ItemApiError } from "../../lib/items";

function SummaryContent({ data }: { data: DashboardSummary }) {
  const counters = [
    { label: "Achados registrados", value: data.counts.found, Icon: Package },
    { label: "Perdas registradas", value: data.counts.lost, Icon: Search },
    { label: "Alertas de perda abertos", value: data.counts.openLost, Icon: Bell },
    { label: "Achados devolvidos", value: data.counts.returnedFound, Icon: CheckCircle2 },
  ];
  return <>
    <section aria-label="Resumo dos seus registros" className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {counters.map(({ label, value, Icon }) => <div key={label} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="mb-4 flex items-start justify-between gap-2"><p className="text-sm font-medium text-gray-600">{label}</p><Icon size={20} className="shrink-0 text-gray-500" aria-hidden="true" /></div>
        <p className="text-3xl font-bold tracking-tight text-gray-900">{value}</p>
      </div>)}
    </section>
    <div className="grid items-start gap-6 lg:grid-cols-12">
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold">Seus registros recentes</h2><p className="mt-1 text-sm text-gray-600">Últimos cadastros de objetos encontrados e alertas de perda.</p></div><Link href="/meus-itens" className="inline-flex items-center gap-1 text-sm font-semibold underline underline-offset-4">Ver todos<ArrowRight size={15} aria-hidden="true" /></Link></div>
        {data.recent.length ? <div className="divide-y divide-gray-100">{data.recent.map((item) => <Link
          key={`${item.kind}-${item.public_code}`} href={`/meus-itens?tipo=${item.kind}&busca=${encodeURIComponent(item.public_code)}`}
          className="group block rounded-xl px-2 py-4 transition hover:bg-gray-50 focus-visible:outline-2 focus-visible:outline-blue-600"
        >
          <div className="flex items-start justify-between gap-3"><div className="min-w-0"><h3 className="break-words text-sm font-semibold group-hover:underline">{item.title}</h3><p className="mt-1 text-xs text-gray-600">{item.kind === "found" ? "Encontrado" : "Perdido"} · {item.category}</p></div><span className="shrink-0 rounded-lg bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700">{item.status}</span></div>
          <p className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-600"><span>{item.location}</span><span>{itemDate(item.occurred_at)}</span></p>
          <p className="mt-1 font-mono text-xs text-gray-500">{item.public_code}</p>
        </Link>)}</div> : <div className="py-9 text-center"><SearchX size={32} className="mx-auto mb-3 text-gray-400" aria-hidden="true" /><h3 className="font-semibold">Você ainda não tem registros</h3><p className="mt-2 text-sm text-gray-600">Cadastre um item perdido ou encontrado para acompanhá-lo aqui.</p><CreateItemButton className="mt-4 inline-block rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white">Cadastrar primeiro item</CreateItemButton></div>}
      </section>
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 lg:col-span-5">
        <h2 className="flex items-center gap-2 text-lg font-bold"><MapPin size={20} className="text-blue-600" aria-hidden="true" />Pontos de coleta</h2>
        <p className="mb-3 mt-1 text-sm text-gray-600">Locais ativos cadastrados pela equipe.</p>
        <Link href="/pontos-coleta" className="mb-5 inline-flex items-center gap-1 text-sm font-semibold underline underline-offset-4">Ver todos os pontos<ArrowRight size={15} aria-hidden="true" /></Link>
        {data.points === null ? <p role="status" className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">Não foi possível consultar os pontos agora. Use Atualizar painel para tentar novamente.</p> : data.points.results.length === 0 ? <p className="rounded-xl bg-gray-50 p-4 text-sm text-gray-600">Nenhum ponto de coleta ativo cadastrado.</p> : <div className="space-y-4">
          {data.points.results.map((point) => <article key={point.id} className="rounded-xl border border-gray-200 bg-gray-50 p-4"><h3 className="font-semibold">{point.name}</h3>{point.address && <p className="mt-2 break-words text-sm leading-6 text-gray-600">{point.address}</p>}{point.opening_hours && <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600">Horário: {point.opening_hours}</p>}{point.address && <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${point.name}, ${point.address}`)}`} target="_blank" rel="noreferrer" className="mt-3 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4">Abrir no mapa<ExternalLink size={14} aria-hidden="true" /></a>}</article>)}
          {data.points.count > data.points.results.length && <p className="text-xs text-gray-600">Exibindo {data.points.results.length} de {data.points.count} pontos ativos.</p>}
        </div>}
      </section>
    </div>
  </>;
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [expired, setExpired] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      const startedAt = performance.now();
      try {
        const summary = await readItemResponse<DashboardSummary>(await fetch("/api/dashboard/", { credentials: "same-origin", cache: "no-store", signal: controller.signal }));
        if (!summary?.user || !summary?.counts || !Array.isArray(summary.recent)) throw new Error("Resposta do painel inválida. Tente novamente.");
        await finishLoadingCycle(startedAt, controller.signal);
        if (!controller.signal.aborted) { setData(summary); setExpired(false); }
      } catch (reason) {
        if (!controller.signal.aborted) { setError(reason instanceof Error ? reason.message : "Não foi possível carregar o painel."); setExpired(reason instanceof ItemApiError && reason.status === 401); }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    void load();
    return () => controller.abort();
  }, [attempt]);

  function reload() { setLoading(true); setError(""); setData(null); setAttempt((value) => value + 1); }
  return <PrivateLayout>
    <div className="min-h-screen bg-[#F5F6F8] text-gray-900">

      <div className="findly-page">
        <div className="mb-7 flex flex-wrap items-end justify-between gap-5">
          <div><p className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest findly-page-label"><LayoutDashboard size={16} aria-hidden="true" />Painel inicial</p><h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">{data?.user.full_name.trim() ? `Olá, ${data.user.full_name.trim().split(/\s+/)[0]}!` : "Bem-vindo ao Findly!"}</h1><p className="mt-2 text-sm leading-6 text-gray-600">Acompanhe seus registros e ajude objetos a voltarem para seus donos.</p></div>
          <button onClick={reload} disabled={loading} className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold disabled:opacity-50"><RefreshCw size={16} className={loading ? "animate-spin" : ""} aria-hidden="true" />Atualizar painel</button>
        </div>
        <section className="mb-7 rounded-3xl bg-black px-6 py-7 text-white sm:px-8"><h2 className="text-2xl font-bold tracking-tight">Perdeu ou encontrou algum objeto?</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-gray-300">Registre os detalhes e acompanhe a situação dos seus cadastros.</p><CreateItemButton className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-gray-100"><PlusCircle size={18} aria-hidden="true" />Cadastrar item</CreateItemButton></section>
        {loading ? <FindlyLoading message="Carregando os dados da sua conta…" /> : error ? <div role="alert" className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800"><p>{error}</p>{expired ? <Link href="/login" className="mt-3 inline-block font-semibold underline">Entrar novamente</Link> : <button onClick={reload} className="mt-3 rounded-lg border border-red-300 px-4 py-2 font-semibold">Tentar novamente</button>}</div> : data && <SummaryContent data={data} />}
        <section className="mt-8"><h2 className="mb-4 text-lg font-bold">Acesso rápido</h2><div className="grid gap-4 sm:grid-cols-3">
          {[{ href: "/meus-itens", title: "Meus itens", text: "Acompanhe seus registros.", Icon: Package }, { href: "/itens-perdidos?tipo=found", title: "Buscar objetos", text: "Consulte os itens encontrados.", Icon: Search }, { href: "/itens-perdidos", title: "Alertas de perda", text: "Veja o que estão procurando.", Icon: Bell }].map(({ href, title, text, Icon }) => <Link key={href} href={href} className="flex items-center gap-4 rounded-2xl border border-gray-200 bg-white p-5 hover:border-gray-400"><Icon size={23} className="shrink-0 text-gray-600" aria-hidden="true" /><div className="flex-1"><h3 className="text-sm font-semibold">{title}</h3><p className="mt-1 text-xs text-gray-600">{text}</p></div><ArrowRight size={17} aria-hidden="true" /></Link>)}
        </div></section>
        <footer className="mt-10 border-t border-gray-200 py-6 text-center text-xs text-gray-500">Findly · Centro Universitário UNIFIP</footer>
      </div>
    </div>
  </PrivateLayout>;
}
