"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, type ChangeEvent } from "react";
import { Package, Tag, MapPin, Calendar, Camera, ArrowLeft, Settings, CheckCircle2, X } from "lucide-react";

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

  function handleFotoChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = maxFotos - fotos.length;
    if (remainingSlots <= 0) {
      e.target.value = "";
      return;
    }

    const filesToAdd = files.slice(0, remainingSlots);
    const newPhotoObjects = filesToAdd.map((file) => ({
      file,
      previewUrl: URL.createObjectURL(file),
    }));

    setFotos((prev) => [...prev, ...newPhotoObjects]);
    e.target.value = "";
  }

  function handleRemoveFoto(indexToRemove) {
    setFotos((prev) => {
      const itemToRemove = prev[indexToRemove];
      if (itemToRemove?.previewUrl) {
        URL.revokeObjectURL(itemToRemove.previewUrl);
      }
      return prev.filter((_, idx) => idx !== indexToRemove);
    });
  }

  function handleSubmit(e) {
    e.preventDefault();

    if (!data) {
      return;
    }

    const dataOcorrencia = new Date(data);
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    if (dataOcorrencia > hoje) {
      return;
    }

    setCadastrado(true);

    fotos.forEach((foto) => {
      if (foto.previewUrl) URL.revokeObjectURL(foto.previewUrl);
    });

    setTitulo("");
    setCategoria("");
    setLocal("");
    setData("");
    setDescricao("");
    setFotos([]);

    setTimeout(() => setCadastrado(false), 4000);
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
            href="/configuracao"
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
            Cadastrar Item<br />
          </h1>

          <div className="mt-3 h-1 w-40 bg-[#42a5df]" />

          <p className="mt-5 max-w-xl text-base text-gray-500">
            Cadastre as informações do objeto perdido ou encontrado no campus da UNIFIP.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl bg-[#f8f8f8] p-6 shadow-sm md:p-8">
          <div className="mb-8">
            <label className="mb-3 block text-lg font-bold italic">
              Tipo de Registro
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                aria-pressed={tipo === "perdido"}
                onClick={() => setTipo("perdido")}
                className={`rounded-xl px-6 py-3 font-bold italic transition ${tipo === "perdido"
                    ? "bg-black text-white"
                    : "bg-[#d5d5d5] text-black hover:bg-gray-300"
                  }`}
              >
                Perdi um Item
              </button>
              <button
                type="button"
                aria-pressed={tipo === "achado"}
                onClick={() => setTipo("achado")}
                className={`rounded-xl px-6 py-3 font-bold italic transition ${tipo === "achado"
                    ? "bg-black text-white"
                    : "bg-[#d5d5d5] text-black hover:bg-gray-300"
                  }`}
              >
                Encontrei um Item
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <div className="rounded-2xl bg-[#d5d5d5] p-5">
              <label className="mb-3 flex items-center gap-3 text-lg font-bold italic">
                <Package className="w-6 h-6 text-black shrink-0" />
                Título / Nome do Item:
              </label>
              <input
                type="text"
                required
                maxLength={80}
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ex: Garrafa Térmica Azul"
                className="w-full rounded-xl bg-white px-4 py-3 outline-none text-base"
              />
            </div>

            <div className="rounded-2xl bg-[#d5d5d5] p-5">
              <label className="mb-3 flex items-center gap-3 text-lg font-bold italic">
                <Tag className="w-6 h-6 text-black shrink-0" />
                Categoria:
              </label>
              <select
                required
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full rounded-xl bg-white px-4 py-3 outline-none text-base"
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

            <div className="rounded-2xl bg-[#d5d5d5] p-5">
              <label className="mb-3 flex items-center gap-3 text-lg font-bold italic">
                <MapPin className="w-6 h-6 text-black shrink-0" />
                Local no Campus:
              </label>
              <input
                type="text"
                required
                maxLength={120}
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                placeholder="Ex: Bloco B, Biblioteca, Praça de Alimentação"
                className="w-full rounded-xl bg-white px-4 py-3 outline-none text-base"
              />
            </div>

            <div className="rounded-2xl bg-[#d5d5d5] p-5">
              <label className="mb-3 flex items-center gap-3 text-lg font-bold italic">
                <Calendar className="w-6 h-6 text-black shrink-0" />
                Data da Ocorrência:
              </label>
              <input
                type="date"
                required
                value={data}
                max={new Date().toISOString().split("T")[0]}
                onChange={(e) => setData(e.target.value)}
                className="w-full rounded-xl bg-white px-4 py-3 outline-none text-base text-black font-medium cursor-pointer"
              />
            </div>

            <div className="rounded-2xl bg-[#d5d5d5] p-5 md:col-span-2">
              <label className="mb-3 flex items-center gap-3 text-lg font-bold italic">
                Descrição Detalhada:
              </label>
              <textarea
                rows={3}
                maxLength={500}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Adicione detalhes como marcas de uso, cor exata, capas ou características marcantes..."
                className="w-full rounded-xl bg-white px-4 py-3 outline-none text-base resize-none"
              />
            </div>

            <div className="rounded-2xl bg-[#d5d5d5] p-5 md:col-span-2">
              <label className="mb-3 flex items-center gap-3 text-lg font-bold italic">
                <Camera className="w-6 h-6 text-black shrink-0" />
                Anexar Fotos:
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFotoChange}
                className="w-full rounded-xl bg-white px-4 py-3 outline-none text-base file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-bold file:italic file:bg-black file:text-white hover:file:bg-gray-800"
              />
              <p className="mt-2 text-sm text-gray-600">Máximo de {maxFotos} fotos por cadastro.</p>
              {fotos.length > 0 && (
                <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                  {fotos.map((item, idx) => (
                    <div key={idx} className="relative shrink-0">
                      <Image
                        src={item.previewUrl}
                        alt={`Preview ${idx + 1}`}
                        width={112}
                        height={112}
                        unoptimized
                        className="mt-2 h-28 w-28 rounded-2xl object-cover shadow-sm"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFoto(idx)}
                        className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1 shadow-md hover:bg-red-600 transition"
                        title="Remover foto"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-2xl bg-black px-6 py-4 text-lg font-bold italic text-white transition hover:bg-gray-800"
          >
            Cadastrar Item
          </button>

          {cadastrado && (
            <div className="mt-4 rounded-2xl border border-green-300 bg-green-50 p-4 text-center font-semibold text-green-700 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              {tipo === "perdido" ? "Item perdido cadastrado com sucesso!" : "Item encontrado cadastrado com sucesso!"}
            </div>
          )}
        </form>
      </div>
    </main>
  );
}