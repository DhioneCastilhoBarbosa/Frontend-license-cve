import { Listbox, ListboxButton, ListboxOption, ListboxOptions, Popover, PopoverButton, PopoverPanel } from "@headlessui/react";
import {
  Calendar,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export interface FilterChip {
  key: string;
  label: string;
  onRemove: () => void;
}

const pillClass =
  "inline-flex h-9 items-center gap-1.5 rounded-lg bg-zinc-100/90 dark:bg-zinc-800/80 px-3 text-sm text-zinc-700 dark:text-zinc-200 transition hover:bg-zinc-200/80 dark:hover:bg-zinc-800";

const WEEKDAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

function parseIsoDate(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map(Number);
  if (!y || !m || !d) return null;
  return new Date(y, m - 1, d);
}

function toIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatDisplay(value: string): string {
  const date = parseIsoDate(value);
  if (!date) return "";
  return date.toLocaleDateString("pt-BR");
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function buildCalendarDays(viewMonth: Date): (Date | null)[] {
  const first = startOfMonth(viewMonth);
  const startOffset = first.getDay();
  const daysInMonth = new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 0).getDate();

  const days: (Date | null)[] = Array.from({ length: startOffset }, () => null);
  for (let day = 1; day <= daysInMonth; day++) {
    days.push(new Date(viewMonth.getFullYear(), viewMonth.getMonth(), day));
  }
  while (days.length % 7 !== 0) days.push(null);
  return days;
}

interface FilterSearchProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}

export function FilterSearch({ value, onChange, placeholder }: FilterSearchProps) {
  return (
    <label className={`${pillClass} w-full cursor-text`}>
      <Search size={15} className="shrink-0 text-zinc-400" />
      <input
        type="text"
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-zinc-400"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </label>
  );
}

interface FilterSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  "aria-label"?: string;
  className?: string;
}

export function FilterSelect({
  value,
  onChange,
  options,
  "aria-label": ariaLabel,
  className = "",
}: FilterSelectProps) {
  const selected = options.find((o) => o.value === value) ?? options[0];

  return (
    <Listbox value={value} onChange={onChange}>
      <div className={`relative min-w-0 flex-1 ${className}`}>
        <ListboxButton
          aria-label={ariaLabel}
          className={`group ${pillClass} w-full cursor-pointer justify-between pr-2 pl-3 text-sm font-medium data-open:bg-zinc-200/80 dark:data-open:bg-zinc-700`}
        >
          <span className="truncate">{selected?.label}</span>
          <ChevronDown
            size={14}
            className="shrink-0 text-zinc-400 transition-transform group-data-open:rotate-180"
          />
        </ListboxButton>

        <ListboxOptions
          anchor="bottom start"
          transition
          className="z-50 mt-1.5 min-w-[var(--button-width)] overflow-hidden rounded-xl border border-zinc-200/80 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-1 shadow-xl shadow-zinc-900/10 transition duration-150 ease-out data-closed:scale-95 data-closed:opacity-0"
        >
          {options.map((option) => (
            <ListboxOption
              key={option.value}
              value={option.value}
              className="group flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm text-zinc-700 dark:text-zinc-200 data-focus:bg-zinc-100 dark:data-focus:bg-zinc-800 data-selected:bg-sky-50 data-selected:text-sky-700 dark:data-selected:bg-sky-950/50 dark:data-selected:text-sky-300"
            >
              <span className="truncate font-medium">{option.label}</span>
              <Check
                size={14}
                className="shrink-0 text-sky-500 opacity-0 group-data-selected:opacity-100"
              />
            </ListboxOption>
          ))}
        </ListboxOptions>
      </div>
    </Listbox>
  );
}

interface FilterDateProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  min?: string;
  "aria-label"?: string;
}

