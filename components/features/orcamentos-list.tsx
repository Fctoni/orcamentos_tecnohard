'use client'

import { useRef, useCallback, useState } from 'react'
import { Plus, Search, X, RefreshCw, Trash2 } from 'lucide-react'
import Link from 'next/link'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { OrcamentosTable } from './orcamentos-table'
import { useOrcamentos } from '@/lib/hooks/use-orcamentos'
import { useToast } from '@/hooks/use-toast'
import { STATUS_CONFIG, OrcamentoStatus } from '@/lib/types/app'

export function OrcamentosList() {
  const { toast } = useToast()
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

  // Estado de seleção
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [deleteMultiple, setDeleteMultiple] = useState(false)
  const [processingBatch, setProcessingBatch] = useState(false)

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

  // Funções de seleção
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const selectAll = () => {
    if (selectedIds.length === orcamentos.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(orcamentos.map(o => o.id))
    }
  }

  // Alteração de status em lote
  const changeStatusBatch = async (status: OrcamentoStatus) => {
    setProcessingBatch(true)
    const count = selectedIds.length
    
    for (const id of selectedIds) {
      await updateStatus(id, status)
    }
    
    setSelectedIds([])
    setProcessingBatch(false)
    toast({ title: `Status de ${count} orçamentos atualizado!` })
  }

  // Exclusão em lote
  const handleDeleteMultiple = async () => {
    setProcessingBatch(true)
    const count = selectedIds.length
    
    for (const id of selectedIds) {
      await deleteOrcamento(id)
    }
    
    setSelectedIds([])
    setDeleteMultiple(false)
    setProcessingBatch(false)
    toast({ title: `${count} orçamentos excluídos!` })
  }

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
              placeholder="Buscar por número, cliente, código ou descrição do item..."
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
        selectedIds={selectedIds}
        onToggleSelect={toggleSelect}
        onSelectAll={selectAll}
      />

      {/* Barra de ações em lote */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white rounded-lg shadow-lg border p-4 flex items-center gap-4 z-50">
          <span className="text-sm font-medium">
            {selectedIds.length} selecionado(s)
          </span>
          
          <Separator orientation="vertical" className="h-8" />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={processingBatch}>
                <RefreshCw className="mr-2 h-4 w-4" /> Alterar Status
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <DropdownMenuItem
                  key={key}
                  onClick={() => changeStatusBatch(key as OrcamentoStatus)}
                >
                  {config.icon} {config.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setDeleteMultiple(true)}
            disabled={processingBatch}
          >
            <Trash2 className="mr-2 h-4 w-4" /> Excluir
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSelectedIds([])}
            disabled={processingBatch}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Dialog de exclusão em lote */}
      <AlertDialog open={deleteMultiple} onOpenChange={setDeleteMultiple}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir {selectedIds.length} orçamentos?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Todos os orçamentos selecionados,
              seus itens e anexos serão removidos permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={processingBatch}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteMultiple}
              className="bg-red-600 hover:bg-red-700"
              disabled={processingBatch}
            >
              {processingBatch ? 'Excluindo...' : 'Sim, excluir todos'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
