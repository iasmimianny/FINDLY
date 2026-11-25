import ItemList from "../../components/ItemList";

export default async function MeusItens({ searchParams }: {
  searchParams: Promise<{ tipo?: string; busca?: string }>;
}) {
  const params = await searchParams;
  const kind = params.tipo === "found" ? "found" : "lost";
  const search = typeof params.busca === "string" ? params.busca : "";
  return <ItemList key={`${kind}-${search}`} mine initialKind={kind} initialSearch={search} />;
}

export const metadata = { title: "Meus itens" };
