import StaffReturns from "../../../components/funcionario/StaffReturns";
export default async function Page({ searchParams }: { searchParams: Promise<{ codigo?: string }> }) {
  const { codigo } = await searchParams;
  return <StaffReturns key={codigo ?? ""} initialCode={codigo ?? ""} />;
}

export const metadata = { title: "Reivindicações e devoluções" };
