"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { CircleHelp, Handshake, History, House, LogOut, MapPin, Package, PlusCircle, Search, Settings, Star, User } from "lucide-react";
import SidebarToggle, { useSidebarCollapsed } from "./SidebarToggle";
import { accountLinks, isActiveNavigation, navigationMenus, type NavigationArea } from "../lib/navigation";

const icons = { House, PlusCircle, Search, Star, Package, MapPin, Handshake, History, CircleHelp, Settings, User };
type Entry = { label: string; href: string; icon: keyof typeof icons; color?: string };
export default function AppSidebar({ area, children }: { area: NavigationArea; children?: ReactNode }) {
  const pathname = usePathname();
  const { collapsed, toggle } = useSidebarCollapsed();
  const links = accountLinks(area);
  const navigationId = `findly-${area}-navigation`;
  const secondary: Entry[] = [{ label: "Meu perfil", href: links.profile, icon: "User" }, { label: "Ajuda / FAQ", href: links.help, icon: "CircleHelp" }, { label: "Configurações", href: links.settings, icon: "Settings" }];
  function renderEntry(entry: Entry) {
    const Icon = icons[entry.icon];
    const active = isActiveNavigation(pathname, entry.href);
    const color = entry.color ?? "text-gray-400";
    const backgrounds: Record<string, string> = { "text-cyan-400": "bg-cyan-500/20", "text-red-400": "bg-red-500/20", "text-amber-400": "bg-amber-500/20", "text-purple-400": "bg-purple-500/20", "text-blue-400": "bg-blue-500/20" };
    const background = backgrounds[color] ?? "bg-gray-500/20";
    return <Link key={entry.href} href={entry.href} aria-label={entry.label} title={collapsed ? entry.label : undefined} aria-current={active ? "page" : undefined}
      className={`flex items-center rounded-2xl py-3 text-sm font-bold not-italic transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 ${collapsed ? "justify-center gap-0 px-2" : "gap-3 px-4"} ${active ? "bg-[#303236] text-white" : "bg-[#1e2022] text-white hover:bg-gray-800"}`}>
      <span className={`shrink-0 rounded-full p-1 ${background} ${color}`}><Icon className="h-[18px] w-[18px]" strokeWidth={2.5} aria-hidden="true" /></span>
      <span className="findly-sidebar-label" aria-hidden={collapsed}>{entry.label}</span>
    </Link>;
  }
  return <aside data-collapsed={collapsed} aria-label={area === "staff" ? "Menu do funcionário" : "Menu principal"} className={`findly-sidebar sticky top-0 z-50 flex h-dvh shrink-0 flex-col overflow-hidden border-r border-gray-800 bg-black font-sans text-white transition-[width] motion-reduce:transition-none ${collapsed ? "w-20 p-2" : "w-64 p-4"}`}>
    <div className={`flex shrink-0 items-center gap-2 pb-6 pt-2 ${collapsed ? "flex-col" : "justify-between"}`}>
      <Link href={links.home} aria-label="Findly — início" className={`flex min-w-0 items-center gap-3 ${collapsed ? "" : "flex-1"}`}><Image src="/logo-findly.jpg" alt="Findly" width={44} height={44} className="h-11 w-11 shrink-0 rounded-full object-cover" />{!collapsed && <span className="text-lg font-black not-italic tracking-wider">FINDLY</span>}</Link>
      <SidebarToggle collapsed={collapsed} onToggle={toggle} controls={navigationId} />
    </div>
    <nav id={navigationId} className={`min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-0`}>
      <div className="space-y-2">{navigationMenus[area].map(renderEntry)}</div><div className="my-5 border-t border-gray-800" /><div className="space-y-2">{secondary.map(renderEntry)}</div>{!collapsed && children}
    </nav>
    <div className={`mt-4 shrink-0 border-t border-gray-800 pt-4`}><form action="/api/auth/logout" method="post"><button type="submit" aria-label="Sair" title={collapsed ? "Sair" : undefined} className={`flex w-full items-center rounded-2xl bg-[#1e2022] py-3 text-sm font-bold not-italic text-white transition-colors hover:bg-red-500/10 hover:text-red-400 focus-visible:outline-2 focus-visible:outline-cyan-400 ${collapsed ? "justify-center gap-0 px-2" : "gap-3 px-4"}`}><span className="shrink-0 rounded-full bg-red-500/20 p-1 text-red-500"><LogOut className="h-[18px] w-[18px]" strokeWidth={2.5} aria-hidden="true" /></span><span className="findly-sidebar-label" aria-hidden={collapsed}>Sair</span></button></form>{!collapsed && <div className="mt-4 px-4 text-xs text-gray-500"><p>Campus UNIFIP</p><p>Patos - PB</p></div>}</div>
  </aside>;
}
