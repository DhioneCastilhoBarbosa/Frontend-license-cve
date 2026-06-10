import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import CreateLicenseModal from "./createLicenseModal";
import DeleteLicenseConfirmModal from "./deleteLicenseConfirmModal";
import EditLicenseStatusModal from "./editLicenseStatusModal";
import LicenseReportModal from "./LicenseReportModal";
import api from "../../../services/api";
import type { LicenseRecord, LicenseReportData } from "../../../types/licenseReport";
import { buildLicenseReportData } from "../../../utils/buildLicenseReportData";
import {
  isStorePurchaseCode,
  isWithinDateRange,
} from "../../../utils/licenseFilters";
import { getEmailInitials, isWithinPeriodPreset } from "../../../utils/licenseStats";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardCopy,
  Inbox,
  Pencil,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

function isCoringaLicense(status: string) {
  return status.toLowerCase() === "coringa";
}

export interface TableHandle {
  openReport: () => void;
  openCreateModal: () => void;
}

interface TableProps {
  licenses: LicenseRecord[];
  onRefresh: () => void;
}

const STATUS_OPTIONS = ["Todos", "Ativada", "Expirada", "Criada", "Coringa"];
const ORIGIN_OPTIONS = [
  { value: "Todos", label: "Todas as origens" },
  { value: "Loja", label: "Loja Online" },
  { value: "Criado manual", label: "Manual" },
];
const PERIOD_OPTIONS = [
  { value: "all", label: "Todo o período" },
  { value: "7d", label: "Últimos 7 dias" },
  { value: "30d", label: "Últimos 30 dias" },
  { value: "90d", label: "Últimos 90 dias" },
];

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "Ativada"
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
      : status === "Expirada"
        ? "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400"
        : status.toLowerCase() === "coringa"
          ? "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400"
          : "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles}`}
    >
      {status === "Ativada" ? "Ativa" : status}
    </span>
  );
}

