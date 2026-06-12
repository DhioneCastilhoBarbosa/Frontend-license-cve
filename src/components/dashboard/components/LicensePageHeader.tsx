import { FileText, Plus } from "lucide-react";

interface LicensePageHeaderProps {
  canWrite: boolean;
  onExportReport: () => void;
  onNewLicense: () => void;
}

export default function LicensePageHeader({
  canWrite,
  onExportReport,
  onNewLicense,
}: LicensePageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Licenças
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Gerencie e acompanhe todas as licenças utilizadas naplataforma.
        </p>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={onExportReport}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition cursor-pointer"
        >
          <FileText size={16} />
          Exportar Relatório
        </button>
        {canWrite && (
          <button
            type="button"
            onClick={onNewLicense}
            className="inline-flex items-center gap-2 rounded-lg bg-sky-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-sky-600 transition cursor-pointer shadow-sm"
          >
            <Plus size={16} />
            Nova Licença
          </button>
        )}
      </div>
    </div>
  );
}
