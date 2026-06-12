import {
  useEffect,
  useMemo,
  useState,
} from "react";
import DeleteUserConfirmModal from "./deleteUserConfirmModal";
import EditUserModal from "./editUserModal";
import api from "../../../services/api";
import type { NivelAcesso, UserRecord } from "../../../types/user";
import { getNameInitials } from "../../../utils/keyStats";
import { getNivelAcessoLabel } from "../../../utils/permissions";
import {
  ChevronLeft,
  ChevronRight,
  Inbox,
  Pencil,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import TableFilterBar, { FilterSelect } from "../../tableFilters/TableFilterBar";

interface TableProps {
  users: UserRecord[];
  onRefresh: () => void;
}

const NIVEL_FILTER_OPTIONS = ["Todos", "pendente", "visualizador", "admin", "superAdmin"];

function NivelBadge({ nivel }: { nivel: string }) {
  const styles =
    nivel === "superAdmin"
      ? "bg-violet-50 text-violet-700 dark:bg-violet-950/50 dark:text-violet-400"
      : nivel === "admin"
        ? "bg-sky-50 text-sky-700 dark:bg-sky-950/50 dark:text-sky-400"
        : nivel === "pendente"
          ? "bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-400"
          : "bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${styles}`}
    >
      {getNivelAcessoLabel(nivel)}
    </span>
  );
}

export default function Table({ users, onRefresh }: TableProps) {
  const [search, setSearch] = useState("");
  const [nivelFilter, setNivelFilter] = useState("Todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [deleteTarget, setDeleteTarget] = useState<UserRecord | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [editTarget, setEditTarget] = useState<UserRecord | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter((item) => {
      const searchMatch =
        !q ||
        item.nome.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q);

      const nivelMatch =
        nivelFilter === "Todos" || item.nivel_acesso === nivelFilter;

      return searchMatch && nivelMatch;
    });
  }, [users, search, nivelFilter]);

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
    if (nivelFilter !== "Todos") {
      chips.push({
        key: "nivel",
        label: getNivelAcessoLabel(nivelFilter),
        onRemove: () => setNivelFilter("Todos"),
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
  }, [nivelFilter, search]);

  const clearAllFilters = () => {
    setSearch("");
    setNivelFilter("Todos");
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      setDeleteLoading(true);
      await api.delete(`/usuarios/${deleteTarget.id}`);
      toast.success("Usuário excluído com sucesso.");
      setDeleteTarget(null);
      onRefresh();
    } catch {
      toast.error("Erro ao excluir usuário. Tente novamente.");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleConfirmEdit = async (data: {
    id: number;
    nome: string;
    email: string;
    nivel_acesso: NivelAcesso;
  }) => {
    try {
      setEditLoading(true);
      await api.put(`/usuarios/${data.id}`, {
        nome: data.nome,
        email: data.email,
        nivel_acesso: data.nivel_acesso,
      });
      toast.success("Usuário atualizado com sucesso.");
      setEditTarget(null);
      onRefresh();
    } catch {
      toast.error("Erro ao atualizar usuário. Tente novamente.");
    } finally {
      setEditLoading(false);
    }
  };

  const actionsDisabled =
    deleteTarget !== null ||
    deleteLoading ||
    editTarget !== null ||
    editLoading;

  useEffect(() => {
    setCurrentPage(1);
  }, [search, nivelFilter, itemsPerPage]);

  return (
    <div className="space-y-4">
      <TableFilterBar
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder="Buscar nome ou e-mail..."
        activeChips={activeChips}
        onClearAll={clearAllFilters}
      >
        <FilterSelect
          value={nivelFilter}
          onChange={setNivelFilter}
          aria-label="Nível de acesso"
          options={NIVEL_FILTER_OPTIONS.map((n) => ({
            value: n,
            label: n === "Todos" ? "Nível" : getNivelAcessoLabel(n),
          }))}
        />
      </TableFilterBar>

      <DeleteUserConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => !deleteLoading && setDeleteTarget(null)}
        nome={deleteTarget?.nome ?? ""}
        email={deleteTarget?.email ?? ""}
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
      />
      <EditUserModal
        isOpen={editTarget !== null}
        onClose={() => !editLoading && setEditTarget(null)}
        user={editTarget}
        loading={editLoading}
        onConfirm={handleConfirmEdit}
      />

      <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 z-10 bg-zinc-50 dark:bg-zinc-800/80 border-b border-zinc-200 dark:border-zinc-700">
              <tr>
                {[
                  "Nome",
                  "Email",
                  "Nível de Acesso",
                  "Data de Cadastro",
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
                    <div className="flex items-center gap-2.5 min-w-[140px]">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-100 dark:bg-sky-950/50 text-xs font-semibold text-sky-700 dark:text-sky-400">
                        {getNameInitials(item.nome)}
                      </span>
                      <span className="text-zinc-700 dark:text-zinc-300 truncate">
                        {item.nome}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 truncate max-w-[240px]">
                    {item.email}
                  </td>
                  <td className="px-4 py-3">
                    <NivelBadge nivel={item.nivel_acesso} />
                  </td>
                  <td className="px-4 py-3 text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                    {new Date(item.created_at).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "2-digit",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditTarget(item)}
                        disabled={actionsDisabled}
                        className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-50 cursor-pointer"
                        title="Editar"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(item)}
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
                  <td colSpan={5} className="px-4 py-16 text-center text-zinc-400">
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
}
