interface Props {
  params: Promise<{ id: string }>
}

export default async function OrcamentoDetailPage({ params }: Props) {
  const { id } = await params
  
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Detalhes do Orçamento</h1>
      <p className="text-muted-foreground">ID: {id} - Em desenvolvimento (FASE 6)</p>
    </div>
  )
}
