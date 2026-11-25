import { accountLinks, type NavigationArea } from "../lib/navigation";
import Link from "next/link";
import { ArrowLeft, Bell, CircleHelp, KeyRound, Settings, ShieldAlert } from "lucide-react";
import ProfilePanel from "./ProfilePanel";

export function ProfileContent({ area = "user" }: { area?: NavigationArea }) {
  const links = accountLinks(area);
  return <>
    <div className="findly-page min-h-screen bg-[#F5F6F8] text-gray-900">
      <div className="w-full min-w-0">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div><p className="text-xs font-bold uppercase tracking-widest findly-page-label">Minha conta</p><h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Meu perfil</h1><p className="mt-3 text-sm leading-6 text-gray-600">Consulte sua conta e mantenha nome e telefone atualizados.</p></div>
          <Link href={links.settings} className="inline-flex items-center gap-2 rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm font-semibold hover:bg-gray-50"><Settings size={17} aria-hidden="true" />Configurações</Link>
        </div>
        <ProfilePanel />
        <section className="mt-6 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="flex items-center gap-2 text-lg font-bold"><KeyRound size={20} aria-hidden="true" />Senha da conta</h2>
          <p className="mt-2 text-sm leading-6 text-gray-600">Receba um link no e-mail da sua conta para definir uma nova senha.</p>
          <Link href="/recuperar-senha" className="mt-4 inline-block rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold hover:bg-gray-50">Solicitar troca de senha</Link>
        </section>
        <Link href={links.home} className="mt-6 inline-flex items-center gap-2 text-sm font-semibold underline underline-offset-4"><ArrowLeft size={16} aria-hidden="true" />Voltar ao início</Link>
      </div>
    </div>
  </>;
}

const cardClass = "rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6";

export function SettingsContent({ area = "user" }: { area?: NavigationArea }) {
  const links = accountLinks(area);
  return <>
    <div className="findly-page min-h-screen bg-[#F5F6F8] text-gray-900">
      <div className="w-full min-w-0">
        <header className="mb-8"><p className="text-xs font-bold uppercase tracking-widest findly-page-label">Minha conta</p><h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">Configurações</h1><p className="mt-3 text-sm leading-6 text-gray-600">Atualize seus dados pessoais e acesse as opções da sua conta.</p></header>
        <section aria-label="Dados do perfil"><h2 className="mb-4 text-lg font-bold">Meu perfil</h2><ProfilePanel /></section>
        <div className="mt-6 grid items-start gap-6 sm:grid-cols-2">
          <section className={cardClass}><h2 className="flex items-center gap-2 text-lg font-bold"><KeyRound size={20} aria-hidden="true" />Segurança</h2><p className="mt-2 text-sm leading-6 text-gray-600">Solicite um link no seu e-mail para definir uma nova senha.</p><Link href="/recuperar-senha" className="mt-4 inline-block rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold hover:bg-gray-50">Trocar senha</Link></section>
          <section className={cardClass}><h2 className="flex items-center gap-2 text-lg font-bold"><CircleHelp size={20} aria-hidden="true" />Central de ajuda</h2><p className="mt-2 text-sm leading-6 text-gray-600">Tire suas dúvidas sobre objetos perdidos, encontrados e devoluções.</p><Link href={links.help} className="mt-4 inline-block rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold hover:bg-gray-50">Perguntas frequentes</Link></section>
          <section className={cardClass}><h2 className="flex items-center gap-2 text-lg font-bold"><Bell size={20} aria-hidden="true" />Notificações</h2><p className="mt-2 text-sm leading-6 text-gray-600">Acompanhe as atualizações dos seus pedidos de propriedade e das retiradas.</p><Link href={links.notifications} className="mt-4 inline-block rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold hover:bg-gray-50">Ver notificações</Link></section>
          <section className={cardClass}><h2 className="flex items-center gap-2 text-lg font-bold"><ShieldAlert size={20} aria-hidden="true" />Gerenciamento da conta</h2><p className="mt-2 text-sm leading-6 text-gray-600">A exclusão de conta está indisponível no momento.</p><button type="button" disabled className="mt-4 rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-500 opacity-60">Excluir conta</button></section>
        </div>
      </div>
    </div>
  </>;
}
