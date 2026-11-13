"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/, "");
const inputClass = "mt-2 w-full rounded-xl border border-gray-300 px-4 py-3";

export default function PasswordResetForm({
  reset,
}: {
  reset?: { uid: string; token: string };
}) {
  const [pending, setPending] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const invalidLink = reset && (!reset.uid || !reset.token);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending || done || invalidLink) return;

    const form = new FormData(event.currentTarget);
    const password = form.get("new_password");
    const confirmation = form.get("new_password_confirm");
    if (reset && password !== confirmation) {
      setError("As senhas nÃ£o coincidem.");
      return;
    }

    setPending(true);
    setError("");
    try {
      const response = await fetch(
        `${API_URL}/api/auth/password-reset/${reset ? "confirm/" : ""}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          referrerPolicy: "no-referrer",
          body: JSON.stringify(
            reset
              ? { ...reset, new_password: password, new_password_confirm: confirmation }
              : { email: String(form.get("email") ?? "").trim() },
          ),
        },
      );

      if (response.status === (reset ? 200 : 202)) {
        if (reset) window.history.replaceState(null, "", window.location.pathname);
        setDone(true);
      } else if (response.status === 429) {
        setError("Muitas tentativas. Aguarde antes de tentar novamente.");
      } else if (response.status === 400) {
        const data = await response.json();
        const messages = reset
          ? data?.new_password ?? data?.new_password_confirm
          : data?.email;
        setError(
          typeof messages === "string"
            ? messages
            : Array.isArray(messages) && messages.every((message) => typeof message === "string") && messages.length
              ? messages.join(" ")
              : reset
                ? "Link invÃ¡lido ou expirado. Solicite um novo link."
                : "Confira o endereÃ§o de e-mail informado.",
        );
      } else {
        setError("NÃ£o foi possÃ­vel concluir a solicitaÃ§Ã£o. Tente novamente.");
      }
    } catch {
      setError("NÃ£o foi possÃ­vel conectar ao servidor. Tente novamente.");
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[#f5f6f8] px-4 py-8 text-[#171717]">
      <section className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-sm">
        <p className="mb-2 text-sm font-bold tracking-wider">FINDLY</p>
        <h1 className="mb-4 text-2xl font-bold">
          {reset ? "Redefinir senha" : "Recuperar senha"}
        </h1>

        {done ? (
          <p role="status">
            {reset
              ? "Senha redefinida. Entre com a nova senha."
              : "Se houver uma conta ativa com esse e-mail, vocÃª receberÃ¡ um link para redefinir a senha."}
          </p>
        ) : invalidLink ? (
          <p role="alert">O link estÃ¡ incompleto. Solicite um novo link.</p>
        ) : (
          <form method="post" onSubmit={submit} className="space-y-4">
            {reset ? (
              <>
                <label className="block font-medium">
                  Nova senha
                  <input className={inputClass} name="new_password" type="password" autoComplete="new-password" required />
                </label>
                <label className="block font-medium">
                  Confirme a nova senha
                  <input className={inputClass} name="new_password_confirm" type="password" autoComplete="new-password" required />
                </label>
              </>
            ) : (
              <label className="block font-medium">
                E-mail da conta
                <input className={inputClass} name="email" type="email" autoComplete="email" required />
              </label>
            )}

            {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
            <button type="submit" disabled={pending} className="w-full rounded-xl bg-black px-4 py-3 font-semibold text-white disabled:opacity-60">
              {pending ? "Enviandoâ€¦" : reset ? "Salvar nova senha" : "Enviar link"}
            </button>
          </form>
        )}

        <div className="mt-6 flex flex-wrap gap-4 text-sm font-medium underline">
          <Link href="/login">Voltar ao login</Link>
          {reset && !done && <Link href="/recuperar-senha">Solicitar novo link</Link>}
        </div>
      </section>
    </main>
  );
}
