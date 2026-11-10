"use client";

import Link from "next/link";
import { useState } from "react";
import {
  PlusCircle,
  Search,
  Star,
  Package,
  MapPin,
  User,
  ArrowRight,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  SearchX,
} from "lucide-react";

import PrivateLayout from "../components/funcionario/PrivateLayout";

const favoritos = [
  {
    id: 1,
    titulo: "Carteira de Couro",
    categoria: "Acessórios",
  },
  {
    id: 2,
    titulo: "Carteira Preta",
    categoria: "Documentos",
  },
  {
    id: 3,
    titulo: "Fone Bluetooth",
    categoria: "Eletrônicos",
  },
];

export default function Dashboard() {
  const [busca, setBusca] = useState("");

  const favoritosFiltrados = favoritos.filter((item) =>
    `${item.titulo} ${item.categoria}`
      .toLowerCase()
      .includes(busca.toLowerCase())
  );

  return (
    <PrivateLayout>
      <div className="flex min-h-screen flex-col bg-[#F5F6F8] text-gray-900">

        {/* CABEÇALHO */}
        <header className="flex min-h-[76px] items-center justify-between gap-4 border-b border-gray-200 bg-white px-5 py-4 sm:px-8">

          <div className="relative w-full max-w-md">
            <Search
              size={19}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Pesquisar favoritos..."
              className="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-11 pr-4 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#42A5DF] focus:bg-white focus:ring-2 focus:ring-[#42A5DF]/10"
            />
          </div>

          <Link
            href="/perfil"
            title="Meu perfil"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-700 transition hover:border-gray-400 hover:bg-gray-100"
          >
            <User size={20} />
          </Link>

          <form action="/api/auth/logout" method="post" className="shrink-0">
            <button
              type="submit"
              className="inline-flex h-10 items-center gap-2 rounded-xl border border-gray-200 px-3 text-sm font-semibold text-gray-700 transition hover:bg-red-50 hover:text-red-700"
            >
              <LogOut size={17} aria-hidden="true" />
              Sair
            </button>
          </form>
        </header>

        {/* ÁREA PRINCIPAL */}
        <main className="flex-1 px-5 py-8 sm:px-8 lg:px-10">

          <div className="mx-auto max-w-7xl">

            {/* APRESENTAÇÃO */}
            <section className="mb-9 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">

              <div>
                <div className="mb-3 flex items-center gap-2">
                  <LayoutDashboard
                    size={17}
                    className="text-[#5B50A1]"
                  />

                  <span className="text-xs font-bold uppercase tracking-[0.16em] text-[#5B50A1]">
                    Painel inicial
                  </span>
                </div>

                <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                  Bem-vindo ao Findly!
                </h1>

                <p className="mt-2 max-w-xl text-sm leading-6 text-gray-500 sm:text-base">
                  Organize seus registros, acompanhe seus favoritos e encontre
                  objetos de maneira mais simples.
                </p>
              </div>

              <Link
                href="/cadastrar-item"
                className="inline-flex w-fit items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-gray-800"
              >
                <PlusCircle size={18} />
                Cadastrar item
              </Link>

            </section>

            {/* CARD DE DESTAQUE */}
            <section className="relative mb-8 overflow-hidden rounded-3xl bg-black px-6 py-8 text-white sm:px-9 sm:py-10">

              <div className="absolute -right-16 -top-20 h-64 w-64 rounded-full bg-[#42A5DF]/10 blur-3xl" />

              <div className="relative z-10 max-w-2xl">

                <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#BACBD8]">
                  Encontre. Conecte. Devolva.
                </span>

                <h2 className="mt-4 text-2xl font-bold leading-tight tracking-tight sm:text-3xl">
                  Perdeu ou encontrou algum objeto?
                </h2>

                <p className="mt-3 max-w-lg text-sm leading-7 text-gray-400">
                  Registre as informações na plataforma e ajude a conectar
                  pessoas aos seus objetos.
                </p>

                <Link
                  href="/itens-perdidos"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#BACBD8] transition hover:text-white"
                >
                  Explorar itens
                  <ArrowRight size={17} />
                </Link>

              </div>

              <Search
                size={130}
                strokeWidth={0.7}
                className="absolute -bottom-8 right-8 hidden rotate-[-15deg] text-white/[0.07] sm:block"
              />

            </section>

            {/* CONTEÚDO EM CARDS */}
            <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-12">

              {/* FAVORITOS */}
              <section
                id="favoritos"
                className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm lg:col-span-7"
              >

                <div className="mb-6 flex items-center justify-between gap-3">

                  <div>
                    <div className="flex items-center gap-2">
                      <Star
                        size={19}
                        className="fill-amber-400 text-amber-400"
                      />

                      <h2 className="text-lg font-bold text-gray-900">
                        Itens favoritos
                      </h2>
                    </div>

                    <p className="mt-1 text-sm text-gray-500">
                      Acompanhe os objetos que você salvou.
                    </p>
                  </div>

                  <Link
                    href="/itens-favoritos"
                    className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-gray-500 transition hover:text-black sm:text-sm"
                  >
                    Ver todos
                    <ArrowRight size={15} />
                  </Link>

                </div>

                <div className="divide-y divide-gray-100">

                  {favoritosFiltrados.length > 0 ? (
                    favoritosFiltrados.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 py-4 first:pt-0 last:pb-0"
                      >

                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#F2F5F7] text-gray-500">
                          <Package size={21} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-sm font-semibold text-gray-900">
                            {item.titulo}
                          </h3>

                          <p className="mt-1 text-xs text-gray-500">
                            {item.categoria}
                          </p>
                        </div>

                        <Star
                          size={17}
                          className="shrink-0 fill-amber-400 text-amber-400"
                        />

                      </div>
                    ))
                  ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">

                      <SearchX
                        size={30}
                        className="mb-3 text-gray-300"
                      />

                      <p className="text-sm font-semibold text-gray-700">
                        Nenhum item encontrado
                      </p>

                      <p className="mt-1 text-xs text-gray-400">
                        Tente pesquisar por outro nome ou categoria.
                      </p>

                    </div>
                  )}

                </div>

              </section>

              {/* PONTOS NO CAMPUS */}
              <section
                id="pontos-campus"
                className="rounded-2xl border border-gray-200/80 bg-white p-6 shadow-sm lg:col-span-5"
              >

                <div className="mb-6 flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-blue-500">
                    <MapPin size={19} />
                  </div>

                  <div>
                    <h2 className="text-base font-bold text-gray-900">
                      Pontos no campus
                    </h2>

                    <p className="text-xs text-gray-500">
                      Localização e acesso
                    </p>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-100 bg-[#F8FAFC] p-5">

                  <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-blue-600">
                    UNIFIP
                  </span>

                  <h3 className="mt-4 text-sm font-semibold text-gray-800">
                    Centro Universitário UNIFIP
                  </h3>

                  <p className="mt-2 text-xs leading-6 text-gray-500">
                    Consulte a localização do campus em Patos, Paraíba,
                    e planeje sua visita.
                  </p>

                  <a
                    href="https://www.google.com/maps/search/?api=1&query=Centro+Universit%C3%A1rio+UNIFIP+Patos+PB"
                    target="_blank"
                    rel="noreferrer"
                    className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-black px-4 py-3 text-xs font-semibold text-white transition hover:bg-gray-800"
                  >
                    Abrir localização
                    <ExternalLink size={15} />
                  </a>

                </div>

              </section>

            </div>

            {/* ATALHOS */}
            <section className="mt-8">

              <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-900">
                  Acesso rápido
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Acesse as principais áreas da plataforma.
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">

                <Link
                  href="/itens-perdidos"
                  className="group flex items-center gap-4 rounded-2xl border border-gray-200/80 bg-white p-5 transition hover:-translate-y-1 hover:border-[#BACBD8] hover:shadow-md"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-500">
                    <Search size={21} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Buscar itens
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      Explore os registros.
                    </p>
                  </div>

                  <ArrowRight
                    size={17}
                    className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-black"
                  />
                </Link>

                <Link
                  href="/meus-itens"
                  className="group flex items-center gap-4 rounded-2xl border border-gray-200/80 bg-white p-5 transition hover:-translate-y-1 hover:border-[#BACBD8] hover:shadow-md"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-purple-50 text-purple-500">
                    <Package size={21} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Meus itens
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      Gerencie seus registros.
                    </p>
                  </div>

                  <ArrowRight
                    size={17}
                    className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-black"
                  />
                </Link>

                <Link
                  href="/perfil"
                  className="group flex items-center gap-4 rounded-2xl border border-gray-200/80 bg-white p-5 transition hover:-translate-y-1 hover:border-[#BACBD8] hover:shadow-md"
                >
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F0EFF9] text-[#5B50A1]">
                    <User size={21} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-gray-900">
                      Meu perfil
                    </h3>

                    <p className="mt-1 text-xs text-gray-500">
                      Consulte sua conta.
                    </p>
                  </div>

                  <ArrowRight
                    size={17}
                    className="text-gray-400 transition group-hover:translate-x-1 group-hover:text-black"
                  />
                </Link>

              </div>

            </section>

            {/* RODAPÉ */}
            <footer className="mt-12 border-t border-gray-200 py-6">
              <p className="text-center text-xs text-gray-400">
                © {new Date().getFullYear()} Findly · Centro Universitário UNIFIP
              </p>
            </footer>

          </div>
        </main>
      </div>
    </PrivateLayout>
  );
}