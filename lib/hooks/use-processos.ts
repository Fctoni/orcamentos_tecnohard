'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Processo } from '@/lib/types/app'

export function useProcessos(includeInactive = false) {
  const supabase = createClient()
  const [processos, setProcessos] = useState<Processo[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchProcessos = useCallback(async () => {
    let query = supabase
      .from('processos')
      .select('*')
      .order('ordem')
    
    if (!includeInactive) {
      query = query.eq('ativo', true)
    }
    
    const { data } = await query
    setProcessos(data || [])
    setLoading(false)
  }, [supabase, includeInactive])

  useEffect(() => {
    fetchProcessos()
  }, [fetchProcessos])

  const addProcesso = async (data: { codigo: string; nome: string }) => {
    setSaving(true)
    
    // Pegar a maior ordem atual
    const maxOrdem = processos.reduce((max, p) => Math.max(max, p.ordem), 0)
    
    const { data: newProcesso, error } = await supabase
      .from('processos')
      .insert({ ...data, ordem: maxOrdem + 1, ativo: true })
      .select()
      .single()
    
    if (!error && newProcesso) {
      await fetchProcessos()
    }
    
    setSaving(false)
    return { data: newProcesso, error }
  }

  const updateProcesso = async (id: string, data: Partial<Processo>) => {
    setSaving(true)
    
    const { data: updated, error } = await supabase
      .from('processos')
      .update(data)
      .eq('id', id)
      .select()
      .single()
    
    if (!error) {
      await fetchProcessos()
    }
    
    setSaving(false)
    return { data: updated, error }
  }

  const deleteProcesso = async (id: string) => {
    setSaving(true)
    
    const { error } = await supabase
      .from('processos')
      .delete()
      .eq('id', id)
    
    if (!error) {
      await fetchProcessos()
    }
    
    setSaving(false)
    return { error }
  }

  const toggleAtivo = async (id: string, ativo: boolean) => {
    return updateProcesso(id, { ativo })
  }

  const reorderProcessos = async (reorderedProcessos: Processo[]) => {
    setSaving(true)
    
    // Atualizar a ordem de cada processo
    const updates = reorderedProcessos.map((processo, index) => 
      supabase
        .from('processos')
        .update({ ordem: index + 1 })
        .eq('id', processo.id)
    )
    
    await Promise.all(updates)
    await fetchProcessos()
    
    setSaving(false)
  }

  return {
    processos,
    loading,
    saving,
    addProcesso,
    updateProcesso,
    deleteProcesso,
    toggleAtivo,
    reorderProcessos,
    refresh: fetchProcessos,
  }
}
