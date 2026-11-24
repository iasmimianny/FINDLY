"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { Package, Plus, Search } from "lucide-react";

import PrivateLayout from "../app/components/funcionario/PrivateLayout";
import FindlyLoading from "./FindlyLoading";
import { useResource } from "./funcionario/StaffUI";
import type { Profile } from "../lib/profile";
import ItemCard from "./items/ItemCard";
import CreateItemButton from "./CreateItemButton";

import { finishLoadingCycle } from "../lib/loading-cycle";

import {
  categories,
  statuses,
  itemListPath,
  readItemResponse,
  ItemApiError,
  type ItemKind,
  type ItemPage,
  type ItemQuery,
} from "../lib/items";

const inputClass =
  "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100";

const primaryButton =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800";

const secondaryButton =
  "rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-40";

function Results({
  query,
  onPage,
}: {
  query: ItemQuery;
  onPage: (page: number) => void;
}) {
  const { data: viewer, error: identityError } = useResource<Profile>("/api/account/me/");
  const [result, setResult] = useState<ItemPage | null>(null);
  const [error, setError] = useState("");
  const [expired, setExpired] = useState(false);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    async function load() {
      const startedAt = performance.now();

      try {
        const data = await readItemResponse<ItemPage>(
          await fetch(itemListPath(query), {
            signal: controller.signal,
            cache: "no-store",
            credentials: "same-origin",
          })
        );

        if (
          !Array.isArray(data?.results) ||
          typeof data.count !== "number"
        ) {
          throw new Error("Resposta de listagem inválida.");
        }

        await finishLoadingCycle(startedAt, controller.signal);

        if (!controller.signal.aborted) {
          setResult(data);
          setError("");
        }
      } catch (reason) {
        if (!controller.signal.aborted) {
          setError(
            reason instanceof Error
              ? reason.message
              : "Não foi possível carregar os itens."
          );

          setExpired(
            reason instanceof ItemApiError &&
              reason.status === 401
          );
        }
      }
    }

    void load();

    return () => controller.abort();
  }, [query, attempt]);

  if (error) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-800"
      >
        <p>{error}</p>

        {expired ? (
          <Link
            href="/login"
            className="mt-3 inline-block font-semibold underline"
          >
            Entrar novamente
          </Link>
        ) : (
          <button
            className="mt-3 rounded-lg border border-red-300 px-4 py-2 font-semibold"
            onClick={() => {
              setError("");
              setAttempt((value) => value + 1);
            }}
          >
            Tentar novamente
          </button>
        )}
      </div>
    );
  }

  if (!result) {
    return <FindlyLoading message="Carregando registros…" />;
  }

  return (
    <section aria-label="Resultados" aria-live="polite">
      <p className="mb-4 text-sm text-gray-600">
        {result.count}{" "}
        {result.count === 1 ? "registro" : "registros"} ·{" "}
        {query.kind === "found"
          ? "Itens encontrados"
          : "Itens perdidos"}
        {query.mine ? " por você" : ""}
        {!query.mine && query.kind === "lost" ? " · Somente alertas em aberto" : ""}
      </p>

      {identityError && (
        <p role="alert" className="mb-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-900">
          Não foi possível confirmar sua conta. Recarregue a página para liberar as ações dos anúncios.
        </p>
      )}
      {result.results.length ? (
        <div className="space-y-4">
          {result.results.map((item) => (
            <ItemCard
              key={`${query.kind}-${item.public_code}`}
              item={item}
              kind={query.kind}
              viewerId={viewer?.id}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-gray-200 bg-white p-10 text-center">
          <Package
            className="mx-auto mb-3 text-gray-400"
            size={36}
          />

          <h2 className="font-semibold text-gray-800">
            Nenhum registro encontrado
          </h2>

          <p className="mt-2 text-sm text-gray-600">
            {query.search || query.category || query.status
              ? "Tente outra busca ou altere os filtros."
              : query.mine
              ? "Cadastre um item para vê-lo aqui."
              : "Os registros aparecerão aqui quando forem cadastrados."}
          </p>
        </div>
      )}

      {(result.previous || result.next) && (
        <nav
          aria-label="Paginação dos registros"
          className="mt-6 flex items-center justify-between gap-3"
        >
          <button
            disabled={!result.previous}
            onClick={() => onPage(query.page - 1)}
            className={secondaryButton}
          >
            Anterior
          </button>

          <span className="text-sm text-gray-600">
            Página {query.page}
          </span>

          <button
            disabled={!result.next}
            onClick={() => onPage(query.page + 1)}
            className={secondaryButton}
          >
            Próxima
          </button>
        </nav>
      )}
    </section>
  );
}

export default function ItemList({
  mine = false,
  initialKind = "lost",
  initialSearch = "",
  initialCreate = false,
}: {
  mine?: boolean;
  initialKind?: ItemKind;
  initialSearch?: string;
  initialCreate?: boolean;
}) {
  const [query, setQuery] = useState<ItemQuery>({
    kind: initialKind,
    search: initialSearch,
    category: "",
    status: "",
    page: 1,
    mine,
  });

  const [search, setSearch] = useState(initialSearch);
  const [revision, setRevision] = useState(0);

  function updateQuery(changes: Partial<ItemQuery>) {
    setQuery((previous) => ({
      ...previous,
      page: 1,
      ...changes,
    }));
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    updateQuery({ search: search.trim() });
  }

  function clearFilters() {
    setSearch("");

    updateQuery({
      search: "",
      category: "",
      status: "",
    });
  }

  return (
    <PrivateLayout>
      <div className="min-h-screen bg-white font-sans text-gray-900">
        <div className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-10">

          <header className="mb-8 flex flex-wrap items-end justify-between gap-5">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-[#42a5df]">
                {mine ? "Meus registros" : "Explorar registros"}
              </p>

              <h1 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">
                {mine ? "Meus itens cadastrados" : "Mural de achados e perdidos"}
              </h1>

              <p className="mt-3 max-w-xl text-sm leading-6 text-gray-600">
                {mine
                  ? "Acompanhe seus registros de perda e de objetos encontrados."
                  : "Consulte os objetos encontrados e os alertas de perda no campus."}
              </p>
            </div>

            <CreateItemButton className={primaryButton} initiallyOpen={initialCreate} onCreated={() => setRevision(v => v + 1)}>
              <Plus size={17} />
              Cadastrar item
            </CreateItemButton>
          </header>

          <div
            role="group"
            aria-label="Tipo de registro"
            className="mb-5 flex gap-3"
          >
            {(
              [
                ["lost", "Perdidos"],
                ["found", "Encontrados"],
              ] as const
            ).map(([kind, label]) => (
              <button
                key={kind}
                type="button"
                aria-pressed={query.kind === kind}
                onClick={() =>
                  updateQuery({ kind, status: "" })
                }
                className={`rounded-xl border px-5 py-3 text-sm font-semibold ${
                  query.kind === kind
                    ? "border-black bg-black text-white"
                    : "border-gray-300 bg-white text-gray-700 hover:border-gray-500"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          <form
            onSubmit={submit}
            className="mb-6 rounded-2xl border border-gray-200 bg-gray-50 p-5"
          >
            <div className="grid items-end gap-4 sm:grid-cols-2 lg:grid-cols-4">

              <div className="lg:col-span-2">
                <label
                  htmlFor="item-search"
                  className="mb-2 block text-sm font-semibold"
                >
                  Pesquisar
                </label>

                <input
                  id="item-search"
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Nome, descrição, local ou código"
                  className={inputClass}
                />
              </div>

              <div>
                <label
                  htmlFor="item-category"
                  className="mb-2 block text-sm font-semibold"
                >
                  Categoria
                </label>

                <select
                  id="item-category"
                  value={query.category}
                  onChange={(e) =>
                    updateQuery({ category: e.target.value })
                  }
                  className={inputClass}
                >
                  <option value="">Todas</option>

                  {categories.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="item-status"
                  className="mb-2 block text-sm font-semibold"
                >
                  Situação
                </label>

                <select
                  id="item-status"
                  value={!mine && query.kind === "lost" ? "ABERTO" : query.status}
                  disabled={!mine && query.kind === "lost"}
                  onChange={(e) =>
                    updateQuery({ status: e.target.value })
                  }
                  className={inputClass}
                >
                  {(mine || query.kind !== "lost") && <option value="">Todas</option>}

                  {statuses[query.kind].filter(([value]) => mine || query.kind !== "lost" || value === "ABERTO").map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <button type="submit" className={primaryButton}>
                <Search size={16} />
                Buscar
              </button>

              <button
                type="button"
                className={secondaryButton}
                onClick={clearFilters}
              >
                Limpar filtros
              </button>
            </div>
          </form>

          <Results
            key={`${JSON.stringify(query)}-${revision}`}
            query={query}
            onPage={(page) => updateQuery({ page })}
          />
        </div>
      </div>
    </PrivateLayout>
  );
}