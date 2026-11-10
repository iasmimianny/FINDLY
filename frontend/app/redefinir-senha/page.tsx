import type { Metadata } from "next";
import PasswordResetForm from "../../components/PasswordResetForm";

export const metadata: Metadata = { referrer: "no-referrer" };

export default async function RedefinirSenha({
  searchParams,
}: {
  searchParams: Promise<{ uid?: string | string[]; token?: string | string[] }>;
}) {
  const { uid, token } = await searchParams;

  return (
    <PasswordResetForm
      reset={{
        uid: typeof uid === "string" ? uid : "",
        token: typeof token === "string" ? token : "",
      }}
    />
  );
}
