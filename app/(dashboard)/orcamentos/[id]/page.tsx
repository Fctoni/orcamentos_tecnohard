import { Suspense } from 'react'
import { OrcamentoView } from '@/components/features/orcamento-view'
import { Skeleton } from '@/components/ui/skeleton'

interface Props {
  params: Promise<{ id: string }>
}

export default async function VisualizarOrcamentoPage({ params }: Props) {
  const { id } = await params
  
  return (
    <Suspense fallback={<ViewSkeleton />}>
      <OrcamentoView orcamentoId={id} />
    </Suspense>
  )
}

function ViewSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-[800px] w-full" />
    </div>
  )
}
