"use client";
import Link from "next/link";
import { useState } from "react";
import { type Item, itemDate } from "../../lib/items";
import FindlyLoading from "../FindlyLoading";
import ItemPhotos from "../ItemPhotos";
import { StaffGate, Heading, useResource, Failure, box, button } from "./StaffUI";
type Custody = { id: number; collection_point: { name: string } | null; held_by_user: { full_name: string } | null; is_active: boolean; started_at: string; note: string };
function Detail({ code }: { code: string }) {
  const [version, setVersion] = useState(0);
  const item = useResource<Item>(`/api/staff/items/${code}/`, version);
  const custody = useResource<Custody[]>(`/api/custody/${code}/`, version);
  return <div className="w-full min-w-0"><Link href="/funcionario/inventario" className="mb-6 inline-block text-sm underline">Voltar ao inventário</Link><Heading title="Detalhes do item" description="Consulte os dados registrados e a cadeia de custódia do objeto." />
    {item.error ? <Failure message={item.error} retry={() => setVersion(version + 1)} /> : !item.data ? <FindlyLoading /> : <section className={box}><h2 className="text-2xl font-bold">{item.data.title}</h2><p className="mt-2 text-sm text-gray-600">{code} · {item.data.status_display}</p><p className="mt-4 whitespace-pre-wrap break-words text-sm">{item.data.description}</p><p className="mt-4 text-sm text-gray-600">{item.data.found_location} · {itemDate(item.data.found_at)}</p><ItemPhotos code={code} initialPhotos={item.data.photos} canUpload={!["DEVOLVIDO", "EXPIRADO", "ENCAMINHADO"].includes(item.data.status)} /><div className="mt-6 flex flex-wrap gap-3"><a href={`/api/staff/items/${code}/label/`} target="_blank" rel="noreferrer" className={button}>Abrir etiqueta QR</a><Link href={`/funcionario/historico?codigo=${code}`} className={button}>Ver movimentações</Link><Link href={`/funcionario/devolucoes?codigo=${code}`} className={button}>Ver reivindicações</Link><Link href="/funcionario/recebimento" className="rounded-xl border px-4 py-3 text-sm font-semibold">Receber / transferir</Link></div></section>}
    <section className={`${box} mt-6`}><h2 className="mb-4 text-lg font-bold">Histórico de custódia</h2>{custody.error ? <Failure message={custody.error} retry={() => setVersion(version + 1)} /> : !custody.data ? <FindlyLoading /> : !Array.isArray(custody.data) ? <p role="alert">Custódia inválida.</p> : !custody.data.length ? <p className="text-sm text-gray-600">Nenhuma custódia registrada.</p> : <ol className="space-y-4">{custody.data.map((record) => <li key={record.id} className="border-l-2 border-cyan-300 pl-4"><h3 className="font-semibold">{record.collection_point?.name ?? record.held_by_user?.full_name ?? "Responsável não informado"}{record.is_active && " · Atual"}</h3><p className="mt-1 text-xs text-gray-500">{new Date(record.started_at).toLocaleString("pt-BR")}</p><p className="mt-2 whitespace-pre-wrap break-words text-sm">{record.note}</p></li>)}</ol>}</section>
  </div>;
}
export default function StaffItemDetail({ code }: { code: string }) { return <StaffGate><Detail key={code} code={code} /></StaffGate>; }
