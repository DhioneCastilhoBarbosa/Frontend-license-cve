import { useCallback, useEffect, useRef, useState } from "react";
import api from "../../services/api";
import type { LicenseRecord } from "../../types/licenseReport";
import LicenseCharts from "./components/LicenseCharts";
import LicenseMetrics from "./components/LicenseMetrics";
import LicensePageHeader from "./components/LicensePageHeader";
import Table, { type TableHandle } from "./components/table";

export default function Dashboard() {
  const tableRef = useRef<TableHandle>(null);
  const [licenses, setLicenses] = useState<LicenseRecord[]>([]);

  const fetchLicenses = useCallback(async () => {
    try {
      const response = await api.get("/licencas");
      setLicenses(response.data);
    } catch (error) {
      console.error("Erro ao buscar licenças:", error);
    }
  }, []);

  useEffect(() => {
    fetchLicenses();
  }, [fetchLicenses]);

  return (
    <div className="flex flex-col gap-6 p-4 pt-14 lg:p-8 lg:pt-8 max-w-[1600px] mx-auto w-full">
      <LicensePageHeader
        onExportReport={() => tableRef.current?.openReport()}
        onNewLicense={() => tableRef.current?.openCreateModal()}
      />
      <LicenseMetrics licenses={licenses} />
      <LicenseCharts licenses={licenses} />
      <Table
        ref={tableRef}
        licenses={licenses}
        onRefresh={fetchLicenses}
      />
    </div>
  );
}
