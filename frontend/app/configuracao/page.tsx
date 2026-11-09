"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import { 
  Bell, 
  Moon, 
  User, 
  Globe, 
  ArrowLeft, 
  X, 
  Trash2, 
  Edit3, 
  ShieldAlert,
  Eye,
  EyeOff,
  HelpCircle,
  ExternalLink
} from "lucide-react";

export default function Configuracoes() {
  // Estados de Configuração
  const [pushNotifications, setPushNotifications] = useState(true);
  const [emailAlerts, setEmailAlerts] = useState(false);
  const [tema, setTema] = useState("Escuro");
  const [idioma, setIdioma] = useState("Português (PT-BR)");

  // Modais
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showHelp, setShowHelp] = useState(false);

  // Dados do Perfil
  const [nome, setNome] = useState("João Silva");
  const [email, setEmail] = useState("joao.silva@unifip.edu.br");
  const [telefone, setTelefone] = useState("(83) 99999-9999");
  const [senha, setSenha] = useState("••••••••");
  const [verSenha, setVerSenha] = useState(false);

  function handleSalvarPerfil(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setShowEditProfile(false);
  }

  return (
    <main className="min-h-screen bg-white text-black font-sans flex flex-col justify-between">
      <div>
        {/* --- CABEÇALHO / HEADER --- */}
        <header className="flex h-[74px] items-center justify-between bg-black px-8 text-white">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Image
                src="/logo-findly.jpg"
                alt="Findly"
                width={48}
                height={48}
                className="rounded-full object-cover"
              />
            </Link>
            <span className="text-lg font-medium tracking-wide">FINDLY</span>
          </div>

          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => window.history.back()}
              className="flex items-center gap-2 font-bold italic hover:opacity-70 transition"
            >
              <ArrowLeft className="w-5 h-5 stroke-[2.5]" />
              Voltar
            </button>
          </div>
        </header>

        {/* --- CONTEÚDO PRINCIPAL --- */}
        <div className="mx-auto max-w-6xl px-6 py-10">
          
          {/* Título da Página */}
          <div className="mb-9">
            <h1 className="text-5xl font-black italic leading-tight">
              Configurações
            </h1>
            <div className="mt-3 h-1 w-40 bg-[#42a5df]" />
          </div>

          {/* Grid do Conteúdo */}
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 items-stretch">
            
            {/* BLOCO 1: Notificações, Tema, Conta */}
            <div className="rounded-3xl bg-[#d5d5d5] p-6 md:p-8 space-y-8 flex flex-col justify-between">
              
              {/* Notificações */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Bell className="w-6 h-6 text-black shrink-0" />
                  <h2 className="text-2xl font-black italic">Notificações</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-bold italic text-base">
                      Ativar/desativar notificações push
                    </span>
                    <button
                      type="button"
                      onClick={() => setPushNotifications(!pushNotifications)}
                      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                        pushNotifications ? "bg-black justify-end" : "bg-gray-400 justify-start"
                      }`}
                    >
                      <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between gap-4">
                    <span className="font-bold italic text-base">
                      Alertas por e-mail
                    </span>
                    <button
                      type="button"
                      onClick={() => setEmailAlerts(!emailAlerts)}
                      className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
                        emailAlerts ? "bg-black justify-end" : "bg-gray-400 justify-start"
                      }`}
                    >
                      <div className="bg-white w-4 h-4 rounded-full shadow-md" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Tema */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <Moon className="w-6 h-6 text-black shrink-0" />
                  <h2 className="text-2xl font-black italic">Tema</h2>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setTema("Escuro")}
                    className={`flex-1 py-3 px-4 rounded-full font-bold italic text-center transition ${
                      tema === "Escuro"
                        ? "bg-black text-white"
                        : "bg-white text-black hover:bg-gray-100"
                    }`}
                  >
                    Escuro
                  </button>
                  <button
                    type="button"
                    onClick={() => setTema("Claro")}
                    className={`flex-1 py-3 px-4 rounded-full font-bold italic text-center transition ${
                      tema === "Claro"
                        ? "bg-black text-white"
                        : "bg-white text-black hover:bg-gray-100"
                    }`}
                  >
                    Claro
                  </button>
                </div>
              </div>

              {/* Conta */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <User className="w-6 h-6 text-black shrink-0" />
                  <h2 className="text-2xl font-black italic">Conta</h2>
                </div>

                <div className="flex justify-between items-center px-1">
                  <button
                    type="button"
                    onClick={() => setShowEditProfile(true)}
                    className="font-bold italic underline hover:opacity-75 transition"
                  >
                    Editar perfil
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowDeleteAccount(true)}
                    className="font-bold italic underline hover:opacity-75 transition text-red-700"
                  >
                    Excluir conta
                  </button>
                </div>
              </div>

            </div>

            {/* BLOCO 2: Idioma */}
            <div className="rounded-3xl bg-[#d5d5d5] p-6 md:p-8 flex flex-col justify-between h-full">
              <div className="flex items-center gap-3 mb-6">
                <Globe className="w-6 h-6 text-black shrink-0" />
                <h2 className="text-2xl font-black italic">Idioma</h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 flex-1 items-center py-2">
                {[
                  "Português (PT-BR)",
                  "Inglês (EN)",
                  "Espanhol",
                  "Outros"
                ].map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setIdioma(item)}
                    className={`min-h-[52px] py-3 px-4 rounded-full font-bold italic flex items-center justify-center text-center text-sm md:text-base transition ${
                      idioma === item
                        ? "bg-black text-white"
                        : "bg-white text-black hover:bg-gray-100"
                    }`}
                  >
                    {item}
                  </button>
                ))}
              </div>

              <div className="hidden md:block h-8" />
            </div>

          </div>
        </div>
      </div>

      {/* --- RODAPÉ / ABRE O POPUP DE AJUDA --- */}
      <footer className="py-10 text-center">
        <button
          type="button"
          onClick={() => setShowHelp(true)}
          className="text-2xl md:text-3xl font-normal italic tracking-wide hover:opacity-80 transition"
        >
          Precisa de <span className="font-black not-italic">Ajuda?</span>
        </button>
      </footer>

      {/* --- MODAL: EDITAR PERFIL --- */}
      {showEditProfile && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black italic flex items-center gap-2">
                <Edit3 className="w-6 h-6" /> Editar Perfil
              </h3>
              <button
                type="button"
                onClick={() => setShowEditProfile(false)}
                className="p-1 hover:bg-gray-200 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSalvarPerfil} className="space-y-4">
              <div>
                <label className="block text-sm font-bold italic mb-2">Nome Completo</label>
                <input
                  type="text"
                  required
                  value={nome}
                  onChange={(e) => setNome(e.target.value)}
                  className="w-full rounded-xl bg-[#f8f8f8] border border-gray-300 px-4 py-3 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold italic mb-2">E-mail Institucional</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl bg-[#f8f8f8] border border-gray-300 px-4 py-3 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold italic mb-2">Telefone / WhatsApp</label>
                <input
                  type="tel"
                  required
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(83) 99999-9999"
                  className="w-full rounded-xl bg-[#f8f8f8] border border-gray-300 px-4 py-3 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold italic mb-2">Nova Senha</label>
                <div className="relative flex items-center">
                  <input
                    type={verSenha ? "text" : "password"}
                    required
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl bg-[#f8f8f8] border border-gray-300 pl-4 pr-11 py-3 outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setVerSenha(!verSenha)}
                    className="absolute right-3 text-gray-500 hover:text-black transition"
                  >
                    {verSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditProfile(false)}
                  className="px-5 py-2.5 rounded-2xl font-bold italic text-gray-600 hover:bg-gray-100"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl font-bold italic bg-black text-white hover:bg-gray-800 transition"
                >
                  Salvar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- MODAL: EXCLUIR CONTA --- */}
      {showDeleteAccount && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-red-200">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <ShieldAlert size={30} />
              <h3 className="text-2xl font-black italic">Excluir Conta</h3>
            </div>
            
            <p className="text-gray-700 text-sm md:text-base mb-6 leading-relaxed">
              Tem certeza que deseja excluir sua conta? Esta ação é irreversível e todos os seus dados e ocorrências no <strong>FINDLY / UNIFIP</strong> serão apagados.
            </p>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowDeleteAccount(false)}
                className="px-5 py-2.5 rounded-2xl font-bold italic text-gray-700 hover:bg-gray-100"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteAccount(false)}
                className="px-6 py-2.5 rounded-2xl font-bold italic bg-red-600 text-white hover:bg-red-700 transition flex items-center gap-2"
              >
                <Trash2 size={18} />
                <span>Excluir</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: POPUP DE AJUDA COM LINK PARA FAQ --- */}
      {showHelp && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-black italic flex items-center gap-2">
                <HelpCircle className="w-6 h-6" /> Central de Ajuda
              </h3>
              <button 
                type="button"
                onClick={() => setShowHelp(false)}
                className="p-1 hover:bg-gray-200 rounded-full transition"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              <Link
                href="/faq"
                className="p-4 bg-[#f8f8f8] hover:bg-gray-200 rounded-2xl border border-gray-200 flex items-center justify-between group transition block"
              >
                <div>
                  <h4 className="font-bold italic text-lg mb-1 group-hover:text-black">
                    Perguntas Frequentes (FAQ)
                  </h4>
                  <p className="text-sm text-gray-600">
                    Veja respostas para dúvidas sobre achados e resgate de pertences.
                  </p>
                </div>
                <ExternalLink className="w-5 h-5 text-gray-500 group-hover:text-black shrink-0 ml-2" />
              </Link>

              <div className="p-4 bg-[#f8f8f8] rounded-2xl border border-gray-200">
                <h4 className="font-bold italic text-lg mb-1">Contato do Suporte</h4>
                <p className="text-sm text-gray-600">
                  E-mail: <strong>suporte@unifip.edu.br</strong>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowHelp(false)}
              className="mt-6 w-full py-3 rounded-2xl font-bold italic bg-black text-white hover:bg-gray-800 transition"
            >
              Fechar
            </button>
          </div>
        </div>
      )}

    </main>
  );
}