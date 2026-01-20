# 📎 FASE 5: Upload de Anexos

**Duração Estimada:** Semana 3  
**Objetivo:** Gerenciar anexos dos itens com Supabase Storage

---

## 📋 Checklist de Tarefas

- [ ] 5.1 Configurar Supabase Storage (se não feito)
- [ ] 5.2 Criar hook `useAnexos`
- [ ] 5.3 Criar componente AnexoUpload
- [ ] 5.4 Criar componente AnexoList
- [ ] 5.5 Implementar preview de imagens
- [ ] 5.6 Implementar download de anexos
- [ ] 5.7 Implementar exclusão com confirmação
- [ ] 5.8 Validar tipos e tamanhos de arquivo
- [ ] 5.9 Integrar com ItemList

---

## 5.1 Verificar Configuração do Storage

O bucket `orcamento-anexos` deve já estar criado na Fase 1. Verificar se as policies estão corretas:

```sql
-- Verificar bucket
SELECT * FROM storage.buckets WHERE id = 'orcamento-anexos';

-- Verificar policies
SELECT * FROM storage.policies WHERE bucket_id = 'orcamento-anexos';
```

---

## 5.2 Hook useAnexos

**`lib/hooks/use-anexos.ts`:**

```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { OrcamentoAnexo, OrcamentoAnexoInsert } from '@/lib/types/app'

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

  const getAnexoUrl = (storagePath: string): string => {
    const { data } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(storagePath)
    
    return data.publicUrl
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
```

---

## 5.3 Componente AnexoUpload

**`components/features/anexo-upload.tsx`:**

```typescript
'use client'

import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, Loader2, FileIcon, ImageIcon } from 'lucide-react'

import { Button } from '@/components/ui/button'
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
  const { uploading, progress, uploadAnexo, ALLOWED_TYPES, MAX_FILE_SIZE } = useAnexos(itemId, orcamentoId)
  const [pendingFiles, setPendingFiles] = useState<File[]>([])

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
```

**Nota:** Instalar `react-dropzone`:

```bash
npm install react-dropzone
```

---

## 5.4 Componente AnexoList

**`components/features/anexo-list.tsx`:**

```typescript
'use client'

import { useState } from 'react'
import { Download, Trash2, Eye, FileIcon, ImageIcon, FileText } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useAnexos } from '@/lib/hooks/use-anexos'
import { useToast } from '@/hooks/use-toast'
import { OrcamentoAnexo } from '@/lib/types/app'

interface AnexoListProps {
  anexos: OrcamentoAnexo[]
  itemId: string
  orcamentoId: string
  onDelete: (id: string) => void
}

export function AnexoList({ anexos, itemId, orcamentoId, onDelete }: AnexoListProps) {
  const { toast } = useToast()
  const { deleteAnexo, downloadAnexo, getSignedUrl } = useAnexos(itemId, orcamentoId)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [previewName, setPreviewName] = useState<string>('')

  const handleDelete = async () => {
    const anexo = anexos.find(a => a.id === deleteId)
    if (!anexo) return

    const { error } = await deleteAnexo(anexo)
    
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao excluir', description: error.message })
    } else {
      onDelete(anexo.id)
      toast({ title: 'Anexo excluído com sucesso!' })
    }
    setDeleteId(null)
  }

  const handlePreview = async (anexo: OrcamentoAnexo) => {
    const url = await getSignedUrl(anexo.storage_path)
    if (url) {
      setPreviewUrl(url)
      setPreviewName(anexo.nome_arquivo)
    }
  }

  const isImage = (tipo: string) => tipo.startsWith('image/')
  const isPdf = (tipo: string) => tipo === 'application/pdf'

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  const getFileIcon = (tipo: string) => {
    if (isImage(tipo)) return <ImageIcon className="h-8 w-8 text-blue-500" />
    if (isPdf(tipo)) return <FileText className="h-8 w-8 text-red-500" />
    return <FileIcon className="h-8 w-8 text-gray-500" />
  }

  if (anexos.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-4">
        Nenhum anexo neste item.
      </p>
    )
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {anexos.map((anexo) => (
          <div
            key={anexo.id}
            className="border rounded-lg p-3 space-y-2 bg-secondary/30"
          >
            <div className="flex items-center justify-center h-16">
              {getFileIcon(anexo.tipo_arquivo)}
            </div>
            
            <div className="text-center">
              <p className="text-xs font-medium truncate" title={anexo.nome_arquivo}>
                {anexo.nome_arquivo}
              </p>
              <p className="text-xs text-muted-foreground">
                {formatFileSize(anexo.tamanho)}
              </p>
            </div>

            <div className="flex justify-center gap-1">
              {(isImage(anexo.tipo_arquivo) || isPdf(anexo.tipo_arquivo)) && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handlePreview(anexo)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => downloadAnexo(anexo)}
              >
                <Download className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-red-600"
                onClick={() => setDeleteId(anexo.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      {/* Dialog de Preview */}
      <Dialog open={!!previewUrl} onOpenChange={() => setPreviewUrl(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>{previewName}</DialogTitle>
          </DialogHeader>
          {previewUrl && (
            previewUrl.includes('.pdf') ? (
              <iframe src={previewUrl} className="w-full h-[70vh]" />
            ) : (
              <img src={previewUrl} alt={previewName} className="max-w-full h-auto" />
            )
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de Confirmação de Exclusão */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir anexo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O arquivo será removido permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
```

---

## 5.5 Integrar com ItemList

Adicionar seção de anexos dentro do card expandido do item em `item-list.tsx`:

```typescript
// Dentro do CollapsibleContent, após os detalhes do item:

{/* Anexos */}
<div className="space-y-4 pt-4 border-t">
  <h4 className="text-sm font-semibold">📎 Anexos</h4>
  
  <AnexoList
    anexos={item.anexos || []}
    itemId={item.id}
    orcamentoId={orcamentoId}
    onDelete={(id) => {
      const updatedItem = {
        ...item,
        anexos: item.anexos?.filter(a => a.id !== id) || []
      }
      onItensChange(itens.map(i => i.id === item.id ? updatedItem : i))
    }}
  />
  
  <AnexoUpload
    itemId={item.id}
    orcamentoId={orcamentoId}
    onUploadComplete={(anexo) => {
      const updatedItem = {
        ...item,
        anexos: [...(item.anexos || []), anexo]
      }
      onItensChange(itens.map(i => i.id === item.id ? updatedItem : i))
    }}
  />
</div>
```

---

## 5.6 Componente Progress (se não existir)

```bash
npx shadcn@latest add progress
```

---

## ✅ Critérios de Conclusão da Fase 5

- [ ] Upload de arquivos funcionando via drag & drop
- [ ] Upload de arquivos funcionando via clique
- [ ] Validação de tipos de arquivo (PNG, JPG, GIF, WEBP, PDF)
- [ ] Validação de tamanho (máx 10MB)
- [ ] Progress bar durante upload
- [ ] Preview de imagens
- [ ] Preview de PDFs
- [ ] Download de arquivos
- [ ] Exclusão com confirmação
- [ ] Anexos salvos no Supabase Storage
- [ ] Referências salvas na tabela `orcamento_anexos`
- [ ] Integração completa com ItemList

---

## 🔗 Próxima Fase

➡️ [FASE 6: Visualização e PDF](./FASE6.MD)




