"use client";

import Link from "next/link";
import { MapPin, User } from "lucide-react";
import { useResource } from "./funcionario/StaffUI";
import type { Profile } from "../lib/profile";
import { NotificationDropdown } from "./NotificationCenter";

export default function UserHeader() {
  const { data } = useResource<Profile>("/api/account/me/");

  return (
    <header className="flex min-h-[74px] shrink-0 flex-wrap items-center justify-between gap-3 border-b border-gray-200 bg-white px-4 py-3 text-gray-900 md:px-5 md:py-4 lg:px-8">

      <div className="order-2 w-full min-w-0 md:order-1 md:w-auto md:flex-1">
        <h2 className="text-sm font-bold">Área do usuário</h2>
        <p className="mt-1 flex items-center gap-1 text-xs text-gray-500">
          FINDLY - Conectando quem perdeu com quem encontrou.
        </p>
      </div>

      {/* Notificações e configurações */}

      <div className="order-1 flex min-h-10 w-full min-w-0 shrink-0 items-center justify-end gap-3 pl-14 md:order-2 md:w-auto md:pl-0">

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
          href="/configuracao"
          aria-label="Configurações da conta"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-gray-50 text-gray-700 hover:bg-gray-100"
        >
          <User size={20} aria-hidden="true" />
        </Link>

      </div>
    </header>
  );
}
