"use client";
import Image from "next/image";
import Link from "next/link";
import { useState, type FormEvent } from "react";
import {
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Phone,
  UserRound,
} from "lucide-react";
import { cadastrarUsuario } from "../../lib/api";

function Requisito({
  valido,
  texto,
}: {
  valido: boolean;
  texto: string;
}) {
  return (
    <div
      className={`flex items-center gap-2 text-xs ${
        valido ? "text-green-700" : "text-gray-600"
      }`}
    >
      <CheckCircle2
        size={15}
        aria-hidden="true"
        className={valido ? "text-green-700" : "text-gray-400"}
      />
      <span>{texto}</span>
    </div>
  );
}

export default function CadastroUsuario() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmacao, setMostrarConfirmacao] = useState(false);
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const [aviso, setAviso] = useState("");
  const [carregando, setCarregando] = useState(false);
  const nomeValido = nome.trim().split(/\s+/).filter(Boolean).length >= 2;
  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
  const senhaTamanho = senha.length >= 8;
  const senhaLetra = /[a-zA-Z]/.test(senha);
  const senhaNumero = /\d/.test(senha);
  const senhaValida = senhaTamanho && senhaLetra && senhaNumero;
  const senhasIguais =
    confirmarSenha.length > 0 && senha === confirmarSenha;
  const erroNome = tentouEnviar && !nomeValido;
  const erroEmail = tentouEnviar && !emailValido;
  const erroSenha = tentouEnviar && !senhaValida;
  const erroConfirmacao = tentouEnviar && !senhasIguais;
  const campo =
    "min-h-12 w-full rounded-xl border bg-white py-3 pl-12 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-500 focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100";
  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTentouEnviar(true);
    setAviso("");
    if (!nomeValido || !emailValido || !senhaValida || !senhasIguais || carregando) {
      return;
    }
    setCarregando(true);
    try {
      await cadastrarUsuario({
        full_name: nome.trim(),
        email: email.trim(),
        phone: telefone.trim(),
        password: senha,
        password_confirm: confirmarSenha,
      });
      setAviso("Conta criada com sucesso! Verifique seu e-mail para ativá-la.");
      setNome("");
      setEmail("");
      setTelefone("");
      setSenha("");
      setConfirmarSenha("");
      setTentouEnviar(false);
    } catch (error) {
      setAviso(
        error instanceof Error
          ? error.message
          : "Não foi possível criar sua conta. Tente novamente."
      );
    } finally {
      setCarregando(false);
    }
  }
  return (
    <main className="min-h-screen bg-[#f5f6f8] text-[#171717]">
      {/* <header className="flex h-[74px] items-center justify-between bg-black px-5 text-white sm:px-10">
        <Link
          href="/"
          className="flex items-center gap-3 rounded-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
        >
          <Image
            src="/logo-findly.jpg"
            alt=""
            width={42}
            height={42}
            className="h-[42px] w-[42px] rounded-full object-cover"
          />
          <span className="text-xl font-bold tracking-tight">FINDLY</span>
        </Link>
        <Link
          href="/"
          className="flex min-h-11 items-center gap-2 rounded-lg px-2 text-sm font-semibold transition hover:text-gray-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          <ArrowLeft size={18} aria-hidden="true" />
          Voltar ao início
        </Link>
      </header> */}
      <section className="flex min-h-[calc(100vh-74px)] items-center justify-center px-4 py-10 sm:px-6">
        <div className="w-full max-w-[680px]">
          <div className="mb-7 text-center">
            <Image
              src="/logo-findly.jpg"
              alt="Logo do FINDLY"
              width={76}
              height={76}
              priority
              className="mx-auto mb-5 h-[76px] w-[76px] rounded-full object-cover shadow-sm"
            />
            <h1 className="text-3xl font-bold tracking-tight sm:text-[34px]">
              Crie sua conta
            </h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-gray-600">
              Faça parte da comunidade acadêmica da UNIFIP e
              ajude a conectar pessoas aos seus pertences.
            </p>
          </div>
          <div className="rounded-2xl border border-[#e2e4e8] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.035)] sm:p-8">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="space-y-5"
            >
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* Nome */}
                <div>
                  <label
                    htmlFor="nome"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Nome completo{" "}
                    <span className="text-red-600" aria-hidden="true">*</span>
                  </label>
                  <div className="relative">
                    <UserRound
                      size={19}
                      aria-hidden="true"
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                    />
                    <input
                      id="nome"
                      name="nome"
                      type="text"
                      autoComplete="name"
                      required
                      aria-invalid={erroNome}
                      aria-describedby={erroNome ? "erro-nome" : undefined}
                      value={nome}
                      onChange={(e) => {
                        setNome(e.target.value);
                        setAviso("");
                      }}
                      placeholder="Seu nome completo"
                      className={`${campo} ${
                        erroNome ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  </div>
                  {erroNome && (
                    <p id="erro-nome" className="mt-2 text-xs text-red-700">
                      Informe seu nome e sobrenome.
                    </p>
                  )}
                </div>
                {/* E-mail */}
                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold"
                  >
                    E-mail institucional{" "}
                    <span className="text-red-600" aria-hidden="true">*</span>
                  </label>
                  <div className="relative">
                    <Mail
                      size={19}
                      aria-hidden="true"
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                    />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      aria-invalid={erroEmail}
                      aria-describedby={erroEmail ? "erro-email" : undefined}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        setAviso("");
                      }}
                      placeholder="Seu e-mail da UNIFIP"
                      className={`${campo} ${
                        erroEmail ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                  </div>
                  {erroEmail && (
                    <p id="erro-email" className="mt-2 text-xs text-red-700">
                      Informe um e-mail válido.
                    </p>
                  )}
                </div>
                {/* Telefone */}
                <div>
                  <label
                    htmlFor="telefone"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Telefone / WhatsApp{" "}
                    <span className="font-normal text-gray-500">
                      (opcional)
                    </span>
                  </label>
                  <div className="relative">
                    <Phone
                      size={19}
                      aria-hidden="true"
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                    />
                    <input
                      id="telefone"
                      name="telefone"
                      type="tel"
                      autoComplete="tel"
                      value={telefone}
                      onChange={(e) => {
                        setTelefone(e.target.value);
                        setAviso("");
                      }}
                      placeholder="(83) 99999-9999"
                      className={`${campo} border-gray-300`}
                    />
                  </div>
                </div>
                {/* Senha */}
                <div>
                  <label
                    htmlFor="senha"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Senha{" "}
                    <span className="text-red-600" aria-hidden="true">*</span>
                  </label>
                  <div className="relative">
                    <LockKeyhole
                      size={19}
                      aria-hidden="true"
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                    />
                    <input
                      id="senha"
                      name="senha"
                      type={mostrarSenha ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      aria-invalid={erroSenha}
                      aria-describedby={
                        erroSenha ? "erro-senha requisitos-senha" : "requisitos-senha"
                      }
                      value={senha}
                      onChange={(e) => {
                        setSenha(e.target.value);
                        setAviso("");
                      }}
                      placeholder="Crie uma senha"
                      className={`${campo} pr-12 ${
                        erroSenha ? "border-red-500" : "border-gray-300"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setMostrarSenha(!mostrarSenha)}
                      aria-label={
                        mostrarSenha ? "Ocultar senha" : "Mostrar senha"
                      }
                      aria-pressed={mostrarSenha}
                      className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-[#2563eb]"
                    >
                      {mostrarSenha ? (
                        <EyeOff size={19} aria-hidden="true" />
                      ) : (
                        <Eye size={19} aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {erroSenha && (
                    <p id="erro-senha" className="mt-2 text-xs text-red-700">
                      A senha não atende aos requisitos.
                    </p>
                  )}
                </div>
                {/* Confirmar senha */}
                <div className="sm:col-span-2">
                  <label
                    htmlFor="confirmarSenha"
                    className="mb-2 block text-sm font-semibold"
                  >
                    Confirmar senha{" "}
                    <span className="text-red-600" aria-hidden="true">*</span>
                  </label>
                  <div className="relative">
                    <LockKeyhole
                      size={19}
                      aria-hidden="true"
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                    />
                    <input
                      id="confirmarSenha"
                      name="confirmarSenha"
                      type={mostrarConfirmacao ? "text" : "password"}
                      autoComplete="new-password"
                      required
                      aria-invalid={erroConfirmacao}
                      aria-describedby={
                        erroConfirmacao ? "erro-confirmacao" : undefined
                      }
                      value={confirmarSenha}
                      onChange={(e) => {
                        setConfirmarSenha(e.target.value);
                        setAviso("");
                      }}
                      placeholder="Digite a senha novamente"
                      className={`${campo} pr-12 ${
                        erroConfirmacao
                          ? "border-red-500"
                          : "border-gray-300"
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setMostrarConfirmacao(!mostrarConfirmacao)
                      }
                      aria-label={
                        mostrarConfirmacao
                          ? "Ocultar confirmação de senha"
                          : "Mostrar confirmação de senha"
                      }
                      aria-pressed={mostrarConfirmacao}
                      className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-lg text-gray-600 hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-[#2563eb]"
                    >
                      {mostrarConfirmacao ? (
                        <EyeOff size={19} aria-hidden="true" />
                      ) : (
                        <Eye size={19} aria-hidden="true" />
                      )}
                    </button>
                  </div>
                  {confirmarSenha.length > 0 && (
                    <p
                      id={erroConfirmacao ? "erro-confirmacao" : undefined}
                      className={`mt-2 text-xs ${
                        senhasIguais ? "text-green-700" : "text-red-700"
                      }`}
                    >
                      {senhasIguais
                        ? "As senhas coincidem."
                        : "As senhas não coincidem."}
                    </p>
                  )}
                  {erroConfirmacao && !confirmarSenha && (
                    <p
                      id="erro-confirmacao"
                      className="mt-2 text-xs text-red-700"
                    >
                      Confirme sua senha.
                    </p>
                  )}
                </div>
              </div>
              {/* Requisitos de senha */}
              <div
                id="requisitos-senha"
                className="rounded-xl border border-gray-200 bg-[#f8f9fa] p-4"
              >
                <p className="mb-3 text-sm font-semibold">
                  Requisitos da senha
                </p>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <Requisito
                    valido={senhaTamanho}
                    texto="Pelo menos 8 caracteres"
                  />
                  <Requisito
                    valido={senhaLetra}
                    texto="Pelo menos uma letra"
                  />
                  <Requisito
                    valido={senhaNumero}
                    texto="Pelo menos um número"
                  />
                </div>
              </div>
              {/* Aviso de privacidade */}
              <p className="text-xs leading-5 text-gray-600">
                Os dados informados serão utilizados para identificação
                e funcionamento dos recursos do FINDLY, conforme a
                política de privacidade que será disponibilizada.
              </p>
              <button
                type="submit"
                disabled={carregando}
                className="flex min-h-12 w-full items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-[#292929] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb]"
              >
                {carregando ? "Criando conta..." : "Criar conta"}
              </button>
              {aviso && (
                <p
                  role="status"
                  className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-900"
                >
                  {aviso}
                </p>
              )}
              <p className="text-xs text-gray-500">
                <span className="text-red-600">*</span> Campos obrigatórios
              </p>
            </form>
            <div className="mt-6 border-t border-gray-200 pt-6">
              <p className="text-center text-sm text-gray-600">
                Já possui uma conta?{" "}
                <Link
                  href="/login"
                  className="font-bold text-black underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb]"
                >
                  Entrar
                </Link>
              </p>
            </div>
          </div>
          <p className="mt-6 text-center text-xs text-gray-500">
            FINDLY · Centro Universitário UNIFIP
          </p>
        </div>
      </section>
    </main>
  );
}
