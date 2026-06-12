import { Dialog } from "@headlessui/react";
import { Loader } from "lucide-react";
import { useEffect, useState } from "react";
import {
  getNivelAcessoInicialParaEdicao,
  isNivelAcessoEditavel,
  NIVEL_ACESSO_OPTIONS,
  type NivelAcesso,
  type UserRecord,
} from "../../../types/user";

interface EditUserModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserRecord | null;
  loading: boolean;
  onConfirm: (data: {
    id: number;
    nome: string;
    email: string;
    nivel_acesso: NivelAcesso;
  }) => void | Promise<void>;
}

export default function EditUserModal({
  isOpen,
  onClose,
  user,
  loading,
  onConfirm,
}: EditUserModalProps) {
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [nivelAcesso, setNivelAcesso] = useState<NivelAcesso | "">("");

  useEffect(() => {
    if (isOpen && user) {
      setNome(user.nome);
      setEmail(user.email);
      setNivelAcesso(getNivelAcessoInicialParaEdicao(user.nivel_acesso));
    }
  }, [isOpen, user]);

  const handleClose = () => {
    if (loading) return;
    onClose();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !nome.trim() || !email.trim() || !isNivelAcessoEditavel(nivelAcesso)) {
      return;
    }
    void onConfirm({
      id: user.id,
      nome: nome.trim(),
      email: email.trim(),
      nivel_acesso: nivelAcesso,
    });
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
            Editar usuário
          </Dialog.Title>
          <Dialog.Description className="text-sm text-gray-600 dark:text-gray-400">
            Atualize os dados do usuário.
          </Dialog.Description>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label
                htmlFor="edit-user-nome"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Nome
              </label>
              <input
                id="edit-user-nome"
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                disabled={loading}
                required
                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-gray-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="edit-user-email"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email
              </label>
              <input
                id="edit-user-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                required
                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-gray-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="edit-user-nivel"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Nível de acesso
              </label>
              <select
                id="edit-user-nivel"
                value={nivelAcesso}
                onChange={(e) => {
                  const value = e.target.value;
                  if (isNivelAcessoEditavel(value)) {
                    setNivelAcesso(value);
                  }
                }}
                disabled={loading}
                required
                className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-gray-800 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="" disabled>
                  {user?.nivel_acesso === "pendente"
                    ? "Selecione para aprovar o usuário"
                    : "Selecione o nível de acesso"}
                </option>
                {NIVEL_ACESSO_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

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
                type="submit"
                disabled={loading || !nome.trim() || !email.trim() || !isNivelAcessoEditavel(nivelAcesso)}
                className="px-4 py-2 rounded-md bg-sky-500 text-white font-medium hover:bg-sky-600 transition disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2 min-w-[7rem] cursor-pointer"
              >
                {loading ? (
                  <Loader className="animate-spin w-5 h-5" aria-hidden />
                ) : (
                  "Salvar"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Dialog>
  );
}
