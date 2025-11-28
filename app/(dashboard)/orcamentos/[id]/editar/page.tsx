import { OrcamentoForm } from '@/components/features/orcamento-form'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditarOrcamentoPage({ params }: Props) {
  const { id } = await params
  
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">✏️ Editar Orçamento</h1>
      <OrcamentoForm orcamentoId={id} />
    </div>
  )
}
