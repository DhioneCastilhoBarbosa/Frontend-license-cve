 import { BadgeCheck, Layers } from "lucide-react"
import {
  forwardRef,
  useImperativeHandle,
  useEffect,
  useState,
} from "react"
import api from "../../../services/api";

export interface CardsHandle {
  refresh: () => void
}
type License = {
  status: string;
  // add other properties if needed
};

 const Cards = forwardRef<CardsHandle>((_, ref) => {
  const[activeLicenses, setActiveLicenses] = useState(0);
  const[totalLicenses, setTotalLicenses] = useState(0);
  const [, setData] = useState<License[]>([])

  const getData = async () => {
  try {
    const response = await api.get('/chaves')
    console.log('Licenças recebidas:', response.data)
    setData(response.data)
    const active = response.data.filter((item: License) => item.status === 'Ativada').length;
    const total = response.data.length;
    setActiveLicenses(active);
  
    setTotalLicenses(total);
  } catch (error) {
    console.error('Erro ao buscar licenças:', error)
  }
}

  useEffect(() => {
    getData();
  }, []);

    useImperativeHandle(ref, () => ({
    refresh: () => {
      getData()
    },
  }))

  return (
    <div className="flex items-center justify-center min-h-[100px]">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        {/* Card Ativas */}
        <div className="w-full flex items-center justify-start gap-4 bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-lg ring-1 ring-slate-200 dark:ring-zinc-700 md:max-w-96">
          <div className="p-3 rounded-full bg-green-100 dark:bg-green-900">
            <BadgeCheck className="w-6 h-6 text-green-500" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-green-500">{activeLicenses}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Licenças Ativas</p>
          </div>
        </div>

        {/* Card Total */}
        <div className="w-full flex items-center justify-start gap-4 bg-white dark:bg-zinc-800 p-6 rounded-2xl shadow-lg ring-1 ring-slate-200 dark:ring-zinc-700 md:max-w-96">
          <div className="p-3 rounded-full bg-sky-100 dark:bg-sky-900">
            <Layers className="w-6 h-6 text-sky-500" />
          </div>
          <div>
            <h2 className="text-3xl font-bold text-sky-500">{totalLicenses}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Total de Licenças</p>
          </div>
        </div>
      </div>
    </div>
  )
})

export default Cards