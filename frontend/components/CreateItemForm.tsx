
"use client";

import { useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import ItemPhotos from "./ItemPhotos";
import OccurrenceDatePicker from "./OccurrenceDatePicker";
import { categories, occurrenceDate, readItemResponse, ItemApiError, type Item, type ItemKind } from "../lib/items";
import {
  Package,
  Tag,
  MapPin,
  Camera,
  CheckCircle2,
} from "lucide-react";


export default function CreateItemForm({ onBusy, onCreated }: { onBusy: (busy: boolean) => void; onCreated: () => void }) {
  const [tipo, setTipo] = useState<ItemKind>("lost");
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [local, setLocal] = useState("");
  const [data, setData] = useState("");
  const [descricao, setDescricao] = useState("");
  const [saved, setSaved] = useState<Item | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [expired, setExpired] = useState(false);
  const [uncertain, setUncertain] = useState(false);
  const lock = useRef(false);

  const hoje = new Date();
  const dataHoje = [
    hoje.getFullYear(),
    String(hoje.getMonth() + 1).padStart(2, "0"),
    String(hoje.getDate()).padStart(2, "0"),
  ].join("-");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current || uncertain) return;
    if (!data || data > dataHoje) { setError("Informe uma data até hoje."); return; }
    if (!titulo.trim() || !local.trim() || !descricao.trim()) { setError("Preencha nome, local e descrição."); return; }
    lock.current = true;
    setPending(true);
    onBusy(true);
    setError("");
    setExpired(false);
    try {
      const date = occurrenceDate(data);
      const payload = {
        title: titulo.trim(), description: descricao.trim(), category: categoria,
        ...(tipo === "found" ? { found_at: date, found_location: local.trim() } : { lost_at: date, lost_location: local.trim() }),
      };
      const result = await readItemResponse<Item>(await fetch(`/api/items/${tipo}/`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        credentials: "same-origin", cache: "no-store", body: JSON.stringify(payload),
      }));
      if (!result?.public_code) throw new Error("Não foi possível confirmar o código do registro.");
      setSaved(result);
      onCreated();
    } catch (reason) {
      const unknown = !(reason instanceof ItemApiError) || reason.status >= 500;
      setUncertain(unknown);
      setExpired(reason instanceof ItemApiError && reason.status === 401);
      setError(unknown ? "Não conseguimos confirmar se o cadastro foi salvo. Confira Meus itens antes de tentar novamente para evitar duplicação." : reason.message);
    } finally {
      lock.current = false;
      setPending(false);
      onBusy(false);
    }
  }

  const inputClass =
    "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm text-gray-800 outline-none transition placeholder:text-gray-400 focus:border-[#42a5df] focus:ring-2 focus:ring-[#42a5df]/20";

  const cardClass =
    "rounded-2xl border border-gray-100 bg-white p-5 shadow-sm";

  if (saved) return <><div className="bg-white py-2 text-gray-900"><section className="mx-auto max-w-3xl rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
    <CheckCircle2 size={36} className="mb-4 text-green-700" aria-hidden="true" />
    <h1 className="text-2xl font-bold">Registro salvo!</h1>
    <p role="status" className="mt-3 text-gray-700">{saved.title} foi cadastrado. Código: <strong className="font-mono">{saved.public_code}</strong>.</p>
    {tipo === "found" && <ItemPhotos code={saved.public_code} canUpload />}
    <div className="mt-6 flex flex-wrap gap-3">
      <Link href={`/meus-itens?tipo=${tipo}&busca=${saved.public_code}`} className="rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white">Ver em Meus itens</Link>
      <Link href={`/itens-perdidos?tipo=${tipo}&busca=${saved.public_code}`} className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold">Encontrar na busca</Link>
      <button type="button" className="rounded-xl border border-gray-300 px-5 py-3 text-sm font-semibold" onClick={() => { setSaved(null); setTitulo(""); setCategoria(""); setLocal(""); setData(""); setDescricao(""); }}>Cadastrar outro</button>
    </div>
  </section></div></>;

  return (
    <>
      <main className="bg-white text-gray-900 font-sans">
        <div className="mx-auto max-w-6xl py-2">

          <p className="mb-5 text-sm text-gray-600">Informe os detalhes do objeto perdido ou encontrado no campus.</p>

          <form onSubmit={handleSubmit}>
            <fieldset disabled={pending} className="min-w-0">

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
                  aria-pressed={tipo === "lost"}
                  onClick={() => setTipo("lost")}
                  className={`rounded-xl border px-5 py-4 text-sm font-semibold transition ${
                    tipo === "lost"
                      ? "border-black bg-black text-white"
                      : "border-gray-200 bg-white text-gray-600 hover:border-gray-400"
                  }`}
                >
                  Perdi um item
                </button>

                <button
                  type="button"
                  aria-pressed={tipo === "found"}
                  onClick={() => setTipo("found")}
                  className={`rounded-xl border px-5 py-4 text-sm font-semibold transition ${
                    tipo === "found"
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
                  <label htmlFor="item-title" className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Package size={17} />
                    Nome do item
                  </label>

                  <input
                    id="item-title"
                    type="text"
                    required
                    maxLength={120}
                    value={titulo}
                    onChange={(e) => setTitulo(e.target.value)}
                    placeholder="Ex.: Garrafa térmica azul"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label htmlFor="item-category" className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <Tag size={17} />
                    Categoria
                  </label>

                  <select
                    id="item-category"
                    required
                    value={categoria}
                    onChange={(e) => setCategoria(e.target.value)}
                    className={inputClass}
                  >
                    <option value="" disabled>
                      Selecione uma categoria
                    </option>
                    {categories.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                  </select>
                </div>

                <div>
                  <label htmlFor="item-location" className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
                    <MapPin size={17} />
                    Local no campus
                  </label>

                  <input
                    id="item-location"
                    type="text"
                    required
                    maxLength={120}
                    value={local}
                    onChange={(e) => setLocal(e.target.value)}
                    placeholder="Ex.: Bloco B, Biblioteca..."
                    className={inputClass}
                  />
                </div>

                <OccurrenceDatePicker value={data} onChange={setData} maxDate={dataHoje} disabled={pending} />

                <div className="md:col-span-2">
                  <label htmlFor="item-description" className="mb-2 block text-sm font-semibold text-gray-700">
                    Faça uma breve descrição do item
                  </label>

                  <textarea
                    id="item-description"
                    required
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

            <section className={`${cardClass} mb-6`}>
              <h2 className="flex items-center gap-2 text-lg font-bold"><Camera size={20} aria-hidden="true" />Fotos do item</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">{tipo === "found" ? "Depois de salvar o item encontrado, você poderá adicionar fotos nesta tela ou em Meus itens." : "Alertas de perda são cadastrados com descrição. O envio de fotos está disponível para objetos encontrados."}</p>
            </section>

            {/* Confirmação */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs text-gray-500">
                Confira as informações antes de finalizar o cadastro.
              </p>

              <button
                type="submit"
                disabled={pending || uncertain}
                className="rounded-xl bg-black px-8 py-4 text-sm font-semibold text-white transition hover:bg-gray-800 disabled:opacity-50"
              >
                {pending ? "Salvando…" : "Cadastrar item"}
              </button>
            </div>

            {error && <div role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><p>{error}</p>
              {expired && <Link href="/login" className="mt-3 inline-block font-semibold underline">Entrar novamente</Link>}
              {uncertain && <div className="mt-3 flex flex-wrap gap-4"><Link href={`/meus-itens?tipo=${tipo}`} className="font-semibold underline">Conferir Meus itens</Link><button type="button" className="font-semibold underline" onClick={() => { setUncertain(false); setError(""); }}>Já conferi; liberar nova tentativa</button></div>}
            </div>}
            </fieldset>
          </form>
        </div>
      </main>
    </>
  );
}
