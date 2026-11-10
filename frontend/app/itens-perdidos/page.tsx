
"use client";

import Link from "next/link";
import { useState, type ChangeEvent } from "react";
import {
  CalendarDays,
  MapPin,
  Plus,
  Search,
} from "lucide-react";
import PrivateLayout from "../components/funcionario/PrivateLayout";
import Image from "next/image";

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
      .includes(busca.trim().toLowerCase())
  );

  function handleBuscaChange(event: ChangeEvent<HTMLInputElement>) {
    setBusca(event.target.value);
  }

  return (
    <PrivateLayout>
      <main className="min-h-screen bg-gray-50 px-6 py-10 text-black md:px-10">
        <div className="mx-auto max-w-5xl">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-black italic">
                Itens perdidos
              </h1>
              <p className="mt-2 text-gray-600">
                Veja os registros recentes no campus.
              </p>
            </div>

            <Link
              href="/cadastrar-item"
              className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-bold text-white hover:bg-gray-800"
            >
              <Plus size={17} />
              Cadastrar item
            </Link>
          </div>

          <label className="relative mb-5 block">
            <span className="sr-only">Buscar itens perdidos</span>
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

            <input
              type="search"
              value={busca}
              onChange={handleBuscaChange}
              placeholder="Buscar item ou local"
              className="w-full rounded-xl border border-gray-200 bg-white py-3 pl-12 pr-4 outline-none focus:border-[#42a5df]"
            />
          </label>

          <section className="divide-y divide-gray-100 rounded-2xl border border-gray-200 bg-white px-5">
            {itensFiltrados.length > 0 ? (
              itensFiltrados.map((item) => (
                <article
                  key={item.id}
                  className="flex items-center gap-4 py-4"
                >
                  <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    <Image
                      src={item.imagem}
                      alt={item.titulo}
                      fill
                      sizes="64px"
                      unoptimized
                      className="object-cover"
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h2 className="truncate font-bold">
                      {item.titulo}
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                      {item.categoria}
                    </p>

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
                </article>
              ))
            ) : (
              <p className="py-8 text-center text-sm text-gray-500">
                Nenhum item encontrado. Tente outra busca.
              </p>
            )}
          </section>
        </div>
      </main>
    </PrivateLayout>
  );
}
