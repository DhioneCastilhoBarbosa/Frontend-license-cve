import { useEffect, useState } from 'react'
import CreateLicenseModal from './createkeyModal'
import api from '../../../services/api'
import { ClipboardCopy, Eye, EyeOff, Inbox } from 'lucide-react'
interface TableProps {
  onRefresh: () => void
}

export default function Table( { onRefresh }: TableProps) {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [data, setData] = useState([] as Keys[])
  const [showCPF, setShowCPF] = useState<{ [key: string]: boolean }>({})

  const itemsPerPage = 10

type Keys = {
  id: number
  nome: string
  email: string
  cpf: string
  chave: string
  Conta: string
  status: string
  created_at: string 
}


const toggleCPF = (id: number) => {
    setShowCPF(prev => ({ ...prev, [id]: !prev[id] }))
  }

const maskCPF = (cpf: string) => {
    return cpf.replace(/^(\d{3})\d{6}(\d{2})$/, "$1.***.***-$2")
  }

const formatCPF = (cpf: string) => {
  return cpf.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4")
}

const getData = async () => {
  try {
    const response = await api.get('/chaves')
    console.log('chaves:', response.data)
    setData(response.data)
   
  } catch (error) {
    console.error('Erro ao buscar licenças:', error)
  }
  finally {
    onRefresh()
  }
}


  const filtered = data.filter((item) => {
    const searchMatch =
      item.nome.toLowerCase().includes(search.toLowerCase()) ||
      item.cpf.toLowerCase().includes(search.toLowerCase())

    const statusMatch =
      statusFilter === 'Todos' || item.status.toLowerCase() === statusFilter.toLowerCase()

    return searchMatch && statusMatch
  })

  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedData = filtered.slice(startIndex, startIndex + itemsPerPage)

const goToPage = (page: number) => {
  if (page >= 1 && page <= totalPages) {
    setCurrentPage(page)
  }
}

useEffect(() => {
  getData()
}, [])

  return (
  <div className="space-y-4">
  {/* Bloco de filtros integrado visualmente com a tabela */}
  <div className="rounded-xl shadow-lg ring-1 ring-slate-200 dark:ring-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 mt-1">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <input
        type="text"
        placeholder="Buscar por nome ou por CPF"
        className="w-full md:w-1/2 px-4 py-2 rounded-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 "
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      <select
        value={statusFilter}
        onChange={(e) => setStatusFilter(e.target.value)}
        className="w-full md:w-1/4 px-4 py-2 rounded-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-gray-800 dark:text-white "
      >
        <option value="Todos">Todos os status</option>
        <option value="Ativada">Ativada</option>
        <option value="Criada">Criada</option>
      </select>
      <button onClick={() => setIsModalOpen(true)}>
        <span className="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition cursor-pointer">
          Criar chave
        </span>
      </button>
    </div>
  </div>
  
  <CreateLicenseModal
    isOpen={isModalOpen}
    onClose={() => setIsModalOpen(false)}
    onRefresh={getData}
  />

  {/* Tabela */}
  <div className="overflow-x-auto rounded-xl shadow-lg ring-1 ring-slate-200 dark:ring-zinc-700">
    <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700 text-sm">
      <thead className="bg-gray-100 dark:bg-zinc-800">
        <tr>
          <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Nome</th>
          <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Email</th>
          <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">CPF</th>
          <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Chave de acesso</th>
          <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Status</th>
          <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Data de criação</th>
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-700">
        {paginatedData.map((item) => (
          <tr key={item.id}>
            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{item.nome}</td>
            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{item.email}</td>
            
            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">
              <div className="flex items-center gap-2 whitespace-nowrap">
                {showCPF[item.id] ? formatCPF(item.cpf) : maskCPF(item.cpf)}
                <button
                  onClick={() => toggleCPF(item.id)}
                  title={showCPF[item.id] ? "Ocultar CPF" : "Mostrar CPF"}
                  className="p-1 rounded hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
                >
                  {showCPF[item.id] ? (
                    <EyeOff className="w-4 h-4 text-gray-500 dark:text-gray-300" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-500 dark:text-gray-300" />
                  )}
                </button>
              </div>
            </td>
          <td className="px-4 py-3 text-gray-700 dark:text-gray-300 flex items-center gap-2">
            {item.chave}
            <button
              onClick={() => {
                navigator.clipboard.writeText(item.chave)
              }}
              title="Copiar código"
              className="p-1 rounded hover:bg-gray-200 dark:hover:bg-zinc-700 transition"
            >
              <ClipboardCopy className="w-4 h-4 text-gray-500 dark:text-gray-300" />
            </button>
          </td>
            <td className="px-4 py-3">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  item.status === 'Ativada'
                    ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
                    : item.status === 'Expirada'
                    ? 'bg-rose-100 text-rose-600 dark:bg-rose-900 dark:text-rose-300'
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                }`}
              >
                {item.status}
              </span>
            </td>
            <td className="px-4 py-3 text-gray-700 dark:text-gray-300"> {new Date(item.created_at).toLocaleDateString('pt-BR')}</td>
          </tr>
        ))}
        {filtered.length === 0 && (
          <tr>
            <td colSpan={7} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
              <Inbox className="w-16 h-16 mx-auto mb-2 text-gray-400 dark:text-gray-500" strokeWidth={1} />
              Nenhum resultado encontrado
            </td>
          </tr>
        )}
      </tbody>
    </table>
    {filtered.length > 0 && (
      <div className="flex justify-center mt-6 mb-2">
        <div className="flex items-center gap-2">
          {/* Botão anterior */}
          <button
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className="w-8 h-8 flex items-center justify-center rounded-md border dark:border-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            &lt;
          </button>

          {/* Números das páginas */}
        {(() => {
      const maxVisiblePages = 5
      let start = Math.max(currentPage - 2, 1)
      let end = start + maxVisiblePages - 1

      if (end > totalPages) {
        end = totalPages
        start = Math.max(end - maxVisiblePages + 1, 1)
      }

      const pageNumbers = []
      for (let i = start; i <= end; i++) {
        pageNumbers.push(i)
      }

      return (
        <>
          {pageNumbers.map((pageNumber) => (
            <button
              key={pageNumber}
              onClick={() => goToPage(pageNumber)}
              className={`w-8 h-8 flex items-center justify-center rounded-md border dark:border-zinc-700 ${
                currentPage === pageNumber
                  ? 'bg-sky-100 text-black font-semibold'
                  : 'hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 cursor-pointer'
              }`}
            >
              {pageNumber}
            </button>
          ))}

          {totalPages > end && (
            <button
              onClick={() => goToPage(totalPages)}
              className="w-8 h-8 flex items-center justify-center rounded-md border dark:border-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-800 text-gray-700 dark:text-gray-300 "
            >
              {totalPages}
            </button>
          )}
        </>
      )
    })()}


          {/* Botão próxima */}
          <button
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="w-8 h-8 flex items-center justify-center rounded-md border dark:border-zinc-700 hover:bg-gray-200 dark:hover:bg-zinc-800 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            &gt;
          </button>
        </div>
      </div>
    )}


  </div>
</div>

  )
}
