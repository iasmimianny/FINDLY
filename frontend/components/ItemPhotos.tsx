"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef, useState, type FormEvent } from "react";
import { ItemApiError, photoError, uploadItemPhoto, type ItemPhoto } from "../lib/items";

export default function ItemPhotos({ code, initialPhotos = [], canUpload = false }: {
  code: string; initialPhotos?: ItemPhoto[]; canUpload?: boolean;
}) {
  const [photos, setPhotos] = useState(initialPhotos);
  const [file, setFile] = useState<File | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  const [expired, setExpired] = useState(false);
  const [message, setMessage] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const lock = useRef(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file || lock.current) return;
    lock.current = true;
    setPending(true);
    setError("");
    setMessage("");
    setExpired(false);
    try {
      const photo = await uploadItemPhoto(code, file);
      setPhotos((previous) => [...previous, photo]);
      setFile(null);
      if (input.current) input.current.value = "";
      setMessage("Foto salva no item.");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível enviar a foto.");
      setExpired(reason instanceof ItemApiError && reason.status === 401);
    } finally {
      lock.current = false;
      setPending(false);
    }
  }

  return <div className="mt-4">
    {photos.length > 0 && <div className="mb-3 flex flex-wrap gap-3">
      {photos.map((photo, index) => <a key={photo.id} href={photo.image} target="_blank" rel="noreferrer" aria-label={`Abrir foto ${index + 1}`}>
        <Image src={photo.image} alt={`Foto ${index + 1} do item ${code}`} width={96} height={96} unoptimized className="h-24 w-24 rounded-xl border border-gray-200 object-cover" />
      </a>)}
    </div>}
    {canUpload && <form onSubmit={submit} className="rounded-xl border border-gray-200 bg-gray-50 p-4">
      <label htmlFor={`photo-${code}`} className="block text-sm font-semibold text-gray-800">Adicionar foto</label>
      <p id={`photo-help-${code}`} className="mt-1 text-xs text-gray-600">JPG, PNG ou WebP, até 5 MB por foto. Envie uma de cada vez.</p>
      <input ref={input} id={`photo-${code}`} aria-describedby={`photo-help-${code}`} type="file" accept=".jpg,.jpeg,.png,.webp" disabled={pending} className="mt-3 block w-full text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-white file:px-3 file:py-2 file:font-medium" onChange={(event) => {
        const selected = event.target.files?.[0] ?? null;
        const validation = selected ? photoError(selected) : "";
        setError(validation); setMessage(""); setFile(validation ? null : selected);
      }} />
      <button disabled={pending || !file} className="mt-3 rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{pending ? "Enviando…" : "Salvar foto"}</button>
      {message && <p role="status" className="mt-2 text-sm text-green-700">{message}</p>}
      {error && <p role="alert" className="mt-2 text-sm text-red-700">{error}</p>}
      {expired && <Link href="/login" className="mt-2 inline-block text-sm font-semibold underline">Entrar novamente</Link>}
    </form>}
  </div>;
}
