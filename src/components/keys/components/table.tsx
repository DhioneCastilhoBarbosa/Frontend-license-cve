import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useState,
} from "react";
import CreateLicenseModal from "./createkeyModal";
import DeleteKeyConfirmModal from "./deleteKeyConfirmModal";
import EditKeyStatusModal from "./editKeyStatusModal";
import api from "../../../services/api";
import type { KeyRecord } from "../../../types/key";
import { isWithinDateRange, getNameInitials } from "../../../utils/keyStats";
import { isWithinPeriodPreset } from "../../../utils/licenseStats";
import {
  ChevronLeft,
  ChevronRight,
  ClipboardCopy,
  Eye,
  EyeOff,
  Inbox,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import TableFilterBar, { FilterDate, FilterSelect } from "../../tableFilters/TableFilterBar";

export interface TableHandle {
  openCreateModal: () => void;
}

interface TableProps {
  keys: KeyRecord[];
  canWrite?: boolean;
  onRefresh: () => void;
}

const STATUS_OPTIONS = ["Todos", "Ativada", "Criada", "Expirada"];
const PERIOD_OPTIONS = [
  { value: "all", label: "Período" },
  { value: "7d", label: "7 dias" },
  { value: "30d", label: "30 dias" },
  { value: "90d", label: "90 dias" },
];

function StatusBadge({ status }: { status: string }) {
  const styles =
    status === "Ativada"
      ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
      : status === "Expirada"
        ? "bg-red-50 text-red-600 dark:bg-red-950/50 dark:text-red-400"
        : "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles}`}
    >
      {status === "Ativada" ? "Ativa" : status}
    </span>
  );
}

