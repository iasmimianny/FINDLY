"use client";
import { Modal } from "@heroui/react";
import type { ReactNode } from "react";

export default function FindlyModal({ open, onClose, title, children, busy = false }: { open: boolean; onClose: () => void; title: string; children: ReactNode; busy?: boolean }) {
  return <Modal isOpen={open} onOpenChange={(value) => { if (!value && !busy) onClose(); }}>
    <Modal.Backdrop isDismissable={!busy} isKeyboardDismissDisabled={busy} className="z-[100] bg-black/45 backdrop-blur-sm">
      <Modal.Container placement="center" size="md" scroll="inside">
        <Modal.Dialog className="findly-overlay rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-xl">
          {!busy && <Modal.CloseTrigger aria-label="Fechar janela" />}
          <Modal.Header><Modal.Heading className="pr-7 text-xl font-bold">{title}</Modal.Heading></Modal.Header>
          <Modal.Body className="pb-6">{children}</Modal.Body>
        </Modal.Dialog>
      </Modal.Container>
    </Modal.Backdrop>
  </Modal>;
}
