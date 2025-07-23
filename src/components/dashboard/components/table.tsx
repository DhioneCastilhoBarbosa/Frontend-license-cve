import { useState } from 'react'
import CreateLicenseModal from './createLicenseModal'

const data = [
  {
    id: 1,
    nome: 'João Silva',
    email: 'joao@email.com',
    codigoCompra: 'CMP-12983',
    licenca: 'LIC-456XYZ',
    status: 'Ativa',
    validade: '15/12/2025',
    dataCompra: '10/01/2024',
  },
  {
    id: 2,
    nome: 'Maria Santos',
    email: 'maria@email.com',
    codigoCompra: 'CMP-55421',
    licenca: 'LIC-123ABC',
    status: 'Expirada',
    validade: '10/07/2023',
    dataCompra: '05/02/2022',
  },
  {
    id: 3,
    nome: 'Carlos Oliveira',
    email: 'carlos@email.com',
    codigoCompra: 'CMP-98345',
    licenca: 'LIC-789GHI',
    status: 'Criada',
    validade: '20/11/2025',
    dataCompra: '03/05/2024',
  },
  {
    id: 4,
    nome: 'Ana Costa',
    email: 'ana@email.com',
    codigoCompra: 'CMP-11122',
    licenca: 'LIC-999ZZZ',
    status: 'Ativa',
    validade: '01/01/2026',
    dataCompra: '18/02/2024',
  },
  {
    id: 5,
    nome: 'Lucas Rocha',
    email: 'lucas@email.com',
    codigoCompra: 'CMP-44661',
    licenca: 'LIC-332LMN',
    status: 'Expirada',
    validade: '02/04/2023',
    dataCompra: '10/10/2021',
  },
  {
    id: 6,
    nome: 'Fernanda Lima',
    email: 'fernanda@email.com',
    codigoCompra: 'CMP-88992',
    licenca: 'LIC-543QWE',
    status: 'Ativa',
    validade: '10/08/2025',
    dataCompra: '15/03/2024',
  },
  {
    id: 7,
    nome: 'Bruno Alves',
    email: 'bruno@email.com',
    codigoCompra: 'CMP-77338',
    licenca: 'LIC-201RTY',
    status: 'Criada',
    validade: '31/12/2025',
    dataCompra: '07/07/2024',
  },
  {
    id: 8,
    nome: 'Juliana Mendes',
    email: 'juliana@email.com',
    codigoCompra: 'CMP-11442',
    licenca: 'LIC-789UIO',
    status: 'Expirada',
    validade: '28/09/2022',
    dataCompra: '25/04/2022',
  },
  {
    id: 9,
    nome: 'Pedro Cardoso',
    email: 'pedro@email.com',
    codigoCompra: 'CMP-77885',
    licenca: 'LIC-567TYU',
    status: 'Ativa',
    validade: '05/03/2026',
    dataCompra: '21/06/2024',
  },
  {
    id: 10,
    nome: 'Camila Ribeiro',
    email: 'camila@email.com',
    codigoCompra: 'CMP-33221',
    licenca: 'LIC-321ASD',
    status: 'Criada',
    validade: '12/10/2025',
    dataCompra: '12/05/2024',
  },
]


export default function Table() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('Todos')
  const [currentPage, setCurrentPage] = useState(1)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const itemsPerPage = 2

type License = {
  id: number
  nome: string
  email: string
  codigoCompra: string
  licenca: string
  status: string
  validade: string
  dataCompra: string
}

const handleCreateLicense = (data: {
  codigoCompra: string
  email: string
  nome: string
  quantidade: number
  validade: string
}) => {
  // Exemplo de mapeamento para License, se necessário
  const newLicense: License = {
    id: Date.now(), // ou outra lógica para gerar ID
    nome: data.nome,
    email: data.email,
    codigoCompra: data.codigoCompra,
    licenca: '', // definir conforme necessário
    status: 'Criada', // ou outro valor padrão
    validade: data.validade,
    dataCompra: new Date().toLocaleDateString('pt-BR'), // ou outro valor
  }
  console.log('Nova licença:', newLicense)
  // aqui você pode enviar via API, ou adicionar ao seu array `data`
}

  const filtered = data.filter((item) => {
    const searchMatch =
      item.nome.toLowerCase().includes(search.toLowerCase()) ||
      item.codigoCompra.toLowerCase().includes(search.toLowerCase())

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

  return (
  <div className="space-y-4">
  {/* Bloco de filtros integrado visualmente com a tabela */}
  <div className="rounded-xl shadow-lg ring-1 ring-slate-200 dark:ring-zinc-700 bg-white dark:bg-zinc-900 px-4 py-2 mt-1">
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <input
        type="text"
        placeholder="Buscar por nome ou código de compra"
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
        <option value="Ativa">Ativa</option>
        <option value="Expirada">Expirada</option>
        <option value="Criada">Criada</option>
      </select>
      <button onClick={() => setIsModalOpen(true)}>
        <span className="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition cursor-pointer">
          Criar licença
        </span>
      </button>
    </div>
  </div>
  
  <CreateLicenseModal
  isOpen={isModalOpen}
  onClose={() => setIsModalOpen(false)}
  onSubmit={handleCreateLicense}
/>

  {/* Tabela */}
  <div className="overflow-x-auto rounded-xl shadow-lg ring-1 ring-slate-200 dark:ring-zinc-700">
    <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-700 text-sm">
      <thead className="bg-gray-100 dark:bg-zinc-800">
        <tr>
          <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Nome</th>
          <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Email</th>
          <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Código de Compra</th>
          <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Licença</th>
          <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Status</th>
          <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Validade</th>
          <th className="px-4 py-3 text-left font-semibold text-gray-600 dark:text-gray-300">Data de Compra</th>
        </tr>
      </thead>
      <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-700">
        {paginatedData.map((item) => (
          <tr key={item.id}>
            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{item.nome}</td>
            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{item.email}</td>
            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{item.codigoCompra}</td>
            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{item.licenca}</td>
            <td className="px-4 py-3">
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                  item.status === 'Ativa'
                    ? 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300'
                    : item.status === 'Expirada'
                    ? 'bg-rose-100 text-rose-600 dark:bg-rose-900 dark:text-rose-300'
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300'
                }`}
              >
                {item.status}
              </span>
            </td>
            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{item.validade}</td>
            <td className="px-4 py-3 text-gray-700 dark:text-gray-300">{item.dataCompra}</td>
          </tr>
        ))}
        {filtered.length === 0 && (
          <tr>
            <td colSpan={7} className="px-4 py-6 text-center text-gray-500 dark:text-gray-400">
              Nenhum resultado encontrado.
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
