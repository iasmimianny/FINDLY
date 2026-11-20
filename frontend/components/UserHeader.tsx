"use client";
import Link from "next/link";
import { Search, User } from "lucide-react";
import { useResource } from "./funcionario/StaffUI";
import type { Profile } from "../lib/profile";
import { NotificationDropdown } from "./NotificationCenter";

export default function UserHeader() {
  const { data } = useResource<Profile>("/api/account/me/");
  return <header className="flex min-h-[74px] shrink-0 flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-5 py-4 text-gray-900 sm:px-8">
    <form action="/itens-perdidos" className="flex min-w-0 flex-1 items-center gap-2 sm:max-w-lg"><input type="hidden" name="tipo" value="found" /><label htmlFor="header-search" className="sr-only">Pesquisar objetos encontrados</label><input id="header-search" name="busca" type="search" placeholder="Pesquisar objetos encontrados…" className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-cyan-500" /><button aria-label="Buscar objetos encontrados" className="rounded-xl bg-black p-2 text-white"><Search size={20} aria-hidden="true" /></button></form>
    <div className="flex shrink-0 items-center gap-3"><div className="hidden max-w-48 text-right lg:block"><p className="truncate text-sm font-semibold">{data?.full_name || "Minha conta"}</p>{data && <p className="truncate text-xs text-gray-500">{data.email}</p>}</div><NotificationDropdown /><Link href="/perfil" aria-label="Meu perfil" className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"><User size={20} aria-hidden="true" /></Link></div>
  </header>;
}
