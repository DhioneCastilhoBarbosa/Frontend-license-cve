import { Dialog } from "@headlessui/react";
import { FileDown, Loader, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import type { LicenseReportData } from "../../../types/licenseReport";
import { exportLicenseReportPdf } from "../../../utils/exportLicenseReportPdf";
import LicenseReportDocument from "./LicenseReportDocument";

interface LicenseReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  reportData: LicenseReportData | null;
}

function waitForCharts(): Promise<void> {
  return new Promise((resolve) => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setTimeout(resolve, 1200);
      });
    });
  });
}

export default function LicenseReportModal({
  isOpen,
  onClose,
  reportData,
}: LicenseReportModalProps) {
  const reportRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);

  const handleExportPdf = async () => {
    const reportElement = reportRef.current?.querySelector(
      ".license-report"
    ) as HTMLElement | null;

    if (!reportElement || !reportData) {
      toast.error("Relatório não encontrado para exportação.");
      return;
    }

    try {
      setExporting(true);
      await waitForCharts();

      const today = new Date().toISOString().slice(0, 10);
      await exportLicenseReportPdf(
        reportElement,
        `relatorio-licencas-${today}.pdf`
      );
      toast.success("Relatório PDF exportado com sucesso.");
    } catch (error) {
      console.error("Erro ao exportar PDF:", error);
      const message =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao gerar o PDF: ${message}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={exporting ? () => undefined : onClose}
      className="fixed z-50 inset-0 overflow-y-auto"
    >
      <div className="flex min-h-screen items-start justify-center px-4 py-6">
        <div className="fixed inset-0 bg-black/60" aria-hidden="true" />

        <div className="relative z-10 w-full max-w-5xl rounded-xl bg-zinc-100 dark:bg-zinc-900 shadow-2xl ring-1 ring-slate-200 dark:ring-zinc-700">
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-zinc-700 px-5 py-4">
            <div>
              <Dialog.Title className="text-lg font-semibold text-slate-900 dark:text-white">
                Pré-visualização do Relatório
              </Dialog.Title>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Revise os dados antes de exportar em PDF
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleExportPdf}
                disabled={exporting || !reportData}
                className="flex items-center gap-2 px-4 py-2 rounded-md bg-emerald-600 text-white text-sm hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
              >
                {exporting ? (
                  <Loader className="w-4 h-4 animate-spin" />
                ) : (
                  <FileDown className="w-4 h-4" />
                )}
                {exporting ? "Gerando PDF..." : "Exportar PDF"}
              </button>
              <button
                type="button"
                onClick={onClose}
                disabled={exporting}
                className="p-2 rounded-md text-slate-500 hover:bg-slate-200 dark:hover:bg-zinc-800 transition cursor-pointer"
                aria-label="Fechar"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="overflow-auto max-h-[calc(100vh-8rem)] p-6 flex justify-center">
            {reportData ? (
              <div ref={reportRef} className="shadow-xl">
                <LicenseReportDocument data={reportData} />
              </div>
            ) : (
              <p className="text-slate-500 py-12">Nenhum dado para exibir.</p>
            )}
          </div>
        </div>
      </div>
    </Dialog>
  );
}
