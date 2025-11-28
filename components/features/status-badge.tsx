import { OrcamentoStatus } from '@/lib/types/app'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: OrcamentoStatus
  className?: string
}

const statusStyles: Record<OrcamentoStatus, { label: string; icon: string; bg: string }> = {
  'cadastrado': { label: 'Cadastrado', icon: '📝', bg: 'bg-gray-500' },
  'aguardando-informacoes': { label: 'Aguardando Informações', icon: '⏳', bg: 'bg-yellow-500' },
  'enviado': { label: 'Enviado', icon: '📤', bg: 'bg-blue-500' },
  'em-negociacao': { label: 'Em Negociação', icon: '💬', bg: 'bg-orange-500' },
  'aprovado': { label: 'Aprovado', icon: '✅', bg: 'bg-green-500' },
  'rejeitado': { label: 'Rejeitado', icon: '❌', bg: 'bg-red-500' },
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = statusStyles[status]
  
  if (!config) {
    return null
  }
  
  return (
    <span 
      className={cn(
        'inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold text-white',
        config.bg,
        className
      )}
    >
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  )
}


