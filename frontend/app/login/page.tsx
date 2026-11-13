
"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import {
  ArrowLeft,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Loader2,
} from "lucide-react";

import { ApiError, loginUsuario } from "../../lib/api";

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [tentouEnviar, setTentouEnviar] = useState(false);
  const [carregando, setCarregando] = useState(false);
  const [aviso, setAviso] = useState("");
  const [sucesso, setSucesso] = useState(false);

  const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email.trim()
  );

  const erroEmail = tentouEnviar && !emailValido;
  const erroSenha = tentouEnviar && senha.length === 0;

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (carregando) return;

    setTentouEnviar(true);
    setAviso("");
    setSucesso(false);

    if (!emailValido || !senha) return;

    setCarregando(true);

    try {
      const resposta = await loginUsuario({
        email: email.trim(),
        password: senha,
      });

      if (!resposta.user) {
        throw new Error("Dados do usuário não recebidos.");
      }

      setSucesso(true);
      setAviso(
        `Login realizado! Bem-vindo(a), ${
          resposta.user.full_name || "usuário"
        }.`
      );

      // Aguarda a atualização da sessão e segue para o dashboard.
      router.replace("/dashboard");
      router.refresh();

    } catch (erro: unknown) {
      setSucesso(false);

      if (erro instanceof ApiError) {
        if (erro.status === 429) {
          setAviso(
            "Muitas tentativas de login. Aguarde alguns minutos."
          );
        } else if (erro.status === 401) {
          setAviso(
            "E-mail ou senha incorretos, ou conta ainda não ativada."
          );
        } else if (erro.status === 400) {
          setAviso(
            erro.message || "Verifique os dados informados."
          );
        } else {
          setAviso(erro.message);
        }
      } else if (erro instanceof TypeError) {
        setAviso(
          "Não foi possível conectar ao servidor. Verifique se o backend está funcionando."
        );
      } else {
        setAviso(
          erro instanceof Error
            ? erro.message
            : "Ocorreu um erro inesperado. Tente novamente."
        );
      }

      // Mantém a senha preenchida quando ocorre um erro.
    } finally {
      setCarregando(false);
    }
  }

  const campo =
    "min-h-12 w-full rounded-xl border bg-white py-3 pl-12 pr-4 text-sm text-gray-900 outline-none transition placeholder:text-gray-500 focus:border-[#2563eb] focus:ring-2 focus:ring-blue-100";

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

          <span className="text-xl font-bold tracking-tight">
            FINDLY
          </span>
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
        <div className="w-full max-w-[440px]">
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
              Entre na sua conta
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-gray-600">
              Acesse o FINDLY com suas credenciais institucionais
              para acompanhar seus achados e perdidos.
            </p>
          </div>

          <div className="rounded-2xl border border-[#e2e4e8] bg-white p-6 shadow-[0_4px_24px_rgba(0,0,0,0.035)] sm:p-8">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="email"
                  className="mb-2 block text-sm font-semibold"
                >
                  E-mail institucional{" "}
                  <span className="text-red-600" aria-hidden="true">
                    *
                  </span>
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
                    disabled={carregando}
                    aria-invalid={erroEmail}
                    aria-describedby={
                      erroEmail ? "erro-email" : undefined
                    }
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setAviso("");
                      setSucesso(false);
                    }}
                    placeholder="Digite seu e-mail institucional"
                    className={`${campo} ${
                      erroEmail ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>

                {erroEmail && (
                  <p
                    id="erro-email"
                    className="mt-2 text-xs text-red-700"
                  >
                    Informe um e-mail válido.
                  </p>
                )}
              </div>

              <div>
                <label
                  htmlFor="senha"
                  className="mb-2 block text-sm font-semibold"
                >
                  Senha{" "}
                  <span className="text-red-600" aria-hidden="true">
                    *
                  </span>
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
                    autoComplete="current-password"
                    required
                    disabled={carregando}
                    aria-invalid={erroSenha}
                    aria-describedby={
                      erroSenha ? "erro-senha" : undefined
                    }
                    value={senha}
                    onChange={(e) => {
                      setSenha(e.target.value);
                      setAviso("");
                      setSucesso(false);
                    }}
                    placeholder="Digite sua senha"
                    className={`${campo} pr-12 ${
                      erroSenha ? "border-red-500" : "border-gray-300"
                    }`}
                  />

                  <button
                    type="button"
                    disabled={carregando}
                    onClick={() =>
                      setMostrarSenha(!mostrarSenha)
                    }
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
                  <p
                    id="erro-senha"
                    className="mt-2 text-xs text-red-700"
                  >
                    Informe sua senha.
                  </p>
                )}

                <p className="mt-3 text-right text-sm text-gray-500">
                  <Link href="/recuperar-senha" className="underline">Esqueceu sua senha?</Link>
                </p>
              </div>

              <button
                type="submit"
                disabled={carregando}
                className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-bold text-white transition hover:bg-[#292929] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb]"
              >
                {carregando ? (
                  <>
                    <Loader2
                      size={18}
                      className="animate-spin"
                      aria-hidden="true"
                    />
                    Entrando...
                  </>
                ) : (
                  "Entrar"
                )}
              </button>

              {aviso && (
                <p
                  role={sucesso ? "status" : "alert"}
                  className={`rounded-lg border px-4 py-3 text-sm leading-5 ${
                    sucesso
                      ? "border-green-200 bg-green-50 text-green-800"
                      : "border-red-200 bg-red-50 text-red-800"
                  }`}
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
                Ainda não possui uma conta?{" "}
                <Link
                  href="/cadastro"
                  className="font-bold text-black underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563eb]"
                >
                  Cadastre-se
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
