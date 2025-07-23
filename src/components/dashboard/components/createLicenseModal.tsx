import { Dialog } from '@headlessui/react'
import { useState } from 'react'

interface CreateLicenseModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: {
    codigoCompra: string
    email: string
    nome: string
    quantidade: number
    validade: string
  }) => void
}

export default function CreateLicenseModal({ isOpen, onClose, onSubmit }: CreateLicenseModalProps) {
  const [codigoCompra, setCodigoCompra] = useState('')
  const [email, setEmail] = useState('')
  const [nome, setNome] = useState('')
  const [quantidade, setQuantidade] = useState(1)
  const [validade, setValidade] = useState('')

  const handleSubmit = () => {
    onSubmit({ codigoCompra, email, nome, quantidade, validade })
    onClose()
  }

  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black/60 dark:bg-black/60" aria-hidden="true" />

        <div className="relative bg-white dark:bg-zinc-900 rounded-xl shadow-lg ring-1 ring-slate-200 dark:ring-zinc-700 w-full max-w-md mx-auto p-6 space-y-4 z-50">
          <Dialog.Title className="text-lg font-semibold text-gray-800 dark:text-white">
            Criar Nova Licença
          </Dialog.Title>

          <div className="space-y-3">
            <input
              type="text"
              placeholder="Código de Compra"
              value={codigoCompra}
              onChange={(e) => setCodigoCompra(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
            />
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-gray-800 dark:text-white"
            />
            <input
              type="text"
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-gray-800 dark:text-white"
            />
            <input
              type="number"
              placeholder="Quantidade"
              min={1}
              value={quantidade}
              onChange={(e) => setQuantidade(Number(e.target.value))}
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-gray-800 dark:text-white"
            />
            <input
              type="date"
              placeholder="Validade"
              value={validade}
              onChange={(e) => setValidade(e.target.value)}
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-gray-800 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md border dark:border-zinc-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition"
            >
              Criar
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
