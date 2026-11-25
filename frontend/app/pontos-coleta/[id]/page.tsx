import { notFound } from "next/navigation";
import CollectionPointDetail from "../../../components/CollectionPointDetail";
import PrivateLayout from "../../components/funcionario/PrivateLayout";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) notFound();
  return <PrivateLayout><main className="findly-page min-h-screen bg-gray-50"><CollectionPointDetail id={Number(id)} /></main></PrivateLayout>;
}

export const metadata = { title: "Detalhes do ponto de coleta" };
