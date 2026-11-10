
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
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
  PlusIcon,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

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
  ];

  const menuSecundario = [
    {
      nome: "Cadastrar item perdido",
      rota: "/cadastro-itens-perdidos",
      Icone: PlusIcon,
    },
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

  return (
    <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col bg-black text-white">
      <div className="flex items-center gap-3 px-6 py-7">
        <img
          src="/logo-findly.jpg"
          alt="Findly"
          className="h-11 w-11 rounded-full object-cover"
        />
        <span className="text-xl font-bold tracking-widest">
          FINDLY
        </span>
      </div>

      <nav className="flex-1 px-4">
        <div className="space-y-2">
          {menuPrincipal.map(({ nome, rota, Icone, cor }) => {
            const ativo = pathname === rota;

            return (
              <Link
                key={rota}
                href={rota}
                className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors ${
                  ativo
                    ? "bg-[#1E2022] text-white"
                    : "text-gray-400 hover:bg-[#1E2022] hover:text-white"
                }`}
              >
                <Icone className={`h-5 w-5 ${cor}`} />
                {nome}
              </Link>
            );
          })}
        </div>

        <div className="my-6 border-t border-gray-800" />

        <div className="space-y-2">
          {menuSecundario.map(({ nome, rota, Icone }) => (
            <Link
              key={rota}
              href={rota}
              className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm transition-colors ${
                pathname === rota
                  ? "bg-[#1E2022] text-white"
                  : "text-gray-400 hover:bg-[#1E2022] hover:text-white"
              }`}
            >
              <Icone className="h-5 w-5" />
              {nome}
            </Link>
          ))}
        </div>
      </nav>

      <div className="border-t border-gray-800 px-4 py-5">
        <button
          onClick={() => router.push("/login")}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-3 text-sm text-gray-400 transition-colors hover:bg-[#1E2022] hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          Sair
        </button>

        <div className="mt-4 px-4 text-xs text-gray-500">
          <p>Campus UNIFIP</p>
          <p>Patos - PB</p>
        </div>
      </div>
    </aside>
  );
}
