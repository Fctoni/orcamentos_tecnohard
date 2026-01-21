'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  Eye, Edit, Trash2, FileDown, Copy, MoreHorizontal,
  ArrowUpDown, ArrowUp, ArrowDown, FileText, ChevronDown, ChevronUp
} from 'lucide-react'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuSub, 
  DropdownMenuSubContent, 
  DropdownMenuSubTrigger, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu'
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import { StatusBadge } from './status-badge'
import { useToast } from '@/hooks/use-toast'
import { Orcamento, OrcamentoItem, OrcamentoStatus, STATUS_CONFIG } from '@/lib/types/app'
import { formatCurrency } from '@/lib/utils/format'
import { createClient } from '@/lib/supabase/client'

interface OrcamentosTableProps {
  orcamentos: Orcamento[]
  loading: boolean
  loadingMore: boolean
  sortBy: { column: string; direction: 'asc' | 'desc' }
  onSort: (column: string) => void
  onDelete: (id: string) => Promise<{ error: any }>
  onStatusChange: (id: string, status: OrcamentoStatus) => Promise<{ error: any }>
  lastElementRef: (node: HTMLTableRowElement) => void
  onRefresh: () => void
  selectedIds: string[]
  onToggleSelect: (id: string) => void
  onSelectAll: () => void
}

