'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Edit, FileDown, Copy, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { OrcamentoPreview } from './orcamento-preview'
import { StatusBadge } from './status-badge'
import { useOrcamento } from '@/lib/hooks/use-orcamento'
import { useToast } from '@/hooks/use-toast'
import { OrcamentoStatus, STATUS_CONFIG } from '@/lib/types/app'

interface OrcamentoViewProps {
  orcamentoId: string
}

export function OrcamentoView({ orcamentoId }: OrcamentoViewProps) {
  const router = useRouter()
  const { toast } = useToast()
  const { orcamento, loading, updateOrcamento, duplicateOrcamento } = useOrcamento(orcamentoId)
  const [downloading, setDownloading] = useState(false)

  const handleStatusChange = async (status: OrcamentoStatus) => {
    const { error } = await updateOrcamento({ status })
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao atualizar status' })
    } else {
      toast({ title: 'Status atualizado!' })
    }
  }

  const handleDuplicate = async () => {
    const { data, error } = await duplicateOrcamento(orcamentoId)
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao duplicar' })
    } else if (data) {
      toast({ title: 'Orçamento duplicado!' })
      router.push(`/orcamentos/${data.id}/editar`)
    }
  }

  const handleDownloadPDF = async () => {
    setDownloading(true)
    try {
      const response = await fetch(`/api/pdf/${orcamentoId}`)
      if (!response.ok) throw new Error('Erro ao gerar PDF')
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Orcamento-${orcamento?.numero}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast({ title: 'PDF baixado com sucesso!' })
    } catch (error) {
      toast({ variant: 'destructive', title: 'Erro ao gerar PDF' })
    } finally {
      setDownloading(false)
    }
  }

  if (loading) {
    return <Skeleton className="h-[800px] w-full" />
  }

  if (!orcamento) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">Orçamento não encontrado</p>
        <Button variant="link" onClick={() => router.push('/orcamentos')}>
          Voltar para lista
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header com ações */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => router.push('/orcamentos')}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Orçamento {orcamento.numero}</h1>
            <StatusBadge status={orcamento.status as OrcamentoStatus} />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => router.push(`/orcamentos/${orcamentoId}/editar`)}>
            <Edit className="mr-2 h-4 w-4" /> Editar
          </Button>

          <Button onClick={handleDownloadPDF} disabled={downloading}>
            <FileDown className="mr-2 h-4 w-4" />
            {downloading ? 'Gerando...' : 'Baixar PDF'}
          </Button>

          <Button variant="outline" onClick={handleDuplicate}>
            <Copy className="mr-2 h-4 w-4" /> Duplicar
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" /> Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => handleStatusChange(key as OrcamentoStatus)}
                >
                  {config.icon} {config.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Preview do orçamento */}
      <OrcamentoPreview orcamento={orcamento} />
    </div>
  )
}

