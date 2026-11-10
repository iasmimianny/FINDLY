
"use client";

import { useState, type ChangeEvent } from "react";
import Link from "next/link";
import {
  Package,
  Plus,
  Upload,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  X,
} from "lucide-react";
import PrivateLayout from "../components/funcionario/PrivateLayout";

type Item = {
  id: string;
  titulo: string;
  categoria: string;
  data: string;
  status: "Perdido" | "Encontrado";
  fotos: string[];
};

export default function MeusItens() {
  const [itens, setItens] = useState<Item[]>([
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

  const [itemSelecionado, setItemSelecionado] = useState<Item | null>(null);
  const [novasFotos, setNovasFotos] = useState<string[]>([]);

  function handleOpenUploadModal(item: Item) {
    setItemSelecionado(item);
    setNovasFotos([]);
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    const novasUrls = files.map((file) => URL.createObjectURL(file));

    setNovasFotos((prev) => [...prev, ...novasUrls]);

    e.target.value = "";
  }

  function handleRemoveFoto(index: number) {
    const fotoRemovida = novasFotos[index];

    URL.revokeObjectURL(fotoRemovida);

    setNovasFotos((prev) => prev.filter((_, i) => i !== index));
  }

  function handleCloseModal() {
    novasFotos.forEach((foto) => URL.revokeObjectURL(foto));
    setNovasFotos([]);
    setItemSelecionado(null);
  }

  function handleSaveFotos() {
    if (!itemSelecionado || novasFotos.length === 0) return;

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

    setNovasFotos([]);
    setItemSelecionado(null);
  }

  const cardClass =
    "rounded-2xl border border-gray-100 bg-white p-5 shadow-sm";

  return (
    <PrivateLayout>
      <main className="min-h-screen bg-white text-gray-900 font-sans">
        <div className="mx-auto max-w-6xl px-5 py-8 md:px-10 md:py-10">

          {/* Cabeçalho */}
          <div className="mb-8">
            <p className="mb-2 text-xs font-bold uppercase tracking-widest text-[#42a5df]">
              MEUS REGISTROS
            </p>

            <h1 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Meus itens cadastrados
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-relaxed text-gray-500">
              Acompanhe seus itens perdidos ou encontrados e adicione novas
              fotos para facilitar a identificação dos objetos.
            </p>
          </div>

          {/* Botão de cadastro */}
          <div className="mb-6 flex justify-end">
            <Link
              href="/cadastrar-item"
              className="flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              <Plus className="h-4 w-4" />
              Cadastrar novo item
            </Link>
          </div>

          {/* Listagem dos itens */}
          <div className={cardClass}>
            <div className="mb-5">
              <h2 className="text-lg font-bold text-gray-900">
                Itens registrados
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                Visualize seus registros e gerencie as fotos dos itens.
              </p>
            </div>

            {itens.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {itens.map((item) => (
                  <div
                    key={item.id}
                    className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-white">
                        <Package className="h-7 w-7 text-gray-700" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="font-semibold text-gray-900">
                          {item.titulo}
                        </h3>

                        <p className="mt-1 text-xs text-gray-500">
                          Categoria: {item.categoria}
                        </p>

                        <p className="text-xs text-gray-500">
                          Data: {item.data}
                        </p>

                        <div className="mt-2 flex flex-wrap items-center gap-3">
                          <span
                            className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1 text-xs font-semibold ${
                              item.status === "Perdido"
                                ? "bg-red-50 text-red-700"
                                : "bg-green-50 text-green-700"
                            }`}
                          >
                            {item.status === "Perdido" ? (
                              <Clock className="h-3.5 w-3.5" />
                            ) : (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            )}

                            {item.status}
                          </span>

                          <span className="text-xs text-gray-500">
                            {item.fotos.length}{" "}
                            {item.fotos.length === 1 ? "foto" : "fotos"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleOpenUploadModal(item)}
                      className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-800 transition hover:border-[#42a5df] hover:text-[#42a5df]"
                    >
                      <Upload className="h-4 w-4" />
                      Adicionar fotos
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-10 text-center">
                <Package className="mx-auto mb-3 h-10 w-10 text-gray-300" />

                <p className="font-semibold text-gray-700">
                  Nenhum item cadastrado
                </p>

                <p className="mt-1 text-sm text-gray-500">
                  Seus itens registrados aparecerão aqui.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal de upload */}
        {itemSelecionado && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="w-full max-w-lg rounded-2xl border border-gray-100 bg-white p-6 shadow-xl">

              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-[#42a5df]">
                    GERENCIAR FOTOS
                  </p>

                  <h2 className="mt-1 text-xl font-bold text-gray-900">
                    Adicionar fotos
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-lg p-2 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <p className="mb-5 text-sm text-gray-500">
                Selecione imagens para adicionar ao item{" "}
                <span className="font-semibold text-gray-800">
                  {itemSelecionado.titulo}
                </span>.
              </p>

              {/* Área de seleção */}
              <label className="mb-5 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-300 p-8 text-center transition hover:border-[#42a5df] hover:bg-gray-50">
                <ImageIcon className="mb-3 h-9 w-9 text-gray-400" />

                <span className="text-sm font-semibold text-gray-800">
                  Clique para selecionar imagens
                </span>

                <span className="mt-1 text-xs text-gray-400">
                  Formatos PNG, JPG ou JPEG
                </span>

                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>

              {/* Fotos selecionadas */}
              {novasFotos.length > 0 && (
                <div className="mb-5">
                  <p className="mb-3 text-sm font-semibold text-gray-800">
                    Novas fotos selecionadas ({novasFotos.length})
                  </p>

                  <div className="flex flex-wrap gap-3">
                    {novasFotos.map((src, index) => (
                      <div
                        key={src}
                        className="relative h-20 w-20 overflow-hidden rounded-xl border border-gray-200"
                      >
                        <img
                          src={src}
                          alt={`Foto selecionada ${index + 1}`}
                          className="h-full w-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() => handleRemoveFoto(index)}
                          className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white transition hover:bg-black"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Botões */}
              <div className="flex justify-end gap-3 border-t border-gray-100 pt-5">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="rounded-xl px-5 py-3 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={handleSaveFotos}
                  disabled={novasFotos.length === 0}
                  className="flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <CheckCircle2 className="h-4 w-4" />
                  Salvar fotos
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </PrivateLayout>
  );
}
