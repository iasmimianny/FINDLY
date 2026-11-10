
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ChangeEvent } from "react";
import {
  CalendarDays,
  MapPin,
  Search,
  Star,
  X,
} from "lucide-react";
import PrivateLayout from "../components/funcionario/PrivateLayout";

type Favorito = {
  id: number;
  titulo: string;
  categoria: string;
  local: string;
  data: string;
  status: "Perdido" | "Encontrado";
  imagem: string;
};

const favoritosIniciais: Favorito[] = [
  {
    id: 1,
    titulo: "Carteira de couro marrom",
    categoria: "Acessórios",
    local: "Bloco A",
    data: "18/10/2026",
    status: "Perdido",
    imagem:
      "https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: 2,
    titulo: "Chaveiro com três chaves",
    categoria: "Chaves",
    local: "Bloco B",
    data: "18/10/2026",
    status: "Encontrado",
    imagem: "/chaveiro.svg",
  },
  {
    id: 3,
    titulo: "Fone de ouvido preto",
    categoria: "Eletrônicos",
    local: "Biblioteca",
    data: "17/10/2026",
    status: "Encontrado",
    imagem:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: 4,
    titulo: "Garrafa térmica azul",
    categoria: "Garrafas",
    local: "Cantina",
    data: "16/10/2026",
    status: "Perdido",
    imagem:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: 5,
    titulo: "Crachá de estudante",
    categoria: "Documentos",
    local: "Recepção",
    data: "15/10/2026",
    status: "Encontrado",
    imagem: "/cracha.svg",
  },
];

export default function ItensFavoritos() {
  const [favoritos, setFavoritos] = useState(favoritosIniciais);
  const [busca, setBusca] = useState("");

  const favoritosFiltrados = favoritos.filter((item) =>
    `${item.titulo} ${item.categoria} ${item.local}`
      .toLowerCase()
      .includes(busca.trim().toLowerCase())
  );

  function handleBuscaChange(event: ChangeEvent<HTMLInputElement>) {
    setBusca(event.target.value);
  }

  function removerFavorito(id: number) {
    setFavoritos((itensAtuais) =>
      itensAtuais.filter((item) => item.id !== id)
    );
  }

  const cardClass =
    "rounded-2xl border border-gray-100 bg-white p-5 shadow-sm";

  return (
    <PrivateLayout>
      <main className="min-h-screen bg-white text-gray-900 font-sans">
        <div className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-10">

          {/* Cabeçalho */}
          <div className="mb-8">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#42a5df]">
              MEUS REGISTROS
            </p>

            <h1 className="flex items-center gap-3 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Itens favoritos
              <Star className="h-7 w-7 fill-amber-400 text-amber-400" />
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-500">
              Acompanhe os itens que você salvou para consultar posteriormente.
            </p>
          </div>

          {/* Campo de busca */}
          <div className={`${cardClass} mb-5`}>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Buscar favoritos
            </label>

            <div className="relative">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

              <input
                type="search"
                value={busca}
                onChange={handleBuscaChange}
                placeholder="Buscar por item, categoria ou local"
                className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#42a5df] focus:ring-2 focus:ring-[#42a5df]/20"
              />
            </div>
          </div>

          {/* Quantidade de favoritos */}
          <p className="mb-3 text-sm text-gray-500">
            {favoritosFiltrados.length}{" "}
            {favoritosFiltrados.length === 1 ? "item salvo" : "itens salvos"}
          </p>

          {/* Lista de favoritos */}
          {favoritosFiltrados.length > 0 ? (
            <section className={cardClass}>
              <div className="mb-5">
                <h2 className="text-lg font-bold text-gray-900">
                  Sua lista de favoritos
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Itens que você deseja acompanhar.
                </p>
              </div>

              <div className="divide-y divide-gray-100">
                {favoritosFiltrados.map((item) => (
                  <article
                    key={item.id}
                    className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                  >
                    {/* Imagem */}
                    <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                      <Image
                        src={item.imagem}
                        alt={item.titulo}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>

                    {/* Informações */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate font-semibold text-gray-900">
                          {item.titulo}
                        </h3>

                        <span
                          className={`rounded-lg px-3 py-1 text-xs font-semibold ${
                            item.status === "Encontrado"
                              ? "bg-green-50 text-green-700"
                              : "bg-red-50 text-red-700"
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-gray-500">
                        {item.categoria}
                      </p>

                      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                        <span className="inline-flex items-center gap-1.5">
                          <MapPin className="h-3.5 w-3.5" />
                          {item.local}
                        </span>

                        <span className="inline-flex items-center gap-1.5">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {item.data}
                        </span>
                      </div>
                    </div>

                    {/* Remover favorito */}
                    <button
                      type="button"
                      onClick={() => removerFavorito(item.id)}
                      aria-label={`Remover ${item.titulo} dos favoritos`}
                      className="shrink-0 rounded-xl p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </article>
                ))}
              </div>
            </section>
          ) : (
            /* Lista vazia */
            <section className={`${cardClass} py-10 text-center`}>
              <Star className="mx-auto h-9 w-9 text-amber-400" />

              <h2 className="mt-3 font-bold text-gray-900">
                {favoritos.length === 0
                  ? "Sua lista de favoritos está vazia"
                  : "Nenhum favorito encontrado"}
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                {favoritos.length === 0
                  ? "Explore os itens perdidos e salve aqueles que deseja acompanhar."
                  : "Tente buscar por outro item ou local."}
              </p>

              {favoritos.length === 0 && (
                <Link
                  href="/itens-perdidos"
                  className="mt-5 inline-flex items-center rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                  Explorar itens perdidos
                </Link>
              )}
            </section>
          )}
        </div>
      </main>
    </PrivateLayout>
  );
}
