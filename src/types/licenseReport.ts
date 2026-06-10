export interface LicenseRecord {
  id: number;
  nome: string;
  email: string;
  codigo_compra: string;
  codigo: string;
  status: string;
  validade: string;
  created_at: string;
  quantidade: number;
  valor?: number;
}

export interface LicenseReportPeriod {
  from: string;
  to: string;
  label: string;
}

export interface LicenseReportSummary {
  total: number;
  expired: number;
  expiredPercent: number;
  active: number;
  activePercent: number;
}

export interface LicenseReportSales {
  store: number;
  storePercent: number;
  manual: number;
  manualPercent: number;
}

export interface LicenseMonthlySalesRow {
  month: string;
  monthKey: string;
  storeSales: number;
  manualSales: number;
  total: number;
}

export interface LicenseUsageRate {
  active: number;
  total: number;
  inactive: number;
  usagePercent: number;
}

export interface LicenseReportData {
  period: LicenseReportPeriod;
  generatedAt: string;
  summary: LicenseReportSummary;
  sales: LicenseReportSales;
  monthlySales: LicenseMonthlySalesRow[];
  usageRate: LicenseUsageRate;
}

export interface LicenseReportFilters {
  dateFrom: string;
  dateTo: string;
}
