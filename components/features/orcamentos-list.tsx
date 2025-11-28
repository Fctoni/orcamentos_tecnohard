'use client'

import { useRef, useCallback } from 'react'
import { Plus, Search, X } from 'lucide-react'
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


