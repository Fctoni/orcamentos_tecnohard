import { Loading } from '@/components/ui/loading'

export default function DashboardLoading() {
  return (
    <div className="min-h-[50vh] flex items-center justify-center">
      <Loading size="lg" text="Carregando..." />
    </div>
  )
}

