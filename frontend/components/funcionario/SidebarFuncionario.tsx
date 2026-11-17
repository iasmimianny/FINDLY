
"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import SidebarToggle, { useSidebarCollapsed } from "../SidebarToggle";
import { StaffPointSummary } from "./StaffContext";
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
  {
    nome: "Pontos de coleta",
    href: "/funcionario/pontos-coleta",
    icone: MapPin,
    cor: "text-blue-400",
    fundo: "bg-blue-500/20",
  },
];

export default function SidebarFuncionario() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebarCollapsed();

  return <aside data-collapsed={collapsed} aria-label="Menu do funcionário" className={`findly-sidebar flex h-dvh shrink-0 flex-col justify-between overflow-hidden border-r border-gray-800 bg-black text-white transition-[width,padding] duration-200 motion-reduce:transition-none ${collapsed ? "w-20 p-2" : "w-64 p-4"}`}>
    <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
      <div className={`mb-6 flex items-center gap-2 pt-2 ${collapsed ? "flex-col" : "justify-between"}`}>
        <Link href="/funcionario/painel" aria-label="Findly — início da área do funcionário" className="flex min-w-0 items-center gap-3">
          <Image src="/logo-findly.jpg" alt="Findly" width={44} height={44} className="h-11 w-11 shrink-0 rounded-full object-cover" />
          {!collapsed && <span className="text-lg font-black italic tracking-wider">FINDLY</span>}
        </Link>
        <SidebarToggle collapsed={collapsed} onToggle={toggle} controls="findly-staff-navigation" />
      </div>
      {!collapsed && <StaffPointSummary />}
      <nav id="findly-staff-navigation" className="space-y-2">{menus.map((menu) => {
        const Icon = menu.icone;
        const active = pathname === menu.href;
        return <Link key={menu.href} href={menu.href} aria-label={menu.nome} title={collapsed ? menu.nome : undefined} aria-current={active ? "page" : undefined}
          className={`flex items-center gap-3 rounded-2xl py-3 text-sm font-bold italic text-white transition ${collapsed ? "gap-0 px-[19px]" : "px-4"} ${active ? "bg-[#303236]" : "bg-[#1e2022] hover:bg-gray-800"}`}>
          <div className={`shrink-0 rounded-full p-1 ${menu.fundo} ${menu.cor}`}><Icon size={18} strokeWidth={2.5} aria-hidden="true" /></div>
          <span className="findly-sidebar-label" aria-hidden={collapsed}>{menu.nome}</span>
        </Link>;
      })}</nav>
    </div>
    <div className="mt-4 shrink-0 space-y-4">
      <form action="/api/auth/logout" method="post"><button type="submit" aria-label="Sair" title={collapsed ? "Sair" : undefined}
        className={`flex w-full cursor-pointer items-center gap-3 rounded-2xl bg-[#1e2022] py-3 text-sm font-bold italic text-white transition hover:bg-red-500/10 hover:text-red-400 ${collapsed ? "gap-0 px-[19px]" : "px-4"}`}>
        <div className="shrink-0 rounded-full bg-red-500/20 p-1 text-red-500"><LogOut size={18} strokeWidth={2.5} aria-hidden="true" /></div>{!collapsed && <span>Sair</span>}
      </button></form>
      {!collapsed && <div className="border-t border-gray-900 pt-4 text-xs font-medium text-gray-500">Campus UNIFIP Patos</div>}
    </div>
  </aside>;
}