import type { ReactNode } from "react";
import SidebarFuncionario from "../../components/funcionario/SidebarFuncionario";
import HeaderFuncionario from "../../components/funcionario/HeaderFuncionario";
import { StaffProvider } from "../../components/funcionario/StaffContext";

export default function FuncionarioLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <StaffProvider>
      <div className="flex h-dvh w-full overflow-hidden bg-black font-sans">
        <SidebarFuncionario />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-white text-black">
          <HeaderFuncionario />

          <main className="min-h-0 min-w-0 flex-1 overflow-y-auto overflow-x-hidden bg-gray-50 p-4 sm:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </StaffProvider>
  );
}