export function OrcamentosTable({
  orcamentos,
  loading,
  loadingMore,
  sortBy,
  onSort,
  onDelete,
  onStatusChange,
  lastElementRef,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onRefresh,
}: OrcamentosTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const supabase = createClient()
  const [deleteId, setDeleteId] = useState<string | null>(null)
  
  // Estados para expansao de itens
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())
  const [itensCache, setItensCache] = useState<Record<string, OrcamentoItem[]>>({})
  const [loadingItens, setLoadingItens] = useState<Set<string>>(new Set())

  const loadItens = async (orcamentoId: string) => {
    setLoadingItens(prev => new Set(prev).add(orcamentoId))
    
    const { data, error } = await supabase
      .from('orcamento_itens')
      .select('*')
      .eq('orcamento_id', orcamentoId)
      .order('ordem')
    
    if (!error && data) {
      setItensCache(prev => ({ ...prev, [orcamentoId]: data }))
    }
    
    setLoadingItens(prev => {
      const newSet = new Set(prev)
      newSet.delete(orcamentoId)
      return newSet
    })
  }

  const toggleExpand = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    
    const newExpanded = new Set(expandedIds)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
      if (!itensCache[id]) {
        await loadItens(id)
      }
    }
    setExpandedIds(newExpanded)
  }

  const handleDelete = async () => {
    if (!deleteId) return
    
    const { error } = await onDelete(deleteId)
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao excluir', description: error.message })
    } else {
      toast({ title: 'Orçamento excluído com sucesso' })
    }
    setDeleteId(null)
  }

  const handleStatusChange = async (id: string, status: OrcamentoStatus) => {
    const { error } = await onStatusChange(id, status)
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao atualizar status', description: error.message })
    } else {
      toast({ title: 'Status atualizado com sucesso' })
    }
  }

  const handleDownloadPDF = async (id: string, numero: string) => {
    try {
      const response = await fetch(`/api/pdf/${id}`)
      if (!response.ok) throw new Error('Erro ao gerar PDF')
      
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `Orcamento-${numero}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
      
      toast({ title: 'PDF baixado com sucesso!' })
    } catch {
      toast({ variant: 'destructive', title: 'Erro ao gerar PDF' })
    }
  }

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy.column !== column) return <ArrowUpDown className="h-4 w-4" />
    return sortBy.direction === 'asc' 
      ? <ArrowUp className="h-4 w-4" /> 
      : <ArrowDown className="h-4 w-4" />
  }

  const deleteOrcamento = deleteId ? orcamentos.find(o => o.id === deleteId) : null

  if (loading) {
    return <TableSkeleton />
  }

  if (orcamentos.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="Nenhum orçamento encontrado"
        description="Crie seu primeiro orçamento para começar a usar o sistema."
        action={{ label: 'Criar Orçamento', href: '/orcamentos/novo' }}
      />
    )
  }

  const ActionsMenu = ({ orcamento }: { orcamento: Orcamento }) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Mais opções">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => router.push(`/orcamentos/${orcamento.id}`)}>
          <Eye className="mr-2 h-4 w-4" /> Visualizar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push(`/orcamentos/${orcamento.id}/editar`)}>
          <Edit className="mr-2 h-4 w-4" /> Editar
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleDownloadPDF(orcamento.id, orcamento.numero)}>
          <FileDown className="mr-2 h-4 w-4" /> Baixar PDF
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Copy className="mr-2 h-4 w-4" /> Duplicar
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuSub>
          <DropdownMenuSubTrigger>🔄 Alterar Status</DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {Object.entries(STATUS_CONFIG).map(([key, config]) => (
              <DropdownMenuItem 
                key={key}
                onClick={() => handleStatusChange(orcamento.id, key as OrcamentoStatus)}
              >
                {config.icon} {config.label}
              </DropdownMenuItem>
            ))}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
        <DropdownMenuSeparator />
        <DropdownMenuItem 
          className="text-red-600"
          onClick={() => setDeleteId(orcamento.id)}
        >
          <Trash2 className="mr-2 h-4 w-4" /> Excluir
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )

  return (
    <>
      {/* Versão Mobile - Cards */}
      <div className="md:hidden space-y-4">
        {orcamentos.map((orcamento, index) => (
          <Card 
            key={orcamento.id}
            className={`cursor-pointer transition-colors ${selectedIds.includes(orcamento.id) ? 'ring-2 ring-primary' : ''}`}
            onClick={() => router.push(`/orcamentos/${orcamento.id}`)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  <div onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      checked={selectedIds.includes(orcamento.id)}
                      onCheckedChange={() => onToggleSelect(orcamento.id)}
                      aria-label={`Selecionar orçamento ${orcamento.numero}`}
                    />
                  </div>
                  <div className="space-y-1">
                    <p className="font-semibold">{orcamento.numero}</p>
                    <p className="text-sm text-muted-foreground">{orcamento.cliente}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StatusBadge status={orcamento.status as OrcamentoStatus} />
                  <div onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => toggleExpand(orcamento.id, e)}
                      aria-label={expandedIds.has(orcamento.id) ? 'Recolher itens' : 'Expandir itens'}
                    >
                      {expandedIds.has(orcamento.id) 
                        ? <ChevronUp className="h-4 w-4" />
                        : <ChevronDown className="h-4 w-4" />
                      }
                    </Button>
                  </div>
                  <div onClick={(e) => e.stopPropagation()}>
                    <ActionsMenu orcamento={orcamento} />
                  </div>
                </div>
              </div>
              
              {/* Itens expandidos - Mobile */}
              {expandedIds.has(orcamento.id) && (
                <div className="mt-3 pt-3 border-t" onClick={(e) => e.stopPropagation()}>
                  {loadingItens.has(orcamento.id) ? (
                    <div className="text-center text-muted-foreground py-2 text-sm">Carregando...</div>
                  ) : !itensCache[orcamento.id] || itensCache[orcamento.id].length === 0 ? (
                    <div className="text-center text-muted-foreground py-2 text-sm">Nenhum item cadastrado</div>
                  ) : (
                    <div className="space-y-2">
                      {itensCache[orcamento.id].map(item => (
                        <div key={item.id} className="flex justify-between items-start text-sm bg-muted/50 rounded p-2">
                          <div className="flex-1 min-w-0">
                            <span className="font-mono text-xs text-muted-foreground">{item.codigo_item}</span>
                            <p className="truncate">{item.item}</p>
                          </div>
                          <span className="ml-2 whitespace-nowrap font-medium">
                            {formatCurrency(item.preco_unitario)}/{item.unidade}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <span className="text-sm text-muted-foreground">
                  {format(new Date(orcamento.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                </span>
                <span className="font-semibold">{formatCurrency(orcamento.valor_total)}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Versão Desktop - Tabela */}
      <div className="hidden md:block bg-white rounded-lg border overflow-hidden">
        <Table role="table" aria-label="Lista de orçamentos">
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <Checkbox
                  checked={selectedIds.length === orcamentos.length && orcamentos.length > 0}
                  onCheckedChange={onSelectAll}
                  aria-label="Selecionar todos os orçamentos"
                />
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => onSort('numero')} className="h-8 px-2">
                  Número <SortIcon column="numero" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => onSort('cliente')} className="h-8 px-2">
                  Cliente <SortIcon column="cliente" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => onSort('status')} className="h-8 px-2">
                  Status <SortIcon column="status" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => onSort('created_at')} className="h-8 px-2">
                  Data <SortIcon column="created_at" />
                </Button>
              </TableHead>
              <TableHead>
                <Button variant="ghost" onClick={() => onSort('valor_total')} className="h-8 px-2">
                  Valor Total <SortIcon column="valor_total" />
                </Button>
              </TableHead>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead className="w-[60px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orcamentos.map((orcamento, index) => (
              <React.Fragment key={orcamento.id}>
              <TableRow
                ref={index === orcamentos.length - 1 ? lastElementRef : undefined}
                className={`cursor-pointer hover:bg-secondary/50 ${selectedIds.includes(orcamento.id) ? 'bg-secondary/30' : ''}`}
                onClick={() => router.push(`/orcamentos/${orcamento.id}`)}
              >
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Checkbox
                    checked={selectedIds.includes(orcamento.id)}
                    onCheckedChange={() => onToggleSelect(orcamento.id)}
                    aria-label={`Selecionar orçamento ${orcamento.numero}`}
                  />
                </TableCell>
                <TableCell className="font-medium">{orcamento.numero}</TableCell>
                <TableCell>{orcamento.cliente}</TableCell>
                <TableCell>
                  <StatusBadge status={orcamento.status as OrcamentoStatus} />
                </TableCell>
                <TableCell>
                  {format(new Date(orcamento.created_at), 'dd/MM/yyyy', { locale: ptBR })}
                </TableCell>
                <TableCell>{formatCurrency(orcamento.valor_total)}</TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={(e) => toggleExpand(orcamento.id, e)}
                    aria-label={expandedIds.has(orcamento.id) ? 'Recolher itens' : 'Expandir itens'}
                  >
                    {expandedIds.has(orcamento.id) 
                      ? <ChevronUp className="h-4 w-4" />
                      : <ChevronDown className="h-4 w-4" />
                    }
                  </Button>
                </TableCell>
                <TableCell onClick={(e) => e.stopPropagation()}>
                  <ActionsMenu orcamento={orcamento} />
                </TableCell>
              </TableRow>
              {expandedIds.has(orcamento.id) && (
                <TableRow className="bg-muted/50 hover:bg-muted/50">
                  <TableCell colSpan={9} className="p-4">
                    {loadingItens.has(orcamento.id) ? (
                      <div className="text-center text-muted-foreground py-2">Carregando...</div>
                    ) : !itensCache[orcamento.id] || itensCache[orcamento.id].length === 0 ? (
                      <div className="text-center text-muted-foreground py-2">Nenhum item cadastrado</div>
                    ) : (
                      <div className="ml-8">
                        <Table className="w-auto">
                          <TableHeader>
                            <TableRow className="!border-b-2 border-black">
                              <TableHead className="text-base font-bold text-center w-[150px]">Código</TableHead>
                              <TableHead className="text-base font-bold text-center min-w-[250px]">Descrição</TableHead>
                              <TableHead className="text-base font-bold text-center w-[150px]">Valor</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {itensCache[orcamento.id].map(item => (
                                <TableRow key={item.id}>
                                <TableCell className="font-mono text-sm text-center">{item.codigo_item}</TableCell>
                                <TableCell className="text-center">{item.item}</TableCell>
                                <TableCell className="font-100px text-center">
                                  {formatCurrency(item.preco_unitario)}/{item.unidade}
                                </TableCell>  
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
            ))}
          </TableBody>
        </Table>

        {loadingMore && (
          <div className="p-4 text-center text-muted-foreground">
            Carregando mais...
          </div>
        )}
      </div>

      {/* Dialog de confirmação de exclusão aprimorado */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir orçamento?</AlertDialogTitle>
            <AlertDialogDescription className="space-y-2" asChild>
              <div>
                <p>Esta ação não pode ser desfeita.</p>
                {deleteOrcamento && (
                  <div className="bg-secondary rounded p-3 text-sm">
                    <p><strong>Número:</strong> {deleteOrcamento.numero}</p>
                    <p><strong>Cliente:</strong> {deleteOrcamento.cliente}</p>
                  </div>
                )}
                <p className="text-red-600 font-medium">
                  Todos os itens e anexos também serão removidos.
                </p>
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function TableSkeleton() {
  return (
    <>
      {/* Mobile skeleton */}
      <div className="md:hidden space-y-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-3">
              <div className="flex justify-between">
                <Skeleton className="h-5 w-24" />
                <Skeleton className="h-6 w-20 rounded-full" />
              </div>
              <Skeleton className="h-4 w-40" />
              <div className="flex justify-between pt-3 border-t">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-28" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      {/* Desktop skeleton */}
      <div className="hidden md:block bg-white rounded-lg border p-4 space-y-4">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-12 w-full" />
        ))}
      </div>
    </>
  )
}
