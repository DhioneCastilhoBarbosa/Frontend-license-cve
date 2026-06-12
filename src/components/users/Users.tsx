import { useCallback, useEffect, useState } from "react";
import api from "../../services/api";
import type { UserRecord } from "../../types/user";
import UserPageHeader from "./components/UserPageHeader";
import Table from "./components/table";
import { toast } from "sonner";

export default function UsersPage() {
  const [users, setUsers] = useState<UserRecord[]>([]);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await api.get("/usuarios");
      setUsers(response.data);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      toast.error("Erro ao carregar usuários.");
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div className="flex flex-col gap-6 p-4 pt-14 lg:p-8 lg:pt-8 max-w-[1600px] mx-auto w-full">
      <UserPageHeader />
      <Table users={users} onRefresh={fetchUsers} />
    </div>
  );
}
