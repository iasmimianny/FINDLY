"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@heroui/react";
import FindlyModal from "../FindlyModal";
import OccurrenceDatePicker from "../OccurrenceDatePicker";

import {
  createFoundItem,
  occurrenceDate,
  uploadItemPhoto,
  photoError,
  type Item,
} from "../../lib/items";

type Props = {
  item: Item;
  onClose: () => void;
  onSuccess: (message: string) => void;
};

const inputClass =
  "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500";

export default function FoundItemModal({ item, onClose, onSuccess }: Props) {
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [date, setDate] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [sending, setSending] = useState(false);

  const now = new Date();

  const today = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (sending) return;

    setError("");

    if (!description.trim() || !location.trim() || !date) {
      setError("Preencha todos os campos obrigatórios.");
      return;
    }

    if (date > today) {
      setError("A data não pode estar no futuro.");
      return;
    }

    if (photo) {
      const validation = photoError(photo);

      if (validation) {
        setError(validation);
        return;
      }
    }

    setSending(true);

    try {
      const foundItem = await createFoundItem({
        title: item.title,
        category: item.category,
        description: description.trim(),
        found_location: location.trim(),
        found_at: occurrenceDate(date),
        lost_report_code: item.public_code,
      });

      if (photo) {
        try {
          await uploadItemPhoto(foundItem.public_code, photo);
        } catch {
          onSuccess(
            "Objeto vinculado ao alerta. A foto não foi enviada e pode ser adicionada em Meus itens. Entregue o objeto a um ponto de coleta."
          );
          return;
        }
      }

      onSuccess(
        "Objeto encontrado vinculado ao alerta. Entregue-o a um ponto de coleta do Findly."
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Não foi possível cadastrar o objeto."
      );
    } finally {
      setSending(false);
    }
  }

  return (
    <FindlyModal
      open
      title="Encontrei este item"
      onClose={onClose}
      busy={sending}
      size="lg"
    >
      <form
        onSubmit={submit}
        className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <div>
          <label className="mb-2 block text-sm font-semibold">
            Nome do objeto
          </label>

          <input
            value={item.title}
            readOnly
            className={`${inputClass} bg-gray-100`}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Categoria
          </label>

          <input
            value={item.category_display}
            readOnly
            className={`${inputClass} bg-gray-100`}
          />
        </div>

        <div className="min-w-0 sm:col-span-2">
          <label className="mb-2 block text-sm font-semibold">
            Descrição *
          </label>

          <textarea
            required
            rows={3}
            value={description}
            disabled={sending}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Descreva o objeto encontrado."
            className={inputClass}
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold">
            Local onde encontrou *
          </label>

          <input
            required
            value={location}
            disabled={sending}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Ex.: Biblioteca, bloco A"
            className={inputClass}
          />
        </div>

        <div className="min-w-0">
          <OccurrenceDatePicker
            label="Data em que encontrou"
            value={date}
            onChange={setDate}
            maxDate={today}
            disabled={sending}
          />
        </div>

        <div className="min-w-0 sm:col-span-2">
          <label className="mb-2 block text-sm font-semibold">
            Foto do objeto (opcional)
          </label>

          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp"
            disabled={sending}
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;

              if (file) {
                const validation = photoError(file);

                if (validation) {
                  setError(validation);
                  setPhoto(null);
                  e.target.value = "";
                  return;
                }
              }

              setPhoto(file);
              setError("");
            }}
            className={inputClass}
          />

          <p className="mt-1 text-xs text-gray-500">
            JPG, PNG ou WebP. Máximo de 5 MB.
          </p>
        </div>

        <p className="rounded-xl bg-blue-50 p-3 text-sm text-blue-800 sm:col-span-2">
          O achado será vinculado a este alerta. Entregue o objeto a um ponto de
          coleta do Findly. O alerta será encerrado quando o funcionário
          confirmar a retirada pelo proprietário do alerta.
        </p>

        {error && (
          <p role="alert" className="text-sm text-red-600 sm:col-span-2">
            {error}
          </p>
        )}

        <div className="flex flex-wrap justify-end gap-3 pt-2 sm:col-span-2">
          <Button
            type="button"
            variant="secondary"
            isDisabled={sending}
            onPress={onClose}
            className="rounded-xl border px-4 py-3 text-sm"
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            isDisabled={sending}
            className="rounded-xl bg-black px-4 py-3 text-sm font-semibold text-white disabled:opacity-50"
          >
            {sending ? "Enviando..." : "Confirmar cadastro"}
          </Button>
        </div>
      </form>
    </FindlyModal>
  );
}