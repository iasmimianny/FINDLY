import { notFound } from "next/navigation";
import CollectionPointDetail from "../../../../components/CollectionPointDetail";
export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[1-9]\d*$/.test(id) || !Number.isSafeInteger(Number(id))) notFound();
  return <CollectionPointDetail id={Number(id)} staffMode />;
}
