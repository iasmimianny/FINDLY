
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { CheckCircle2, LoaderCircle, XCircle } from "lucide-react";

type Status = "verificando" | "sucesso" | "erro";

export default function VerificarEmail() {
  const [status, setStatus] = useState<Status>("verificando");
  const [mensagem, setMensagem] = useState("Verificando seu e-mail...");
  const iniciou = useRef(false);

  useEffect(() => {
    if (iniciou.current) return;
    iniciou.current = true;

    async function verificar() {
      const parametros = new URLSearchParams(window.location.search);
      const uid = parametros.get("uid");
      const token = parametros.get("token");

      if (!uid || !token) {
        setStatus("erro");
        setMensagem("Link de verificação inválido ou incompleto.");
        return;
      }

      try {
        const resposta = await fetch(
          "http://127.0.0.1:8000/api/auth/verify-email/",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ uid, token }),
          }
        );

        const dados = await resposta.json();

        if (!resposta.ok) {
          throw new Error(
            typeof dados.detail === "string"
              ? dados.detail
              : "Não foi possível verificar seu e-mail."
          );
        }

        setStatus("sucesso");
        setMensagem("E-mail verificado com sucesso! Sua conta está ativa.");
      } catch (erro) {
        setStatus("erro");
        setMensagem(
          erro instanceof Error
            ? erro.message
            : "Ocorreu um erro ao verificar seu e-mail."
        );
      }
    }

    void verificar();
  }, []);

  return (
    <main className="min-h-screen bg-[#f5f6f8] text-[#171717]">
      <header className="flex h-[74px] items-center bg-black px-5 text-white sm:px-10">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/logo-findly.jpg"
            alt="Logo do FINDLY"
            width={42}
            height={42}
            className="h-[42px] w-[42px] rounded-full object-cover"
          />
          <span className="text-xl font-bold">FINDLY</span>
        </Link>
      </header>

      <section className="flex min-h-[calc(100vh-74px)] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 text-center shadow-sm">
          {status === "verificando" && (
            <LoaderCircle
              size={54}
              className="mx-auto mb-5 animate-spin text-blue-600"
            />
          )}

          {status === "sucesso" && (
            <CheckCircle2
              size={54}
              className="mx-auto mb-5 text-green-600"
            />
          )}

          {status === "erro" && (
            <XCircle
              size={54}
              className="mx-auto mb-5 text-red-600"
            />
          )}

          <h1 className="mb-3 text-2xl font-bold">
            {status === "verificando"
              ? "Verificando e-mail"
              : status === "sucesso"
                ? "Conta ativada!"
                : "Falha na verificação"}
          </h1>

          <p role="status" className="mb-7 text-sm leading-6 text-gray-600">
            {mensagem}
          </p>

          {status === "sucesso" && (
            <Link
              href="/login"
              className="block rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Ir para o login
            </Link>
          )}

          {status === "erro" && (
            <Link
              href="/login"
              className="block rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Voltar ao login
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
