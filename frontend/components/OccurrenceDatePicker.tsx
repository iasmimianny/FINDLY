"use client";

import type { CSSProperties } from "react";
import { Calendar, DateField, DatePicker, FieldError, Label } from "@heroui/react";
import { parseDate } from "@internationalized/date";
import { I18nProvider } from "react-aria-components";
import { CalendarDays } from "lucide-react";

const palette = {
  "--accent": "#111111",
  "--accent-foreground": "#ffffff",
  "--focus": "#2563eb",
} as CSSProperties;

export default function OccurrenceDatePicker({ value, onChange, maxDate, disabled = false, label = "Data da ocorrência" }: {
  value: string;
  onChange: (value: string) => void;
  maxDate: string;
  disabled?: boolean;
  label?: string;
}) {
  return (
    <I18nProvider locale="pt-BR">
      <DatePicker
        className="w-full text-gray-900"
        style={palette}
        name="occurrence_date"
        value={value ? parseDate(value) : null}
        onChange={(date) => onChange(date?.toString() ?? "")}
        maxValue={parseDate(maxDate)}
        isDisabled={disabled}
        isRequired
        validationBehavior="native"
        granularity="day"
        shouldForceLeadingZeros
      >
        <Label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-700">
          <CalendarDays size={17} aria-hidden="true" />
          {label}
        </Label>
        <DateField.Group className="min-h-12 w-full rounded-xl border border-gray-200 bg-white px-4 shadow-none">
          <DateField.Input className="text-sm text-gray-800">
            {(segment) => <DateField.Segment segment={segment} />}
          </DateField.Input>
          <DateField.Suffix>
            <DatePicker.Trigger aria-label={label === "Data da ocorrência" ? "Abrir calendário da ocorrência" : `Abrir calendário: ${label}`} className="rounded-lg text-gray-800">
              <DatePicker.TriggerIndicator>
                <CalendarDays size={19} aria-hidden="true" />
              </DatePicker.TriggerIndicator>
            </DatePicker.Trigger>
          </DateField.Suffix>
        </DateField.Group>
        <FieldError className="mt-1 text-sm text-red-700">
          Escolha uma data válida, até hoje.
        </FieldError>
        <DatePicker.Popover placement="bottom start" style={{ ...palette, width: "min(20rem, calc(100vw - 2rem))", maxWidth: "calc(100vw - 2rem)", boxSizing: "border-box" }} className="z-[150] rounded-2xl border border-gray-200 bg-white p-3 text-gray-900 shadow-lg">
          <Calendar aria-label={label} maxValue={parseDate(maxDate)} style={{ width: "100%", maxWidth: "none" }}>
            <Calendar.Header>
              <Calendar.NavButton slot="previous" aria-label="Mês anterior" />
              <Calendar.Heading className="text-center" />
              <Calendar.NavButton slot="next" aria-label="Próximo mês" />
            </Calendar.Header>
            <Calendar.Grid>
              <Calendar.GridHeader>
                {(day) => <Calendar.HeaderCell>{day}</Calendar.HeaderCell>}
              </Calendar.GridHeader>
              <Calendar.GridBody>
                {(date) => <Calendar.Cell date={date} />}
              </Calendar.GridBody>
            </Calendar.Grid>
          </Calendar>
        </DatePicker.Popover>
      </DatePicker>
    </I18nProvider>
  );
}
