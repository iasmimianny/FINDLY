"use client";
import Link from "next/link";
import { useState } from "react";
import { type Item } from "../../lib/items";
import { useStaff } from "./StaffContext";
import FindlyLoading from "../FindlyLoading";
import { StaffGate, Heading, useResource, Failure, box, button, type Page } from "./StaffUI";
function Dashboard() {
  const staff = useStaff();
  const [version, setVersion] = useState(0);
  const all = useResource<Page<Item>>("/api/staff/items/?page=1&ordering=-created_at", version);
  const held = useResource<Page<Item>>("/api/staff/items/?status=EM_CUSTODIA", version);
  const waiting = useResource<Page<Item>>("/api/staff/items/?status=AGUARDANDO_RETIRADA", version);
  const returned = useResource<Page<Item>>("/api/staff/items/?status=DEVOLVIDO", version);
  const resources = [all, held, waiting, returned];
  const error = resources.find((resource) => resource.error)?.error;
  return <div className="mx-auto max-w-6xl"><Heading title="Visão geral" description="Resumo dos itens encontrados no campus. Seus pontos designados aparecem no menu e na seção Pontos de coleta." /><button onClick={() => setVersion(version + 1)} className={`${button} mb-6`}>Atualizar painel</button>
    {error ? <Failure message={error} retry={() => setVersion(version + 1)} /> : resources.some((resource) => !resource.data) ? <FindlyLoading /> : <><section className="mb-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{["Encontrados no campus", "Em custódia no campus", "Aguardando retirada", "Devolvidos"].map((label, index) => <div key={label} className={box}><p className="text-sm text-gray-600">{label}</p><p className="mt-3 text-3xl font-bold">{resources[index].data?.count ?? "—"}</p></div>)}</section><section className={box}><h2 className="mb-4 text-lg font-bold">Cadastros recentes</h2>{all.data?.results?.length ? <ul className="divide-y divide-gray-100">{all.data.results.slice(0, 5).map((item) => <li key={item.public_code}><Link href={`/funcionario/inventario/${item.public_code}`} className="flex flex-wrap justify-between gap-3 py-4 text-sm"><span className="font-semibold">{item.title}</span><span className="text-gray-600">{item.status_display} · {item.public_code}</span></Link></li>)}</ul> : <p className="text-sm text-gray-600">Nenhum item cadastrado ainda.</p>}</section></>}
    <section className={`${box} mt-6`}><h2 className="text-lg font-bold">Sua operação</h2><p className="mt-2 text-sm text-gray-600">{staff?.state.status === "ready" ? `${staff.state.points.count} pontos disponíveis para sua conta.` : "Consulte seus pontos de coleta."}</p><div className="mt-5 flex flex-wrap gap-3">{[["recebimento", "Receber item"], ["inventario", "Consultar inventário"], ["devolucoes", "Reivindicações e devoluções"], ["pontos-coleta", "Pontos de coleta"]].map(([path, label]) => <Link key={path} href={`/funcionario/${path}`} className={button}>{label}</Link>)}</div></section>
  </div>;
}
export default function StaffDashboard() { return <StaffGate><Dashboard /></StaffGate>; }
