import { Plus } from "lucide-react";

interface KeyPageHeaderProps {
  canWrite: boolean;
  onNewKey: () => void;
}

export default function KeyPageHeader({ canWrite, onNewKey }: KeyPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Chaves
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Gerencie e acompanhe todas as chaves de ativação na plataforma.
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        {canWrite && (
          <button
            type="button"
            onClick={onNewKey}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-600 transition cursor-pointer shadow-sm"
          >
            <Plus size={16} />
            Nova Chave
          </button>
        )}
      </div>
    </div>
  );
}
