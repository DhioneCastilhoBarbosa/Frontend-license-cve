import {
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { KeyRecord } from "../../../types/key";
import {
  countKeysByStatus,
  getLast12MonthsKeyChartData,
} from "../../../utils/keyStats";

interface KeyChartsProps {
  keys: KeyRecord[];
}

const PIE_COLORS = ["#22c55e", "#f59e0b", "#94a3b8"];

export default function KeyCharts({ keys }: KeyChartsProps) {
  const lineData = getLast12MonthsKeyChartData(keys);
  const { active, pending, other, total } = countKeysByStatus(keys);

  const pieData = [
    { name: "Ativas", value: active },
    { name: "Pendentes", value: pending },
    { name: "Outras", value: other },
  ].filter((d) => d.value > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-4">
          Chaves Criadas nos Últimos 12 Meses
        </h3>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={lineData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
              <XAxis
                dataKey="month"
                tick={{ fontSize: 11, fill: "#71717a" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#71717a" }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 8,
                  border: "1px solid #e4e4e7",
                  fontSize: 12,
                }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="ativadas"
                name="Ativas"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={{ r: 3, fill: "#0ea5e9" }}
              />
              <Line
                type="monotone"
                dataKey="pendentes"
                name="Pendentes"
                stroke="#8b5cf6"
                strokeWidth={2}
                dot={{ r: 3, fill: "#8b5cf6" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-5 shadow-sm">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-white mb-2">
          Distribuição das Chaves
        </h3>
        <div className="relative h-[220px]">
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="45%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value, name) => [
                    Number(value ?? 0).toLocaleString("pt-BR"),
                    String(name),
                  ]}
                />
                <Legend
                  wrapperStyle={{ fontSize: 11 }}
                  formatter={(value, entry) => {
                    const payload = entry.payload as { value?: number } | undefined;
                    const v = payload?.value ?? 0;
                    const pct = total ? Math.round((Number(v) / total) * 100) : 0;
                    return `${value} (${pct}%)`;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="flex h-full items-center justify-center text-sm text-zinc-400">
              Sem dados
            </p>
          )}
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center pb-8">
            <span className="text-2xl font-bold text-zinc-900 dark:text-white">
              {total.toLocaleString("pt-BR")}
            </span>
            <span className="text-xs text-zinc-500">Total</span>
          </div>
        </div>
      </div>
    </div>
  );
}
