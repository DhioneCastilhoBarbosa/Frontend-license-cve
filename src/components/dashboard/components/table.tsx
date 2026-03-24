import { useEffect, useState } from "react";
import CreateLicenseModal from "./createLicenseModal";
import DeleteLicenseConfirmModal from "./deleteLicenseConfirmModal";
import EditLicenseStatusModal from "./editLicenseStatusModal";
import api from "../../../services/api";
import { ClipboardCopy, Inbox } from "lucide-react";
import { toast } from "sonner";

function isCoringaLicense(status: string) {
  return status.toLowerCase() === "coringa";
}

interface TableProps {
  onRefresh: () => void;
}

export default function Table({ onRefresh }: TableProps) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("Todos");
  const [currentPage, setCurrentPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
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
  const [data, setData] = useState([] as License[]);

  const itemsPerPage = 10;

  type License = {
    id: number;
    nome: string;
    email: string;
    codigo_compra: string;
    codigo: string;
    status: string;
    validade: string;
    created_at: string;
    quantidade: number;
  };

  const getData = async () => {
    try {
      const response = await api.get("/licencas");
      console.log("Licenças recebidas:", response.data);
      setData(response.data);
    } catch (error) {
      console.error("Erro ao buscar licenças:", error);
    } finally {
      onRefresh();
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    const { codigo } = deleteTarget;
    try {
      setDeleteLoading(true);
      await api.delete("/deletar-licenca", { params: { codigo } });
      toast.success("Licença excluída com sucesso.");
      setDeleteTarget(null);
      await getData();
    } catch (error) {
      toast.error("Erro ao excluir licença. Tente novamente.");
      console.error("Erro ao excluir licença:", error);
    } finally {
      setDeleteLoading(false);
    }
  };

  const closeDeleteModal = () => {
    if (deleteLoading) return;
    setDeleteTarget(null);
  };

  const closeEditStatusModal = () => {
    if (statusUpdatingCodigo !== null) return;
    setEditStatusTarget(null);
  };

  const handleConfirmEditStatus = async (status: string) => {
    if (!editStatusTarget) return;
    const { codigo } = editStatusTarget;
    try {
      setStatusUpdatingCodigo(codigo);
      await api.put("/atualizar-licenca", { codigo, status });
      toast.success("Status da licença atualizado.");
      setEditStatusTarget(null);
      await getData();
    } catch (error) {
      toast.error("Erro ao atualizar status. Tente novamente.");
      console.error("Erro ao atualizar licença:", error);
    } finally {
      setStatusUpdatingCodigo(null);
    }
  };

  const actionsDisabled =
    deleteTarget !== null ||
    deleteLoading ||
    editStatusTarget !== null ||
    statusUpdatingCodigo !== null;

  const filtered = data.filter((item) => {
    const searchMatch =
      item.nome.toLowerCase().includes(search.toLowerCase()) ||
      item.codigo_compra.toLowerCase().includes(search.toLowerCase());

    const statusMatch =
      statusFilter === "Todos" ||
      item.status.toLowerCase() === statusFilter.toLowerCase();

    return searchMatch && statusMatch;
  });

  // MAIS RECENTE PRIMEIRO (created_at)
  const sorted = [...filtered].sort((a, b) => {
    const da = new Date(a.created_at).getTime();
    const db = new Date(b.created_at).getTime();
    return db - da;
  });

  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = sorted.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  useEffect(() => {
    setCurrentPage(1);
  }, [search, statusFilter]);

  useEffect(() => {
    getData();
  }, []);

  return (
    <div className="space-y-4">
      {/* Bloco de filtros integrado visualmente com a tabela */}
      <div className="rounded-xl shadow-lg ring-1 ring-slate-200 dark:ring-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 mt-1">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <input
            type="text"
            placeholder="Buscar por nome ou código de compra"
            className="w-full md:w-1/2 px-4 py-2 rounded-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 "
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-1/4 px-4 py-2 rounded-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-gray-800 dark:text-white "
          >
            <option value="Todos">Todos os status</option>
            <option value="Ativada">Ativada</option>
            <option value="Expirada">Expirada</option>
            <option value="Criada">Criada</option>
            <option value="Coringa">Coringa</option>
          </select>
          <button onClick={() => setIsModalOpen(true)}>
            <span className="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition cursor-pointer">
              Criar licença
            </span>
          </button>
        </div>
      </div>

      <CreateLicenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onRefresh={getData}
      />

      <DeleteLicenseConfirmModal
        isOpen={deleteTarget !== null}
        onClose={closeDeleteModal}
        nome={deleteTarget?.nome ?? ""}
        codigo={deleteTarget?.codigo ?? ""}
        loading={deleteLoading}
        onConfirm={handleConfirmDelete}
      />

      <EditLicenseStatusModal
        isOpen={editStatusTarget !== null}
        onClose={closeEditStatusModal}
        nome={editStatusTarget?.nome ?? ""}
        codigo={editStatusTarget?.codigo ?? ""}
        currentStatus={editStatusTarget?.status ?? "Criada"}
        loading={
          editStatusTarget !== null &&
          statusUpdatingCodigo === editStatusTarget.codigo
        }
        onConfirm={handleConfirmEditStatus}
      />

      {/* Tabela */}
      <div className="overflow-x-auto rounded-xl shadow-lg ring-1 ring-slate-200 dark:ring-zinc-700">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700 text-sm">
          <thead className="bg-gray-100 dark:bg-zinc-800">
            <tr>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                Nome
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                Email
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                Código de Compra
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                Licença
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                Status
              </th>

              <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                Validade
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                Data de Compra
              </th>
              <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-700">
            {paginatedData.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {item.nome}
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {item.email}
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {item.codigo_compra}
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300 flex items-center gap-2">
                  {item.codigo}
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(item.codigo);
                    }}
                    title="Copiar código"
                    className="p-1 rounded hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
                  >
                    <ClipboardCopy className="w-4 h-4 text-gray-500 dark:text-gray-300" />
                  </button>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                      item.status === "Ativada"
                        ? "bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300"
                        : item.status === "Expirada"
                          ? "bg-rose-100 text-rose-600 dark:bg-rose-900 dark:text-rose-300"
                          : item.status.toLowerCase() === "coringa"
                            ? "bg-sky-100 text-sky-700 dark:bg-sky-950 dark:text-sky-300"
                            : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>

                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {item.validade}
                </td>
                <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
                  {" "}
                  {new Date(item.created_at).toLocaleDateString("pt-BR")}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-row flex-nowrap items-center gap-2">
                    {isCoringaLicense(item.status) ? (
                      <span
                        className="shrink-0 px-3 py-1.5 rounded-md text-xs font-medium invisible pointer-events-none select-none"
                        aria-hidden
                      >
                        Editar
                      </span>
                    ) : (
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
                        className="shrink-0 px-3 py-1.5 rounded-md bg-sky-500 text-white text-xs font-medium hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                      >
                        Editar
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
                      className="shrink-0 px-3 py-1.5 rounded-md bg-red-600 text-white text-xs font-medium hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                    >
                      Deletar
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={8}
                  className="px-4 py-6 text-center text-gray-500 dark:text-gray-400"
                >
                  <Inbox
                    className="w-16 h-16 mx-auto mb-2 text-gray-400 dark:text-gray-500"
                    strokeWidth={1}
                  />
                  Nenhum resultado encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
        {filtered.length > 0 && (
          <div className="flex justify-center mt-6 mb-2">
            <div className="flex items-center gap-2">
              {/* Botão anterior */}
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="w-8 h-8 flex items-center justify-center rounded-md border dark:border-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                &lt;
              </button>

              {/* Números das páginas */}
              {(() => {
                const maxVisiblePages = 5;
                let start = Math.max(currentPage - 2, 1);
                let end = start + maxVisiblePages - 1;

                if (end > totalPages) {
                  end = totalPages;
                  start = Math.max(end - maxVisiblePages + 1, 1);
                }

                const pageNumbers = [];
                for (let i = start; i <= end; i++) {
                  pageNumbers.push(i);
                }

                return (
                  <>
                    {pageNumbers.map((pageNumber) => (
                      <button
                        key={pageNumber}
                        onClick={() => goToPage(pageNumber)}
                        className={`w-8 h-8 flex items-center justify-center rounded-md border dark:border-zinc-700 ${
                          currentPage === pageNumber
                            ? "bg-sky-100 text-black font-semibold"
                            : "hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 cursor-pointer"
                        }`}
                      >
                        {pageNumber}
                      </button>
                    ))}

                    {totalPages > end && (
                      <button
                        onClick={() => goToPage(totalPages)}
                        className="w-8 h-8 flex items-center justify-center rounded-md border dark:border-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 "
                      >
                        {totalPages}
                      </button>
                    )}
                  </>
                );
              })()}

              {/* Botão próxima */}
              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="w-8 h-8 flex items-center justify-center rounded-md border dark:border-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                &gt;
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
