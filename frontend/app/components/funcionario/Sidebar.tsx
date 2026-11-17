"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import SidebarToggle, { useSidebarCollapsed } from "../../../components/SidebarToggle";
import {
  PlusCircle,
  Search,
  Star,
  Package,
  MapPin,
  CircleHelp,
  Settings,
  LogOut,
  House,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebarCollapsed();

  const menuPrincipal = [
    {
      nome: "Início",
      rota: "/dashboard",
      Icone: House,
      cor: "text-cyan-400",
    },
    {
      nome: "Cadastrar item",
      rota: "/cadastrar-item",
      Icone: PlusCircle,
      cor: "text-cyan-400",
    },
    {
      nome: "Itens perdidos",
      rota: "/itens-perdidos",
      Icone: Search,
      cor: "text-red-400",
    },
    {
      nome: "Favoritos",
      rota: "/itens-favoritos",
      Icone: Star,
      cor: "text-amber-400",
    },
    {
      nome: "Meus itens",
      rota: "/meus-itens",
      Icone: Package,
      cor: "text-purple-400",
    },
    {
      nome: "Pontos de coleta",
      rota: "/pontos-coleta",
      Icone: MapPin,
      cor: "text-blue-400",
    },
  ];

  const menuSecundario = [
    // {
    //   nome: "Cadastrar item perdido",
    //   rota: "/cadastro-itens-perdidos",
    //   Icone: PlusIcon,
    // },
    {
      nome: "Ajuda / FAQ",
      rota: "/faq",
      Icone: CircleHelp,
    },
    {
      nome: "Configurações",
      rota: "/configuracao",
      Icone: Settings,
    },
  ];

  function renderMenu(menu: { nome: string; rota: string; Icone: typeof House; cor?: string }) {
    const Icon = menu.Icone;
    const active = pathname === menu.rota;
    return <Link key={menu.rota} href={menu.rota} aria-label={menu.nome} title={collapsed ? menu.nome : undefined} aria-current={active ? "page" : undefined}
      className={`flex items-center gap-3 rounded-lg py-3 text-sm transition-colors ${collapsed ? "gap-0 px-5" : "px-4"} ${active ? "bg-[#1E2022] text-white" : "text-gray-400 hover:bg-[#1E2022] hover:text-white"}`}>
      <Icon className={`h-5 w-5 shrink-0 ${menu.cor ?? "text-gray-400"}`} aria-hidden="true" />
      <span className="findly-sidebar-label" aria-hidden={collapsed}>{menu.nome}</span>
    </Link>;
  }

  return <aside data-collapsed={collapsed} aria-label="Menu principal" className={`findly-sidebar fixed left-0 top-0 z-50 flex h-dvh shrink-0 flex-col overflow-hidden bg-black text-white transition-[width] duration-200 motion-reduce:transition-none ${collapsed ? "w-20" : "w-64"}`}>
    <div className={`flex shrink-0 items-center gap-3 py-5 ${collapsed ? "flex-col px-2" : "px-4"}`}>
      <Image src="/logo-findly.jpg" alt="Findly" width={44} height={44} className="h-11 w-11 shrink-0 rounded-full object-cover" />
      {!collapsed && <span className="min-w-0 flex-1 text-lg font-bold tracking-widest">FINDLY</span>}
      <SidebarToggle collapsed={collapsed} onToggle={toggle} controls="findly-main-navigation" />
    </div>
    <nav id="findly-main-navigation" className={`min-h-0 flex-1 overflow-y-auto overflow-x-hidden ${collapsed ? "px-2" : "px-4"}`}>
      <div className="space-y-2">{menuPrincipal.map(renderMenu)}</div>
      <div className="my-5 border-t border-gray-800" />
      <div className="space-y-2">{menuSecundario.map(renderMenu)}</div>
    </nav>
    <div className={`shrink-0 border-t border-gray-800 py-4 ${collapsed ? "px-2" : "px-4"}`}>
      <form action="/api/auth/logout" method="post"><button type="submit" aria-label="Sair" title={collapsed ? "Sair" : undefined}
        className={`flex w-full items-center gap-3 rounded-lg py-3 text-sm text-gray-400 transition-colors hover:bg-[#1E2022] hover:text-white ${collapsed ? "gap-0 px-5" : "px-4"}`}>
        <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />{!collapsed && "Sair"}
      </button></form>
      {!collapsed && <div className="mt-4 px-4 text-xs text-gray-500"><p>Campus UNIFIP</p><p>Patos - PB</p></div>}
    </div>
  </aside>;
}