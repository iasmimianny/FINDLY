import Link from "next/link";
import { Bell, CircleHelp, KeyRound, ShieldAlert } from "lucide-react";
import PrivateLayout from "../components/funcionario/PrivateLayout";
import ProfilePanel from "../../components/ProfilePanel";

const cardClass = "rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6";

export default function Configuracoes() {
  return <PrivateLayout>
    <main className="min-h-screen bg-[#F5F6F8] px-5 py-8 text-gray-900 sm:px-8 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8"><p className="text-xs font-bold uppercase tracking-widest text-blue-700">Minha conta</p><h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Configurações</h1><p className="mt-3 text-sm leading-6 text-gray-600">Atualize seus dados pessoais e acesse as opções da sua conta.</p></header>
        <section aria-label="Dados do perfil"><h2 className="mb-4 text-lg font-bold">Meu perfil</h2><ProfilePanel /></section>
        <div className="mt-6 grid items-start gap-6 sm:grid-cols-2">
          <section className={cardClass}><h2 className="flex items-center gap-2 text-lg font-bold"><KeyRound size={20} aria-hidden="true" />Segurança</h2><p className="mt-2 text-sm leading-6 text-gray-600">Solicite um link no seu e-mail para definir uma nova senha.</p><Link href="/recuperar-senha" className="mt-4 inline-block rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold hover:bg-gray-50">Trocar senha</Link></section>
          <section className={cardClass}><h2 className="flex items-center gap-2 text-lg font-bold"><CircleHelp size={20} aria-hidden="true" />Central de ajuda</h2><p className="mt-2 text-sm leading-6 text-gray-600">Tire suas dúvidas sobre objetos perdidos, encontrados e devoluções.</p><Link href="/faq" className="mt-4 inline-block rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold hover:bg-gray-50">Perguntas frequentes</Link></section>
          <section className={cardClass}><h2 className="flex items-center gap-2 text-lg font-bold"><Bell size={20} aria-hidden="true" />Notificações</h2><p className="mt-2 text-sm leading-6 text-gray-600">As preferências de notificações estarão disponíveis aqui em breve.</p></section>
          <section className={cardClass}><h2 className="flex items-center gap-2 text-lg font-bold"><ShieldAlert size={20} aria-hidden="true" />Gerenciamento da conta</h2><p className="mt-2 text-sm leading-6 text-gray-600">A exclusão de conta está indisponível no momento.</p><button type="button" disabled className="mt-4 rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-500 opacity-60">Excluir conta</button></section>
        </div>
      </div>
    </main>
  </PrivateLayout>;
}
