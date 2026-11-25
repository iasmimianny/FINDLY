"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";

import {
  PanelsTopLeft,
  CircleHelp,
  Handshake,
  History,
  House,
  LogOut,
  MapPin,
  Menu,
  Package,
  PlusCircle,
  Search,
  Settings,
  Star,
  User,
  X,
} from "lucide-react";

import SidebarToggle, { useSidebarCollapsed } from "./SidebarToggle";

import {
  accountLinks,
  isActiveNavigation,
  navigationMenus,
  type NavigationArea,
} from "../lib/navigation";

const icons = {
  House,
  PlusCircle,
  Search,
  Star,
  Package,
  MapPin,
  Handshake,
  History,
  PanelsTopLeft,
  CircleHelp,
  Settings,
  User,
};

type Entry = {
  label: string;
  href: string;
  icon: keyof typeof icons;
  color?: string;
};

export default function AppSidebar({
  area,
  children,
}: {
  area: NavigationArea;
  children?: ReactNode;
}) {
  const pathname = usePathname();

  const { collapsed, toggle } = useSidebarCollapsed();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const opener = useRef<HTMLButtonElement>(null);
  const closer = useRef<HTMLButtonElement>(null);
  const drawer = useRef<HTMLElement>(null);

  const links = accountLinks(area);
  const navigationId = `findly-${area}-navigation`;

  // No celular, a sidebar sempre abre expandida.
  const effectiveCollapsed = !isMobile && collapsed;

  // Identifica o tamanho da tela.
  useEffect(() => {
    const media = window.matchMedia("(max-width: 767px)");

    function handleResize() {
      setIsMobile(media.matches);

      if (!media.matches) {
        setMobileOpen(false);
      }
    }

    handleResize();

    media.addEventListener("change", handleResize);

    return () => {
      media.removeEventListener("change", handleResize);
    };
  }, []);

  // Bloqueia a rolagem da página com o menu mobile aberto.
  useEffect(() => {
    if (!mobileOpen) return;

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";
    closer.current?.focus();
    const trigger = opener.current;

    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setMobileOpen(false);
        return;
      }
      if (event.key !== "Tab" || !drawer.current) return;
      const controls = Array.from(drawer.current.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled])",
      )).filter((element) => element.getClientRects().length > 0);
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey ? document.activeElement === first : document.activeElement === last) {
        event.preventDefault();
        (event.shiftKey ? last : first)?.focus();
      }
    }

    window.addEventListener("keydown", handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;

      window.removeEventListener("keydown", handleEscape);
      trigger?.focus();
    };
  }, [mobileOpen]);

  const secondary: Entry[] = [
    {
      label: "Ajuda / FAQ",
      href: links.help,
      icon: "CircleHelp",
    },
    {
      label: "Configurações",
      href: links.settings,
      icon: "Settings",
    },
  ];

  function renderEntry(entry: Entry) {
    const Icon = icons[entry.icon];

    const active = isActiveNavigation(pathname, entry.href);

    const color = entry.color ?? "text-gray-400";

    const backgrounds: Record<string, string> = {
      "text-cyan-400": "bg-cyan-500/20",
      "text-red-400": "bg-red-500/20",
      "text-amber-400": "bg-amber-500/20",
      "text-purple-400": "bg-purple-500/20",
      "text-blue-400": "bg-blue-500/20",
    };

    const background = backgrounds[color] ?? "bg-gray-500/20";

    return (
      <Link
        key={entry.href}
        href={entry.href}
        onClick={() => setMobileOpen(false)}
        aria-label={entry.label}
        title={effectiveCollapsed ? entry.label : undefined}
        aria-current={active ? "page" : undefined}
        className={`flex items-center rounded-2xl py-3 text-sm font-bold not-italic transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan-400 ${
          effectiveCollapsed ? "justify-center gap-0 px-2" : "gap-3 px-4"
        } ${active ? "bg-[#303236] text-white" : "bg-transparent text-white"}`}
      >
        <span className={`shrink-0 rounded-full p-1 ${background} ${color}`}>
          <Icon
            className="h-[18px] w-[18px]"
            strokeWidth={2.5}
            aria-hidden="true"
          />
        </span>

        <span className="findly-sidebar-label" aria-hidden={effectiveCollapsed}>
          {entry.label}
        </span>
      </Link>
    );
  }

  return (
    <>
      {/* Botão para abrir o menu no celular */}

      <button
        type="button"
        ref={opener}
        onClick={() => setMobileOpen(true)}
        aria-label="Abrir menu"
        aria-expanded={mobileOpen}
        aria-controls={navigationId}
        className="fixed left-4 top-4 z-40 flex h-10 w-10 items-center justify-center rounded-xl bg-black text-white shadow-md transition hover:bg-gray-800 focus-visible:outline-2 focus-visible:outline-cyan-400 md:hidden"
      >
        <Menu size={22} aria-hidden="true" />
      </button>

      {/* Fundo escuro atrás da sidebar mobile */}

      {mobileOpen && (
        <div
          aria-hidden="true"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm md:hidden"
        />
      )}

      {/* Sidebar compartilhada */}

      <aside
        ref={drawer}
        role={mobileOpen ? "dialog" : undefined}
        aria-modal={mobileOpen ? true : undefined}
        data-collapsed={effectiveCollapsed}
        aria-label={area === "staff" ? "Menu do funcionário" : "Menu principal"}
        inert={isMobile && !mobileOpen}
        className={`findly-sidebar fixed inset-y-0 left-0 z-[110] flex h-dvh max-w-[85vw] shrink-0 flex-col overflow-hidden border-r border-gray-800 bg-black font-sans text-white transition-[width,transform,visibility] duration-300 motion-reduce:transition-none md:sticky md:top-0 md:z-50 md:max-w-none md:visible md:translate-x-0 ${
          mobileOpen ? "visible translate-x-0" : "invisible -translate-x-full"
        } ${effectiveCollapsed ? "w-64 p-4 md:w-20 md:p-2" : "w-64 p-4"}`}
      >
        {/* Logo e controles */}

        <div
          className={`flex shrink-0 items-center gap-2 pb-6 pt-2 ${
            effectiveCollapsed ? "flex-col" : "justify-between"
          }`}
        >
          <Link
            href={links.home}
            onClick={() => setMobileOpen(false)}
            aria-label="Findly — início"
            className={`flex min-w-0 items-center gap-3 ${
              effectiveCollapsed ? "" : "flex-1"
            }`}
          >
            <Image
              src="/logo-findly.jpg"
              alt="Findly"
              width={44}
              height={44}
              className="h-11 w-11 shrink-0 rounded-full object-cover"
            />

            {!effectiveCollapsed && (
              <span className="text-lg font-black not-italic tracking-wider">
                FINDLY
              </span>
            )}
          </Link>

          {/* Controle original do desktop */}

          <div className="hidden md:block">
            <SidebarToggle
              collapsed={collapsed}
              onToggle={toggle}
              controls={navigationId}
            />
          </div>

          {/* Botão para fechar no celular */}

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            ref={closer}
            aria-label="Fechar menu"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-400 transition hover:bg-gray-800 hover:text-white md:hidden"
          >
            <X size={22} aria-hidden="true" />
          </button>
        </div>

        {/* Links de navegação */}

        <nav
          id={navigationId}
          className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-0 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          <div className="space-y-2">
            {navigationMenus[area].map(renderEntry)}
          </div>

          <div className="my-5 border-t border-gray-800" />

          <div className="space-y-2">{secondary.map(renderEntry)}</div>

          {!effectiveCollapsed && children}
        </nav>

        {/* Logout e informações do campus */}

        <div className="mt-4 shrink-0 border-t border-gray-800 pt-4">
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              aria-label="Sair"
              title={effectiveCollapsed ? "Sair" : undefined}
              className={`flex w-full items-center rounded-2xl bg-transparent py-3 text-sm font-bold not-italic text-white transition-colors hover:bg-red-500/10 hover:text-red-400 focus-visible:outline-2 focus-visible:outline-cyan-400 ${
                effectiveCollapsed ? "justify-center gap-0 px-2" : "gap-3 px-4"
              }`}
            >
              <span className="shrink-0 rounded-full bg-red-500/20 p-1 text-red-500">
                <LogOut
                  className="h-[18px] w-[18px]"
                  strokeWidth={2.5}
                  aria-hidden="true"
                />
              </span>

              <span
                className="findly-sidebar-label"
                aria-hidden={effectiveCollapsed}
              >
                Sair
              </span>
            </button>
          </form>

          {!effectiveCollapsed && (
            <div className="mt-4 px-4 text-xs text-gray-500">
              <p>Campus UNIFIP</p>
              <p>Patos - PB</p>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
