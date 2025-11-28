'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { 
  Eye, Edit, Trash2, FileDown, Copy, MoreHorizontal,
  ArrowUpDown, ArrowUp, ArrowDown 
} from 'lucide-react'

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
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
import { StatusBadge } from './status-badge'
import { useToast } from '@/hooks/use-toast'
import { Orcamento, OrcamentoStatus, STATUS_CONFIG } from '@/lib/types/app'
import { formatCurrency } from '@/lib/utils/format'

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
}: OrcamentosTableProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [deleteId, setDeleteId] = useState<string | null>(null)

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

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy.column !== column) return <ArrowUpDown className="h-4 w-4" />
    return sortBy.direction === 'asc' 
      ? <ArrowUp className="h-4 w-4" /> 
      : <ArrowDown className="h-4 w-4" />
  }

  if (loading) {
    return <TableSkeleton />
  }

  if (orcamentos.length === 0) {
    return <EmptyState />
  }

  return (
    <>
      <div className="bg-white rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
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
              <TableHead className="w-[60px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {orcamentos.map((orcamento, index) => (
              <TableRow
                key={orcamento.id}
                ref={index === orcamentos.length - 1 ? lastElementRef : undefined}
                className="cursor-pointer hover:bg-secondary/50"
                onClick={() => router.push(`/orcamentos/${orcamento.id}`)}
              >
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
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
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
                      <DropdownMenuItem>
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {loadingMore && (
          <div className="p-4 text-center text-muted-foreground">
            Carregando mais...
          </div>
        )}
      </div>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir orçamento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O orçamento será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

function TableSkeleton() {
  return (
    <div className="bg-white rounded-lg border p-4 space-y-4">
      {[...Array(5)].map((_, i) => (
        <Skeleton key={i} className="h-12 w-full" />
      ))}
    </div>
  )
}

function EmptyState() {
  return (
    <div className="bg-white rounded-lg border p-12 text-center">
      <div className="text-6xl mb-4">📋</div>
      <h3 className="text-lg font-semibold mb-2">Nenhum orçamento encontrado</h3>
      <p className="text-muted-foreground mb-6">
        Crie seu primeiro orçamento para começar.
      </p>
      <Button asChild>
        <a href="/orcamentos/novo">Criar Orçamento</a>
      </Button>
    </div>
  )
}


