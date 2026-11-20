import { notFound } from "next/navigation";
import StaffItemDetail from "../../../../components/funcionario/StaffItemDetail";
export default async function Page({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  if (!/^[A-Z2-9]{10}$/.test(code)) notFound();
  return <StaffItemDetail code={code} />;
}
