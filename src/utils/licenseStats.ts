import type { LicenseRecord } from "../types/licenseReport";
import { isStorePurchaseCode } from "./licenseFilters";

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

export function countByStatus(licenses: LicenseRecord[]) {
  const active = licenses.filter((l) => l.status === "Ativada").length;
  const expired = licenses.filter((l) => l.status === "Expirada").length;
  const revoked = licenses.filter(
    (l) => l.status !== "Ativada" && l.status !== "Expirada"
  ).length;
  const total = licenses.length;
  return { active, expired, revoked, total };
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current > 0 ? 100 : null;
  return Math.round(((current - previous) / previous) * 1000) / 10;
}

function countInMonth(licenses: LicenseRecord[], year: number, month: number) {
  return licenses.filter((l) => {
    const d = new Date(l.created_at);
    return d.getFullYear() === year && d.getMonth() === month;
  }).length;
}

export function getMonthlyVariation(
  licenses: LicenseRecord[],
  predicate: (l: LicenseRecord) => boolean
) {
  const now = new Date();
  const thisMonth = countInMonth(
    licenses.filter(predicate),
    now.getFullYear(),
    now.getMonth()
  );
  const prevDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonth = countInMonth(
    licenses.filter(predicate),
    prevDate.getFullYear(),
    prevDate.getMonth()
  );
  return { current: thisMonth, change: percentChange(thisMonth, lastMonth) };
}

export function getMonthSales(licenses: LicenseRecord[]) {
  const now = new Date();
  const monthLicenses = licenses.filter((l) => {
    const d = new Date(l.created_at);
    return (
      d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
    );
  });
  const revenue = monthLicenses.reduce(
    (sum, l) => sum + (l.valor ?? 0) * (l.quantidade || 1),
    0
  );
  return { count: monthLicenses.length, revenue };
}

export function getLast12MonthsChartData(licenses: LicenseRecord[]) {
  const now = new Date();
  const buckets: { month: string; loja: number; manual: number }[] = [];

  for (let i = 11; i >= 0; i -= 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    const inMonth = licenses.filter((l) => {
      const created = new Date(l.created_at);
      return created.getFullYear() === year && created.getMonth() === month;
    });
    buckets.push({
      month: MONTH_LABELS[month],
      loja: inMonth.filter((l) => isStorePurchaseCode(l.codigo_compra)).length,
      manual: inMonth.filter((l) => !isStorePurchaseCode(l.codigo_compra))
        .length,
    });
  }

  return buckets;
}

export function isWithinPeriodPreset(
  createdAt: string,
  preset: string
): boolean {
  if (preset === "all") return true;
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return false;
  const now = new Date();
  const days =
    preset === "7d" ? 7 : preset === "30d" ? 30 : preset === "90d" ? 90 : 0;
  if (!days) return true;
  const start = new Date(now);
  start.setDate(start.getDate() - days);
  start.setHours(0, 0, 0, 0);
  return date >= start;
}

export function getEmailInitials(email: string): string {
  const local = email.split("@")[0] ?? "";
  const parts = local.split(/[._-]/).filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[1][0] ?? ""}`.toUpperCase();
  }
  return local.slice(0, 2).toUpperCase();
}
