import StaffHistory from "../../../components/funcionario/StaffHistory";
export default async function Page({ searchParams }: { searchParams: Promise<{ codigo?: string }> }) {
  const { codigo } = await searchParams;
  return <StaffHistory key={codigo ?? ""} initialCode={codigo ?? ""} />;
}
