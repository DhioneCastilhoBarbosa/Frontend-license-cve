import { Dialog } from "@headlessui/react";
import { Loader } from "lucide-react";

interface DeleteLicenseConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  nome: string;
  codigo: string;
  loading: boolean;
  onConfirm: () => void | Promise<void>;
}

export default function DeleteLicenseConfirmModal({
  isOpen,
  onClose,
  nome,
  codigo,
  loading,
  onConfirm,
}: DeleteLicenseConfirmModalProps) {
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
            Deseja realmente excluir a licença?
          </Dialog.Title>
          <Dialog.Description className="text-sm text-gray-600 dark:text-gray-400 space-y-2">
            <p>
              Esta ação não pode ser desfeita. A licença será removida
              permanentemente.
            </p>
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
              onClick={() => void onConfirm()}
              disabled={loading}
              className="px-4 py-2 rounded-md bg-red-600 text-white font-medium hover:bg-red-700 transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 min-w-[7rem] cursor-pointer"
            >
              {loading ? (
                <Loader className="animate-spin w-5 h-5" aria-hidden />
              ) : (
                "Excluir"
              )}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  );
}
