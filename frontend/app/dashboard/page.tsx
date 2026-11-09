
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ChangeEvent } from "react";
import {
  PlusCircle,
  Search,
  Star,
  Package,
  MapPin,
  Settings,
  User,
  ArrowRight,
  CircleHelp,
  ExternalLink,
  LogOut,
} from "lucide-react";

export default function Dashboard() {
  const router = useRouter();
  const [busca, setBusca] = useState("");

  const favoritos = [
    {
      id: 1,
      titulo: "Carteira de Couro",
      categoria: "Acessórios",
      imagem:
        "https://images.unsplash.com/photo-1627123424574-724758594e93?w=300&auto=format&fit=crop&q=80",
    },
    {
      id: 2,
      titulo: "Carteira Preta",
      categoria: "Documentos",
      imagem:
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=300&auto=format&fit=crop&q=80",
    },
    {
      id: 3,
      titulo: "Fone Bluetooth",
      categoria: "Eletrônicos",
      imagem:
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=300&auto=format&fit=crop&q=80",
    },
  ];

  const favoritosFiltrados = favoritos.filter((item) =>
    `${item.titulo} ${item.categoria}`
      .toLowerCase()
      .includes(busca.toLowerCase())
  );

  const handleLogout = () => {
    // TODO: Encerrar a sessão JWT conforme a autenticação existente.
    router.replace("/login");
  };

  return (
    <div className="flex h-screen bg-black text-white font-sans overflow-hidden">
      {/* --- NAVEGAÇÃO LATERAL (SIDEBAR) --- */}
      <aside className="w-64 bg-black p-6 flex flex-col justify-between border-r border-gray-800 shrink-0">
        <div className="space-y-8">
          {/* Logo FINDLY */}
          <div className="flex items-center gap-3">
            <Image
              src="/logo-findly.jpg"
              alt="Findly"
              width={44}
              height={44}
              className="rounded-full object-cover"
            />
            <span className="text-xl font-black italic tracking-wider">
              FINDLY
            </span>
          </div>

          {/* Menus / Links */}
          <nav className="space-y-2">
            <Link
              href="/cadastrar-item"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1e2022] hover:bg-gray-800 transition text-sm font-bold italic text-white"
            >
              <div className="p-1 rounded-full bg-cyan-500 text-black">
                <PlusCircle size={18} strokeWidth={2.5} />
              </div>
              <span>Cadastrar Itens</span>
            </Link>

            <Link
              href="/itens-perdidos"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1e2022] hover:bg-gray-800 transition text-sm font-bold italic text-white"
            >
              <div className="p-1 rounded-full bg-red-500/20 text-red-500">
                <Search size={18} strokeWidth={2.5} />
              </div>
              <span>Itens Perdidos</span>
            </Link>

            <Link
              href="/itens-favoritos"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1e2022] hover:bg-gray-800 transition text-sm font-bold italic text-white"
            >
              <div className="p-1 rounded-full bg-amber-500/20 text-amber-400">
                <Star size={18} strokeWidth={2.5} />
              </div>
              <span>Itens Favoritos</span>
            </Link>

            <Link
              href="/meus-itens"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1e2022] hover:bg-gray-800 transition text-sm font-bold italic text-white"
            >
              <div className="p-1 rounded-full bg-purple-500/20 text-purple-400">
                <Package size={18} strokeWidth={2.5} />
              </div>
              <span>Meus Itens</span>
            </Link>

            <div className="pt-4 space-y-2">
              <Link
                href="#pontos-campus"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-gray-900 transition text-sm font-bold italic text-gray-300 hover:text-white"
              >
                <MapPin size={18} className="text-blue-500" />
                <span>Pontos no Campus</span>
              </Link>

              <Link
                href="/faq"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-gray-900 transition text-sm font-bold italic text-gray-300 hover:text-white"
              >
                <CircleHelp size={18} className="text-amber-400" />
                <span>Ajuda / FAQ</span>
              </Link>

              <Link
                href="/configuracao"
                className="flex items-center gap-3 px-4 py-2.5 rounded-xl hover:bg-gray-900 transition text-sm font-bold italic text-gray-300 hover:text-white"
              >
                <Settings size={18} className="text-gray-400" />
                <span>Configurações</span>
              </Link>
            </div>
          </nav>
        </div>

        {/* --- RODAPÉ DA SIDEBAR --- */}
        <div className="space-y-4">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#1e2022] hover:bg-red-500/10 transition text-sm font-bold italic text-white hover:text-red-400 cursor-pointer"
          >
            <div className="p-1 rounded-full bg-red-500/20 text-red-500">
              <LogOut size={18} strokeWidth={2.5} />
            </div>
            <span>Sair</span>
          </button>

          <div className="text-xs text-gray-500 font-medium pt-4 border-t border-gray-900">
            Campus UNIFIP Patos
          </div>
        </div>
      </aside>

      {/* --- ÁREA DE CONTEÚDO PRINCIPAL --- */}
      <div className="flex-1 flex flex-col bg-white text-black overflow-hidden">
        {/* --- HEADER SUPERIOR --- */}
        <header className="h-[74px] bg-black px-8 flex items-center justify-between border-b border-gray-900 text-white shrink-0">
          {/* Barra de Pesquisa */}
          <div className="relative w-full max-w-xl">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              value={busca}
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setBusca(e.target.value)
              }
              placeholder="Pesquisa..."
              className="w-full bg-[#1e2022] text-white pl-12 pr-4 py-2.5 rounded-full outline-none focus:ring-2 focus:ring-[#42a5df] transition text-sm font-medium"
            />
          </div>

          {/* Perfil do Usuário */}
          <Link
            href="/perfil"
            className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:bg-gray-200 transition shadow-md"
            title="Seu Perfil"
          >
            <User size={22} className="stroke-[2.5]" />
          </Link>
        </header>

        {/* --- DADOS DO PAINEL / CONTEÚDO --- */}
        <main className="flex-1 p-8 overflow-y-auto bg-gray-50">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* LADO ESQUERDO: Card de Itens Favoritos */}
            <section
              id="favoritos"
              className="lg:col-span-7 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black italic">
                      Itens Favoritos
                    </h2>
                    <Star className="w-6 h-6 text-amber-400 fill-amber-400" />
                  </div>
                  <p className="text-sm text-gray-500 font-medium mt-1">
                    Acompanhe os itens que salvou.
                  </p>
                </div>

                <Link
                  href="/itens-favoritos"
                  className="inline-flex items-center gap-1 text-xs font-bold text-gray-600 hover:text-black"
                >
                  Ver todos
                  <ArrowRight size={14} />
                </Link>
              </div>

              <div className="divide-y divide-gray-100">
                {favoritosFiltrados.length > 0 ? (
                  favoritosFiltrados.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-600">
                        <Package size={19} />
                      </div>

                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-sm font-bold text-black">
                          {item.titulo}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {item.categoria}
                        </p>
                      </div>

                      <Star
                        size={16}
                        className="shrink-0 fill-amber-400 text-amber-400"
                        aria-label="Favorito"
                      />
                    </div>
                  ))
                ) : (
                  <p className="py-5 text-sm text-gray-500">
                    Nenhum favorito encontrado para “{busca}”.
                  </p>
                )}
              </div>
            </section>

            {/* LADO DIREITO: Pontos no Campus */}
            <section
              id="pontos-campus"
              className="lg:col-span-5 bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-5"
            >
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-blue-500" />
                  <h3 className="font-bold italic text-lg">
                    Pontos no Campus
                  </h3>
                </div>

                <span className="text-xs bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full font-bold">
                  UNIFIP
                </span>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-[#f8f8f8] p-5">
                <p className="text-sm font-semibold text-gray-700">
                  Consulte a localização do campus e planeje sua visita.
                </p>

                <p className="mt-2 text-xs text-gray-500">
                  Centro Universitário UNIFIP · Patos, PB
                </p>

                <a
                  href="https://www.google.com/maps/search/?api=1&query=Centro+Universit%C3%A1rio+UNIFIP+Patos+PB"
                  target="_blank"
                  rel="noreferrer"
                  className="mt-5 inline-flex items-center gap-2 rounded-xl bg-black px-4 py-3 text-sm font-bold text-white transition hover:bg-gray-800"
                >
                  Abrir no Google Maps
                  <ExternalLink size={16} />
                </a>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>
  );
}
