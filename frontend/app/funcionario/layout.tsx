
import type { ReactNode } from "react";
import SidebarFuncionario from "../../components/funcionario/SidebarFuncionario";
import HeaderFuncionario from "../../components/funcionario/HeaderFuncionario";

export default function FuncionarioLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="flex h-screen overflow-hidden bg-black font-sans">
      <SidebarFuncionario />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden bg-white text-black">
        <HeaderFuncionario />

        <main className="flex-1 overflow-y-auto bg-gray-50 p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