function OriginBadge({ codigoCompra }: { codigoCompra: string }) {
  const isStore = isStorePurchaseCode(codigoCompra);
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
        isStore
          ? "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400"
          : "bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400"
      }`}
    >
      {isStore ? "Loja Online" : "Manual"}
    </span>
  );
}

const Table = forwardRef<TableHandle, TableProps>(function Table(
  { licenses, onRefresh },
  ref
) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [originFilter, setOriginFilter] = useState("Todos");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportData, setReportData] = useState<LicenseReportData | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{
    codigo: string;
    nome: string;
  } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editStatusTarget, setEditStatusTarget] = useState<{
    codigo: string;
    nome: string;
    status: string;
  } | null>(null);
  const [statusUpdatingCodigo, setStatusUpdatingCodigo] = useState<string | null>(
    null
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return licenses.filter((item) => {
      const searchMatch =
        !q ||
        item.nome.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.codigo_compra.toLowerCase().includes(q) ||
        item.codigo.toLowerCase().includes(q);

      const statusMatch =
        statusFilter === "Todos" ||
        item.status.toLowerCase() === statusFilter.toLowerCase();

      const originMatch =
        originFilter === "Todos" ||
        (originFilter === "Loja" && isStorePurchaseCode(item.codigo_compra)) ||
        (originFilter === "Criado manual" &&
          !isStorePurchaseCode(item.codigo_compra));

      const periodMatch = isWithinPeriodPreset(item.created_at, periodFilter);
      const dateMatch = isWithinDateRange(item.created_at, dateFrom, dateTo);

      return searchMatch && statusMatch && originMatch && periodMatch && dateMatch;
    });
  }, [
    licenses,
    search,
    statusFilter,
    originFilter,
    periodFilter,
    dateFrom,
    dateTo,
  ]);

  const sorted = useMemo(() => {
    return [...filtered].sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [filtered]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / itemsPerPage));
  const paginatedData = sorted.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const activeChips = useMemo(() => {
    const chips: { key: string; label: string; onRemove: () => void }[] = [];
    if (statusFilter !== "Todos") {
      chips.push({
        key: "status",
        label: statusFilter === "Ativada" ? "Ativas" : statusFilter,
        onRemove: () => setStatusFilter("Todos"),
      });
    }
    if (originFilter !== "Todos") {
      chips.push({
        key: "origin",
        label: originFilter === "Loja" ? "Loja Online" : "Manual",
        onRemove: () => setOriginFilter("Todos"),
      });
    }
    if (periodFilter !== "all") {
      const label =
        PERIOD_OPTIONS.find((p) => p.value === periodFilter)?.label ?? periodFilter;
      chips.push({
        key: "period",
        label,
        onRemove: () => setPeriodFilter("all"),
      });
    }
    if (dateFrom || dateTo) {
      chips.push({
        key: "dates",
        label: `${dateFrom || "..."} — ${dateTo || "..."}`,
        onRemove: () => {
          setDateFrom("");
          setDateTo("");
        },
      });
    }
    if (search) {
      chips.push({
        key: "search",
        label: `"${search}"`,
        onRemove: () => setSearch(""),
      });
    }
    return chips;
  }, [statusFilter, originFilter, periodFilter, dateFrom, dateTo, search]);

  const clearAllFilters = () => {
    setSearch("");
    setStatusFilter("Todos");
    setOriginFilter("Todos");
    setPeriodFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  const openReport = () => {
    if (sorted.length === 0) {
      toast.error("Nenhuma licença para gerar relatório com os filtros atuais.");
      return;
    }
    setReportData(buildLicenseReportData(sorted, { dateFrom, dateTo }));
    setIsReportOpen(true);
  };

  useImperativeHandle(ref, () => ({
    openReport,
    openCreateModal: () => setIsModalOpen(true),
  }));

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await api.delete("/deletar-licenca", { params: { codigo: deleteTarget.codigo } });
      toast.success("Licença excluída com sucesso.");
      setDeleteTarget(null);
      onRefresh();
    } catch {
      toast.error("Erro ao excluir licença. Tente novamente.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleConfirmEditStatus = async (status: string) => {
    if (!editStatusTarget) return;
    try {
      setStatusUpdatingCodigo(editStatusTarget.codigo);
      await api.put("/atualizar-licenca", {
        codigo: editStatusTarget.codigo,
        status,
      });
      toast.success("Status da licença atualizado.");
      setEditStatusTarget(null);
      onRefresh();
    } catch {
      toast.error("Erro ao atualizar status. Tente novamente.");
    } finally {
      setStatusUpdatingCodigo(null);
    }
  };

  const actionsDisabled =
    deleteTarget !== null ||
    deleteLoading ||
    editStatusTarget !== null ||
    statusUpdatingCodigo !== null;

  useEffect(() => setCurrentPage(1), [search, statusFilter, originFilter, periodFilter, dateFrom, dateTo, itemsPerPage]);

  const selectClass =
    "rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-sky-500/30";

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm space-y-3">
        <div className="flex flex-col xl:flex-row gap-3">
          <div className="relative flex-1">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              type="text"
              placeholder="Buscar por nome, e-mail, código ou licença..."
              className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/50 pl-9 pr-4 py-2.5 text-sm text-zinc-800 dark:text-zinc-200 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-sky-500/30"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={selectClass}
              aria-label="Status"
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s} value={s}>
                  {s === "Todos" ? "Status" : s}
                </option>
              ))}
            </select>
            <select
              value={originFilter}
              onChange={(e) => setOriginFilter(e.target.value)}
              className={selectClass}
              aria-label="Origem"
            >
              {ORIGIN_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <select
              value={periodFilter}
              onChange={(e) => setPeriodFilter(e.target.value)}
              className={selectClass}
              aria-label="Período"
            >
              {PERIOD_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className={`${selectClass} w-auto`}
            aria-label="Data inicial"
          />
          <input
            type="date"
            value={dateTo}
            min={dateFrom || undefined}
            onChange={(e) => setDateTo(e.target.value)}
            className={`${selectClass} w-auto`}
            aria-label="Data final"
          />
          {activeChips.length > 0 && (
            <button
              type="button"
              onClick={clearAllFilters}
              className="text-xs font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 cursor-pointer ml-auto"
            >
              Limpar todos
            </button>
          )}
        </div>

        {activeChips.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {activeChips.map((chip) => (
              <button
                key={chip.key}
                type="button"
                onClick={chip.onRemove}
                className="inline-flex items-center gap-1 rounded-full bg-sky-50 dark:bg-sky-950/40 px-2.5 py-1 text-xs font-medium text-sky-700 dark:text-sky-400 hover:bg-sky-100 dark:hover:bg-sky-950/60 cursor-pointer"
              >
                {chip.label}
                <X size={12} />
              </button>
            ))}
          </div>
        )}
      </div>

      <LicenseReportModal
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        reportData={reportData}
      />
      <CreateLicenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={onRefresh}
      />
      <DeleteLicenseConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => !deleteLoading && setDeleteTarget(null)}
        nome={deleteTarget?.nome ?? ""}
        codigo={deleteTarget?.codigo ?? ""}
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
      />
      <EditLicenseStatusModal
        isOpen={editStatusTarget !== null}
        onClose={() => statusUpdatingCodigo === null && setEditStatusTarget(null)}
        nome={editStatusTarget?.nome ?? ""}
        codigo={editStatusTarget?.codigo ?? ""}
        currentStatus={editStatusTarget?.status ?? "Criada"}
        loading={
          editStatusTarget !== null &&
          statusUpdatingCodigo === editStatusTarget.codigo
        }
        onConfirm={handleConfirmEditStatus}
      />

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-zinc-50 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-700">
              <tr>
                {[
                  "Email",
                  "Código de Compra",
                  "Licença",
                  "Status",
                  "Validade",
                  "Data de Compra",
                  "Origem",
                  "Ações",
                ].map((col) => (
                  <th
                    key={col}
                    className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400 whitespace-nowrap"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {paginatedData.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5 min-w-[180px]">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-950/50 text-xs font-semibold text-sky-700 dark:text-sky-400">
                        {getEmailInitials(item.email)}
                      </span>
                      <span className="text-zinc-700 dark:text-zinc-300 truncate">
                        {item.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                    {item.codigo_compra}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                      <span className="font-mono text-xs">{item.codigo}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(item.codigo);
                          toast.success("Código copiado.");
                        }}
                        className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                        title="Copiar"
                      >
                        <ClipboardCopy size={14} className="text-zinc-400" />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                    {item.validade}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                    {new Date(item.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3">
                    <OriginBadge codigoCompra={item.codigo_compra} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      {!isCoringaLicense(item.status) && (
                        <button
                          type="button"
                          onClick={() =>
                            setEditStatusTarget({
                              codigo: item.codigo,
                              nome: item.nome,
                              status: item.status,
                            })
                          }
                          disabled={actionsDisabled}
                          className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 cursor-pointer"
                          title="Editar"
                        >
                          <Pencil size={15} />
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() =>
                          setDeleteTarget({
                            codigo: item.codigo,
                            nome: item.nome,
                          })
                        }
                        disabled={actionsDisabled}
                        className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-50 cursor-pointer"
                        title="Excluir"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-16 text-center text-zinc-400">
                    <Inbox className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    Nenhum resultado encontrado
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {filtered.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 text-sm text-zinc-500">
              <span>Resultados por página:</span>
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
                className="rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-2 py-1 text-sm cursor-pointer"
              >
                {[10, 25, 50].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
              <span className="hidden sm:inline">
                · {filtered.length} resultado(s)
              </span>
            </div>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 cursor-pointer"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let page: number;
                if (totalPages <= 5) page = i + 1;
                else if (currentPage <= 3) page = i + 1;
                else if (currentPage >= totalPages - 2) page = totalPages - 4 + i;
                else page = currentPage - 2 + i;
                return (
                  <button
                    key={page}
                    type="button"
                    onClick={() => setCurrentPage(page)}
                    className={`min-w-[36px] h-9 rounded-lg text-sm font-medium cursor-pointer ${
                      currentPage === page
                        ? "bg-sky-500 text-white"
                        : "border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}
              {totalPages > 5 && currentPage < totalPages - 2 && (
                <>
                  <span className="px-1 text-zinc-400">…</span>
                  <button
                    type="button"
                    onClick={() => setCurrentPage(totalPages)}
                    className="min-w-[36px] h-9 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm hover:bg-zinc-50 dark:hover:bg-zinc-800 cursor-pointer"
                  >
                    {totalPages}
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 disabled:opacity-40 cursor-pointer"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default Table;
