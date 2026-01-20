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
            previewName.toLowerCase().endsWith('.pdf') ? (
              <iframe src={previewUrl} className="w-full h-[70vh]" />
            ) : (
              // eslint-disable-next-line @next/next/no-img-element
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

