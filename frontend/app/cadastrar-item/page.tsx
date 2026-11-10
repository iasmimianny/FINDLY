
"use client";

import { useState, type ChangeEvent, type FormEvent } from "react";
import Image from "next/image";
import {
  Package,
  Tag,
  MapPin,
  Calendar,
  Camera,
  CheckCircle2,
  X,
  Upload,
} from "lucide-react";
import PrivateLayout from "../components/funcionario/PrivateLayout";

type FotoItem = {
  file: File;
  previewUrl: string;
};

export default function CadastrarItem() {
  const [tipo, setTipo] = useState("perdido");
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [local, setLocal] = useState("");
  const [data, setData] = useState("");
  const [descricao, setDescricao] = useState("");
  const [fotos, setFotos] = useState<FotoItem[]>([]);
  const [cadastrado, setCadastrado] = useState(false);

  const maxFotos = 6;

  const hoje = new Date();
  const dataHoje = [
    hoje.getFullYear(),
    String(hoje.getMonth() + 1).padStart(2, "0"),
    String(hoje.getDate()).padStart(2, "0"),
  ].join("-");

  function handleFotoChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) return;

    const vagas = maxFotos - fotos.length;

    if (vagas <= 0) {
      e.target.value = "";
      return;
    }

    const arquivosSelecionados = files.slice(0, vagas);

    const novasFotos = arquivosSelecionados.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setFotos((prev) => [...prev, ...novasFotos]);
    e.target.value = "";
  }

  function handleRemoveFoto(index: number) {
    setFotos((prev) => {
      const foto = prev[index];

      if (foto?.previewUrl) {
        URL.revokeObjectURL(foto.previewUrl);
      }

      return prev.filter((_, i) => i !== index);
    });
  }

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!data || data > dataHoje) {
      return;
    }

    setCadastrado(true);

    fotos.forEach((foto) => {
      URL.revokeObjectURL(foto.previewUrl);
    });

    setTitulo("");
    setCategoria("");
    setLocal("");
    setData("");
    setDescricao("");
    setFotos([]);

    setTimeout(() => setCadastrado(false), 4000);
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#42a5df] focus:ring-2 focus:ring-[#42a5df]/20";

  const cardClass =
    "rounded-2xl border border-gray-100 bg-white p-5 shadow-sm";

  return (
    <PrivateLayout>
      <main className="min-h-screen bg-white text-gray-900 font-sans">
        <div className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-10">

          {/* Cabeçalho da página */}
          <div className="mb-8">
            <span className="mb-2 text-xs font-bold uppercase tracking-widest text-[#42a5df]">
              MEUS REGISTROS
            </span>

            <h1 className="mt-2 text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Cadastrar item
            </h1>

            <p className="mt-2 max-w-xl text-sm leading-relaxed text-gray-500">
              Informe os detalhes do objeto perdido ou encontrado no campus
              da UNIFIP para ajudar a conectar pessoas e objetos.
            </p>
          </div>

          <form onSubmit={handleSubmit}>

            {/* Tipo de registro */}
            <section className={`${cardClass} mb-6`}>
              <div className="mb-4">
                <h2 className="text-lg font-bold text-gray-900">
                  Tipo de registro
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  O que aconteceu com o objeto?
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
                  Perdi um item
                </button>

                <button
                  type="button"
                  aria-pressed={tipo === "achado"}
                  onClick={() => setTipo("achado")}
                  className={`rounded-xl border px-5 py-4 text-sm font-semibold transition ${
                    tipo === "achado"
                      ? "border-black bg-black text-white"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
                  }`}
                >
                  Encontrei um item
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

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Package size={17} />
                    Nome do item
                  </label>

                  <input
                    type="text"
                    required
                    maxLength={80}
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ex.: Garrafa térmica azul"
                    className={inputClass}
                  />
                </div>

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
                    <option value="Documentos">Documentos</option>
                    <option value="Acessórios">Acessórios</option>
                    <option value="Roupas">Roupas</option>
                    <option value="Chaves">Chaves</option>
                    <option value="Outros">Outros</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <MapPin size={17} />
                    Local no campus
                  </label>

                  <input
                    type="text"
                    required
                    maxLength={120}
                    value={local}
                    onChange={(e) => setLocal(e.target.value)}
                    placeholder="Ex.: Bloco B, Biblioteca..."
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Calendar size={17} />
                    Data da ocorrência
                  </label>

                  <input
                    type="date"
                    required
                    max={dataHoje}
                    value={data}
                    onChange={(e) => setData(e.target.value)}
                    className={inputClass}
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-semibold text-gray-700">
                    Descrição detalhada
                  </label>

                  <textarea
                    rows={4}
                    maxLength={500}
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Informe características como cor, marca, estado de conservação e outros detalhes..."
                    className={`${inputClass} resize-none`}
                  />

                  <p className="mt-1 text-right text-xs text-gray-400">
                    {descricao.length}/500 caracteres
                  </p>
                </div>
              </div>
            </section>

            {/* Fotos */}
            <section className={`${cardClass} mb-6`}>
              <div className="mb-5">
                <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
                  <Camera size={20} />
                  Fotos do item
                </h2>

                <p className="mt-1 text-sm text-gray-500">
                  Adicione imagens que ajudem na identificação do objeto.
                </p>
              </div>

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 px-5 py-8 text-center transition hover:border-[#42a5df] hover:bg-blue-50/40">
                <Upload size={28} className="mb-3 text-gray-500" />

                <span className="text-sm font-semibold text-gray-700">
                  Clique para selecionar fotos
                </span>

                <span className="mt-1 text-xs text-gray-400">
                  Imagens • Máximo de 6 fotos
                </span>

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFotoChange}
                  disabled={fotos.length >= maxFotos}
                  className="hidden"
                />
              </label>

              <div className="mt-3 flex items-center justify-between text-xs text-gray-500">
                <span>Você pode adicionar até {maxFotos} imagens.</span>
                <span>{fotos.length}/{maxFotos} selecionadas</span>
              </div>

              {fotos.length > 0 && (
                <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
                  {fotos.map((item, idx) => (
                    <div key={item.previewUrl} className="relative">
                      <Image
                        src={item.previewUrl}
                        alt={`Foto ${idx + 1}`}
                        width={160}
                        height={160}
                        unoptimized
                        className="h-28 w-full rounded-xl object-cover"
                      />

                      <button
                        type="button"
                        onClick={() => handleRemoveFoto(idx)}
                        title="Remover foto"
                        className="absolute -right-2 -top-2 rounded-full bg-black p-1.5 text-white shadow transition hover:bg-red-600"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Confirmação */}
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
      </main>
    </PrivateLayout>
  );
}
