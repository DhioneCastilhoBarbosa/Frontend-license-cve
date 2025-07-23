import Cards from "./components/cards";
import Table from "./components/table";

export default function Dashboard() {
  return (
    <div className="h-full flex flex-col md:overflow-hidden overflow-auto items-center">
      {/* Cards fixos no topo */}
      <div className="p-8 shrink-0">
        <Cards />
      </div>

      {/* Área da tabela com rolagem */}
      <div className="flex-1 md:overflow-y-auto p-6 pt-0 md:w-5/6 w-full">
        <Table />
      </div>
    </div>
  )
}

