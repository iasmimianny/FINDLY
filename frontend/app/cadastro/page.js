"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { User, Mail, Phone, Lock, ArrowLeft, Settings } from "lucide-react";

export default function CadastroUsuario() {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [senha, setSenha] = useState("");
  const [cadastrado, setCadastrado] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setCadastrado(true);
  }

  return (
    <main className="min-h-screen bg-white text-black font-sans">
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

          <Link
            href="/configuracoes"
            className="flex items-center justify-center hover:opacity-70 transition"
            aria-label="Configurações"
          >
            <Settings className="w-6 h-6" />
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-9">
          <h1 className="text-5xl font-black italic leading-tight">
            Cadastre seu perfil<br />
          </h1>

          <div className="mt-3 h-1 w-40 bg-[#42a5df]" />

          <p className="mt-5 max-w-xl text-base text-gray-500">
            Preencha as informações abaixo para criar seu cadastro de usuário na UNIFIP.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl bg-[#f8f8f8] p-6 shadow-sm md:p-8">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="rounded-2xl bg-[#d5d5d5] p-5">
              <label className="mb-3 flex items-center gap-3 text-lg font-bold italic">
                <User className="w-6 h-6 text-black shrink-0" />
                Nome Completo:
              </label>

              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Seu nome completo"
                className="w-full rounded-xl bg-white px-4 py-3 outline-none"
              />
            </div>

            <div className="rounded-2xl bg-[#d5d5d5] p-5">
              <label className="mb-3 flex items-center gap-3 text-lg font-bold italic">
                <Mail className="w-6 h-6 text-black shrink-0" />
                E-mail Institucional:
              </label>

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@unifip.edu.br"
                className="w-full rounded-xl bg-white px-4 py-3 outline-none"
              />
            </div>

            <div className="rounded-2xl bg-[#d5d5d5] p-5">
              <label className="mb-3 flex items-center gap-3 text-lg font-bold italic">
                <Phone className="w-6 h-6 text-black shrink-0" />
                Telefone / WhatsApp:
              </label>

              <input
                type="tel"
                required
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                placeholder="(83) 99999-9999"
                className="w-full rounded-xl bg-white px-4 py-3 outline-none"
              />
            </div>

            <div className="rounded-2xl bg-[#d5d5d5] p-5">
              <label className="mb-3 flex items-center gap-3 text-lg font-bold italic">
                <Lock className="w-6 h-6 text-black shrink-0" />
                Senha:
              </label>

              <input
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl bg-white px-4 py-3 outline-none"
              />
            </div>
          </div>

          <div className="mt-6 rounded-2xl border border-[#59558a]/20 bg-[#59558a]/10 p-5">
            <p className="font-bold text-[#59558a]">
              Privacidade garantida
            </p>
            <p className="mt-1 text-sm text-gray-600">
              Seus dados serão utilizados apenas para a autenticação e identificação de ocorrências no campus da UNIFIP.
            </p>
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-2xl bg-black px-6 py-4 text-lg font-bold italic text-white transition hover:bg-gray-800"
          >
            Cadastrar
          </button>

          {cadastrado && (
            <div className="mt-4 rounded-2xl border border-green-300 bg-green-50 p-4 text-center font-semibold text-green-700">
              Usuário vinculado com sucesso!
            </div>
          )}
        </form>
      </div>
    </main>
  );
}