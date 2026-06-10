import { useCallback, useEffect, useRef, useState } from "react";
import api from "../../services/api";
import type { KeyRecord } from "../../types/key";
import KeyCharts from "./components/KeyCharts";
import KeyMetrics from "./components/KeyMetrics";
import KeyPageHeader from "./components/KeyPageHeader";
import Table, { type TableHandle } from "./components/table";

export default function Key() {
  const tableRef = useRef<TableHandle>(null);
  const [keys, setKeys] = useState<KeyRecord[]>([]);

  const fetchKeys = useCallback(async () => {
    try {
      const response = await api.get("/chaves");
      setKeys(response.data);
    } catch (error) {
      console.error("Erro ao buscar chaves:", error);
    }
  }, []);

  useEffect(() => {
    fetchKeys();
  }, [fetchKeys]);

  return (
    <div className="flex flex-col gap-6 p-4 pt-14 lg:p-8 lg:pt-8 max-w-[1600px] mx-auto w-full">
      <KeyPageHeader onNewKey={() => tableRef.current?.openCreateModal()} />
      <KeyMetrics keys={keys} />
      <KeyCharts keys={keys} />
      <Table ref={tableRef} keys={keys} onRefresh={fetchKeys} />
    </div>
  );
}
