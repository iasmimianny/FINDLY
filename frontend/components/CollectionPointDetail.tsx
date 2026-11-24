"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PointDetails } from "./CollectionPoints";
import CollectionPointForm from "./CollectionPointForm";
import FindlyLoading from "./FindlyLoading";
import { readProfileResponse, type Profile } from "../lib/profile";
import type { CollectionPoint } from "../lib/collection-points";
export default function CollectionPointDetail({ id, staffMode = false }: { id: number; staffMode?: boolean }) {
  const router = useRouter();
  const basePath = staffMode ? "/funcionario/pontos-coleta" : "/pontos-coleta";
  const [user, setUser] = useState<Profile | null>(null);
  const [error, setError] = useState("");
  const [editor, setEditor] = useState<CollectionPoint | null>(null);
  const [version, setVersion] = useState(0);
  const [notice, setNotice] = useState("");
  useEffect(() => { const controller = new AbortController(); async function load() { try { const data = await readProfileResponse(await fetch("/api/account/me/", { cache: "no-store", signal: controller.signal })); if (!controller.signal.aborted) setUser(data); } catch (reason) { if (!controller.signal.aborted) setError(reason instanceof Error ? reason.message : "Não foi possível consultar sua conta."); } } void load(); return () => controller.abort(); }, []);
  function saved() { setEditor(null); setNotice("Ponto atualizado com sucesso."); setVersion((value) => value + 1); }
  return <div className="w-full min-w-0 text-gray-900"><Link href={basePath} className="mb-6 inline-block text-sm underline">Voltar à lista de pontos</Link><h1 className="mb-7 text-3xl font-bold">Ponto de coleta e responsáveis</h1>{notice && <p role="status" className="mb-5 rounded-xl bg-green-50 p-4 text-sm text-green-800">{notice}</p>}{error ? <p role="alert">{error} <Link href="/login" className="underline">Entrar novamente</Link></p> : !user ? <FindlyLoading /> : editor && user.role === "admin" ? <CollectionPointForm point={editor} onSaved={saved} onCancel={() => setEditor(null)} /> : <PointDetails key={`${id}-${version}`} id={id} admin={user.role === "admin"} onEdit={setEditor} onChanged={() => setNotice("Situação do ponto atualizada.")} onClose={() => router.push(basePath)} />}</div>;
}
