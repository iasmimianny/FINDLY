import type { Metadata } from "next";
import CollectionPoints from "../../../components/CollectionPoints";

export const metadata: Metadata = { title: "Pontos de coleta | Findly" };

export default function PontosColetaFuncionario() {
  return <div className="w-full min-w-0 text-gray-900"><header className="mb-8"><p className="text-xs font-bold uppercase tracking-widest text-blue-700">Área do funcionário</p><h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Pontos de coleta</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">Consulte os pontos designados à sua conta. Administradores podem gerenciar todos os locais e seus responsáveis.</p></header><CollectionPoints staffMode /></div>;
}
