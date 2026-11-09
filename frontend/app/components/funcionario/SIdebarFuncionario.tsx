
import type { LucideIcon } from "lucide-react";

interface CardEstatisticaProps {
  titulo: string;
  valor: number;
  icone: LucideIcon;
  cor?: string;
}

export default function CardEstatistica({
  titulo,
  valor,
  icone: Icone,
  cor = "text-[#07449B]",
}: CardEstatisticaProps) {
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-gray-500">
          {titulo}
        </p>
        <Icone size={23} className={cor} />
      </div>

      <p className="mt-4 text-3xl font-black text-black">
        {valor}
      </p>
    </div>
  );
}