const Table = forwardRef<TableHandle, TableProps>(function Table(
  { keys, canWrite = true, onRefresh },
  ref
) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [periodFilter, setPeriodFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    chave: string;
    nome: string;
  } | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editStatusTarget, setEditStatusTarget] = useState<{
    chave: string;
    nome: string;
    status: string;
  } | null>(null);
  const [statusUpdatingChave, setStatusUpdatingChave] = useState<string | null>(
    null
  );
  const [showCPF, setShowCPF] = useState<Record<number, boolean>>({});

  const toggleCPF = (id: number) => {
    setShowCPF((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const maskCPF = (cpf: string) =>
    cpf.replace(/^(\d{3})\d{6}(\d{2})$/, "$1.***.***-$2");

  const formatCPF = (cpf: string) =>
    cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return keys.filter((item) => {
      const searchMatch =
        !q ||
        item.nome.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.cpf.toLowerCase().includes(q) ||
        item.chave.toLowerCase().includes(q);

      const statusMatch =
        statusFilter === "Todos" ||
        item.status.toLowerCase() === statusFilter.toLowerCase();

      const periodMatch = isWithinPeriodPreset(item.created_at, periodFilter);
      const dateMatch = isWithinDateRange(item.created_at, dateFrom, dateTo);

      return searchMatch && statusMatch && periodMatch && dateMatch;
    });
  }, [keys, search, statusFilter, periodFilter, dateFrom, dateTo]);

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
  }, [statusFilter, periodFilter, dateFrom, dateTo, search]);

  const clearAllFilters = () => {
    setSearch("");
    setStatusFilter("Todos");
    setPeriodFilter("all");
    setDateFrom("");
    setDateTo("");
  };

  useImperativeHandle(ref, () => ({
    openCreateModal: () => {
      if (canWrite) setIsModalOpen(true);
    },
  }));

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await api.delete("/deletar-chave", {
        params: { chave: deleteTarget.chave },
      });
      toast.success("Chave excluída com sucesso.");
      setDeleteTarget(null);
      onRefresh();
    } catch {
      toast.error("Erro ao excluir chave. Tente novamente.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleConfirmEditStatus = async (status: string) => {
    if (!editStatusTarget) return;
    try {
      setStatusUpdatingChave(editStatusTarget.chave);
      await api.put("/atualizar-status-chave", {
        chave: editStatusTarget.chave,
        status,
      });
      toast.success("Status da chave atualizado.");
      setEditStatusTarget(null);
      onRefresh();
    } catch {
      toast.error("Erro ao atualizar status. Tente novamente.");
    } finally {
      setStatusUpdatingChave(null);
    }
  };

  const actionsDisabled =
    deleteTarget !== null ||
    deleteLoading ||
    editStatusTarget !== null ||
    statusUpdatingChave !== null;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter, periodFilter, dateFrom, dateTo, itemsPerPage]);

  return (
    <div className="space-y-4">
      <TableFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar nome, e-mail, CPF..."
        activeChips={activeChips}
        onClearAll={clearAllFilters}
      >
        <FilterSelect
          value={statusFilter}
          onChange={setStatusFilter}
          aria-label="Status"
          options={STATUS_OPTIONS.map((s) => ({
            value: s,
            label: s === "Todos" ? "Status" : s === "Ativada" ? "Ativa" : s,
          }))}
        />
        <FilterSelect
          value={periodFilter}
          onChange={setPeriodFilter}
          aria-label="Período"
          options={PERIOD_OPTIONS}
        />
        <FilterDate
          label="De"
          value={dateFrom}
          onChange={setDateFrom}
          aria-label="Data inicial"
        />
        <FilterDate
          label="Até"
          value={dateTo}
          onChange={setDateTo}
          min={dateFrom || undefined}
          aria-label="Data final"
        />
      </TableFilterBar>

      {canWrite && (
        <CreateLicenseModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onRefresh={onRefresh}
        />
      )}
      <DeleteKeyConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => !deleteLoading && setDeleteTarget(null)}
        nome={deleteTarget?.nome ?? ""}
        chave={deleteTarget?.chave ?? ""}
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
      />
      <EditKeyStatusModal
        isOpen={editStatusTarget !== null}
        onClose={() => statusUpdatingChave === null && setEditStatusTarget(null)}
        nome={editStatusTarget?.nome ?? ""}
        chave={editStatusTarget?.chave ?? ""}
        currentStatus={editStatusTarget?.status ?? "Criada"}
        loading={
          editStatusTarget !== null &&
          statusUpdatingChave === editStatusTarget.chave
        }
        onConfirm={handleConfirmEditStatus}
      />

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-zinc-50 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-700">
              <tr>
                {[
                  "Nome",
                  "Email",
                  "CPF",
                  "Chave de Acesso",
                  "Status",
                  "Data de Criação",
                  ...(canWrite ? ["Ações"] : []),
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
                    <div className="flex items-center gap-2.5 min-w-[140px]">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-950/50 text-xs font-semibold text-sky-700 dark:text-sky-400">
                        {getNameInitials(item.nome)}
                      </span>
                      <span className="text-zinc-700 dark:text-zinc-300 truncate">
                        {item.nome}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 truncate max-w-[200px]">
                    {item.email}
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      {showCPF[item.id] ? formatCPF(item.cpf) : maskCPF(item.cpf)}
                      <button
                        type="button"
                        onClick={() => toggleCPF(item.id)}
                        title={showCPF[item.id] ? "Ocultar CPF" : "Mostrar CPF"}
                        className="p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
                      >
                        {showCPF[item.id] ? (
                          <EyeOff size={14} className="text-zinc-400" />
                        ) : (
                          <Eye size={14} className="text-zinc-400" />
                        )}
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                      <span className="font-mono text-xs">{item.chave}</span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(item.chave);
                          toast.success("Chave copiada.");
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
                    {new Date(item.created_at).toLocaleDateString("pt-BR")}
                  </td>
                  {canWrite && (
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setEditStatusTarget({
                              chave: item.chave,
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
                        <button
                          type="button"
                          onClick={() =>
                            setDeleteTarget({
                              chave: item.chave,
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
                  )}
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={canWrite ? 7 : 6} className="px-4 py-16 text-center text-zinc-400">
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
