"use client";

import { finishLoadingCycle } from "../lib/loading-cycle";
import FindlyLoading from "./FindlyLoading";
import Link from "next/link";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { CheckCircle2, Mail, Phone, Save, User } from "lucide-react";
import { ProfileApiError, readProfileResponse, type Profile } from "../lib/profile";

const inputClass = "mt-2 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm text-gray-900 outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-100 disabled:opacity-60";
const roleLabels: Record<string, string> = { common: "Estudante / usuário", operator: "Operador de ponto de coleta", admin: "Administrador" };

function ProfileEditor({ initial }: { initial: Profile }) {
  const [profile, setProfile] = useState(initial);
  const [name, setName] = useState(initial.full_name);
  const [phone, setPhone] = useState(initial.phone);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [expired, setExpired] = useState(false);
  const [saved, setSaved] = useState(false);
  const lock = useRef(false);
  const dirty = name.trim() !== profile.full_name || phone.trim() !== profile.phone;

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (lock.current || !dirty) return;
    if (!name.trim()) { setError("Informe seu nome completo."); return; }
    lock.current = true;
    setSaving(true);
    setSaved(false);
    setError("");
    setExpired(false);
    try {
      const data = await readProfileResponse(await fetch("/api/account/me/", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ full_name: name.trim(), phone: phone.trim() }), credentials: "same-origin", cache: "no-store",
      }));
      setProfile(data);
      setName(data.full_name);
      setPhone(data.phone);
      setSaved(true);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Não foi possível salvar os dados.");
      setExpired(reason instanceof ProfileApiError && reason.status === 401);
    } finally { lock.current = false; setSaving(false); }
  }

  const joined = new Date(profile.date_joined);
  return <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
    <div className="mb-6 flex items-center gap-4 border-b border-gray-100 pb-5">
      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-blue-50 text-blue-700"><User size={30} aria-hidden="true" /></div>
      <div className="min-w-0"><h2 className="break-words text-xl font-bold text-gray-900">{profile.full_name || "Sua conta"}</h2><p className="mt-1 break-all text-sm text-gray-600">{profile.email}</p><p className="mt-2 text-xs font-medium text-gray-500">{roleLabels[profile.role] ?? "Conta Findly"}{!Number.isNaN(joined.getTime()) && ` · Desde ${joined.toLocaleDateString("pt-BR")}`}</p></div>
    </div>
    <form onSubmit={submit}>
      <fieldset disabled={saving} className="grid min-w-0 gap-5 sm:grid-cols-2">
        <div><label htmlFor="profile-name" className="flex items-center gap-2 text-sm font-semibold text-gray-700"><User size={16} aria-hidden="true" />Nome completo</label><input id="profile-name" name="full_name" autoComplete="name" value={name} maxLength={255} required className={inputClass} onChange={(event) => { setName(event.target.value); setSaved(false); }} /></div>
        <div><label htmlFor="profile-phone" className="flex items-center gap-2 text-sm font-semibold text-gray-700"><Phone size={16} aria-hidden="true" />Telefone / WhatsApp <span className="font-normal text-gray-500">(opcional)</span></label><input id="profile-phone" name="phone" type="tel" autoComplete="tel" value={phone} maxLength={20} className={inputClass} onChange={(event) => { setPhone(event.target.value); setSaved(false); }} /></div>
        <div className="sm:col-span-2"><label htmlFor="profile-email" className="flex items-center gap-2 text-sm font-semibold text-gray-700"><Mail size={16} aria-hidden="true" />E-mail de acesso</label><input id="profile-email" type="email" autoComplete="email" value={profile.email} readOnly aria-describedby="profile-email-help" className={`${inputClass} bg-gray-50 text-gray-600`} /><p id="profile-email-help" className="mt-2 text-xs text-gray-600">Este é o endereço confirmado usado para entrar na sua conta.</p></div>
        <div className="flex flex-wrap items-center gap-3 sm:col-span-2">
          <button disabled={saving || !dirty} className="inline-flex items-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white hover:bg-gray-800 disabled:opacity-50"><Save size={17} aria-hidden="true" />{saving ? "Salvando…" : "Salvar alterações"}</button>
          {dirty && <button type="button" disabled={saving} className="rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold text-gray-700 disabled:opacity-50" onClick={() => { setName(profile.full_name); setPhone(profile.phone); setError(""); setSaved(false); }}>Descartar alterações</button>}
        </div>
      </fieldset>
      {saved && <p role="status" className="mt-4 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800"><CheckCircle2 size={18} aria-hidden="true" />Perfil atualizado com sucesso.</p>}
      {error && <div role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800"><p>{error}</p>{expired && <Link href="/login" className="mt-2 inline-block font-semibold underline">Entrar novamente</Link>}</div>}
    </form>
  </section>;
}

export default function ProfilePanel() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [error, setError] = useState("");
  const [expired, setExpired] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      const startedAt = performance.now();
      try {
        const data = await readProfileResponse(await fetch("/api/account/me/", {
          signal: controller.signal, credentials: "same-origin", cache: "no-store",
        }));
        await finishLoadingCycle(startedAt, controller.signal);
        if (!controller.signal.aborted) setProfile(data);
      } catch (reason) {
        if (!controller.signal.aborted) {
          setError(reason instanceof Error ? reason.message : "Não foi possível carregar seu perfil.");
          setExpired(reason instanceof ProfileApiError && reason.status === 401);
        }
      }
    }
    void load();
    return () => controller.abort();
  }, [attempt]);

  if (error) return <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-800"><p>{error}</p>{expired ? <Link href="/login" className="mt-3 inline-block font-semibold underline">Entrar novamente</Link> : <button className="mt-3 rounded-lg border border-red-300 px-4 py-2 font-semibold" onClick={() => { setError(""); setAttempt((value) => value + 1); }}>Tentar novamente</button>}</div>;
  if (!profile) return <FindlyLoading message="Carregando os dados da sua conta…" />;
  return <ProfileEditor initial={profile} />;
}
