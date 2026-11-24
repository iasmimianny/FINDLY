"use client";

import { useState } from "react";

import {
  CalendarDays,
  MapPin,
  CheckCircle2,
  ClipboardCheck,
} from "lucide-react";

import ItemPhotos from "../ItemPhotos";
import ClaimModal from "./ClaimModal";
import FoundItemModal from "./FoundItemModal";

import {
  itemDate,
  type Item,
  type ItemKind,
} from "../../lib/items";

type Props = {
  item: Item;
  kind: ItemKind;
  mine: boolean;
};

export default function ItemCard({
  item,
  kind,
  mine,
}: Props) {
  const [action, setAction] = useState<
    "claim" | "found" | null
  >(null);

  const [success, setSuccess] = useState("");

  const terminal = [
    "DEVOLVIDO",
    "EXPIRADO",
    "ENCAMINHADO",
  ].includes(item.status);

  const canReportFound =
    !mine &&
    kind === "lost" &&
    item.status === "ABERTO";

  const canRequestClaim =
    !mine &&
    kind === "found" &&
    item.status === "EM_CUSTODIA";

  function handleSuccess(message: string) {
    setSuccess(message);
    setAction(null);
  }

  return (
    <>
      <article className="rounded-xl border border-gray-200 bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="break-words text-lg font-semibold text-gray-900">
              {item.title}
            </h3>

            <p className="mt-1 text-sm text-gray-600">
              {item.category_display}
            </p>
          </div>

          <span className="rounded-lg bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-800">
            {item.status_display}
          </span>
        </div>

        <p className="mt-2 text-xs text-gray-600">
          Código:{" "}
          <span className="font-mono font-semibold">
            {item.public_code}
          </span>
        </p>

        <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-gray-600">
          <span className="inline-flex items-center gap-2">
            <MapPin size={16} />

            {item.found_location ?? item.lost_location}
          </span>

          <span className="inline-flex items-center gap-2">
            <CalendarDays size={16} />

            {itemDate(item.found_at ?? item.lost_at)}
          </span>
        </div>

        <details className="mt-4 text-sm">
          <summary className="w-fit cursor-pointer font-semibold text-gray-800 underline underline-offset-4">
            Ver detalhes
          </summary>

          <p className="mt-3 whitespace-pre-wrap break-words leading-6 text-gray-700">
            {item.description}
          </p>

          {item.contact_note && (
            <p className="mt-2 break-words text-gray-700">
              Orientação de contato: {item.contact_note}
            </p>
          )}
        </details>

        {kind === "found" && (
          <ItemPhotos
            code={item.public_code}
            initialPhotos={item.photos}
            canUpload={mine && !terminal}
          />
        )}

        {!success && canReportFound && (
          <div className="mt-5 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={() => setAction("found")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#42a5df] px-5 py-3 text-sm font-semibold text-gray-950 transition hover:bg-[#3698d0]"
            >
              <CheckCircle2 size={17} />
              Encontrei este item
            </button>
          </div>
        )}

        {!success && canRequestClaim && (
          <div className="mt-5 border-t border-gray-100 pt-4">
            <button
              type="button"
              onClick={() => setAction("claim")}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-gray-800"
            >
              <ClipboardCheck size={17} />
              Solicitar retirada
            </button>
          </div>
        )}

        {!mine &&
          kind === "found" &&
          item.status === "AGUARDANDO_RETIRADA" && (
            <div className="mt-4 rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
              Este objeto já possui uma autorização de retirada.
            </div>
          )}

        {success && (
          <div
            role="status"
            className="mt-4 flex items-start gap-2 rounded-xl border border-green-200 bg-green-50 p-4 text-sm leading-6 text-green-800"
          >
            <CheckCircle2
              size={18}
              className="mt-1 shrink-0"
            />

            <p>{success}</p>
          </div>
        )}
      </article>

      {action === "claim" && (
        <ClaimModal
          item={item}
          onClose={() => setAction(null)}
          onSuccess={handleSuccess}
        />
      )}

      {action === "found" && (
        <FoundItemModal
          item={item}
          onClose={() => setAction(null)}
          onSuccess={handleSuccess}
        />
      )}
    </>
  );
}