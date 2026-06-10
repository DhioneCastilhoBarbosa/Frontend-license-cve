import type { CSSProperties, ReactNode } from "react";
import {
  Activity,
  BadgeCheck,
  FileText,
  Info,
  KeySquare,
  ShoppingCart,
  User,
  XCircle,
} from "lucide-react";
import {
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  XAxis,
  YAxis,
} from "recharts";
import type { LicenseReportData } from "../../../types/licenseReport";
import {
  formatNumberBr,
  getChartMonthlyData,
} from "../../../utils/buildLicenseReportData";
import {
  REPORT_HEIGHT_PX,
  REPORT_WIDTH_PX,
} from "../../../utils/exportLicenseReportPdf";

interface LicenseReportDocumentProps {
  data: LicenseReportData;
}

const USAGE_COLORS = ["#16a34a", "#cbd5e1"];

const sectionTitle: CSSProperties = {
  marginBottom: 8,
  fontSize: 12,
  fontWeight: 700,
  textTransform: "uppercase",
  color: "#334155",
};

const tableCell: CSSProperties = {
  padding: "9px 12px",
  lineHeight: "18px",
  fontSize: 11,
  verticalAlign: "middle",
};

function SummaryCard({
  icon,
  iconBg,
  label,
  value,
  subtitle,
  valueColor,
}: {
  icon: ReactNode;
  iconBg: string;
  label: string;
  value: string;
  subtitle?: string;
  valueColor: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        height: "100%",
        borderRadius: 10,
        border: "1px solid #e2e8f0",
        backgroundColor: "#ffffff",
        padding: "12px 14px",
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.05)",
      }}
    >
      <div
        style={{
          display: "flex",
          width: 40,
          height: 40,
          flexShrink: 0,
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "50%",
          backgroundColor: iconBg,
        }}
      >
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 10,
            fontWeight: 600,
            textTransform: "uppercase",
            color: "#64748b",
            margin: "0 0 4px 0",
            lineHeight: "14px",
          }}
        >
          {label}
        </p>
        <p
          style={{
            fontSize: 22,
            fontWeight: 700,
            lineHeight: "28px",
            color: valueColor,
            margin: "0 0 2px 0",
          }}
        >
          {value}
        </p>
        {subtitle && (
          <p style={{ fontSize: 10, color: "#64748b", margin: 0, lineHeight: "14px" }}>
            {subtitle}
          </p>
        )}
      </div>
    </div>
  );
}

