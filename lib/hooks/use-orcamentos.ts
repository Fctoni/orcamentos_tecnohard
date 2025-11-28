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
      const currentLength = reset ? 0 : orcamentos.length
      
      let query = supabase
        .from('orcamentos')
        .select('*')
        .order(sortBy.column, { ascending: sortBy.direction === 'asc' })
        .range(currentLength, currentLength + pageSize - 1)

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

