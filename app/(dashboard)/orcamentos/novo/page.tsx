import { OrcamentoForm } from '@/components/features/orcamento-form'

export default function NovoOrcamentoPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">➕ Novo Orçamento</h1>
      <OrcamentoForm />
    </div>
  )
}
