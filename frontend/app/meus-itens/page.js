"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import {
  Package,
  Plus,
  Upload,
  CheckCircle2,
  Clock,
  ArrowLeft,
  Settings,
  Image as ImageIcon,
  X,
} from "lucide-react";

export default function MeusItens() {
  const [itens, setItens] = useState([
    {
      id: "1",
      titulo: "Carteira de Couro Preta",
      categoria: "Acessórios",
      data: "10/10/2026",
      status: "Perdido",
      fotos: ["/logo-findly.jpg"],
    },
    {
      id: "2",
      titulo: "Capacete de Moto",
      categoria: "Veículos / Acessórios",
      data: "12/10/2026",
      status: "Encontrado",
      fotos: ["/logo-findly.jpg"],
    },
  ]);

  const [itemSelecionado, setItemSelecionado] = useState(null);
  const [novasFotos, setNovasFotos] = useState([]);

  function handleOpenUploadModal(item) {
    setItemSelecionado(item);
    setNovasFotos([]);
  }

  function handleFileChange(e) {
    const files = Array.from(e.target.files);
    const mockUrls = files.map((file) => URL.createObjectURL(file));
    setNovasFotos((prev) => [...prev, ...mockUrls]);
  }

  function handleRemoveFoto(index) {
    setNovasFotos((prev) => prev.filter((_, i) => i !== index));
  }

  function handleSaveFotos() {
    if (!itemSelecionado) return;

    setItens((prevItens) =>
      prevItens.map((item) => {
        if (item.id === itemSelecionado.id) {
          return {
            ...item,
            fotos: [...item.fotos, ...novasFotos],
          };
        }
        return item;
      })
    );

    setItemSelecionado(null);
    setNovasFotos([]);
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
        <div className="mb-9 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-5xl font-black italic leading-tight">
              Meus Itens Cadastrados
            </h1>
            <div className="mt-3 h-1 w-40 bg-[#42a5df]" />
            <p className="mt-5 max-w-xl text-base text-gray-500">
              Gerencie os seus pertences perdidos ou achados e adicione
              múltiplas fotos para facilitar a identificação.
            </p>
          </div>

          <Link
            href="/cadastrar-item"
            className="flex items-center gap-2 rounded-2xl bg-black px-6 py-4 font-bold italic text-white hover:bg-gray-800 transition"
          >
            <Plus className="w-5 h-5" /> Cadastrar Novo Item
          </Link>
        </div>

        <div className="rounded-3xl bg-[#f8f8f8] p-6 shadow-sm md:p-8">
          <div className="grid grid-cols-1 gap-6">
            {itens.map((item) => (
              <div
                key={item.id}
                className="rounded-2xl bg-[#d5d5d5] p-5 flex flex-wrap items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="rounded-xl bg-white p-3 shrink-0">
                    <Package className="w-8 h-8 text-black" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold italic">{item.titulo}</h3>
                    <p className="text-sm text-gray-600">
                      Categoria: {item.categoria} | Data: {item.data}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-bold italic ${
                          item.status === "Perdido"
                            ? "bg-red-100 text-red-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {item.status === "Perdido" ? (
                          <Clock className="w-3.5 h-3.5" />
                        ) : (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        )}
                        Status: {item.status}
                      </span>

                      <span className="text-xs font-bold italic text-gray-600">
                        {item.fotos.length}{" "}
                        {item.fotos.length === 1 ? "foto" : "fotos"}
                      </span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenUploadModal(item)}
                  className="flex items-center gap-2 rounded-xl bg-white px-4 py-3 font-bold italic text-black border border-gray-300 hover:bg-gray-50 transition"
                >
                  <Upload className="w-4 h-4" /> Upload de Múltiplas Fotos
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {itemSelecionado && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-lg w-full">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-black italic">
                Upload de Fotos: {itemSelecionado.titulo}
              </h2>
              <button
                type="button"
                onClick={() => setItemSelecionado(null)}
                className="p-1 hover:opacity-70 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <p className="text-sm text-gray-500 mb-6">
              Selecione uma ou mais fotos do seu dispositivo para anexar a este
              item.
            </p>

            <label className="border-2 border-dashed border-gray-400 rounded-2xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition mb-6">
              <ImageIcon className="w-10 h-10 text-gray-400 mb-2" />
              <span className="font-bold italic text-sm text-black">
                Clique para selecionar imagens
              </span>
              <span className="text-xs text-gray-400 mt-1">
                Suporta PNG, JPG ou JPEG
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>

            {novasFotos.length > 0 && (
              <div className="mb-6">
                <p className="font-bold italic text-xs mb-2">
                  Novas fotos selecionadas ({novasFotos.length}):
                </p>
                <div className="flex items-center gap-3 overflow-x-auto pb-2">
                  {novasFotos.map((src, index) => (
                    <div
                      key={index}
                      className="relative shrink-0 w-20 h-20 rounded-xl overflow-hidden border border-gray-300"
                    >
                      <img
                        src={src}
                        alt="Preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFoto(index)}
                        className="absolute top-1 right-1 bg-black/70 text-white rounded-full p-0.5 hover:bg-black"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setItemSelecionado(null)}
                className="px-5 py-3 rounded-xl font-bold italic text-gray-600 hover:bg-gray-100 transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveFotos}
                className="px-6 py-3 rounded-xl bg-black text-white font-bold italic hover:bg-gray-800 transition"
              >
                Salvar Fotos
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}