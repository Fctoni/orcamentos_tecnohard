# 📋 FASE 3: Listagem de Orçamentos

**Duração Estimada:** Semana 2  
**Objetivo:** Visualizar e filtrar orçamentos com tabela avançada

---

## 📋 Checklist de Tarefas

- [ ] 3.1 Criar hook `useOrcamentos`
- [ ] 3.2 Criar página de lista de orçamentos
- [ ] 3.3 Implementar tabela responsiva
- [ ] 3.4 Adicionar filtros (status, cliente, data)
- [ ] 3.5 Implementar busca full-text
- [ ] 3.6 Implementar ordenação de colunas
- [ ] 3.7 Implementar scroll infinito
- [ ] 3.8 Criar menu de ações por orçamento
- [ ] 3.9 Componente StatusBadge
- [ ] 3.10 Estados de loading e empty

---

## 3.1 Hook useOrcamentos

**`lib/hooks/use-orcamentos.ts`:**

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Orcamento, OrcamentoStatus } from '@/lib/types/app'

interface UseOrcamentosOptions {
  pageSize?: number
}

interface Filters {
  search: string
  status: OrcamentoStatus | 'all'
  cliente: string
  dateFrom: Date | null
  dateTo: Date | null
}

export function useOrcamentos(options: UseOrcamentosOptions = {}) {
  const { pageSize = 20 } = options
  const supabase = createClient()
  
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [filters, setFilters] = useState<Filters>({
    search: '',
    status: 'all',
    cliente: '',
    dateFrom: null,
    dateTo: null,
  })
  const [sortBy, setSortBy] = useState<{ column: string; direction: 'asc' | 'desc' }>({
    column: 'created_at',
    direction: 'desc',
  })

  const fetchOrcamentos = useCallback(async (reset = false) => {
    if (reset) {
      setLoading(true)
      setOrcamentos([])
    } else {
      setLoadingMore(true)
    }

    try {
      let query = supabase
        .from('orcamentos')
        .select('*')
        .order(sortBy.column, { ascending: sortBy.direction === 'asc' })
        .range(
          reset ? 0 : orcamentos.length,
          reset ? pageSize - 1 : orcamentos.length + pageSize - 1
        )

      // Aplicar filtros
      if (filters.status !== 'all') {
        query = query.eq('status', filters.status)
      }

      if (filters.cliente) {
        query = query.ilike('cliente', `%${filters.cliente}%`)
      }

      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom.toISOString())
      }

      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo.toISOString())
      }

      // Busca full-text
      if (filters.search) {
        query = query.or(
          `numero.ilike.%${filters.search}%,cliente.ilike.%${filters.search}%,contato.ilike.%${filters.search}%`
        )
      }

      const { data, error } = await query

      if (error) throw error

      if (reset) {
        setOrcamentos(data || [])
      } else {
        setOrcamentos(prev => [...prev, ...(data || [])])
      }

      setHasMore((data?.length || 0) === pageSize)
    } catch (error) {
      console.error('Erro ao buscar orçamentos:', error)
    } finally {
      setLoading(false)
      setLoadingMore(false)
    }
  }, [supabase, filters, sortBy, orcamentos.length, pageSize])

  // Buscar dados iniciais
  useEffect(() => {
    fetchOrcamentos(true)
  }, [filters, sortBy])

  const loadMore = () => {
    if (!loadingMore && hasMore) {
      fetchOrcamentos(false)
    }
  }

  const updateFilters = (newFilters: Partial<Filters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  const updateSort = (column: string) => {
    setSortBy(prev => ({
      column,
      direction: prev.column === column && prev.direction === 'asc' ? 'desc' : 'asc',
    }))
  }

  const deleteOrcamento = async (id: string) => {
    const { error } = await supabase.from('orcamentos').delete().eq('id', id)
    if (!error) {
      setOrcamentos(prev => prev.filter(o => o.id !== id))
    }
    return { error }
  }

  const updateStatus = async (id: string, status: OrcamentoStatus) => {
    const { error } = await supabase
      .from('orcamentos')
      .update({ status })
      .eq('id', id)
    
    if (!error) {
      setOrcamentos(prev => prev.map(o => o.id === id ? { ...o, status } : o))
    }
    return { error }
  }

  return {
    orcamentos,
    loading,
    loadingMore,
    hasMore,
    filters,
    sortBy,
    updateFilters,
    updateSort,
    loadMore,
    refresh: () => fetchOrcamentos(true),
    deleteOrcamento,
    updateStatus,
  }
}
```

---

## 3.2 Página de Lista de Orçamentos

**`app/(dashboard)/orcamentos/page.tsx`:**

```typescript
import { Suspense } from 'react'
import { OrcamentosList } from '@/components/features/orcamentos-list'
import { OrcamentosListSkeleton } from '@/components/features/orcamentos-list-skeleton'

