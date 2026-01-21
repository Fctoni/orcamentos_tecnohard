'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Orcamento, OrcamentoItem, OrcamentoStatus } from '@/lib/types/app'

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
      const currentLength = reset ? 0 : orcamentos.length
      
      // Usar função RPC para busca que inclui itens
      const { data, error } = await supabase.rpc('search_orcamentos', {
        search_term: filters.search || null,
        status_filter: filters.status === 'all' ? null : filters.status,
        date_from: filters.dateFrom?.toISOString() || null,
        date_to: filters.dateTo?.toISOString() || null,
        sort_column: sortBy.column,
        sort_direction: sortBy.direction,
        page_offset: currentLength,
        page_limit: pageSize,
      })

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
  }, [supabase, filters, sortBy, pageSize, orcamentos.length])

  // Buscar dados iniciais
  useEffect(() => {
    fetchOrcamentos(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  const fetchItensOrcamento = async (orcamentoId: string): Promise<{ data: OrcamentoItem[] | null; error: Error | null }> => {
    const { data, error } = await supabase
      .from('orcamento_itens')
      .select('*')
      .eq('orcamento_id', orcamentoId)
      .order('ordem')
    
    return { data, error }
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
    fetchItensOrcamento,
  }
}


