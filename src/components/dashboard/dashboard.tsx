import { useRef } from "react";
import Cards,{type CardsHandle} from "./components/cards";
import Table from "./components/table";

export default function Dashboard() {
   const cardsRef = useRef<CardsHandle>(null)

  const handleRefreshFromTable = () => {
    cardsRef.current?.refresh()
  }

  return (
    <div className="h-full flex flex-col md:overflow-hidden overflow-auto items-stretch w-full">
      {/* Cards fixos no topo */}
      <div className="p-8 shrink-0 w-full flex justify-center">
        <Cards ref={cardsRef} />
      </div>

      {/* Área da tabela com rolagem — largura total para reduzir rolagem horizontal */}
      <div className="flex-1 md:overflow-y-auto w-full min-w-0 px-4 sm:px-6 lg:px-8 pt-0 pb-6">
        <Table onRefresh={handleRefreshFromTable} />
      </div>
    </div>
  )
}