export default function LicenseReportDocument({
  data,
}: LicenseReportDocumentProps) {
  const chartData = getChartMonthlyData(data);

  const usageChartData = [
    { name: "Em Uso", value: data.usageRate.active },
    { name: "Não em Uso", value: data.usageRate.inactive },
  ].filter((item) => item.value > 0);

  const monthlyTotals = data.monthlySales.reduce(
    (acc, row) => ({
      store: acc.store + row.storeSales,
      manual: acc.manual + row.manualSales,
      total: acc.total + row.total,
    }),
    { store: 0, manual: 0, total: 0 }
  );

  return (
    <div
      className="license-report"
      style={{
        width: `${REPORT_WIDTH_PX}px`,
        height: `${REPORT_HEIGHT_PX}px`,
        padding: "24px 28px 20px",
        boxSizing: "border-box",
        backgroundColor: "#ffffff",
        color: "#1e293b",
        fontFamily: "Roboto, Arial, sans-serif",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <header
        style={{
          flexShrink: 0,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          borderBottom: "1px solid #e2e8f0",
          paddingBottom: 14,
          marginBottom: 16,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              display: "flex",
              width: 44,
              height: 44,
              alignItems: "center",
              justifyContent: "center",
              borderRadius: 10,
              backgroundColor: "#e0f2fe",
            }}
          >
            <KeySquare size={26} color="#0284c7" strokeWidth={2} />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, color: "#0f172a", margin: 0 }}>
              License
            </h1>
            <p style={{ fontSize: 11, color: "#64748b", margin: 0 }}>
              Plataforma de Licenciamento de Software
            </p>
          </div>
        </div>
        <div style={{ textAlign: "right", minWidth: 260, flexShrink: 0 }}>
          <h2
            style={{
              fontSize: 16,
              fontWeight: 700,
              textTransform: "uppercase",
              color: "#0f172a",
              margin: 0,
              lineHeight: "22px",
            }}
          >
            Relatório de Licenças
          </h2>
          <p style={{ marginTop: 6, fontSize: 11, color: "#64748b", lineHeight: "16px" }}>
            Período: {data.period.label}
          </p>
          <p style={{ marginTop: 2, fontSize: 11, color: "#64748b", lineHeight: "16px" }}>
            Gerado em: {data.generatedAt}
          </p>
        </div>
      </header>

      <section style={{ flexShrink: 0, marginBottom: 14 }}>
        <h3 style={sectionTitle}>Resumo Geral</h3>
        <div style={{ display: "flex", gap: 10, height: 78 }}>
          <div style={{ flex: 1 }}>
            <SummaryCard
              icon={<FileText size={18} color="#2563eb" />}
              iconBg="#dbeafe"
              label="Total de Licenças"
              value={formatNumberBr(data.summary.total)}
              subtitle="100% do total"
              valueColor="#2563eb"
            />
          </div>
          <div style={{ flex: 1 }}>
            <SummaryCard
              icon={<XCircle size={18} color="#dc2626" />}
              iconBg="#fee2e2"
              label="Licenças Expiradas"
              value={formatNumberBr(data.summary.expired)}
              subtitle={`${data.summary.expiredPercent}% do total`}
              valueColor="#dc2626"
            />
          </div>
          <div style={{ flex: 1 }}>
            <SummaryCard
              icon={<BadgeCheck size={18} color="#16a34a" />}
              iconBg="#dcfce7"
              label="Licenças Ativadas"
              value={formatNumberBr(data.summary.active)}
              subtitle={`${data.summary.activePercent}% do total`}
              valueColor="#16a34a"
            />
          </div>
        </div>
      </section>

      <section style={{ flexShrink: 0, marginBottom: 14 }}>
        <h3 style={sectionTitle}>Resumo de Vendas</h3>
        <div style={{ display: "flex", gap: 10, height: 78 }}>
          <div style={{ flex: 1 }}>
            <SummaryCard
              icon={<ShoppingCart size={18} color="#2563eb" />}
              iconBg="#dbeafe"
              label="Vendas pela Loja Online"
              value={formatNumberBr(data.sales.store)}
              subtitle={`${data.sales.storePercent}% do total`}
              valueColor="#2563eb"
            />
          </div>
          <div style={{ flex: 1 }}>
            <SummaryCard
              icon={<User size={18} color="#7c3aed" />}
              iconBg="#ede9fe"
              label="Vendas Manuais"
              value={formatNumberBr(data.sales.manual)}
              subtitle={`${data.sales.manualPercent}% do total`}
              valueColor="#7c3aed"
            />
          </div>
        </div>
      </section>

      <section
        style={{
          flexShrink: 0,
          height: 230,
          marginBottom: 14,
          borderRadius: 10,
          border: "1px solid #e2e8f0",
          padding: "12px 14px 6px",
        }}
      >
        <h3 style={sectionTitle}>Vendas de Licenças ao Longo do Período</h3>
        <LineChart
          width={730}
          height={185}
          data={chartData}
          margin={{ top: 10, right: 16, left: -12, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
          <XAxis
            dataKey="month"
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={{ stroke: "#cbd5e1" }}
            tickLine={false}
            interval={0}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#64748b" }}
            axisLine={false}
            tickLine={false}
            width={36}
            allowDecimals={false}
          />
          <Legend wrapperStyle={{ fontSize: 10, paddingTop: 4 }} iconSize={8} />
          <Line
            type="monotone"
            dataKey="loja"
            name="Loja Online"
            stroke="#2563eb"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#2563eb", strokeWidth: 0 }}
          />
          <Line
            type="monotone"
            dataKey="manual"
            name="Manuais"
            stroke="#7c3aed"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#7c3aed", strokeWidth: 0 }}
          />
        </LineChart>
      </section>

      <div
        style={{
          flex: 1,
          display: "flex",
          gap: 14,
          minHeight: 0,
          marginBottom: 12,
        }}
      >
        <section
          style={{
            width: "36%",
            flexShrink: 0,
            display: "flex",
            flexDirection: "column",
            borderRadius: 10,
            border: "1px solid #e2e8f0",
            padding: "12px 14px",
          }}
        >
          <h3 style={{ ...sectionTitle, marginBottom: 6 }}>Taxa de Licença em Uso</h3>
          {data.usageRate.total > 0 ? (
            <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
              <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <PieChart width={240} height={150}>
                  <Pie
                    data={usageChartData}
                    cx={120}
                    cy={72}
                    innerRadius={42}
                    outerRadius={62}
                    paddingAngle={2}
                    dataKey="value"
                    startAngle={90}
                    endAngle={-270}
                  >
                    {usageChartData.map((_, index) => (
                      <Cell
                        key={`usage-${index}`}
                        fill={USAGE_COLORS[index % USAGE_COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 9 }} iconSize={8} />
                </PieChart>
              </div>
              <div style={{ textAlign: "center", marginBottom: 10 }}>
                <Activity size={14} color="#16a34a" />
                <p
                  style={{
                    fontSize: 24,
                    fontWeight: 700,
                    color: "#16a34a",
                    margin: "4px 0 0",
                    lineHeight: "30px",
                  }}
                >
                  {data.usageRate.usagePercent}%
                </p>
                <p style={{ fontSize: 10, color: "#64748b", margin: 0 }}>em uso</p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div
                  style={{
                    flex: 1,
                    textAlign: "center",
                    borderRadius: 8,
                    backgroundColor: "#f0fdf4",
                    padding: "8px 10px",
                  }}
                >
                  <p style={{ color: "#64748b", margin: 0, fontSize: 10 }}>Ativadas</p>
                  <p style={{ fontWeight: 700, color: "#16a34a", margin: 0, fontSize: 12 }}>
                    {formatNumberBr(data.usageRate.active)}
                  </p>
                </div>
                <div
                  style={{
                    flex: 1,
                    textAlign: "center",
                    borderRadius: 8,
                    backgroundColor: "#f8fafc",
                    padding: "8px 10px",
                  }}
                >
                  <p style={{ color: "#64748b", margin: 0, fontSize: 10 }}>Total</p>
                  <p style={{ fontWeight: 700, color: "#334155", margin: 0, fontSize: 12 }}>
                    {formatNumberBr(data.usageRate.total)}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", margin: "auto" }}>
              Sem dados
            </p>
          )}
        </section>

        <section
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            borderRadius: 10,
            border: "1px solid #e2e8f0",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: "10px 14px", borderBottom: "1px solid #e2e8f0", flexShrink: 0 }}>
            <h3 style={{ ...sectionTitle, marginBottom: 0 }}>
              Detalhamento Mensal de Vendas
            </h3>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", flex: 1 }}>
            <thead>
              <tr style={{ backgroundColor: "#0369a1", color: "#ffffff" }}>
                <th style={{ ...tableCell, textAlign: "left", fontWeight: 600 }}>Mês</th>
                <th style={{ ...tableCell, textAlign: "right", fontWeight: 600 }}>Loja</th>
                <th style={{ ...tableCell, textAlign: "right", fontWeight: 600 }}>Manuais</th>
                <th style={{ ...tableCell, textAlign: "right", fontWeight: 600 }}>Total</th>
              </tr>
            </thead>
            <tbody>
              {data.monthlySales.map((row, index) => (
                <tr
                  key={row.monthKey}
                  style={{ backgroundColor: index % 2 === 0 ? "#ffffff" : "#f8fafc" }}
                >
                  <td style={{ ...tableCell, color: "#334155" }}>{row.month}</td>
                  <td style={{ ...tableCell, textAlign: "right", color: "#2563eb" }}>
                    {formatNumberBr(row.storeSales)}
                  </td>
                  <td style={{ ...tableCell, textAlign: "right", color: "#7c3aed" }}>
                    {formatNumberBr(row.manualSales)}
                  </td>
                  <td
                    style={{
                      ...tableCell,
                      textAlign: "right",
                      color: "#1e293b",
                      fontWeight: 600,
                    }}
                  >
                    {formatNumberBr(row.total)}
                  </td>
                </tr>
              ))}
              <tr style={{ backgroundColor: "#e0f2fe", fontWeight: 700 }}>
                <td style={{ ...tableCell, color: "#1e293b" }}>TOTAL</td>
                <td style={{ ...tableCell, textAlign: "right", color: "#1d4ed8" }}>
                  {formatNumberBr(monthlyTotals.store)}
                </td>
                <td style={{ ...tableCell, textAlign: "right", color: "#6d28d9" }}>
                  {formatNumberBr(monthlyTotals.manual)}
                </td>
                <td style={{ ...tableCell, textAlign: "right", color: "#0f172a" }}>
                  {formatNumberBr(monthlyTotals.total)}
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      </div>

      <footer
        style={{
          flexShrink: 0,
          marginTop: "auto",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderTop: "1px solid #e2e8f0",
          paddingTop: 12,
          fontSize: 9,
          color: "#64748b",
        }}
      >
        <div style={{ display: "flex", alignItems: "flex-start", gap: 6, maxWidth: "78%" }}>
          <Info size={12} color="#94a3b8" style={{ flexShrink: 0, marginTop: 1 }} />
          <p style={{ margin: 0, lineHeight: "14px" }}>
            Dados referentes às licenças registradas no período selecionado. Relatório
            gerado automaticamente pela plataforma de licenciamento.
          </p>
        </div>
        <span style={{ flexShrink: 0 }}>Página 1 de 1</span>
      </footer>
    </div>
  );
}
