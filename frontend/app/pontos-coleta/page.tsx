import type { Metadata } from "next";
import PrivateLayout from "../components/funcionario/PrivateLayout";
import CollectionPoints from "../../components/CollectionPoints";

export const metadata: Metadata = { title: "Pontos de coleta | Findly" };

export default function PontosColeta() {
  return <PrivateLayout><main className="findly-page min-h-screen bg-[#F5F6F8] text-gray-900"><div className="w-full min-w-0"><header className="mb-8"><p className="text-xs font-bold uppercase tracking-widest findly-page-label">No campus</p><h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Pontos de coleta</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-gray-600">Consulte os locais, horários, vagas e responsáveis por receber os objetos encontrados.</p></header><CollectionPoints /></div></main></PrivateLayout>;
}
