"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ChangeEvent } from "react";
import { ArrowLeft, CalendarDays, MapPin, Search, Star, X } from "lucide-react";

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
    imagem: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&auto=format&fit=crop&q=80",
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
    imagem: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=80",
  },
  {
    id: 4,
    titulo: "Garrafa térmica azul",
    categoria: "Garrafas",
    local: "Cantina",
    data: "16/10/2026",
    status: "Perdido",
    imagem: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&auto=format&fit=crop&q=80",
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
    setFavoritos((itensAtuais) => itensAtuais.filter((item) => item.id !== id));
  }

  return (
    <main className="min-h-screen bg-gray-50 text-black">
      <header className="bg-black text-white">
        <div className="mx-auto flex h-[74px] max-w-5xl items-center justify-between gap-4 px-6">
          <Link href="/" className="flex items-center gap-3" aria-label="Findly, página inicial">
            <Image
              src="/logo-findly.jpg"
              alt=""
              width={44}
              height={44}
              className="rounded-full object-cover"
            />
            <span className="font-bold tracking-wide">FINDLY</span>
          </Link>
          <Link href="/meus-itens" className="text-sm font-semibold hover:text-[#42a5df]">
            Meus itens
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10">
        <Link
          href="/"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-black"
        >
          <ArrowLeft size={17} />
          Voltar ao início
        </Link>

        <div className="mb-7">
          <h1 className="flex items-center gap-3 text-4xl font-black italic">
            Itens favoritos
            <Star className="h-7 w-7 fill-amber-400 text-amber-400" />
          </h1>
          <p className="mt-2 text-gray-600">Itens salvos para acompanhar mais tarde.</p>
        </div>

        <label className="relative mb-5 block">
          <span className="sr-only">Buscar nos favoritos</span>
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <input
            type="search"
            value={busca}
            onChange={handleBuscaChange}
            placeholder="Buscar por item ou local"
            className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 outline-none focus:border-[#42a5df]"
          />
        </label>

        <p className="mb-3 text-sm text-gray-500">
          {favoritosFiltrados.length}{" "}
          {favoritosFiltrados.length === 1 ? "item salvo" : "itens salvos"}
        </p>

        {favoritosFiltrados.length > 0 ? (
          <section className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white px-5">
            {favoritosFiltrados.map((item) => (
              <article key={item.id} className="flex items-center gap-4 py-4">
                <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                  <Image
                    src={item.imagem}
                    alt={item.titulo}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="truncate font-bold">{item.titulo}</h2>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        item.status === "Encontrado"
                          ? "bg-green-100 text-green-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-500">{item.categoria}</p>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500">
                    <span className="inline-flex items-center gap-1.5">
                      <MapPin size={14} />
                      {item.local}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays size={14} />
                      {item.data}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removerFavorito(item.id)}
                  aria-label={`Remover ${item.titulo} dos favoritos`}
                  className="shrink-0 rounded-full p-2 text-gray-400 transition hover:bg-red-50 hover:text-red-600"
                >
                  <X size={18} />
                </button>
              </article>
            ))}
          </section>
        ) : (
          <section className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-10 text-center">
            <Star className="mx-auto h-8 w-8 text-amber-400" />
            <h2 className="mt-3 font-bold">
              {favoritos.length === 0 ? "Sua lista de favoritos está vazia" : "Nenhum favorito encontrado"}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              {favoritos.length === 0
                ? "Explore os itens perdidos e salve os que deseja acompanhar."
                : "Tente buscar por outro item ou local."}
            </p>
            {favoritos.length === 0 && (
              <Link
                href="/itens-perdidos"
                className="mt-5 inline-flex rounded-xl bg-black px-4 py-3 text-sm font-bold text-white hover:bg-gray-800"
              >
                Explorar itens perdidos
              </Link>
            )}
          </section>
        )}

        <p className="mt-5 text-xs text-gray-500">
          Estes são exemplos locais; seus favoritos não ficam salvos após recarregar a página.
        </p>
      </div>
    </main>
  );
}
