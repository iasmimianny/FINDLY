"use client";

import { Modal } from "@heroui/react";
import type { ReactNode } from "react";

export default function FindlyModal({
  open,
  onClose,
  title,
  children,
  busy = false,
  size = "md",
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  busy?: boolean;
  size?: "md" | "lg";
}) {
  return (
    <Modal
      isOpen={open}
      onOpenChange={(value) => {
        if (!value && !busy) onClose();
      }}
    >
      <Modal.Backdrop
        isDismissable={!busy}
        isKeyboardDismissDisabled={busy}
        className="z-[120] bg-black/45 backdrop-blur-sm"
      >
        <Modal.Container
          placement="center"
          size={size}
          scroll="inside"
          className="p-3 sm:p-6"
        >
          <Modal.Dialog className={`findly-overlay w-full min-w-0 max-h-[90dvh] rounded-2xl border border-gray-200 bg-white text-gray-900 shadow-xl ${size === "lg" ? "max-w-2xl" : "max-w-md"}`}>

            {!busy && (
              <Modal.CloseTrigger aria-label="Fechar janela" />
            )}

            <Modal.Header>
              <Modal.Heading className="break-words pr-7 text-lg font-bold sm:text-xl">
                {title}
              </Modal.Heading>
            </Modal.Header>

            <Modal.Body className="min-w-0 overflow-y-auto overflow-x-hidden pb-4 sm:pb-6">
              {children}
            </Modal.Body>

          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}