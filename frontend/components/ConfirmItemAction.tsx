"use client";
import { useRef, useState } from "react";
import { Button } from "@heroui/react";
import FindlyModal from "./FindlyModal";
import { ItemApiError, readItemResponse } from "../lib/items";

export default function ConfirmItemAction({ label, description, endpoint, onChanged }: {
  label: string; description: string; endpoint: string; onChanged: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [uncertain, setUncertain] = useState(false);
  const lock = useRef(false);
  async function confirm() {
    if (lock.current || uncertain) return;
    lock.current = true; setBusy(true); setError("");
    try {
      await readItemResponse(await fetch(endpoint, { method: "POST", credentials: "same-origin", headers: { "Content-Type": "application/json" }, body: "{}", cache: "no-store" }));
      setOpen(false); onChanged();
    } catch (reason) {
      const unknown = !(reason instanceof ItemApiError) || reason.status >= 500;
      setUncertain(unknown);
      setError(unknown ? "Não foi possível confirmar o resultado. Feche esta janela e atualize a lista antes de repetir a ação." : reason.message);
    } finally { setBusy(false); lock.current = false; }
  }
  return <>
    <Button type="button" variant="secondary" className="rounded-xl border border-gray-300 px-4 py-3 text-sm font-semibold" onPress={() => { setError(""); setUncertain(false); setOpen(true); }}>{label}</Button>
    {open && <FindlyModal open title={label} busy={busy} onClose={() => setOpen(false)}>
      <p className="text-sm leading-6 text-gray-700">{description}</p>
      {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
      <div className="mt-6 flex flex-wrap justify-end gap-3"><Button type="button" variant="secondary" isDisabled={busy} onPress={() => setOpen(false)}>Voltar</Button><Button type="button" isDisabled={busy || uncertain} onPress={() => void confirm()}>{busy ? "Confirmando…" : "Confirmar"}</Button></div>
    </FindlyModal>}
  </>;
}
