import {
  BadgeCheck,
  CircleDollarSign,
  Layers,
  TrendingDown,
  TrendingUp,
  XCircle,
} from "lucide-react";
import type { LicenseRecord } from "../../../types/licenseReport";
import {
  countByStatus,
  getMonthSales,
  getMonthlyVariation,
} from "../../../utils/licenseStats";

interface LicenseMetricsProps {
  licenses: LicenseRecord[];
}

interface MetricCardProps {
  title: string;
  value: string;
  subtitle?: string;
  change?: number | null;
  progress: number;
  progressColor: string;
  icon: React.ReactNode;
  iconBg: string;
  extra?: string;
}

function MetricCard({
  title,
  value,
  subtitle,
  change,
  progress,
  progressColor,
  icon,
  iconBg,
  extra,
}: MetricCardProps) {
  const hasChange = change !== null && change !== undefined;
  const isPositive = (change ?? 0) >= 0;

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-zinc-400">
            {title}
          </p>
          <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-white">
            {value}
          </p>
          {hasChange && (
            <p
              className={`mt-1 flex items-center gap-1 text-xs font-medium ${
                isPositive ? "text-emerald-600" : "text-red-500"
              }`}
            >
              {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              {isPositive ? "+" : ""}
              {change}% em relação ao mês anterior
            </p>
          )}
          {subtitle && (
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
              {subtitle}
            </p>
          )}
          {extra && (
            <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">{extra}</p>
          )}
        </div>
        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${iconBg}`}
        >
          {icon}
        </div>
      </div>
      <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-zinc-100 dark:bg-zinc-800">
        <div
          className={`h-full rounded-full transition-all ${progressColor}`}
          style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
        />
      </div>
    </div>
  );
}

export default function LicenseMetrics({ licenses }: LicenseMetricsProps) {
  const { active, expired, total } = countByStatus(licenses);
  const activeVar = getMonthlyVariation(licenses, (l) => l.status === "Ativada");
  const expiredVar = getMonthlyVariation(
    licenses,
    (l) => l.status === "Expirada"
  );
  const sales = getMonthSales(licenses);
  const salesVar = getMonthlyVariation(licenses, () => true);

  const formatCurrency = (v: number) =>
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <MetricCard
        title="Licenças Ativas"
        value={active.toLocaleString("pt-BR")}
        change={activeVar.change}
        progress={total ? (active / total) * 100 : 0}
        progressColor="bg-emerald-500"
        icon={<BadgeCheck size={20} className="text-emerald-500" />}
        iconBg="bg-emerald-50 dark:bg-emerald-950/40"
        subtitle={total ? `${Math.round((active / total) * 100)}% do total` : undefined}
      />
      <MetricCard
        title="Licenças Expiradas"
        value={expired.toLocaleString("pt-BR")}
        change={expiredVar.change}
        progress={total ? (expired / total) * 100 : 0}
        progressColor="bg-red-500"
        icon={<XCircle size={20} className="text-red-500" />}
        iconBg="bg-red-50 dark:bg-red-950/40"
        subtitle={total ? `${Math.round((expired / total) * 100)}% do total` : undefined}
      />
      <MetricCard
        title="Total de Licenças"
        value={total.toLocaleString("pt-BR")}
        change={salesVar.change}
        progress={100}
        progressColor="bg-sky-500"
        icon={<Layers size={20} className="text-sky-500" />}
        iconBg="bg-sky-50 dark:bg-sky-950/40"
        subtitle="Base completa cadastrada"
      />
      <MetricCard
        title="Vendas do Mês"
        value={sales.count.toLocaleString("pt-BR")}
        change={salesVar.change}
        progress={total ? Math.min(100, (sales.count / total) * 100 * 4) : 0}
        progressColor="bg-amber-500"
        icon={<CircleDollarSign size={20} className="text-amber-500" />}
        iconBg="bg-amber-50 dark:bg-amber-950/40"
        extra={`Receita: ${formatCurrency(sales.revenue)}`}
      />
    </div>
  );
}
