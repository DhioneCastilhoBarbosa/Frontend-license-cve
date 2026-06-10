import type { KeyRecord } from "../types/key";

const MONTH_LABELS = [
  "Jan",
  "Fev",
  "Mar",
  "Abr",
  "Mai",
  "Jun",
  "Jul",
  "Ago",
  "Set",
  "Out",
  "Nov",
  "Dez",
];

export function countKeysByStatus(keys: KeyRecord[]) {
  const active = keys.filter((k) => k.status === "Ativada").length;
  const pending = keys.filter((k) => k.status === "Criada").length;
  const other = keys.filter(
    (k) => k.status !== "Ativada" && k.status !== "Criada"
  ).length;
  const total = keys.length;
  return { active, pending, other, total };
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function countInMonth(keys: KeyRecord[], year: number, month: number) {
  return keys.filter((k) => {
    const d = new Date(k.created_at);
    return d.getFullYear() === year && d.getMonth() === month;
  }).length;
}

export function getKeyMonthlyVariation(
  keys: KeyRecord[],
  predicate: (k: KeyRecord) => boolean
) {
  const now = new Date();
  const thisMonth = countInMonth(
    keys.filter(predicate),
    now.getFullYear(),
    now.getMonth()
  );
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = countInMonth(
    keys.filter(predicate),
    prevDate.getFullYear(),
    prevDate.getMonth()
  );
  return { current: thisMonth, change: percentChange(thisMonth, lastMonth) };
}

export function getMonthNewKeys(keys: KeyRecord[]) {
  const now = new Date();
  return keys.filter((k) => {
    const d = new Date(k.created_at);
    return (
      d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    );
  }).length;
}

export function getLast12MonthsKeyChartData(keys: KeyRecord[]) {
  const now = new Date();
  const buckets: { month: string; ativadas: number; pendentes: number }[] = [];

  for (let i = 11; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const inMonth = keys.filter((k) => {
      const created = new Date(k.created_at);
      return created.getFullYear() === year && created.getMonth() === month;
    });
    buckets.push({
      month: MONTH_LABELS[month],
      ativadas: inMonth.filter((k) => k.status === "Ativada").length,
      pendentes: inMonth.filter((k) => k.status !== "Ativada").length,
    });
  }

  return buckets;
}

export function isWithinDateRange(
  createdAt: string,
  from: string,
  to: string
): boolean {
  if (!from && !to) return true;
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return false;
  if (from) {
    const start = new Date(from);
    start.setHours(0, 0, 0, 0);
    if (date < start) return false;
  }
  if (to) {
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);
    if (date > end) return false;
  }
  return true;
}

export function getNameInitials(nome: string): string {
  const parts = nome.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  return nome.slice(0, 2).toUpperCase();
}
