import { Users } from "lucide-react";

export default function UsersPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 pt-14 lg:p-8 lg:pt-8 px-6 text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-50 dark:bg-sky-950/40 mb-4">
        <Users className="h-7 w-7 text-sky-500" />
      </div>
      <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Usuários</h1>
      <p className="mt-2 max-w-md text-sm text-zinc-500 dark:text-zinc-400">
        Gerenciamento de usuários em breve. Esta seção estará disponível em uma
        próxima atualização.
      </p>
    </div>
  );
}
