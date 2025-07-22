 import { BadgeCheck, XCircle, Layers } from "lucide-react"

export default function Cards() {
  return (
    <div className="flex items-center justify-center min-h-[100px]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Card Ativas */}
        <div className="w-full flex items-center justify-start gap-4 bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-lg ring-1 ring-slate-200 dark:ring-zinc-700 md:max-w-96">
          <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
            <BadgeCheck className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-green-500">10</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Licenças Ativas</p>
          </div>
        </div>

        {/* Card Expiradas */}
        <div className="w-full flex items-center justify-start gap-4 bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-lg ring-1 ring-slate-200 dark:ring-zinc-700 md:max-w-96">
          <div className="p-3 rounded-full bg-rose-100 dark:bg-rose-900">
            <XCircle className="w-6 h-6 text-rose-500" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-rose-500">12</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Licenças Expiradas</p>
          </div>
        </div>

        {/* Card Total */}
        <div className="w-full flex items-center justify-start gap-4 bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-lg ring-1 ring-slate-200 dark:ring-zinc-700 md:max-w-96">
          <div className="p-3 rounded-full bg-sky-100 dark:bg-sky-900">
            <Layers className="w-6 h-6 text-sky-500" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-sky-500">22</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total de Licenças</p>
          </div>
        </div>
      </div>
    </div>
  )
}
