"use client";
import { useState, type ReactNode } from "react";
import { Button } from "@heroui/react";
import FindlyModal from "./FindlyModal";
import CreateItemForm from "./CreateItemForm";

export default function CreateItemButton({ className, children = "Cadastrar item", onCreated, initiallyOpen = false }: {
  className?: string; children?: ReactNode; onCreated?: () => void; initiallyOpen?: boolean;
}) {
  const [open, setOpen] = useState(initiallyOpen);
  const [busy, setBusy] = useState(false);
  return <>
    <Button className={className} onPress={() => setOpen(true)}>{children}</Button>
    {open && <FindlyModal open title="Cadastrar item" size="lg" busy={busy} onClose={() => setOpen(false)}>
      <CreateItemForm onBusy={setBusy} onCreated={() => onCreated?.()} />
    </FindlyModal>}
  </>;
}
