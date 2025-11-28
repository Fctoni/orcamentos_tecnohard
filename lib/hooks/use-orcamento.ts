'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { OrcamentoWithItems, OrcamentoInsert, OrcamentoUpdate } from '@/lib/types/app'

export function useOrcamento(id?: string) {
  const supabase = createClient()
  const [orcamento, setOrcamento] = useState<OrcamentoWithItems | null>(null)
  const [loading, setLoading] = useState(!!id)
  const [saving, setSaving] = useState(false)

  const fetchOrcamento = useCallback(async () => {
    if (!id) return
    setLoading(true)
    
    try {
      const { data, error } = await supabase
        .from('orcamentos')
        .select(`
          *,
          itens:orcamento_itens(
            *,
            anexos:orcamento_anexos(*)
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      
      // Ordenar itens
      if (data?.itens) {
        data.itens.sort((a: any, b: any) => a.ordem - b.ordem)
      }
      
      setOrcamento(data)
    } catch (error) {
      console.error('Erro ao buscar orçamento:', error)
    } finally {
      setLoading(false)
    }
  }, [id, supabase])

  useEffect(() => {
    if (id) fetchOrcamento()
  }, [id, fetchOrcamento])

  const createOrcamento = async (data: Omit<OrcamentoInsert, 'numero'>) => {
    setSaving(true)
    try {
      // Gerar número do orçamento
      const { data: numeroData, error: numeroError } = await supabase
        .rpc('gerar_numero_orcamento')

      if (numeroError) throw numeroError

      const { data: orcamentoData, error } = await supabase
        .from('orcamentos')
        .insert({ ...data, numero: numeroData })
        .select()
        .single()

      if (error) throw error
      return { data: orcamentoData, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setSaving(false)
    }
  }

  const updateOrcamento = async (data: OrcamentoUpdate) => {
    if (!id) return { data: null, error: new Error('ID não fornecido') }
    
    setSaving(true)
    try {
      const { data: orcamentoData, error } = await supabase
        .from('orcamentos')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      // Atualizar estado local
      setOrcamento(prev => prev ? { ...prev, ...orcamentoData } : null)
      
      return { data: orcamentoData, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setSaving(false)
    }
  }

  const duplicateOrcamento = async (sourceId: string) => {
    setSaving(true)
    try {
      // Buscar orçamento original
      const { data: original, error: fetchError } = await supabase
        .from('orcamentos')
        .select('*, itens:orcamento_itens(*)')
        .eq('id', sourceId)
        .single()

      if (fetchError) throw fetchError

      // Criar novo orçamento
      const { data: novoOrcamento, error: createError } = await createOrcamento({
        cliente: original.cliente,
        contato: original.contato,
        frete: original.frete,
        validade: original.validade,
        observacoes: original.observacoes,
        ocultar_valor_total: original.ocultar_valor_total,
        status: 'cadastrado',
      })

      if (createError) throw createError

      // Copiar itens (sem anexos)
      if (original.itens?.length > 0 && novoOrcamento) {
        const itensParaCopiar = original.itens.map((item: any) => ({
          orcamento_id: novoOrcamento.id,
          codigo_item: item.codigo_item,
          item: item.item,
          unidade: item.unidade,
          quantidade: item.quantidade,
          peso_unitario: item.peso_unitario,
          preco_unitario: item.preco_unitario,
          preco_total: item.preco_total,
          material: item.material,
          processos: item.processos,
          prazo_entrega: item.prazo_entrega,
          faturamento_minimo: item.faturamento_minimo,
          ordem: item.ordem,
        }))

        await supabase.from('orcamento_itens').insert(itensParaCopiar)
      }

      return { data: novoOrcamento, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setSaving(false)
    }
  }

  return {
    orcamento,
    loading,
    saving,
    refresh: fetchOrcamento,
    createOrcamento,
    updateOrcamento,
    duplicateOrcamento,
  }
}


