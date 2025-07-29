import { Dialog } from '@headlessui/react'
import { useState } from 'react'
import api from '../../../services/api'
import { toast } from 'sonner'
import { Loader } from 'lucide-react'

interface CreateKeyModalProps {
  isOpen: boolean
  onClose: () => void
  onRefresh: () => void
}

export default function CreateKeyModal({ isOpen, onClose, onRefresh }: CreateKeyModalProps) {
  const [cpf, setCpf] = useState('')
  const [email, setEmail] = useState('')
  const [nome, setNome] = useState('')
 
 
  const [loading, setLoading] = useState(false)

  

  const handleCreateLicense = async(data: {
    cpf: string
    email: string
    nome: string
  }) => {
    if (!data.cpf || !data.email || !data.nome) {
      toast.error('Por favor, preencha todos os campos.')
      return
    }
    try {
      setLoading(true)
      await api.post('/criar-acesso', data)
      console.log('Nova chave:', data)
      toast.success('Chave de acesso criada com sucesso!')
      onRefresh() // Chama a função para atualizar os dados na tabela
    } catch (error) {
      toast.error('Erro ao criar chave de acesso. Tente novamente.')
      console.error('Erro ao criar chave de acesso:', error)
    }finally {
      setLoading(false)
      onClose()
    }
   
  }



  return (
    <Dialog open={isOpen} onClose={onClose} className="fixed z-50 inset-0 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="fixed inset-0 bg-black/60 dark:bg-black/60" aria-hidden="true" />

        <div className="relative bg-white dark:bg-zinc-900 rounded-xl shadow-lg ring-1 ring-slate-200 dark:ring-zinc-700 w-full max-w-md mx-auto p-6 space-y-4 z-50">
          <Dialog.Title className="text-lg font-semibold text-gray-800 dark:text-white">
            Criar Nova Chave de acesso
          </Dialog.Title>

          <div className="space-y-3">
            <div className="flex md:flex-row flex-col justify-between md:items-center gap-2">
              <label className="text-sm text-gray-700 dark:text-gray-300" htmlFor="cpf w-full">
                CPF
              </label>
              <input
                 className="min-w-68 px-4 py-2 rounded-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-gray-800 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
                type="text"
                id="cpf"
                placeholder="cpf"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                required
              />
            </div>
            <div className="flex md:flex-row flex-col justify-between md:items-center gap-2">
              <label className="text-sm text-gray-700 dark:text-gray-300" htmlFor="email">
                Email
              </label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="min-w-68  px-4 py-2 rounded-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-gray-800 dark:text-white"
            />
            </div>
            <div className="flex md:flex-row flex-col justify-between md:items-center gap-2">
              <label className="text-sm text-gray-700 dark:text-gray-300" htmlFor="nome">
                Nome
              </label>
            <input
              type="text"
              placeholder="Nome"
              value={nome}
              onChange={(e) => setNome(e.target.value)}
              required
              className="min-w-68  px-4 py-2 rounded-md border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-800 text-sm text-gray-800 dark:text-white"
            />
            </div>
          </div>
          

          <div className="flex justify-end gap-2 pt-4">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-md border dark:border-zinc-600 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700 transition"
            >
              Cancelar
            </button>

            <button
              onClick={() => handleCreateLicense({
                cpf,
                email,
                nome
              })}
              className="px-4 py-2 bg-sky-500 text-white rounded-md hover:bg-sky-600 transition"
            >
                {loading ? <Loader className="animate-spin w-5 h-5" /> : 'Criar'}
            </button>
          </div>
        </div>
      </div>
    </Dialog>
  )
}
