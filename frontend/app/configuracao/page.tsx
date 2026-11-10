"use client";

import { useState, type FormEvent, type ChangeEvent } from "react";
import Link from "next/link";
import {
  Bell,
  User,
  X,
  Trash2,
  ShieldAlert,
  HelpCircle,
  ExternalLink,
  Camera,
  Mail,
  Phone,
  Pencil,
} from "lucide-react";
import PrivateLayout from "../components/funcionario/PrivateLayout";

export default function Configuracoes() {
  // Notificações
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);

  // Modais
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Dados do perfil
  const [nome, setNome] = useState("João Silva");
  const [email, setEmail] = useState("joao.silva@unifip.edu.br");
  const [telefone, setTelefone] = useState("(83) 99999-9999");
  const [foto, setFoto] = useState("");

  function handleSalvarPerfil(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setShowEditProfile(false);
  }

  function handleFoto(e: ChangeEvent<HTMLInputElement>) {
    const arquivo = e.target.files?.[0];

    if (arquivo) {
      if (!arquivo.type.startsWith("image/")) {
        alert("Selecione um arquivo de imagem.");
        return;
      }

      const novaFoto = URL.createObjectURL(arquivo);
      setFoto(novaFoto);
    }
  }

  const cardClass =
    "rounded-2xl border border-gray-100 bg-white p-5 shadow-sm md:p-6";

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#42a5df] focus:ring-2 focus:ring-[#42a5df]/20";

  const labelClass = "mb-2 block text-sm font-semibold text-gray-700";

  return (
    <PrivateLayout>
      <main className="min-h-screen w-full bg-white font-sans text-gray-800">
        <div className="mx-auto w-full max-w-6xl px-5 py-8 md:px-10 md:py-10">
          {/* Cabeçalho */}
          <div className="mb-8">
            <p className="text-xs font-bold uppercase tracking-widest text-[#42a5df]">
              MINHA CONTA
            </p>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Configurações
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-500">
              Gerencie suas informações pessoais, notificações e preferências da
              sua conta.
            </p>
          </div>

          <div className="mx-auto max-w-3xl space-y-6">
            {/* CARD DO PERFIL */}
            <section className={cardClass}>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Meu perfil
                  </h2>
                  <p className="mt-1 text-xs text-gray-500">
                    Suas informações pessoais.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowEditProfile(true)}
                  className="flex items-center gap-2 rounded-xl border border-gray-200 px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  <Pencil size={15} />
                  Editar
                </button>
              </div>

              <div className="flex flex-col items-center border-b border-gray-100 pb-6 text-center sm:flex-row sm:text-left">
                <div className="relative mb-4 h-24 w-24 shrink-0 sm:mb-0 sm:mr-5">
                  {foto ? (
                    <img
                      src={foto}
                      alt="Foto de perfil"
                      className="h-24 w-24 rounded-full border-4 border-blue-50 object-cover"
                    />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-blue-50 bg-blue-50">
                      <User size={42} className="text-[#42a5df]" />
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={() => setShowEditProfile(true)}
                    className="absolute bottom-0 right-0 rounded-full border-2 border-white bg-[#42a5df] p-2 text-white transition hover:bg-[#238bc7]"
                    aria-label="Editar foto de perfil"
                  >
                    <Camera size={15} />
                  </button>
                </div>

                <div>
                  <h3 className="text-xl font-bold text-gray-900">{nome}</h3>
                  <p className="mt-1 text-sm text-gray-500">{email}</p>
                  <span className="mt-2 inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#238bc7]">
                    Conta institucional
                  </span>
                </div>
              </div>

              <div className="grid gap-4 pt-5 sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-gray-50 p-2.5">
                    <Mail size={18} className="text-gray-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">E-mail</p>
                    <p className="break-all text-sm font-semibold text-gray-800">
                      {email}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-gray-50 p-2.5">
                    <Phone size={18} className="text-gray-500" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Telefone</p>
                    <p className="text-sm font-semibold text-gray-800">
                      {telefone}
                    </p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowEditProfile(true)}
                className="mt-6 w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Editar informações do perfil
              </button>
            </section>

            {/* CARD DE NOTIFICAÇÕES */}
            <section className={cardClass}>
              <div className="mb-5 flex items-center gap-3">
                <div className="rounded-xl bg-blue-50 p-2.5">
                  <Bell className="h-5 w-5 text-[#42a5df]" />
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Notificações
                  </h2>
                  <p className="text-xs text-gray-500">
                    Escolha como deseja receber avisos.
                  </p>
                </div>
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Notificações push
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Receber notificações na plataforma.
                    </p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={pushNotifications}
                    aria-label="Ativar ou desativar notificações push"
                    onClick={() => setPushNotifications(!pushNotifications)}
                    className={`flex h-6 w-12 shrink-0 items-center rounded-full p-1 transition-colors ${
                      pushNotifications
                        ? "justify-end bg-[#42a5df]"
                        : "justify-start bg-gray-300"
                    }`}
                  >
                    <span className="h-4 w-4 rounded-full bg-white shadow-sm" />
                  </button>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-gray-800">
                      Alertas por e-mail
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      Receber avisos no e-mail cadastrado.
                    </p>
                  </div>

                  <button
                    type="button"
                    role="switch"
                    aria-checked={emailAlerts}
                    aria-label="Ativar ou desativar alertas por e-mail"
                    onClick={() => setEmailAlerts(!emailAlerts)}
                    className={`flex h-6 w-12 shrink-0 items-center rounded-full p-1 transition-colors ${
                      emailAlerts
                        ? "justify-end bg-[#42a5df]"
                        : "justify-start bg-gray-300"
                    }`}
                  >
                    <span className="h-4 w-4 rounded-full bg-white shadow-sm" />
                  </button>
                </div>
              </div>
            </section>

            {/* AJUDA E EXCLUSÃO DA CONTA */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              {/* Ajuda */}
              <section className={cardClass}>
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-xl bg-blue-50 p-2.5">
                    <HelpCircle className="h-5 w-5 text-[#42a5df]" />
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Central de ajuda
                    </h2>
                    <p className="text-xs text-gray-500">Tire suas dúvidas.</p>
                  </div>
                </div>

                <Link
                  href="/faq"
                  className="flex items-center justify-between rounded-xl border border-gray-200 px-4 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Perguntas frequentes
                  <ExternalLink size={17} className="text-gray-400" />
                </Link>

                <div className="mt-4 rounded-xl bg-gray-50 p-4">
                  <p className="text-sm font-semibold text-gray-800">
                    Contato do suporte
                  </p>
                  <p className="mt-1 break-all text-sm text-gray-600">
                    suporte@unifip.edu.br
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowHelp(true)}
                  className="mt-4 w-full rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                >
                  Mais informações
                </button>
              </section>

              {/* Excluir conta */}
              <section className="flex flex-col rounded-2xl border border-red-100 bg-white p-5 shadow-sm md:p-6">
                <div className="mb-4 flex items-center gap-3">
                  <div className="rounded-xl bg-red-50 p-2.5">
                    <ShieldAlert className="h-5 w-5 text-red-500" />
                  </div>

                  <h2 className="text-lg font-bold text-gray-900">
                    Excluir conta
                  </h2>
                </div>

                <p className="text-sm leading-relaxed text-gray-500">
                  Se desejar encerrar sua conta, você poderá solicitar a
                  exclusão dos seus dados.
                </p>

                <div className="mt-auto pt-4">
                  <button
                    type="button"
                    onClick={() => setShowDeleteAccount(true)}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-red-200 px-4 py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                  >
                    <Trash2 size={16} />
                    Excluir minha conta
                  </button>
                </div>
              </section>
            </div>
          </div>

          <footer className="mt-12 border-t border-gray-100 py-6 text-center">
            <p className="text-xs text-gray-400">
              FINDLY — Sistema de Achados e Perdidos UNIFIP
            </p>
          </footer>
        </div>

        {/* MODAL: EDITAR PERFIL */}
        {showEditProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl bg-white p-6 shadow-2xl md:p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    Editar perfil
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Atualize suas informações pessoais.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
                  aria-label="Fechar"
                >
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSalvarPerfil} className="space-y-4">
                {/* Foto */}
                <div className="flex flex-col items-center pb-3">
                  <div className="relative">
                    {foto ? (
                      <img
                        src={foto}
                        alt="Foto de perfil"
                        className="h-24 w-24 rounded-full border-4 border-blue-50 object-cover"
                      />
                    ) : (
                      <div className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-blue-50 bg-blue-50">
                        <User size={42} className="text-[#42a5df]" />
                      </div>
                    )}
                  </div>

                  <label className="mt-3 flex cursor-pointer items-center gap-2 text-sm font-semibold text-[#238bc7] transition hover:text-[#176b9d]">
                    <Camera size={16} />
                    Alterar foto
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFoto}
                      className="hidden"
                    />
                  </label>
                </div>

                <div>
                  <label className={labelClass}>Nome completo</label>
                  <input
                    type="text"
                    required
                    value={nome}
                    onChange={(e) => setNome(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>E-mail institucional</label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className={labelClass}>Telefone / WhatsApp</label>
                  <input
                    type="tel"
                    required
                    value={telefone}
                    onChange={(e) => setTelefone(e.target.value)}
                    placeholder="(83) 99999-9999"
                    className={inputClass}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowEditProfile(false)}
                    className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
                  >
                    Salvar alterações
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* MODAL: EXCLUIR CONTA */}
        {showDeleteAccount && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl md:p-8">
              <div className="mb-4 flex items-center gap-3 text-red-600">
                <ShieldAlert size={28} />
                <h3 className="text-xl font-bold text-gray-900">
                  Excluir conta
                </h3>
              </div>

              <p className="mb-6 text-sm leading-relaxed text-gray-600">
                Tem certeza que deseja excluir sua conta? Esta ação é
                irreversível e todos os seus dados e ocorrências no{" "}
                <strong>FINDLY / UNIFIP</strong> serão apagados.
              </p>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowDeleteAccount(false)}
                  className="rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-50"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={() => setShowDeleteAccount(false)}
                  className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                >
                  <Trash2 size={16} />
                  Excluir
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: AJUDA */}
        {showHelp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl md:p-8">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-bold text-gray-900">
                  Central de ajuda
                </h3>

                <button
                  type="button"
                  onClick={() => setShowHelp(false)}
                  className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100"
                  aria-label="Fechar"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="space-y-4">
                <Link
                  href="/faq"
                  className="flex items-center justify-between rounded-xl border border-gray-200 p-4 transition hover:bg-gray-50"
                >
                  <div>
                    <h4 className="text-sm font-bold text-gray-800">
                      Perguntas frequentes (FAQ)
                    </h4>
                    <p className="mt-1 text-xs text-gray-500">
                      Dúvidas sobre achados e resgate de pertences.
                    </p>
                  </div>

                  <ExternalLink
                    size={18}
                    className="ml-3 shrink-0 text-gray-400"
                  />
                </Link>

                <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">
                  <h4 className="text-sm font-bold text-gray-800">
                    Contato do suporte
                  </h4>
                  <p className="mt-2 text-sm text-gray-600">
                    suporte@unifip.edu.br
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowHelp(false)}
                className="mt-6 w-full rounded-xl bg-black py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
      </main>
    </PrivateLayout>
  );
}
