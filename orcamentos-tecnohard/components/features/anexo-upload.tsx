'use client'

import { useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, Loader2 } from 'lucide-react'

import { Progress } from '@/components/ui/progress'
import { useAnexos } from '@/lib/hooks/use-anexos'
import { useToast } from '@/hooks/use-toast'
import { OrcamentoAnexo } from '@/lib/types/app'
import { cn } from '@/lib/utils'

interface AnexoUploadProps {
  itemId: string
  orcamentoId: string
  onUploadComplete: (anexo: OrcamentoAnexo) => void
}

export function AnexoUpload({ itemId, orcamentoId, onUploadComplete }: AnexoUploadProps) {
  const { toast } = useToast()
  const { uploading, progress, uploadAnexo, MAX_FILE_SIZE } = useAnexos(itemId, orcamentoId)

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      const { data, error } = await uploadAnexo(file)
      
      if (error) {
        toast({
          variant: 'destructive',
          title: 'Erro no upload',
          description: error.message,
        })
      } else if (data) {
        toast({ title: 'Arquivo enviado com sucesso!' })
        onUploadComplete(data)
      }
    }
  }, [uploadAnexo, onUploadComplete, toast])

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.webp'],
      'application/pdf': ['.pdf'],
    },
    maxSize: MAX_FILE_SIZE,
    disabled: uploading,
  })

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors',
          isDragActive && !isDragReject && 'border-primary bg-primary/5',
          isDragReject && 'border-red-500 bg-red-50',
          !isDragActive && 'border-muted-foreground/25 hover:border-primary/50',
          uploading && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        
        {uploading ? (
          <div className="space-y-4">
            <Loader2 className="h-10 w-10 mx-auto animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Enviando arquivo...</p>
            <Progress value={progress} className="w-full max-w-xs mx-auto" />
          </div>
        ) : (
          <>
            <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-4" />
            {isDragActive ? (
              <p className="text-primary font-medium">Solte os arquivos aqui...</p>
            ) : (
              <>
                <p className="text-sm text-muted-foreground mb-2">
                  Arraste arquivos ou clique para selecionar
                </p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG, GIF, WEBP ou PDF (máx. {formatFileSize(MAX_FILE_SIZE)})
                </p>
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}

