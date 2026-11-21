"use client";

import Link from "next/link";
import { Search, User } from "lucide-react";
import { useResource } from "./funcionario/StaffUI";
import type { Profile } from "../lib/profile";
import { NotificationDropdown } from "./NotificationCenter";

export default function UserHeader() {
  const { data } = useResource<Profile>("/api/account/me/");

  return (
    <header className="flex min-h-[74px] shrink-0 flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3 text-gray-900 md:px-5 md:py-4 lg:px-8">

      {/* Notificações e perfil */}

      <div className="order-1 flex min-h-10 w-full shrink-0 items-center justify-end gap-3 pl-14 md:order-2 md:w-auto md:pl-0">

        <div className="hidden max-w-48 text-right lg:block">
          <p className="truncate text-sm font-semibold">
            {data?.full_name || "Minha conta"}
          </p>

          {data && (
            <p className="truncate text-xs text-gray-500">
              {data.email}
            </p>
          )}
        </div>

        <NotificationDropdown />

        <Link
          href="/perfil"
          aria-label="Meu perfil"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
        >
          <User size={20} aria-hidden="true" />
        </Link>

      </div>

      {/* Barra de pesquisa */}

      <form
        action="/itens-perdidos"
        className="order-2 flex w-full min-w-0 items-center gap-2 md:order-1 md:w-auto md:max-w-lg md:flex-1"
      >
        <input
          type="hidden"
          name="tipo"
          value="found"
        />

        <label
          htmlFor="header-search"
          className="sr-only"
        >
          Pesquisar objetos encontrados
        </label>

        <input
          id="header-search"
          name="busca"
          type="search"
          placeholder="Pesquisar objetos encontrados…"
          className="min-w-0 flex-1 rounded-xl border border-gray-300 bg-gray-50 px-3 py-2.5 text-sm outline-none focus:border-cyan-500"
        />

        <button
          type="submit"
          aria-label="Buscar objetos encontrados"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black text-white"
        >
          <Search size={20} aria-hidden="true" />
        </button>
      </form>

    </header>
  );
}