export function FilterDate({
  label,
  value,
  onChange,
  min,
  "aria-label": ariaLabel,
}: FilterDateProps) {
  const selected = parseIsoDate(value);
  const minDate = parseIsoDate(min ?? "");
  const [viewMonth, setViewMonth] = useState(() => selected ?? new Date());

  const days = useMemo(() => buildCalendarDays(viewMonth), [viewMonth]);

  const isDisabled = (date: Date) => {
    if (!minDate) return false;
    const d = new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
    const m = new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()).getTime();
    return d < m;
  };

  useEffect(() => {
    if (selected) setViewMonth(selected);
  }, [value]);

  const selectDate = (date: Date, close: () => void) => {
    if (isDisabled(date)) return;
    onChange(toIsoDate(date));
    close();
  };

  return (
    <Popover className="relative min-w-0 flex-1">
      {({ close }) => (
        <>
          <PopoverButton
            aria-label={ariaLabel ?? label}
            className={`${pillClass} w-full cursor-pointer font-medium ${
              value ? "text-zinc-800 dark:text-zinc-100" : "text-zinc-500"
            }`}
          >
            <Calendar size={14} className="text-zinc-400 shrink-0" />
            <span className="truncate whitespace-nowrap">
              {label}: {value ? formatDisplay(value) : "—"}
            </span>
            <ChevronDown size={13} className="text-zinc-400 shrink-0" />
          </PopoverButton>

          <PopoverPanel
            anchor="bottom start"
            className="z-50 mt-2 w-[272px] rounded-2xl border border-zinc-200/80 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-4 shadow-2xl shadow-zinc-900/10"
          >
            <div className="mb-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() =>
                  setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))
                }
                className="rounded-lg p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                aria-label="Mês anterior"
              >
                <ChevronLeft size={16} className="text-zinc-500" />
              </button>
              <span className="text-sm font-semibold text-zinc-800 dark:text-zinc-100">
                {MONTHS[viewMonth.getMonth()]} {viewMonth.getFullYear()}
              </span>
              <button
                type="button"
                onClick={() =>
                  setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))
                }
                className="rounded-lg p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                aria-label="Próximo mês"
              >
                <ChevronRight size={16} className="text-zinc-500" />
              </button>
            </div>

            <div className="mb-1 grid grid-cols-7 gap-1">
              {WEEKDAYS.map((day) => (
                <span
                  key={day}
                  className="py-1 text-center text-[10px] font-semibold uppercase text-zinc-400"
                >
                  {day}
                </span>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
              {days.map((date, index) => {
                if (!date) {
                  return <span key={`empty-${index}`} />;
                }

                const iso = toIsoDate(date);
                const isSelected = value === iso;
                const disabled = isDisabled(date);
                const isToday = toIsoDate(new Date()) === iso;

                return (
                  <button
                    key={iso}
                    type="button"
                    disabled={disabled}
                    onClick={() => selectDate(date, close)}
                    className={`h-8 rounded-lg text-xs font-medium transition cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed ${
                      isSelected
                        ? "bg-sky-500 text-white shadow-sm"
                        : isToday
                          ? "bg-sky-50 text-sky-700 ring-1 ring-sky-200 dark:bg-sky-950/40 dark:text-sky-300 dark:ring-sky-800 hover:bg-sky-100 dark:hover:bg-sky-950/60"
                          : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>

            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange("");
                  close();
                }}
                className="mt-3 w-full rounded-lg py-2 text-xs font-medium text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
              >
                Limpar
              </button>
            )}
          </PopoverPanel>
        </>
      )}
    </Popover>
  );
}

interface TableFilterBarProps {
  search: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  activeChips: FilterChip[];
  onClearAll: () => void;
  children: ReactNode;
}

export default function TableFilterBar({
  search,
  onSearchChange,
  searchPlaceholder,
  activeChips,
  onClearAll,
  children,
}: TableFilterBarProps) {
  const hasActiveFilters = activeChips.length > 0;

  return (
    <div className="space-y-2">
      <div className="flex flex-col gap-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 px-3 py-2.5 shadow-sm sm:flex-row sm:items-center">
        <div className="w-full min-w-0 sm:w-[40%]">
          <FilterSearch
            value={search}
            onChange={onSearchChange}
            placeholder={searchPlaceholder}
          />
        </div>

        <div className="flex w-full min-w-0 items-center gap-2 sm:w-[60%]">
          <div className="flex min-w-0 flex-1 items-center gap-2">{children}</div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearAll}
              className="shrink-0 inline-flex h-9 items-center rounded-lg bg-sky-500 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-sky-600 cursor-pointer whitespace-nowrap"
            >
              Limpar filtros
            </button>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-1.5 px-1">
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={chip.onRemove}
              className="inline-flex items-center gap-1 rounded-md bg-zinc-100 dark:bg-zinc-800 px-2 py-1 text-xs text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 cursor-pointer"
            >
              {chip.label}
              <X size={12} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
