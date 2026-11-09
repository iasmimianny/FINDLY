
import { User, MapPin } from "lucide-react";

export default function HeaderFuncionario() {
  return (
    <header className="flex h-[74px] shrink-0 items-center justify-between border-b border-gray-900 bg-black px-8 text-white">
      <div>
        <h2 className="text-sm font-bold italic">
          Painel de Funcionários
        </h2>
        <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
          <MapPin size={12} />
          Ponto de Coleta - Bloco H
        </p>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-sm font-bold">
            Funcionário
          </p>
          <p className="text-xs text-gray-400">
            UNIFIP
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-md">
          <User size={22} strokeWidth={2.5} />
        </div>
      </div>
    </header>
  );
}
