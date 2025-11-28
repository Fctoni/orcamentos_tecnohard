export default function OrcamentosPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Orçamentos</h1>
        <a 
          href="/orcamentos/novo" 
          className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-hover"
        >
          Novo Orçamento
        </a>
      </div>
      <p className="text-muted-foreground">Lista de orçamentos - Em desenvolvimento</p>
    </div>
  )
}


