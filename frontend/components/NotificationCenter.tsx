"use client";
import { Dropdown } from "@heroui/react";
import { Bell, BellOff, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { accountLinks, type NavigationArea } from "../lib/navigation";
import { updateSummary, validUpdates, type RequestUpdate, type UpdatePage } from "../lib/notifications";
import FindlyModal from "./FindlyModal";
import FindlyLoading from "./FindlyLoading";
import { useResource, Failure, Pagination, button, box } from "./funcionario/StaffUI";

function UpdateDetails({ update, onClose }: { update: RequestUpdate | null; onClose: () => void }) {
  const summary = update ? updateSummary(update) : null;
  return <FindlyModal open={!!update} onClose={onClose} title={summary?.title ?? "Notificação"}>{update && summary && <div className="space-y-4 text-sm leading-6"><p>{summary.text}</p><p className="rounded-xl bg-gray-50 p-4"><strong>{update.item.title}</strong><span className="mt-1 block font-mono text-xs text-gray-500">{update.item.public_code}</span></p>{update.decision_note && <p className="whitespace-pre-wrap break-words"><strong>Resposta da equipe: </strong>{update.decision_note}</p>}{update.withdrawal?.is_valid && <p>Autorização válida até {new Date(update.withdrawal.expires_at).toLocaleString("pt-BR")}. Confira o e-mail da sua conta para apresentar a autorização no ponto.</p>}<p className="text-xs text-gray-500">{new Date(summary.date).toLocaleString("pt-BR")}</p><button onClick={onClose} className={button}>Fechar</button></div>}</FindlyModal>;
}

export function NotificationDropdown({ area = "user" }: { area?: NavigationArea }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<RequestUpdate | null>(null);
  const [version, setVersion] = useState(0);
  const result = useResource<UpdatePage>(open ? "/api/notifications/?page=1" : null, version);
  const data = validUpdates(result.data) ? result.data : null;
  const error = result.error || (result.data && !data ? "Não foi possível ler as atualizações." : "");
  return <><Dropdown isOpen={open} onOpenChange={(value) => { setOpen(value); if (value) setVersion((previous) => previous + 1); }}>
    <Dropdown.Trigger aria-label="Abrir notificações" className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-700 transition hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-cyan-500"><Bell size={20} aria-hidden="true" /></Dropdown.Trigger>
    <Dropdown.Popover placement="bottom end" className="findly-overlay z-[90] w-[min(360px,calc(100vw_-_24px))] rounded-2xl border border-gray-200 bg-white p-2 text-gray-900 shadow-xl">
      <div className="border-b border-gray-100 px-3 pb-3 pt-2"><h2 className="text-base font-bold">Notificações</h2><p className="mt-1 text-xs text-gray-500">Atualizações dos seus pedidos</p></div>
      <Dropdown.Menu key={error ? "error" : !data ? "loading" : data.results.length ? "updates" : "empty"} aria-label="Atualizações dos seus pedidos" className="py-2">
        {error ? <Dropdown.Item key="retry" id="retry" textValue="Tentar novamente" onAction={() => setVersion((previous) => previous + 1)}><span className="text-sm text-red-700">Não foi possível carregar. Tentar novamente</span></Dropdown.Item> : !data ? <Dropdown.Item key="loading" id="loading" isDisabled textValue="Carregando notificações"><span className="px-2 py-4 text-sm text-gray-500">Carregando atualizações…</span></Dropdown.Item> : !data.results.length ? <Dropdown.Item key="empty" id="empty" isDisabled textValue="Nenhuma atualização dos seus pedidos"><div className="flex items-start gap-3 py-3"><BellOff size={20} className="shrink-0 text-gray-400" /><div><p className="text-sm font-semibold">Nenhuma atualização por enquanto</p><p className="mt-1 text-xs leading-5 text-gray-500">Os pedidos que você enviar aparecerão aqui.</p></div></div></Dropdown.Item> : data.results.slice(0, 3).map((entry) => { const summary = updateSummary(entry); return <Dropdown.Item key={entry.id} id={String(entry.id)} textValue={`${summary.title}: ${entry.item.title}`} onAction={() => setSelected(entry)} className="rounded-xl px-3 py-3"><div className="min-w-0"><p className="text-sm font-semibold">{summary.title}</p><p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-600">{summary.text}</p><time className="mt-2 block text-[11px] text-gray-500">{new Date(summary.date).toLocaleDateString("pt-BR")}</time></div></Dropdown.Item>; })}
        <Dropdown.Item key="all" id="all" textValue="Visualizar mais notificações" onAction={() => router.push(accountLinks(area).notifications)} className="mt-1 border-t border-gray-100 px-3 py-3 text-sm font-semibold"><span className="flex w-full items-center justify-between">Visualizar mais<ChevronRight size={16} aria-hidden="true" /></span></Dropdown.Item>
      </Dropdown.Menu>
    </Dropdown.Popover>
  </Dropdown><UpdateDetails update={selected} onClose={() => setSelected(null)} /></>;
}

export default function NotificationsPage() {
  const [page, setPage] = useState(1);
  const [version, setVersion] = useState(0);
  const [selected, setSelected] = useState<RequestUpdate | null>(null);
  const result = useResource<UpdatePage>(`/api/notifications/?page=${page}`, version);
  const data = validUpdates(result.data) ? result.data : null;
  return <div className="mx-auto max-w-5xl px-5 py-8 text-gray-900 sm:px-8"><header className="mb-7 flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-bold uppercase tracking-widest text-blue-600">Sua conta</p><h1 className="mt-2 text-3xl font-bold">Notificações</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">Acompanhe a situação dos seus pedidos de propriedade e das autorizações de retirada. Esta lista consulta os registros atuais dos seus pedidos.</p></div><button onClick={() => setVersion(version + 1)} className={button}>Atualizar</button></header>
    {result.error ? <Failure message={result.error} retry={() => setVersion(version + 1)} /> : !result.data ? <FindlyLoading /> : !data ? <Failure message="Não foi possível ler as atualizações." retry={() => setVersion(version + 1)} /> : <>{data.results.length ? <div className="space-y-3">{data.results.map((entry) => { const summary = updateSummary(entry); return <button key={entry.id} onClick={() => setSelected(entry)} className={`${box} flex w-full items-start gap-4 text-left transition hover:border-cyan-300 focus-visible:outline-2 focus-visible:outline-cyan-500`}><span className="rounded-full bg-cyan-50 p-3 text-cyan-700"><Bell size={20} aria-hidden="true" /></span><span className="min-w-0 flex-1"><strong className="block text-sm">{summary.title}</strong><span className="mt-1 block text-sm leading-6 text-gray-600">{summary.text}</span><time className="mt-2 block text-xs text-gray-500">{new Date(summary.date).toLocaleString("pt-BR")}</time></span><ChevronRight size={18} className="mt-3 shrink-0 text-gray-400" aria-hidden="true" /></button>; })}</div> : <section className={`${box} py-12 text-center`}><BellOff size={36} className="mx-auto mb-4 text-gray-400" aria-hidden="true" /><h2 className="font-bold">Nenhuma atualização por enquanto</h2><p className="mt-2 text-sm text-gray-600">Quando você enviar um pedido de propriedade, poderá acompanhar sua situação aqui.</p></section>}<Pagination data={data} page={page} onChange={setPage} /></>}
    <UpdateDetails update={selected} onClose={() => setSelected(null)} />
  </div>;
}
