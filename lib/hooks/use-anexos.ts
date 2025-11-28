'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { OrcamentoAnexo } from '@/lib/types/app'

const BUCKET_NAME = 'orcamento-anexos'
const MAX_FILE_SIZE = 10 * 1024 * 1024 // 10MB
const ALLOWED_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/gif',
  'image/webp',
  'application/pdf',
]

interface UploadResult {
  data: OrcamentoAnexo | null
  error: Error | null
}

export function useAnexos(itemId: string, orcamentoId: string) {
  const supabase = createClient()
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Tipo de arquivo não permitido. Use: PNG, JPG, GIF, WEBP ou PDF.'
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'Arquivo muito grande. Tamanho máximo: 10MB.'
    }
    return null
  }

  const uploadAnexo = async (file: File): Promise<UploadResult> => {
    // Validar arquivo
    const validationError = validateFile(file)
    if (validationError) {
      return { data: null, error: new Error(validationError) }
    }

    setUploading(true)
    setProgress(0)

    try {
      // Gerar nome único para o arquivo
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const storagePath = `${orcamentoId}/${itemId}/${fileName}`

      // Upload para o Storage
      const { error: uploadError } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: false,
        })

      if (uploadError) throw uploadError

      setProgress(50)

      // Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser()

      // Salvar referência no banco
      const { data: anexo, error: dbError } = await supabase
        .from('orcamento_anexos')
        .insert({
          item_id: itemId,
          nome_arquivo: file.name,
          storage_path: storagePath,
          tipo_arquivo: file.type,
          tamanho: file.size,
          created_by: user?.id,
        })
        .select()
        .single()

      if (dbError) {
        // Se falhar no banco, remover do storage
        await supabase.storage.from(BUCKET_NAME).remove([storagePath])
        throw dbError
      }

      setProgress(100)
      return { data: anexo, error: null }
    } catch (error) {
      return { data: null, error: error as Error }
    } finally {
      setUploading(false)
      setProgress(0)
    }
  }

  const deleteAnexo = async (anexo: OrcamentoAnexo): Promise<{ error: Error | null }> => {
    try {
      // Remover do storage
      const { error: storageError } = await supabase.storage
        .from(BUCKET_NAME)
        .remove([anexo.storage_path])

      if (storageError) throw storageError

      // Remover do banco
      const { error: dbError } = await supabase
        .from('orcamento_anexos')
        .delete()
        .eq('id', anexo.id)

      if (dbError) throw dbError

      return { error: null }
    } catch (error) {
      return { error: error as Error }
    }
  }

  const downloadAnexo = async (anexo: OrcamentoAnexo) => {
    try {
      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .download(anexo.storage_path)

      if (error) throw error

      // Criar link de download
      const url = URL.createObjectURL(data)
      const link = document.createElement('a')
      link.href = url
      link.download = anexo.nome_arquivo
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erro ao baixar anexo:', error)
    }
  }

  const getSignedUrl = async (storagePath: string): Promise<string | null> => {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(storagePath, 3600) // 1 hora

    if (error) return null
    return data.signedUrl
  }

  return {
    uploading,
    progress,
    uploadAnexo,
    deleteAnexo,
    downloadAnexo,
    getSignedUrl,
    validateFile,
    ALLOWED_TYPES,
    MAX_FILE_SIZE,
  }
}

