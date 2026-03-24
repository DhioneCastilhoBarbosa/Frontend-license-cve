import { Dialog } from "@headlessui/react";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";

const EDITABLE_STATUSES = ["Ativada", "Criada", "Expirada"] as const;

function normalizeStatus(status: string): (typeof EDITABLE_STATUSES)[number] {
  const s = status.toLowerCase();
  if (s === "ativada") return "Ativada";
  if (s === "expirada") return "Expirada";
  if (s === "criada") return "Criada";
  return "Criada";
}

interface EditLicenseStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  nome: string;
  codigo: string;
  currentStatus: string;
  loading: boolean;
  onConfirm: (status: string) => void | Promise<void>;
}

export default function EditLicenseStatusModal({
  isOpen,
  onClose,
  nome,
  codigo,
  currentStatus,
  loading,
  onConfirm,
}: EditLicenseStatusModalProps) {
  const [status, setStatus] = useState(() => normalizeStatus(currentStatus));

  useEffect(() => {
    if (isOpen) setStatus(normalizeStatus(currentStatus));
  }, [isOpen, currentStatus]);

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      className="fixed z-[60] inset-0 overflow-y-auto"
    >
      <div className="flex items-center justify-center min-h-screen px-4">
        <div
          className="fixed inset-0 bg-black/60 dark:bg-black/60"
          aria-hidden="true"
        />

        <div className="relative bg-white dark:bg-zinc-900 rounded-xl shadow-lg ring-1 ring-slate-200 dark:ring-zinc-700 w-full max-w-md mx-auto p-6 space-y-4 z-[60]">
          <Dialog.Title className="text-lg font-semibold text-gray-800 dark:text-white">
            Editar status da licença
          </Dialog.Title>
          <Dialog.Description className="text-sm text-gray-600 dark:text-gray-400 space-y-3">
            <div className="rounded-md border border-gray-300 dark:border-zinc-600 bg-gray-50 dark:bg-zinc-800/80 px-4 py-3 text-left text-gray-800 dark:text-gray-200 space-y-1">
              <p>
                <span className="text-gray-500 dark:text-gray-400">Nome: </span>
                {nome || "—"}
              </p>
              <p className="font-mono text-xs break-all">
                <span className="text-gray-500 dark:text-gray-400 font-sans">
                  Código:{" "}
                </span>
                {codigo}
              </p>
            </div>
            <div className="space-y-1.5 pt-1">
              <label
                htmlFor="edit-license-status"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Status
              </label>
              <select
                id="edit-license-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as (typeof EDITABLE_STATUSES)[number])}
                disabled={loading}
                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-gray-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {EDITABLE_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          </Dialog.Description>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 rounded-md border border-gray-300 dark:border-zinc-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 transition disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={() => void onConfirm(status)}
              disabled={loading}
              className="px-4 py-2 rounded-md bg-sky-500 text-white font-medium hover:bg-sky-600 transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 min-w-[7rem] cursor-pointer"
            >
              {loading ? (
                <Loader className="animate-spin w-5 h-5" aria-hidden />
              ) : (
                "Confirmar"
              )}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
