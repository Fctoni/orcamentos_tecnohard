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
      // Verificar se o bucket existe tentando listar
      const { error: bucketError } = await supabase.storage
        .from('configuracoes')
        .list('', { limit: 1 })
      
      if (bucketError) {
        // Se o bucket nao existe, retornar erro mais claro
        const errorMsg = bucketError.message.includes('not found') || bucketError.message.includes('400')
          ? 'Bucket "configuracoes" nao encontrado. Crie o bucket no Supabase Dashboard > Storage com este nome exato.'
          : bucketError.message
        throw new Error(errorMsg)
      }

      // Remove logo antigo se existir
      const logoAtual = getConfiguracao('logo_path')
      if (logoAtual) {
        await supabase.storage.from('configuracoes').remove([logoAtual])
      }

      // Upload do novo logo
      const fileExt = file.name.split('.').pop()?.toLowerCase() || 'png'
      const fileName = `logo.${fileExt}`
      
      const { error: uploadError } = await supabase.storage
        .from('configuracoes')
        .upload(fileName, file, { upsert: true })

      if (uploadError) {
        // Erro mais claro para problemas de permissao
        const errorMsg = uploadError.message.includes('400') || uploadError.message.includes('policy')
          ? 'Erro de permissao. Verifique as policies RLS do bucket "configuracoes" no Supabase Dashboard.'
          : uploadError.message
        throw new Error(errorMsg)
      }

      // Salvar path na configuração
      await setConfiguracao('logo_path', fileName)
      
      setSaving(false)
      return { error: null }
    } catch (error: any) {
      setSaving(false)
      console.error('Erro no upload do logo:', error)
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

  const [logoUrl, setLogoUrl] = useState<string | null>(null)

  // Gerar URL assinada para o logo (funciona mesmo sem bucket publico)
  const refreshLogoUrl = useCallback(async () => {
    const logoPath = getConfiguracao('logo_path')
    if (!logoPath) {
      setLogoUrl(null)
      return
    }
    
    // Primeiro tenta URL publica
    const { data: publicData } = supabase.storage.from('configuracoes').getPublicUrl(logoPath)
    
    // Verifica se a URL publica funciona testando com fetch
    try {
      const response = await fetch(publicData.publicUrl, { method: 'HEAD' })
      if (response.ok) {
        setLogoUrl(publicData.publicUrl)
        return
      }
    } catch {
      // URL publica nao funciona, usar assinada
    }
    
    // Fallback: usar URL assinada (valida por 1 hora)
    const { data: signedData, error } = await supabase.storage
      .from('configuracoes')
      .createSignedUrl(logoPath, 3600)
    
    if (!error && signedData) {
      setLogoUrl(signedData.signedUrl)
    }
  }, [supabase, getConfiguracao])

  // Atualizar URL do logo quando configuracoes carregarem
  useEffect(() => {
    if (!loading) {
      refreshLogoUrl()
    }
  }, [loading, configuracoes, refreshLogoUrl])

  const getLogoUrl = (): string | null => {
    return logoUrl
  }

  const getElaboradoPorDefault = (): string | null => {
    return getConfiguracao('elaborado_por_default')
  }

  const setElaboradoPorDefault = async (valor: string | null) => {
    return setConfiguracao('elaborado_por_default', valor)
  }

  const getObservacoesDefault = (): string | null => {
    return getConfiguracao('observacoes_default')
  }

  const setObservacoesDefault = async (valor: string | null) => {
    return setConfiguracao('observacoes_default', valor)
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
    getElaboradoPorDefault,
    setElaboradoPorDefault,
    getObservacoesDefault,
    setObservacoesDefault,
    refresh: fetchConfiguracoes,
  }
}

