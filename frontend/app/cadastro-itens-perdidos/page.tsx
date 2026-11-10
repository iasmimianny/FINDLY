
"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import {
  Hash,
  Camera,
  QrCode,
  Tag,
  Calendar,
  MapPin,
  Upload,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import PrivateLayout from "../components/funcionario/PrivateLayout";

export default function CadastroItensPerdidos() {
  const [tipo, setTipo] = useState("perdido");
  const [foto, setFoto] = useState<string | null>(null);
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

  function selecionarFoto(event: ChangeEvent<HTMLInputElement>) {
    const arquivo = event.target.files?.[0];

    if (arquivo) {
      if (foto) URL.revokeObjectURL(foto);
      setFoto(URL.createObjectURL(arquivo));
    }
  }

  function cadastrarItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setCadastrado(true);
    setTimeout(() => setCadastrado(false), 4000);
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#42a5df] focus:ring-2 focus:ring-[#42a5df]/20";

  const cardClass =
    "rounded-2xl border border-gray-100 bg-white p-5 shadow-sm";

  return (
    <PrivateLayout>
      <div className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-10">

        {/* Cabeçalho da página */}
        <div className="mb-8">
          <span className="text-sm font-semibold text-[#42a5df]">
            MEUS REGISTROS
          </span>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            Cadastrar item
          </h1>

          <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-500">
            Preencha as informações para registrar um item perdido
            ou encontrado na UNIFIP.
          </p>
        </div>

        <form onSubmit={cadastrarItem}>

          {/* Tipo de ocorrência */}
          <section className={`${cardClass} mb-6`}>
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900">
                Tipo de ocorrência
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                O que aconteceu com o item?
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <button
                type="button"
                aria-pressed={tipo === "perdido"}
                onClick={() => setTipo("perdido")}
                className={`rounded-xl border px-5 py-4 text-sm font-semibold transition ${
                  tipo === "perdido"
                    ? "border-black bg-black text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
                }`}
              >
                Item perdido
              </button>

              <button
                type="button"
                aria-pressed={tipo === "encontrado"}
                onClick={() => setTipo("encontrado")}
                className={`rounded-xl border px-5 py-4 text-sm font-semibold transition ${
                  tipo === "encontrado"
                    ? "border-black bg-black text-white"
                    : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
                }`}
              >
                Item encontrado
              </button>
            </div>
          </section>

          {/* Informações do item */}
          <section className={`${cardClass} mb-6`}>
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-900">
                Informações do item
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Preencha os dados para identificar o objeto.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

              {/* ID */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Hash size={17} />
                  ID do item
                </label>

                <div className="flex gap-2">
                  <input
                    value={idItem}
                    readOnly
                    placeholder="Gere um ID para o item"
                    className={inputClass}
                  />

                  <button
                    type="button"
                    onClick={gerarId}
                    className="shrink-0 rounded-xl bg-black px-5 text-sm font-semibold text-white transition hover:bg-gray-800"
                  >
                    Gerar
                  </button>
                </div>
              </div>

              {/* Categoria */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Tag size={17} />
                  Categoria
                </label>

                <select
                  required
                  value={categoria}
                  onChange={(e) => setCategoria(e.target.value)}
                  className={inputClass}
                >
                  <option value="" disabled>
                    Selecione uma categoria
                  </option>
                  <option value="Eletrônicos">Eletrônicos</option>
                  <option value="Material escolar">Material escolar</option>
                  <option value="Documentos">Documentos</option>
                  <option value="Acessórios">Acessórios</option>
                  <option value="Roupas">Roupas</option>
                  <option value="Chaves">Chaves</option>
                  <option value="Outros">Outros</option>
                </select>
              </div>

              {/* Data */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Calendar size={17} />
                  Data e hora da ocorrência
                </label>

                <input
                  type="datetime-local"
                  required
                  value={data}
                  onChange={(e) => setData(e.target.value)}
                  className={inputClass}
                />
              </div>

              {/* Ponto de coleta */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <MapPin size={17} />
                  Ponto de coleta
                </label>

                <select
                  value={pontoColeta}
                  onChange={(e) => setPontoColeta(e.target.value)}
                  className={inputClass}
                >
                  <option value="">Selecione o ponto de coleta</option>
                  <option value="Secretaria">Secretaria</option>
                  <option value="Biblioteca">Biblioteca</option>
                </select>
              </div>

              {/* QR Code */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <QrCode size={17} />
                  QR-Code
                </label>

                <button
                  type="button"
                  onClick={gerarId}
                  className="flex w-full items-center justify-between rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-600 transition hover:border-gray-400"
                >
                  Gerar QR-Code
                  <QrCode size={18} />
                </button>
              </div>

              {/* Foto */}
              <div>
                <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                  <Camera size={17} />
                  Foto do item
                </label>

                <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 transition hover:border-[#42a5df]">
                  {foto ? (
                    <img
                      src={foto}
                      alt="Prévia do item"
                      className="h-10 w-10 rounded-lg object-cover"
                    />
                  ) : (
                    <Upload size={20} className="text-gray-500" />
                  )}

                  <span className="text-sm text-gray-600">
                    {foto ? "Foto selecionada" : "Selecionar imagem"}
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    onChange={selecionarFoto}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Descrição */}
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-semibold text-gray-700">
                  Descrição do item
                </label>

                <textarea
                  rows={4}
                  maxLength={500}
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descreva características, cor, marca ou outros detalhes que ajudem na identificação..."
                  className={`${inputClass} resize-none`}
                />

                <p className="mt-1 text-right text-xs text-gray-400">
                  {descricao.length}/500 caracteres
                </p>
              </div>
            </div>
          </section>

          {/* Privacidade */}
          <section className={`${cardClass} mb-6`}>
            <div className="flex items-start gap-3">
              <ShieldCheck size={22} className="shrink-0 text-[#59558a]" />

              <div>
                <h2 className="text-sm font-bold text-gray-900">
                  Privacidade garantida
                </h2>

                <p className="mt-1 text-sm leading-relaxed text-gray-500">
                  Seus dados serão utilizados apenas para auxiliar
                  na identificação e devolução do item.
                </p>
              </div>
            </div>
          </section>

          {/* Botão de cadastro */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-gray-500">
              Confira as informações antes de finalizar o cadastro.
            </p>

            <button
              type="submit"
              className="rounded-xl bg-black px-8 py-4 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              Cadastrar item
            </button>
          </div>

          {cadastrado && (
            <div className="mt-5 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-4 text-sm font-medium text-green-700">
              <CheckCircle2 size={20} />
              {tipo === "perdido"
                ? "Item perdido cadastrado com sucesso!"
                : "Item encontrado cadastrado com sucesso!"}
            </div>
          )}
        </form>
      </div>
    </PrivateLayout>
  );
}
