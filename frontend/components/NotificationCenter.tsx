"use client";

import { Dropdown } from "@heroui/react";
import { Bell, BellOff, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { accountLinks, type NavigationArea } from "../lib/navigation";

import {
  notificationSummary,
  validNotifications,
  getUnreadCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  type Notification,
  type NotificationPage,
} from "../lib/notifications";

import FindlyModal from "./FindlyModal";
import FindlyLoading from "./FindlyLoading";

import {
  useResource,
  Failure,
  Pagination,
  button,
  box,
} from "./funcionario/StaffUI";

const NOTIFICATION_EVENT = "findly:notifications-updated";

const REFRESH_INTERVAL = 30000;

function notifyChanges() {
  window.dispatchEvent(new Event(NOTIFICATION_EVENT));
}

// Modal com os detalhes da notificação.

function UpdateDetails({
  update,
  onClose,
}: {
  update: Notification | null;
  onClose: () => void;
}) {
  const summary = update ? notificationSummary(update) : null;

  return (
    <FindlyModal
      open={!!update}
      onClose={onClose}
      title={summary?.title ?? "Notificação"}
    >
      {update && summary && (
        <div className="space-y-4 text-sm leading-6">
          <p className="whitespace-pre-wrap break-words">{summary.text}</p>

          <p className="text-xs text-gray-500">
            {new Date(summary.date).toLocaleString("pt-BR")}
          </p>
        </div>
      )}
    </FindlyModal>
  );
}

// Dropdown de notificações compartilhado entre as áreas.

export function NotificationDropdown({
  area = "user",
}: {
  area?: NavigationArea;
}) {
  const router = useRouter();

  const [open, setOpen] = useState(false);

  const [selected, setSelected] = useState<Notification | null>(null);

  const [version, setVersion] = useState(0);

  const [unreadCount, setUnreadCount] = useState(0);

  const [actionError, setActionError] = useState("");

  const [marking, setMarking] = useState(false);

  const result = useResource<NotificationPage>(
    open ? "/api/notifications/?page=1" : null,
    version,
  );

  const data = validNotifications(result.data) ? result.data : null;

  const error =
    result.error ||
    (result.data && !data ? "Não foi possível ler as notificações." : "");

  // Atualiza o contador mesmo com o dropdown fechado.

  useEffect(() => {
    let active = true;

    async function loadUnreadCount() {
      try {
        const count = await getUnreadCount();

        if (active) {
          setUnreadCount(count);
        }
      } catch {
        // Mantém o último contador válido.
      }
    }

    loadUnreadCount();

    const interval = window.setInterval(loadUnreadCount, REFRESH_INTERVAL);

    function handleChanges() {
      void loadUnreadCount();
      setVersion((previous) => previous + 1);
    }

    window.addEventListener(NOTIFICATION_EVENT, handleChanges);

    return () => {
      active = false;

      window.clearInterval(interval);

      window.removeEventListener(NOTIFICATION_EVENT, handleChanges);
    };
  }, []);

  // Atualiza a lista enquanto o dropdown estiver aberto.

  useEffect(() => {
    if (!open) return;

    const interval = window.setInterval(() => {
      setVersion((previous) => previous + 1);
    }, REFRESH_INTERVAL);

    return () => window.clearInterval(interval);
  }, [open]);

  // Abre uma notificação e registra sua leitura.

  async function openNotification(entry: Notification) {
    setActionError("");
    setSelected(entry);
    setOpen(false);

    if (entry.is_read) return;

    try {
      await markNotificationAsRead(entry.id);

      notifyChanges();
    } catch {
      setActionError("Não foi possível marcar a notificação como lida.");
    }
  }

  // Marca todas as notificações como lidas.

  async function markAllAsRead() {
    if (marking) return;

    setMarking(true);
    setActionError("");

    try {
      await markAllNotificationsAsRead();

      notifyChanges();
    } catch {
      setActionError("Não foi possível marcar todas como lidas.");
    } finally {
      setMarking(false);
    }
  }

  return (
    <>
      <Dropdown
        isOpen={open}
        onOpenChange={(value) => {
          setOpen(value);

          if (value) {
            setVersion((previous) => previous + 1);
          }
        }}
      >
        <Dropdown.Trigger
          aria-label={
            unreadCount > 0
              ? `Abrir notificações. ${unreadCount} não lidas`
              : "Abrir notificações"
          }
          className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-700 transition hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-cyan-500"
        >
          <Bell size={20} aria-hidden="true" />

          {unreadCount > 0 && (
            <span
              aria-hidden="true"
              className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-blue-600 px-1 text-[10px] font-bold text-white ring-2 ring-white"
            >
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </Dropdown.Trigger>

        <Dropdown.Popover
          placement="bottom end"
          className="findly-overlay z-[90] w-[calc(100vw-24px)] max-w-[360px] max-h-[75dvh] overflow-y-auto overflow-x-hidden rounded-2xl border border-gray-200 bg-white p-2 text-gray-900 shadow-xl"
        >
          <div className="border-b border-gray-100 px-3 pb-3 pt-2">
            <h2 className="text-base font-bold">Notificações</h2>

            <p className="mt-1 text-xs text-gray-500">
              Acompanhe suas atualizações
            </p>

            {unreadCount > 0 && (
              <p className="mt-1 text-xs font-medium text-blue-600">
                {unreadCount}{" "}
                {unreadCount === 1
                  ? "notificação não lida"
                  : "notificações não lidas"}
              </p>
            )}
          </div>

          {actionError && (
            <p role="alert" className="px-3 py-2 text-xs text-red-700">
              {actionError}
            </p>
          )}

          <Dropdown.Menu
            key={
              error
                ? "error"
                : !data
                  ? "loading"
                  : data.results.length
                    ? "notifications"
                    : "empty"
            }
            aria-label="Suas notificações"
            className="py-2"
          >
            {unreadCount > 0 && (
              <Dropdown.Item
                key="read-all"
                id="read-all"
                textValue="Marcar todas como lidas"
                isDisabled={marking}
                onAction={() => void markAllAsRead()}
                className="px-3 py-2 text-xs font-semibold text-blue-600"
              >
                {marking ? "Marcando..." : "Marcar todas como lidas"}
              </Dropdown.Item>
            )}

            {error ? (
              <Dropdown.Item
                key="retry"
                id="retry"
                textValue="Tentar novamente"
                onAction={() => setVersion((previous) => previous + 1)}
              >
                <span className="text-sm text-red-700">
                  Não foi possível carregar. Tentar novamente
                </span>
              </Dropdown.Item>
            ) : !data ? (
              <Dropdown.Item
                key="loading"
                id="loading"
                isDisabled
                textValue="Carregando notificações"
              >
                <span className="px-2 py-4 text-sm text-gray-500">
                  Carregando notificações…
                </span>
              </Dropdown.Item>
            ) : !data.results.length ? (
              <Dropdown.Item
                key="empty"
                id="empty"
                isDisabled
                textValue="Nenhuma notificação"
              >
                <div className="flex items-start gap-3 py-3">
                  <BellOff size={20} className="shrink-0 text-gray-400" />

                  <div>
                    <p className="text-sm font-semibold">
                      Nenhuma notificação por enquanto
                    </p>

                    <p className="mt-1 text-xs leading-5 text-gray-500">
                      Suas novas atualizações aparecerão aqui.
                    </p>
                  </div>
                </div>
              </Dropdown.Item>
            ) : (
              data.results.slice(0, 3).map((entry) => {
                const summary = notificationSummary(entry);

                return (
                  <Dropdown.Item
                    key={entry.id}
                    id={String(entry.id)}
                    textValue={`${summary.title}: ${summary.text}`}
                    onAction={() => void openNotification(entry)}
                    className={`rounded-xl px-3 py-3 ${
                      !entry.is_read ? "bg-blue-50" : ""
                    }`}
                  >
                    <div className="flex w-full items-start gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="break-words text-sm font-semibold">
                          {summary.title}
                        </p>

                        <p className="mt-1 line-clamp-2 text-xs leading-5 text-gray-600">
                          {summary.text}
                        </p>

                        <time
                          dateTime={summary.date}
                          className="mt-2 block text-[11px] text-gray-500"
                        >
                          {new Date(summary.date).toLocaleDateString("pt-BR")}
                        </time>
                      </div>

                      {!entry.is_read && (
                        <span
                          aria-label="Não lida"
                          className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-600"
                        />
                      )}
                    </div>
                  </Dropdown.Item>
                );
              })
            )}

            <Dropdown.Item
              key="all"
              id="all"
              textValue="Visualizar mais notificações"
              onAction={() => router.push(accountLinks(area).notifications)}
              className="mt-1 border-t border-gray-100 px-3 py-3 text-sm font-semibold"
            >
              <span className="flex w-full items-center justify-between">
                Visualizar mais
                <ChevronRight size={16} aria-hidden="true" />
              </span>
            </Dropdown.Item>
          </Dropdown.Menu>
        </Dropdown.Popover>
      </Dropdown>

      <UpdateDetails update={selected} onClose={() => setSelected(null)} />
    </>
  );
}

// Página completa de notificações.

export default function NotificationsPage() {
  const [page, setPage] = useState(1);

  const [version, setVersion] = useState(0);

  const [selected, setSelected] = useState<Notification | null>(null);

  const [unreadCount, setUnreadCount] = useState(0);

  const [actionError, setActionError] = useState("");

  const [marking, setMarking] = useState(false);

  const result = useResource<NotificationPage>(
    `/api/notifications/?page=${page}`,
    version,
  );

  const data = validNotifications(result.data) ? result.data : null;

  useEffect(() => {
    let active = true;

    async function loadUnreadCount() {
      try {
        const count = await getUnreadCount();

        if (active) {
          setUnreadCount(count);
        }
      } catch {
        // Mantém o último contador válido.
      }
    }

    loadUnreadCount();

    function handleChanges() {
      void loadUnreadCount();

      setVersion((previous) => previous + 1);
    }

    const interval = window.setInterval(handleChanges, REFRESH_INTERVAL);

    window.addEventListener(NOTIFICATION_EVENT, handleChanges);

    return () => {
      active = false;

      window.clearInterval(interval);

      window.removeEventListener(NOTIFICATION_EVENT, handleChanges);
    };
  }, []);

  async function openNotification(entry: Notification) {
    setActionError("");
    setSelected(entry);

    if (entry.is_read) return;

    try {
      await markNotificationAsRead(entry.id);

      notifyChanges();
    } catch {
      setActionError("Não foi possível marcar a notificação como lida.");
    }
  }

  async function markAllAsRead() {
    if (marking) return;

    setMarking(true);
    setActionError("");

    try {
      await markAllNotificationsAsRead();

      notifyChanges();
    } catch {
      setActionError("Não foi possível marcar todas como lidas.");
    } finally {
      setMarking(false);
    }
  }

  return (
    <div className="mx-auto w-full min-w-0 max-w-5xl px-4 py-5 text-gray-900 sm:px-6 sm:py-8 lg:px-8">
      <header className="mb-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-blue-600">
            Sua conta
          </p>

          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">Notificações</h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">
            Acompanhe as atualizações dos seus objetos, solicitações e demais
            atividades no Findly.
          </p>

          {unreadCount > 0 && (
            <p className="mt-2 text-sm font-medium text-blue-600">
              {unreadCount}{" "}
              {unreadCount === 1
                ? "notificação não lida"
                : "notificações não lidas"}
            </p>
          )}
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:items-center">
          {unreadCount > 0 && (
            <button
              onClick={() => void markAllAsRead()}
              disabled={marking}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:opacity-50"
            >
              {marking ? "Marcando..." : "Marcar todas como lidas"}
            </button>
          )}

          <button
            onClick={() => {
              setActionError("");
              notifyChanges();
            }}
            className={button}
          >
            Atualizar
          </button>
        </div>
      </header>

      {actionError && (
        <p
          role="alert"
          className="mb-4 rounded-xl bg-red-50 p-3 text-sm text-red-700"
        >
          {actionError}
        </p>
      )}

      {result.error ? (
        <Failure
          message={result.error}
          retry={() => setVersion((previous) => previous + 1)}
        />
      ) : !result.data ? (
        <FindlyLoading />
      ) : !data ? (
        <Failure
          message="Não foi possível ler as notificações."
          retry={() => setVersion((previous) => previous + 1)}
        />
      ) : (
        <>
          {data.results.length ? (
            <div className="space-y-3">
              {data.results.map((entry) => {
                const summary = notificationSummary(entry);

                return (
                  <button
                    key={entry.id}
                    onClick={() => void openNotification(entry)}
                    className={`${box} relative flex w-full min-w-0 items-start gap-2 text-left transition hover:border-cyan-300 focus-visible:outline-2 focus-visible:outline-cyan-500 sm:gap-4 ${
                      !entry.is_read ? "!border-blue-200 !bg-blue-50/50" : ""
                    }`}
                  >
                    <span className="shrink-0 rounded-full bg-cyan-50 p-2 text-cyan-700 sm:p-3">
                      <Bell size={20} aria-hidden="true" />
                    </span>

                    <span className="min-w-0 flex-1">
                      <span className="flex flex-wrap items-center gap-2">
                        <strong className="min-w-0 break-words text-sm">
                          {summary.title}
                        </strong>

                        {!entry.is_read && (
                          <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[10px] font-semibold text-blue-700">
                            Nova
                          </span>
                        )}
                      </span>

                      <span className="mt-1 block whitespace-pre-wrap break-words text-sm leading-6 text-gray-600">
                        {summary.text}
                      </span>

                      <time
                        dateTime={summary.date}
                        className="mt-2 block text-xs text-gray-500"
                      >
                        {new Date(summary.date).toLocaleString("pt-BR")}
                      </time>
                    </span>

                    <ChevronRight
                      size={18}
                      className="mt-3 hidden shrink-0 text-gray-400 sm:block"
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
          ) : (
            <section className={`${box} py-12 text-center`}>
              <BellOff
                size={36}
                className="mx-auto mb-4 text-gray-400"
                aria-hidden="true"
              />

              <h2 className="font-bold">Nenhuma notificação por enquanto</h2>

              <p className="mt-2 text-sm text-gray-600">
                Quando houver novas atividades relacionadas à sua conta, as
                notificações aparecerão aqui.
              </p>
            </section>
          )}

          <Pagination data={data} page={page} onChange={setPage} />
        </>
      )}

      <UpdateDetails update={selected} onClose={() => setSelected(null)} />
    </div>
  );
}
