export default function OrcamentoDetailPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Detalhes do Orçamento</h1>
      <p className="text-muted-foreground">ID: {params.id} - Em desenvolvimento</p>
    </div>
  )
}


