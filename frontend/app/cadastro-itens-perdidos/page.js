"use client";

import Image from "next/image";
import { useState } from "react";

export default function CadastroItensPeridos() {
  const [tipo, setTipo] = useState("perdido");
  const [foto, setFoto] = useState(null);
  const [categoria, setCategoria] = useState("");
  const [data, setData] = useState("");
  const [pontoColeta, setPontoColeta] = useState("");
  const [descricao, setDescricao] = useState("");
  const [idItem, setIdItem] = useState("");
  const [cadastrado, setCadastrado] = useState(false);

  function gerarId() {
    const numero = Math.floor(1000 + Math.random() * 9000);
    setIdItem(`FDLY-2026-${numero}`);
  }

  function selecionarFoto(event) {
    const arquivo = event.target.files[0];

    if (arquivo) {
      setFoto(URL.createObjectURL(arquivo));
    }
  }

  function cadastrarItem() {
    setCadastrado(true);
  }

  return (
    <main className="min-h-screen bg-white text-black">

      {/* CABEÇALHO */}
<header className="flex h-[74px] items-center justify-between bg-black px-8 text-white">

  <div className="flex items-center gap-4">
    <Image
      src="/logo-findly.jpg"
      alt="Findly"
      width={48}
      height={48}
      className="rounded-full"
    />

    <span className="text-lg font-medium tracking-wide">
      FINDLY
    </span>
  </div>

  <div className="flex items-center gap-6">

    <button
      className="flex items-center gap-2 font-bold italic hover:opacity-70"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M19 12H5" />
        <path d="M12 19l-7-7 7-7" />
      </svg>

      Voltar
    </button>

    {/* CONFIGURAÇÕES */}
    <button
      className="flex items-center justify-center hover:opacity-70"
      aria-label="Configurações"
    >
      <svg
        width="28"
        height="28"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 2.5a2 2 0 0 1 2 2v.2a7.5 7.5 0 0 1 1.7.7l.15-.15a2 2 0 1 1 2.83 2.83l-.15.15a7.5 7.5 0 0 1 .7 1.7h.2a2 2 0 1 1 0 4h-.2a7.5 7.5 0 0 1-.7 1.7l.15.15a2 2 0 1 1-2.83 2.83l-.15-.15a7.5 7.5 0 0 1-1.7.7v.2a2 2 0 1 1-4 0v-.2a7.5 7.5 0 0 1-1.7-.7l-.15.15a2 2 0 1 1-2.83-2.83l.15-.15a7.5 7.5 0 0 1-.7-1.7h-.2a2 2 0 1 1 0-4h.2a7.5 7.5 0 0 1 .7-1.7l-.15-.15a2 2 0 1 1 2.83-2.83l.15.15a7.5 7.5 0 0 1 1.7-.7v-.2a2 2 0 0 1 2-2Z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    </button>

  </div>
</header>


      {/* CONTEÚDO */}
      <div className="mx-auto max-w-6xl px-6 py-10">

        {/* TOPO */}
        <div className="mb-9">

          <button className="mb-6 flex items-center gap-2 text-lg font-bold italic text-[#59558a] hover:underline">
            Ver seus itens

            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m9 18 6-6-6-6" />
            </svg>
          </button>

          <h1 className="text-5xl font-black italic leading-tight">
            Cadastre o item
            <br />
            {tipo === "perdido" ? "perdido:" : "encontrado:"}
          </h1>

          <div className="mt-3 h-1 w-40 bg-[#42a5df]" />

          <p className="mt-5 max-w-xl text-base text-gray-500">
            Preencha as informações abaixo para registrar
            um item perdido ou encontrado na UNIFIP.
          </p>

        </div>


        {/* FORMULÁRIO */}
        <section className="rounded-3xl bg-[#f8f8f8] p-6 shadow-sm md:p-8">

          {/* TIPO */}
          <div className="mb-8">

            <label className="mb-3 block text-lg font-bold italic">
              Tipo de ocorrência
            </label>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">

              <button
                onClick={() => setTipo("perdido")}
                className={`rounded-xl border px-5 py-4 text-left font-bold italic transition ${
                  tipo === "perdido"
                    ? "border-black bg-[#d5d5d5]"
                    : "border-gray-200 bg-white text-gray-500 hover:bg-gray-100"
                }`}
              >
                Item perdido
              </button>

              <button
                onClick={() => setTipo("encontrado")}
                className={`rounded-xl border px-5 py-4 text-left font-bold italic transition ${
                  tipo === "encontrado"
                    ? "border-black bg-[#d5d5d5]"
                    : "border-gray-200 bg-white text-gray-500 hover:bg-gray-100"
                }`}
              >
                Item encontrado
              </button>

            </div>
          </div>


          {/* PRIMEIRA LINHA */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            {/* ID */}
            <div className="rounded-2xl bg-[#d5d5d5] p-5">

              <label className="mb-3 flex items-center gap-3 text-lg font-bold italic">
                <svg
                  width="23"
                  height="23"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>

                ID do item:
              </label>

              <div className="flex gap-2">

                <input
                  value={idItem}
                  readOnly
                  placeholder="ID do item"
                  className="min-w-0 flex-1 rounded-xl bg-white px-4 py-3 outline-none"
                />

                <button
                  onClick={gerarId}
                  className="rounded-xl bg-black px-4 font-bold text-white transition hover:opacity-80"
                >
                  Gerar
                </button>

              </div>

            </div>


            {/* FOTOS */}
            <div className="rounded-2xl bg-[#d5d5d5] p-5">

              <label className="mb-3 flex items-center gap-3 text-lg font-bold italic">

                <svg
                  width="23"
                  height="23"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 16V4" />
                  <path d="m7 9 5-5 5 5" />
                  <path d="M5 20h14" />
                </svg>

                Fotos do item:
              </label>

              <label className="flex cursor-pointer items-center gap-4 rounded-xl bg-white p-4 hover:bg-gray-100">

                {foto ? (
                  <img
                    src={foto}
                    alt="Prévia do item"
                    className="h-16 w-16 rounded-lg object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-gray-200">
                    <svg
                      width="25"
                      height="25"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="3" width="18" height="18" rx="2" />
                      <circle cx="8.5" cy="8.5" r="1.5" />
                      <path d="m21 15-5-5L5 21" />
                    </svg>
                  </div>
                )}

                <div>
                  <p className="font-bold">
                    {foto ? "Foto selecionada" : "Adicionar foto"}
                  </p>

                  <p className="text-sm text-gray-500">
                    Clique para selecionar uma imagem
                  </p>
                </div>

                <input
                  type="file"
                  accept="image/*"
                  onChange={selecionarFoto}
                  className="hidden"
                />

              </label>

            </div>


            {/* QR CODE */}
            <div className="rounded-2xl bg-[#d5d5d5] p-5">

              <label className="mb-3 flex items-center gap-3 text-lg font-bold italic">

                <svg
                  width="23"
                  height="23"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="3" width="6" height="6" />
                  <rect x="15" y="3" width="6" height="6" />
                  <rect x="3" y="15" width="6" height="6" />
                  <path d="M15 15h3v3h-3zM18 18h3v3h-3zM15 18v3" />
                </svg>

                QR-Code:
              </label>

              <button
                onClick={gerarId}
                className="w-full rounded-xl bg-white px-4 py-4 font-bold transition hover:bg-gray-100"
              >
                Gerar QR-Code
              </button>

            </div>


            {/* CATEGORIA */}
            <div className="rounded-2xl bg-[#d5d5d5] p-5">

              <label className="mb-3 flex items-center gap-3 text-lg font-bold italic">

                <svg
                  width="23"
                  height="23"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="4" y="4" width="6" height="6" rx="1" />
                  <rect x="14" y="4" width="6" height="6" rx="1" />
                  <rect x="4" y="14" width="6" height="6" rx="1" />
                  <rect x="14" y="14" width="6" height="6" rx="1" />
                </svg>

                Categoria:
              </label>

              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full rounded-xl bg-white px-4 py-4 outline-none"
              >
                <option value="">
                  Selecione uma categoria
                </option>
                <option value="eletronico">Eletrônico</option>
                <option value="material">Material escolar</option>
                <option value="documento">Documento</option>
                <option value="acessorio">Acessório</option>
                <option value="roupa">Roupa</option>
                <option value="outro">Outro</option>
              </select>

            </div>

          </div>


          {/* DESCRIÇÃO */}
          <div className="mt-5 rounded-2xl bg-[#d5d5d5] p-5">

            <label className="mb-3 block text-lg font-bold italic">
              Descrição do item:
            </label>

            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Descreva características, cor, marca ou outros detalhes..."
              className="min-h-28 w-full resize-none rounded-xl bg-white p-4 outline-none focus:ring-2 focus:ring-[#42a5df]"
            />

          </div>


          {/* DATA E PONTO DE COLETA */}
          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">

            <div className="rounded-2xl bg-[#d5d5d5] p-5">

              <label className="mb-3 flex items-center gap-3 text-lg font-bold italic">

                <svg
                  width="23"
                  height="23"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="5" width="18" height="16" rx="2" />
                  <path d="M16 3v4M8 3v4M3 10h18" />
                </svg>

                Data/Hora:
              </label>

              <input
                type="datetime-local"
                value={data}
                onChange={(e) => setData(e.target.value)}
                className="w-full rounded-xl bg-white px-4 py-4 outline-none"
              />

            </div>


            <div className="rounded-2xl bg-[#d5d5d5] p-5">

              <label className="mb-3 flex items-center gap-3 text-lg font-bold italic">

                <svg
                  width="23"
                  height="23"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z" />
                  <circle cx="12" cy="9" r="2.5" />
                </svg>

                Ponto de Coleta deixado:
              </label>

              <select
                value={pontoColeta}
                onChange={(e) => setPontoColeta(e.target.value)}
                className="w-full rounded-xl bg-white px-4 py-4 outline-none"
              >
                <option value="">
                  Selecione o ponto de coleta
                </option>
                <option value="secretaria">Secretaria</option>
                <option value="biblioteca">Biblioteca</option>
              </select>

            </div>

          </div>


          {/* PRIVACIDADE */}
          <div className="mt-6 rounded-2xl border border-[#59558a]/20 bg-[#59558a]/10 p-5">

            <p className="font-bold text-[#59558a]">
              Privacidade garantida
            </p>

            <p className="mt-1 text-sm text-gray-600">
              Seus dados serão utilizados apenas para auxiliar
              na identificação e devolução do item.
            </p>

          </div>


          {/* BOTÃO */}
          <button
            onClick={cadastrarItem}
            className="mt-6 w-full rounded-2xl bg-black px-6 py-4 text-lg font-bold italic text-white transition hover:bg-gray-800"
          >
            Cadastrar item {tipo}
          </button>


          {cadastrado && (
            <div className="mt-4 rounded-2xl border border-green-300 bg-green-50 p-4 text-center font-semibold text-green-700">
              Item cadastrado com sucesso!
            </div>
          )}

        </section>

      </div>

    </main>
  );
}