export default function OrcamentosPage() {
  return (
    <div className="space-y-6">
      <Suspense fallback={<OrcamentosListSkeleton />}>
        <OrcamentosList />
      </Suspense>
    </div>
  )
}
```

---

## 3.3 Componente OrcamentosList

**`components/features/orcamentos-list.tsx`:**

```typescript
'use client'

import { useRef, useCallback } from 'react'
import { Plus, Search, X, Filter } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { OrcamentosTable } from './orcamentos-table'
import { useOrcamentos } from '@/lib/hooks/use-orcamentos'
import { STATUS_CONFIG, OrcamentoStatus } from '@/lib/types/app'

export function OrcamentosList() {
  const {
    orcamentos,
    loading,
    loadingMore,
    hasMore,
    filters,
    sortBy,
    updateFilters,
    updateSort,
    loadMore,
    refresh,
    deleteOrcamento,
    updateStatus,
  } = useOrcamentos()

  const observer = useRef<IntersectionObserver>()
  
  // Ref para scroll infinito
  const lastElementRef = useCallback((node: HTMLTableRowElement) => {
    if (loading || loadingMore) return
    if (observer.current) observer.current.disconnect()
    
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        loadMore()
      }
    })
    
    if (node) observer.current.observe(node)
  }, [loading, loadingMore, hasMore, loadMore])

  const clearFilters = () => {
    updateFilters({
      search: '',
      status: 'all',
      cliente: '',
      dateFrom: null,
      dateTo: null,
    })
  }

  const hasActiveFilters = filters.search || filters.status !== 'all' || 
    filters.cliente || filters.dateFrom || filters.dateTo

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight">📋 Orçamentos</h1>
        <Link href="/orcamentos/novo">
          <Button className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Novo Orçamento
          </Button>
        </Link>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg border p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Busca */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por número, cliente, item..."
              className="pl-10"
              value={filters.search}
              onChange={(e) => updateFilters({ search: e.target.value })}
            />
          </div>

          {/* Filtro por Status */}
          <Select
            value={filters.status}
            onValueChange={(value) => updateFilters({ status: value as OrcamentoStatus | 'all' })}
          >
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.icon} {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Limpar filtros */}
          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters}>
              <X className="mr-2 h-4 w-4" />
              Limpar
            </Button>
          )}
        </div>
      </div>

      {/* Tabela */}
      <OrcamentosTable
        orcamentos={orcamentos}
        loading={loading}
        loadingMore={loadingMore}
        sortBy={sortBy}
        onSort={updateSort}
        onDelete={deleteOrcamento}
        onStatusChange={updateStatus}
        lastElementRef={lastElementRef}
        onRefresh={refresh}
      />
    </div>
  )
}
```

---

## 3.4 Componente OrcamentosTable

**`components/features/orcamentos-table.tsx`:**

```typescript
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
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
  onRefresh,
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
```

---

## 3.5 Componente StatusBadge

**`components/features/status-badge.tsx`:**

```typescript
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
```

---

## 3.6 Utilitários de Formatação

**`lib/utils/format.ts`:**

```typescript
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(date))
}

export function formatDateTime(date: string | Date): string {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date))
}
```

---

## ✅ Critérios de Conclusão da Fase 3

- [ ] Lista de orçamentos carregando do Supabase
- [ ] Tabela com todas as colunas especificadas
- [ ] Ordenação funcionando em todas as colunas sortáveis
- [ ] Filtro por status funcionando
- [ ] Busca full-text funcionando
- [ ] Scroll infinito carregando mais itens
- [ ] Menu de ações funcionando (visualizar, editar, excluir)
- [ ] Alteração de status inline funcionando
- [ ] Confirmação de exclusão com dialog
- [ ] Loading state com skeleton
- [ ] Empty state quando sem dados
- [ ] Toasts de feedback

---

## 🔗 Próxima Fase

➡️ [FASE 4: Criação/Edição de Orçamentos](./FASE4.MD)




