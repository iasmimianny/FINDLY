import { redirect } from "next/navigation";

export default function CadastroItensPerdidos() {
  redirect("/cadastrar-item");
}

export const metadata = { title: "Registrar item perdido" };
