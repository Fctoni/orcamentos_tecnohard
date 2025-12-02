'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

export interface Configuracao {
  id: string
  chave: string
  valor: string | null
}

export function useConfiguracoes() {
  const supabase = createClient()
  const [configuracoes, setConfiguracoes] = useState<Configuracao[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const fetchConfiguracoes = useCallback(async () => {
    const { data } = await supabase
      .from('configuracoes')
      .select('*')
    
    setConfiguracoes(data || [])
    setLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchConfiguracoes()
  }, [fetchConfiguracoes])

  const getConfiguracao = (chave: string): string | null => {
    const config = configuracoes.find(c => c.chave === chave)
    return config?.valor || null
  }

  const setConfiguracao = async (chave: string, valor: string | null) => {
    setSaving(true)
    
    const { error } = await supabase
      .from('configuracoes')
      .upsert(
        { chave, valor, updated_at: new Date().toISOString() },
        { onConflict: 'chave' }
      )
    
    if (!error) {
      await fetchConfiguracoes()
    }
    
    setSaving(false)
    return { error }
  }

  // Upload de logo
  const uploadLogo = async (file: File) => {
    setSaving(true)
    
    try {
      // Remove logo antigo se existir
      const logoAtual = getConfiguracao('logo_path')
      if (logoAtual) {
        await supabase.storage.from('configuracoes').remove([logoAtual])
      }

      // Upload do novo logo
      const fileExt = file.name.split('.').pop()
      const fileName = `logo.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('configuracoes')
        .upload(fileName, file, { upsert: true })

      if (uploadError) throw uploadError

      // Salvar path na configuração
      await setConfiguracao('logo_path', fileName)
      
      setSaving(false)
      return { error: null }
    } catch (error) {
      setSaving(false)
      return { error }
    }
  }

  const removeLogo = async () => {
    setSaving(true)
    
    try {
      const logoAtual = getConfiguracao('logo_path')
      if (logoAtual) {
        await supabase.storage.from('configuracoes').remove([logoAtual])
      }
      
      await setConfiguracao('logo_path', null)
      
      setSaving(false)
      return { error: null }
    } catch (error) {
      setSaving(false)
      return { error }
    }
  }

  const getLogoUrl = (): string | null => {
    const logoPath = getConfiguracao('logo_path')
    if (!logoPath) return null
    
    const { data } = supabase.storage.from('configuracoes').getPublicUrl(logoPath)
    return data.publicUrl
  }

  return {
    configuracoes,
    loading,
    saving,
    getConfiguracao,
    setConfiguracao,
    uploadLogo,
    removeLogo,
    getLogoUrl,
    refresh: fetchConfiguracoes,
  }
}

