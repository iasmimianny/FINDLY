import Link from "next/link";
import { ArrowLeft, KeyRound, Settings } from "lucide-react";
import PrivateLayout from "../components/funcionario/PrivateLayout";
import ProfilePanel from "../../components/ProfilePanel";

export default function Perfil() {
  return <PrivateLayout>
    <main className="min-h-screen bg-[#F5F6F8] px-5 py-8 text-gray-900 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-widest text-blue-700">Minha conta</p><h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Meu perfil</h1><p className="mt-3 text-sm leading-6 text-gray-600">Consulte sua conta e mantenha nome e telefone atualizados.</p></div>
          <Link href="/configuracao" className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold hover:bg-gray-50"><Settings size={17} aria-hidden="true" />Configurações</Link>
        </div>
        <ProfilePanel />
        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold"><KeyRound size={20} aria-hidden="true" />Senha da conta</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">Receba um link no e-mail da sua conta para definir uma nova senha.</p>
          <Link href="/recuperar-senha" className="mt-4 inline-block rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold hover:bg-gray-50">Solicitar troca de senha</Link>
        </section>
        <Link href="/dashboard" className="mt-6 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4"><ArrowLeft size={16} aria-hidden="true" />Voltar ao início</Link>
      </div>
    </main>
  </PrivateLayout>;
}
