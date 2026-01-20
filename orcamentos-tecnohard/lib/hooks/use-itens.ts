'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { OrcamentoItemInsert, OrcamentoItemUpdate } from '@/lib/types/app'

export function useItens(orcamentoId: string) {
  const supabase = createClient()
  const [saving, setSaving] = useState(false)

  const addItem = async (data: Omit<OrcamentoItemInsert, 'orcamento_id'>) => {
    setSaving(true)
    try {
      const { data: item, error } = await supabase
        .from('orcamento_itens')
        .insert({ ...data, orcamento_id: orcamentoId })
        .select('*, anexos:orcamento_anexos(*)')
        .single()

      if (error) throw error
      return { data: item, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setSaving(false)
    }
  }

  const updateItem = async (itemId: string, data: OrcamentoItemUpdate) => {
    setSaving(true)
    try {
      const { data: item, error } = await supabase
        .from('orcamento_itens')
        .update(data)
        .eq('id', itemId)
        .select('*, anexos:orcamento_anexos(*)')
        .single()

      if (error) throw error
      return { data: item, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setSaving(false)
    }
  }

  const deleteItem = async (itemId: string) => {
    setSaving(true)
    try {
      const { error } = await supabase
        .from('orcamento_itens')
        .delete()
        .eq('id', itemId)

      if (error) throw error
      return { error: null }
    } catch (error) {
      return { error }
    } finally {
      setSaving(false)
    }
  }

  const reorderItems = async (items: { id: string; ordem: number }[]) => {
    setSaving(true)
    try {
      for (const item of items) {
        await supabase
          .from('orcamento_itens')
          .update({ ordem: item.ordem })
          .eq('id', item.id)
      }
      return { error: null }
    } catch (error) {
      return { error }
    } finally {
      setSaving(false)
    }
  }

  return {
    saving,
    addItem,
    updateItem,
    deleteItem,
    reorderItems,
  }
}


