export default function UserPageHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">
          Usuários
        </h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Gerencie os usuários cadastrados na plataforma.
        </p>
      </div>
    </div>
  );
}
