"use client";

import { useState, type FormEvent } from "react";
import FindlyModal from "../FindlyModal";
import { createClaim, type Item } from "../../lib/items";

type Props = {
  item: Item;
  onClose: () => void;
  onSuccess: (message: string) => void;
};

export default function ClaimModal({
  item,
  onClose,
  onSuccess,
}: Props) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (sending) return;

    if (!message.trim()) {
      setError("Informe características do objeto.");
      return;
    }

    setSending(true);
    setError("");

    try {
      await createClaim(item.public_code, message.trim());

      onSuccess(
        "Solicitação enviada! Aguarde a análise do funcionário."
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Não foi possível enviar a solicitação."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <FindlyModal
      open
      title="Solicitar retirada"
      onClose={onClose}
      busy={sending}
    >
      <form onSubmit={submit} className="space-y-4">
        <div className="rounded-xl bg-gray-50 p-4">
          <h3 className="font-semibold">{item.title}</h3>
          <p className="text-sm text-gray-500">
            {item.category_display}
          </p>
        </div>

        <div>
          <label
            htmlFor="claim-message"
            className="mb-2 block text-sm font-semibold"
          >
            Comprovação de propriedade *
          </label>

          <textarea
            id="claim-message"
            required
            rows={5}
            maxLength={4000}
            value={message}
            disabled={sending}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Informe características específicas do seu objeto."
            className="w-full rounded-xl border border-gray-300 p-3 text-sm outline-none focus:border-blue-500"
          />

          <p className="mt-1 text-right text-xs text-gray-500">
            {message.length}/4000
          </p>
        </div>

        <p className="rounded-xl bg-blue-50 p-3 text-sm text-blue-800">
          Sua solicitação será analisada por um funcionário.
          Após a aprovação, você receberá uma autorização
          de retirada.
        </p>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={sending}
            className="rounded-xl border px-4 py-3 text-sm"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={sending}
            className="rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {sending ? "Enviando..." : "Enviar solicitação"}
          </button>
        </div>
      </form>
    </FindlyModal>
  );
}