import type {
  LicenseMonthlySalesRow,
  LicenseRecord,
  LicenseReportData,
  LicenseReportFilters,
} from "../types/licenseReport";
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
] as const;

const MONTH_LABELS_FULL = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
] as const;

function percent(part: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((part / total) * 1000) / 10;
}

function formatDateBr(isoOrDate: string): string {
  const date = new Date(
    isoOrDate.includes("T") ? isoOrDate : `${isoOrDate}T12:00:00`
  );
  return date.toLocaleDateString("pt-BR");
}

function resolvePeriod(
  licenses: LicenseRecord[],
  filters: LicenseReportFilters
): LicenseReportData["period"] {
  const dates = licenses
    .map((l) => new Date(l.created_at).getTime())
    .filter((t) => !Number.isNaN(t));

  const minDate = dates.length ? new Date(Math.min(...dates)) : new Date();
  const maxDate = dates.length ? new Date(Math.max(...dates)) : new Date();

  const from = filters.dateFrom || minDate.toISOString().slice(0, 10);
  const to = filters.dateTo || maxDate.toISOString().slice(0, 10);

  return {
    from,
    to,
    label: `${formatDateBr(from)} a ${formatDateBr(to)}`,
  };
}

function getMonthBuckets(period: LicenseReportData["period"]) {
  const start = new Date(`${period.from}T00:00:00`);
  const end = new Date(`${period.to}T23:59:59.999`);
  const fromYear = start.getFullYear();
  const toYear = end.getFullYear();
  const singleYear = fromYear === toYear;

  const buckets: {
    monthKey: string;
    month: string;
    year: number;
    monthIndex: number;
  }[] = [];

  const cursor = new Date(start.getFullYear(), start.getMonth(), 1);
  const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

  while (cursor <= endMonth) {
    const year = cursor.getFullYear();
    const monthIndex = cursor.getMonth();
    const monthKey = `${year}-${String(monthIndex + 1).padStart(2, "0")}`;

    buckets.push({
      monthKey,
      month: singleYear
        ? MONTH_LABELS_FULL[monthIndex]
        : `${MONTH_LABELS_FULL[monthIndex]}/${year}`,
      year,
      monthIndex,
    });

    cursor.setMonth(cursor.getMonth() + 1);
  }

  return buckets;
}

function getLicenseMonthKey(createdAt: string): string | null {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return null;
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function isWithinPeriod(
  createdAt: string,
  period: LicenseReportData["period"]
): boolean {
  const date = new Date(createdAt);
  if (Number.isNaN(date.getTime())) return false;

  const start = new Date(`${period.from}T00:00:00`);
  const end = new Date(`${period.to}T23:59:59.999`);
  return date >= start && date <= end;
}

function buildMonthlySales(
  licenses: LicenseRecord[],
  period: LicenseReportData["period"]
): LicenseMonthlySalesRow[] {
  const bucketDefs = getMonthBuckets(period);
  const bucketMap = new Map(
    bucketDefs.map((def) => [
      def.monthKey,
      {
        month: def.month,
        monthKey: def.monthKey,
        storeSales: 0,
        manualSales: 0,
        total: 0,
      },
    ])
  );

  for (const license of licenses) {
    if (!isWithinPeriod(license.created_at, period)) continue;

    const monthKey = getLicenseMonthKey(license.created_at);
    if (!monthKey) continue;

    const bucket = bucketMap.get(monthKey);
    if (!bucket) continue;

    if (isStorePurchaseCode(license.codigo_compra)) {
      bucket.storeSales += 1;
    } else {
      bucket.manualSales += 1;
    }
    bucket.total += 1;
  }

  return bucketDefs.map(
    (def) => bucketMap.get(def.monthKey)!
  );
}

export function buildLicenseReportData(
  licenses: LicenseRecord[],
  filters: LicenseReportFilters
): LicenseReportData {
  const period = resolvePeriod(licenses, filters);
  const scopedLicenses = licenses.filter((l) =>
    isWithinPeriod(l.created_at, period)
  );

  const total = scopedLicenses.length;
  const expired = scopedLicenses.filter((l) => l.status === "Expirada").length;
  const active = scopedLicenses.filter((l) => l.status === "Ativada").length;

  const store = scopedLicenses.filter((l) =>
    isStorePurchaseCode(l.codigo_compra)
  ).length;
  const manual = total - store;

  const monthlySales = buildMonthlySales(scopedLicenses, period);

  return {
    period,
    generatedAt: new Date().toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }),
    summary: {
      total,
      expired,
      expiredPercent: percent(expired, total),
      active,
      activePercent: percent(active, total),
    },
    sales: {
      store,
      storePercent: percent(store, total),
      manual,
      manualPercent: percent(manual, total),
    },
    monthlySales,
    usageRate: {
      active,
      total,
      inactive: total - active,
      usagePercent: percent(active, total),
    },
  };
}

export function getChartMonthlyData(data: LicenseReportData) {
  return data.monthlySales.map((row) => {
    const monthIndex = Number(row.monthKey.split("-")[1]) - 1;
    const shortLabel = MONTH_LABELS[monthIndex] ?? row.month.slice(0, 3);

    return {
      month: row.month.includes("/") ? row.month : shortLabel,
      loja: row.storeSales,
      manual: row.manualSales,
    };
  });
}

export function formatNumberBr(value: number): string {
  return value.toLocaleString("pt-BR");
}
