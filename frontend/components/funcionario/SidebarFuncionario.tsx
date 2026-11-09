
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  PackagePlus,
  Package,
  Handshake,
  History,
  LogOut,
  MapPin,
} from "lucide-react";

const menus = [
  {
    nome: "Visão Geral",
    href: "/funcionario/painel",
    icone: LayoutDashboard,
    cor: "text-cyan-400",
    fundo: "bg-cyan-500/20",
  },
  {
    nome: "Receber Item",
    href: "/funcionario/recebimento",
    icone: PackagePlus,
    cor: "text-green-400",
    fundo: "bg-green-500/20",
  },
  {
    nome: "Inventário",
    href: "/funcionario/inventario",
    icone: Package,
    cor: "text-purple-400",
    fundo: "bg-purple-500/20",
  },
  {
    nome: "Devoluções",
    href: "/funcionario/devolucoes",
    icone: Handshake,
    cor: "text-blue-400",
    fundo: "bg-blue-500/20",
  },
  {
    nome: "Histórico",
    href: "/funcionario/historico",
    icone: History,
    cor: "text-amber-400",
    fundo: "bg-amber-500/20",
  },
];

export default function SidebarFuncionario() {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col justify-between border-r border-gray-800 bg-black p-6 text-white">
      <div className="min-h-0 overflow-y-auto">
        <Link
          href="/funcionario/painel"
          className="flex items-center gap-3"
        >
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
        </Link>

        <div className="mt-8 mb-5 rounded-2xl border border-gray-800 bg-[#1e2022] p-4">
          <div className="flex items-center gap-2">
            <MapPin size={18} className="text-blue-400" />
            <span className="text-sm font-bold italic">
              Bloco H
            </span>
          </div>
          <p className="mt-1 text-xs text-gray-400">
            Ponto de Coleta
          </p>
        </div>

        <nav className="space-y-2">
          {menus.map((menu) => {
            const Icone = menu.icone;
            const ativo = pathname === menu.href;

            return (
              <Link
                key={menu.href}
                href={menu.href}
                aria-current={ativo ? "page" : undefined}
                className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-bold italic text-white transition ${
                  ativo
                    ? "bg-[#303236]"
                    : "bg-[#1e2022] hover:bg-gray-800"
                }`}
              >
                <div
                  className={`rounded-full p-1 ${menu.fundo} ${menu.cor}`}
                >
                  <Icone size={18} strokeWidth={2.5} />
                </div>
                <span>{menu.nome}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-4 space-y-4">
        <button
          type="button"
          onClick={() => router.replace("/login")}
          className="flex w-full cursor-pointer items-center gap-3 rounded-2xl bg-[#1e2022] px-4 py-3 text-sm font-bold italic text-white transition hover:bg-red-500/10 hover:text-red-400"
        >
          <div className="rounded-full bg-red-500/20 p-1 text-red-500">
            <LogOut size={18} strokeWidth={2.5} />
          </div>
          <span>Sair</span>
        </button>

        <div className="border-t border-gray-900 pt-4 text-xs font-medium text-gray-500">
          Campus UNIFIP Patos
        </div>
      </div>
    </aside>
  );
}
