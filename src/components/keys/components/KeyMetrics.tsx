import {
  BadgeCheck,
  Clock,
  KeyRound,
  Layers,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import type { KeyRecord } from "../../../types/key";
import {
  countKeysByStatus,
  getKeyMonthlyVariation,
  getMonthNewKeys,
} from "../../../utils/keyStats";

interface KeyMetricsProps {
  keys: KeyRecord[];
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

export default function KeyMetrics({ keys }: KeyMetricsProps) {
  const { active, pending, total } = countKeysByStatus(keys);
  const activeVar = getKeyMonthlyVariation(keys, (k) => k.status === "Ativada");
  const pendingVar = getKeyMonthlyVariation(keys, (k) => k.status === "Criada");
  const monthNew = getMonthNewKeys(keys);
  const monthVar = getKeyMonthlyVariation(keys, () => true);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      <MetricCard
        title="Chaves Ativas"
        value={active.toLocaleString("pt-BR")}
        change={activeVar.change}
        progress={total ? (active / total) * 100 : 0}
        progressColor="bg-emerald-500"
        icon={<BadgeCheck size={20} className="text-emerald-500" />}
        iconBg="bg-emerald-50 dark:bg-emerald-950/40"
        subtitle={total ? `${Math.round((active / total) * 100)}% do total` : undefined}
      />
      <MetricCard
        title="Chaves Pendentes"
        value={pending.toLocaleString("pt-BR")}
        change={pendingVar.change}
        progress={total ? (pending / total) * 100 : 0}
        progressColor="bg-amber-500"
        icon={<Clock size={20} className="text-amber-500" />}
        iconBg="bg-amber-50 dark:bg-amber-950/40"
        subtitle={total ? `${Math.round((pending / total) * 100)}% do total` : undefined}
      />
      <MetricCard
        title="Total de Chaves"
        value={total.toLocaleString("pt-BR")}
        change={monthVar.change}
        progress={100}
        progressColor="bg-sky-500"
        icon={<Layers size={20} className="text-sky-500" />}
        iconBg="bg-sky-50 dark:bg-sky-950/40"
        subtitle="Base completa cadastrada"
      />
      <MetricCard
        title="Novas do Mês"
        value={monthNew.toLocaleString("pt-BR")}
        change={monthVar.change}
        progress={total ? Math.min(100, (monthNew / total) * 100 * 4) : 0}
        progressColor="bg-violet-500"
        icon={<KeyRound size={20} className="text-violet-500" />}
        iconBg="bg-violet-50 dark:bg-violet-950/40"
        subtitle="Criadas no mês atual"
      />
    </div>
  );
}
