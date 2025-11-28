import { Badge } from '@/components/ui/badge'
import { OrcamentoStatus, STATUS_CONFIG } from '@/lib/types/app'
import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: OrcamentoStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  
  return (
    <Badge 
      className={cn(
        'text-white font-medium',
        config.color,
        className
      )}
    >
      {config.icon} {config.label}
    </Badge>
  )
}


