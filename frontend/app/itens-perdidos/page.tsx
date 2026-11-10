"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, type ChangeEvent } from "react";
import { CalendarDays, MapPin, Plus, Search, Package } from "lucide-react";
import PrivateLayout from "../components/funcionario/PrivateLayout";

const itensPerdidos = [
  {
    id: 1,
    titulo: "Chaveiro com três chaves",
    categoria: "Chaves",
    local: "Bloco B",
    data: "18/10/2026",
    imagem: "/chaveiro.svg",
  },
  {
    id: 2,
    titulo: "Garrafa térmica azul",
    categoria: "Garrafas",
    local: "Biblioteca",
    data: "18/10/2026",
    imagem:
      "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=240&auto=format&fit=crop&q=80",
  },
  {
    id: 3,
    titulo: "Carteira preta",
    categoria: "Acessórios",
    local: "Cantina",
    data: "17/10/2026",
    imagem:
      "https://images.unsplash.com/photo-1627123424574-724758594e93?w=240&auto=format&fit=crop&q=80",
  },
  {
    id: 4,
    titulo: "Crachá de estudante",
    categoria: "Documentos",
    local: "Recepção",
    data: "16/10/2026",
    imagem: "/cracha.svg",
  },
  {
    id: 5,
    titulo: "Guarda-chuva preto",
    categoria: "Acessórios",
    local: "Entrada do bloco A",
    data: "15/10/2026",
    imagem:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=240&auto=format&fit=crop&q=80",
  },
];

export default function ItensPerdidos() {
  const [busca, setBusca] = useState("");

  const itensFiltrados = itensPerdidos.filter((item) =>
    `${item.titulo} ${item.categoria} ${item.local}`
      .toLowerCase()
      .includes(busca.trim().toLowerCase()),
  );

  function handleBuscaChange(event: ChangeEvent<HTMLInputElement>) {
    setBusca(event.target.value);
  }

  const cardClass = "rounded-2xl border border-gray-100 bg-white p-5 shadow-sm";

  return (
    <PrivateLayout>
      <main className="min-h-screen bg-white text-gray-900 font-sans">
        <div className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-10">
          {/* Cabeçalho */}
          <div className="mb-8">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#42a5df]">
              EXPLORAR REGISTROS
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Itens perdidos
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-500">
              Consulte os registros recentes de objetos perdidos no campus e
              encontre informações que possam ajudar na identificação.
            </p>
          </div>

          {/* Botão de cadastro */}
          <div className="mb-6 flex justify-end">
            <Link
              href="/cadastrar-item"
              className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              <Plus className="h-4 w-4" />
              Cadastrar item
            </Link>
          </div>

          {/* Busca */}
          <div className={`${cardClass} mb-5`}>
            <label className="mb-2 block text-sm font-semibold text-gray-700">
              Buscar itens
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

          {/* Quantidade de resultados */}
          <p className="mb-3 text-sm text-gray-500">
            {itensFiltrados.length}{" "}
            {itensFiltrados.length === 1
              ? "item encontrado"
              : "itens encontrados"}
          </p>

          {/* Lista de itens */}
          <section className={cardClass}>
            <div className="mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                Registros recentes
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Itens registrados no campus.
              </p>
            </div>

            {itensFiltrados.length > 0 ? (
              <div className="divide-y divide-gray-100">
                {itensFiltrados.map((item) => (
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
                        unoptimized
                        className="object-cover"
                      />
                    </div>

                    {/* Informações */}
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-gray-900">
                        {item.titulo}
                      </h3>

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

                    <div className="hidden shrink-0 rounded-xl bg-gray-50 p-3 sm:flex">
                      <Package className="h-5 w-5 text-gray-500" />
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center">
                <Search className="mx-auto mb-3 h-9 w-9 text-gray-300" />

                <h3 className="font-semibold text-gray-800">
                  Nenhum item encontrado
                </h3>

                <p className="mt-1 text-sm text-gray-500">
                  Tente buscar por outro item, categoria ou local.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </PrivateLayout>
  );
}
