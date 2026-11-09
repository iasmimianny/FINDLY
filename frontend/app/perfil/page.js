"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { User, Mail, Lock, Phone, GraduationCap, ArrowLeft, Settings, Pencil } from "lucide-react";

export default function Perfil() {
  const [nome, setNome] = useState("Nome do Usuário");
  const [email, setEmail] = useState("usuario@unifip.edu.br");
  const [senha, setSenha] = useState("••••••••••••");
  const [telefone, setTelefone] = useState("(83) 98888-8888");
  const [instituicao, setInstituicao] = useState("UNIFIP - Patos PB");

  const [salvo, setSalvo] = useState(false);

  function handleSubmit(e) {
    e.preventDefault();
    setSalvo(true);
    setTimeout(() => setSalvo(false), 3000);
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
            Perfil do Usuário<br />
          </h1>

          <div className="mt-3 h-1 w-40 bg-[#42a5df]" />

          <p className="mt-5 max-w-xl text-base text-gray-500">
            Gerencie e atualize suas informações cadastrais vinculadas ao Findly na UNIFIP.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl bg-[#f8f8f8] p-6 shadow-sm md:p-8">
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="rounded-2xl bg-[#d5d5d5] p-5">
              <label className="mb-3 flex items-center justify-between text-lg font-bold italic">
                <span className="flex items-center gap-3">
                  <User className="w-6 h-6 text-black shrink-0" />
                  Nome Completo:
                </span>
                <Pencil className="w-4 h-4 text-gray-600" />
              </label>

              <input
                type="text"
                required
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full rounded-xl bg-white px-4 py-3 outline-none text-base"
              />
            </div>

            <div className="rounded-2xl bg-[#d5d5d5] p-5">
              <label className="mb-3 flex items-center justify-between text-lg font-bold italic">
                <span className="flex items-center gap-3">
                  <Mail className="w-6 h-6 text-black shrink-0" />
                  E-mail:
                </span>
                <Pencil className="w-4 h-4 text-gray-600" />
              </label>

              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl bg-white px-4 py-3 outline-none text-base text-blue-600 underline font-medium"
              />
            </div>

            <div className="rounded-2xl bg-[#d5d5d5] p-5">
              <label className="mb-3 flex items-center justify-between text-lg font-bold italic">
                <span className="flex items-center gap-3">
                  <Lock className="w-6 h-6 text-black shrink-0" />
                  Senha:
                </span>
                <Pencil className="w-4 h-4 text-gray-600" />
              </label>

              <input
                type="password"
                required
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                className="w-full rounded-xl bg-white px-4 py-3 outline-none text-base"
              />
            </div>

            <div className="rounded-2xl bg-[#d5d5d5] p-5">
              <label className="mb-3 flex items-center justify-between text-lg font-bold italic">
                <span className="flex items-center gap-3">
                  <Phone className="w-6 h-6 text-black shrink-0" />
                  Número de telefone:
                </span>
                <Pencil className="w-4 h-4 text-gray-600" />
              </label>

              <input
                type="tel"
                required
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
                className="w-full rounded-xl bg-white px-4 py-3 outline-none text-base"
              />
            </div>

            <div className="rounded-2xl bg-[#d5d5d5] p-5 md:col-span-2">
              <label className="mb-3 flex items-center justify-between text-lg font-bold italic">
                <span className="flex items-center gap-3">
                  <GraduationCap className="w-6 h-6 text-black shrink-0" />
                  Instituição de ensino:
                </span>
                <Pencil className="w-4 h-4 text-gray-600" />
              </label>

              <input
                type="text"
                required
                value={instituicao}
                onChange={(e) => setInstituicao(e.target.value)}
                className="w-full rounded-xl bg-white px-4 py-3 outline-none text-base"
              />
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-2xl bg-black px-6 py-4 text-lg font-bold italic text-white transition hover:bg-gray-800"
          >
            Salvar Alterações
          </button>

          {salvo && (
            <div className="mt-4 rounded-2xl border border-green-300 bg-green-50 p-4 text-center font-semibold text-green-700">
              Perfil atualizado com sucesso!
            </div>
          )}
        </form>
      </div>
    </main>
  );
}