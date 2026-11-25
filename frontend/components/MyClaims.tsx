"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import PrivateLayout from "../app/components/funcionario/PrivateLayout";
import { useResource, Failure, Pagination } from "./funcionario/StaffUI";
import FindlyLoading from "./FindlyLoading";
import ConfirmItemAction from "./ConfirmItemAction";
import type { ClaimPage, Withdrawal } from "../lib/items";

function date(value: string) {
  return new Date(value).toLocaleString("pt-BR");
}

function Authorization({ authority }: { authority: Withdrawal }) {
  const [now, setNow] = useState(() => Date.now());
  const [imageFailed, setImageFailed] = useState(false);
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 15000);
    return () => clearInterval(timer);
  }, []);
  if (authority.used_at) return <p className="mt-4 rounded-xl bg-green-50 p-4 text-sm text-green-800">Retirada realizada em {date(authority.used_at)}.</p>;
  if (!authority.is_valid || !(Date.parse(authority.expires_at) > now)) return <p className="mt-4 rounded-xl bg-amber-50 p-4 text-sm text-amber-900">Autorização expirada ou indisponível. Procure o funcionário responsável para orientação.</p>;
  return <div className="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4">
    <h3 className="font-semibold">QR Code de retirada</h3>
    <p className="mt-2 text-sm">Apresente este QR Code ao funcionário no ponto de coleta responsável. Válido até {date(authority.expires_at)}.</p>
    {authority.qr_image && !imageFailed ? (
      // QR fornecido pelo backend; não gerar uma autorização no navegador.
      // eslint-disable-next-line @next/next/no-img-element
      <img src={authority.qr_image} alt="QR Code da autorização de retirada" width={240} height={240} onError={() => setImageFailed(true)} className="mt-4 h-auto max-w-full rounded-lg bg-white p-3" />
    ) : <p role="status" className="mt-3 text-sm">QR Code indisponível. Atualize a lista ou peça orientação ao funcionário.</p>}
    <p className="mt-3 text-xs text-gray-600">A retirada só é concluída após a validação pelo funcionário.</p>
  </div>;
}

export default function MyClaims() {
  const [page, setPage] = useState(1);
  const [version, setVersion] = useState(0);
  const { data, error } = useResource<ClaimPage>(`/api/items/claims/?page=${page}`, version);
  return <PrivateLayout><main className="findly-page text-gray-900">
    <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div><p className="findly-page-label text-xs font-bold uppercase tracking-widest">Minhas reivindicações</p><h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Minhas solicitações</h1><p className="mt-3 text-sm text-gray-600">Acompanhe suas reivindicações e apresente o QR Code quando a retirada for autorizada.</p></div>
      <button onClick={() => setVersion(v => v + 1)} className="rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold">Atualizar lista</button>
    </header>
    {error ? <Failure message={error} retry={() => setVersion(v => v + 1)} /> : !data ? <FindlyLoading message="Carregando solicitações…" /> : <>
      {!data.results.length ? <div className="rounded-2xl border bg-white p-8 text-center"><h2 className="font-semibold">Nenhuma solicitação nesta página</h2><p className="mt-2 text-sm text-gray-600">Suas reivindicações aparecerão aqui depois de enviadas.</p><Link href="/itens-perdidos?tipo=found" className="mt-4 inline-block font-semibold text-blue-700 underline">Ver objetos encontrados no mural</Link></div> : <div className="space-y-5">{data.results.map(claim => <article key={claim.id} className="rounded-2xl border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap justify-between gap-3"><h2 className="break-words text-lg font-semibold">{claim.item.title}</h2><span className="rounded-lg bg-gray-100 px-3 py-1 text-sm">{claim.status_display}</span></div>
        <p className="mt-2 text-xs text-gray-600">Código do item: {claim.item.public_code} · Enviada em {date(claim.created_at)}</p>
        <p className="mt-4 whitespace-pre-wrap break-words text-sm"><strong>Sua comprovação:</strong> {claim.message}</p>
        {claim.decision_note && <p className="mt-3 whitespace-pre-wrap break-words text-sm"><strong>Observação do funcionário:</strong> {claim.decision_note}</p>}
        {claim.status === "PENDING" && <div className="mt-4"><ConfirmItemAction label="Cancelar solicitação" description="Deseja cancelar esta reivindicação? Ela deixará de aguardar análise do funcionário." endpoint={`/api/items/claims/${claim.id}/cancel/`} onChanged={() => setVersion(v => v + 1)} /></div>}
        {claim.status === "PENDING" && <p className="mt-4 text-sm text-gray-600">Aguardando análise do funcionário. Atualize a lista para consultar a decisão.</p>}
        {claim.withdrawal?.used_at ? <Authorization authority={claim.withdrawal} /> : claim.status === "APPROVED" && (claim.withdrawal ? <Authorization authority={claim.withdrawal} /> : <p className="mt-4 text-sm">Autorização ainda indisponível. Atualize a lista ou procure o funcionário responsável.</p>)}
      </article>)}</div>}
      <Pagination data={data} page={page} onChange={setPage} />
    </>}
  </main></PrivateLayout>;
}
