'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Plus, Trash2, Edit, GripVertical, Save, X, Upload, ImageIcon, Loader2 } from 'lucide-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { useProcessos } from '@/lib/hooks/use-processos'
import { useConfiguracoes } from '@/lib/hooks/use-configuracoes'
import { Processo } from '@/lib/types/app'

// Componente de item sortável
interface SortableProcessoItemProps {
  processo: Processo
  editingId: string | null
  editForm: { codigo: string; nome: string }
  setEditForm: (form: { codigo: string; nome: string }) => void
  onStartEdit: (processo: Processo) => void
  onCancelEdit: () => void
  onSaveEdit: () => void
  onToggleAtivo: (id: string, ativo: boolean) => void
  onDelete: (id: string) => void
  saving: boolean
}

function SortableProcessoItem({
  processo,
  editingId,
  editForm,
  setEditForm,
  onStartEdit,
  onCancelEdit,
  onSaveEdit,
  onToggleAtivo,
  onDelete,
  saving,
}: SortableProcessoItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: processo.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-4 p-3 border rounded-lg bg-background ${!processo.ativo ? 'opacity-50 bg-gray-50' : ''} ${isDragging ? 'shadow-lg z-50' : ''}`}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing touch-none"
        title="Arraste para reordenar"
      >
        <GripVertical className="h-5 w-5 text-muted-foreground" />
      </button>
      
      {editingId === processo.id ? (
        <>
          <Input
            className="w-40"
            value={editForm.codigo}
            onChange={(e) => setEditForm({ ...editForm, codigo: e.target.value })}
          />
          <Input
            className="flex-1"
            value={editForm.nome}
            onChange={(e) => setEditForm({ ...editForm, nome: e.target.value })}
          />
          <div className="flex gap-2">
            <Button size="sm" onClick={onSaveEdit} disabled={saving}>
              <Save className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="outline" onClick={onCancelEdit}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </>
      ) : (
        <>
          <code className="text-sm bg-secondary px-2 py-1 rounded w-40 truncate">
            {processo.codigo}
          </code>
          <span className="flex-1 font-medium">{processo.nome}</span>
          
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Switch
                checked={processo.ativo}
                onCheckedChange={(checked) => onToggleAtivo(processo.id, checked)}
              />
              <Label className="text-sm text-muted-foreground">
                {processo.ativo ? 'Ativo' : 'Inativo'}
              </Label>
            </div>
            
            <Button size="sm" variant="ghost" onClick={() => onStartEdit(processo)}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="ghost" className="text-red-600" onClick={() => onDelete(processo.id)}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </>
      )}
    </div>
  )
}

export default function ConfigPage() {
  const { toast } = useToast()
  const { processos, loading: loadingProcessos, saving: savingProcessos, addProcesso, updateProcesso, deleteProcesso, toggleAtivo, reorderProcessos } = useProcessos(true)
  const { loading: loadingConfig, saving: savingConfig, getLogoUrl, uploadLogo, removeLogo } = useConfiguracoes()

  // Estado para edição de processos
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({ codigo: '', nome: '' })
  const [showAddForm, setShowAddForm] = useState(false)
  const [newProcesso, setNewProcesso] = useState({ codigo: '', nome: '' })
  const [deleteId, setDeleteId] = useState<string | null>(null)

  // Estado para logo
  const [logoPreview, setLogoPreview] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const logoUrl = getLogoUrl()

  // Configuração do drag & drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      const oldIndex = processos.findIndex((p) => p.id === active.id)
      const newIndex = processos.findIndex((p) => p.id === over.id)
      
      const reordered = arrayMove(processos, oldIndex, newIndex)
      await reorderProcessos(reordered)
      toast({ title: 'Ordem atualizada!' })
    }
  }

  // Handlers de Processos
  const handleStartEdit = (processo: Processo) => {
    setEditingId(processo.id)
    setEditForm({ codigo: processo.codigo, nome: processo.nome })
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({ codigo: '', nome: '' })
  }

  const handleSaveEdit = async () => {
    if (!editingId || !editForm.codigo || !editForm.nome) return
    
    const { error } = await updateProcesso(editingId, editForm)
    
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao salvar', description: 'Não foi possível atualizar o processo.' })
    } else {
      toast({ title: 'Processo atualizado!' })
      handleCancelEdit()
    }
  }

  const handleAddProcesso = async () => {
    if (!newProcesso.codigo || !newProcesso.nome) {
      toast({ variant: 'destructive', title: 'Preencha todos os campos' })
      return
    }

    const { error } = await addProcesso(newProcesso)
    
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao adicionar', description: 'Código já existe ou erro no servidor.' })
    } else {
      toast({ title: 'Processo adicionado!' })
      setNewProcesso({ codigo: '', nome: '' })
      setShowAddForm(false)
    }
  }

  const handleDeleteProcesso = async () => {
    if (!deleteId) return
    
    const { error } = await deleteProcesso(deleteId)
    
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao excluir', description: 'Não foi possível excluir o processo.' })
    } else {
      toast({ title: 'Processo excluído!' })
    }
    setDeleteId(null)
  }

  const handleToggleAtivo = async (id: string, ativo: boolean) => {
    await toggleAtivo(id, ativo)
  }

  // Handlers de Logo
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validar tipo
    if (!file.type.startsWith('image/')) {
      toast({ variant: 'destructive', title: 'Arquivo inválido', description: 'Selecione uma imagem (PNG, JPG, etc.)' })
      return
    }

    // Validar tamanho (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast({ variant: 'destructive', title: 'Arquivo muito grande', description: 'O logo deve ter no máximo 2MB.' })
      return
    }

    // Preview
    const reader = new FileReader()
    reader.onload = (e) => setLogoPreview(e.target?.result as string)
    reader.readAsDataURL(file)
  }

  const handleUploadLogo = async () => {
    const file = fileInputRef.current?.files?.[0]
    if (!file) return

    const { error } = await uploadLogo(file)
    
    if (error) {
      toast({ variant: 'destructive', title: 'Erro no upload', description: 'Não foi possível enviar o logo.' })
    } else {
      toast({ title: 'Logo atualizado!' })
      setLogoPreview(null)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }

  const handleRemoveLogo = async () => {
    const { error } = await removeLogo()
    
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao remover', description: 'Não foi possível remover o logo.' })
    } else {
      toast({ title: 'Logo removido!' })
      setLogoPreview(null)
    }
  }

  const handleCancelLogoPreview = () => {
    setLogoPreview(null)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  if (loadingProcessos || loadingConfig) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">⚙️ Configurações</h1>

      {/* Seção: Logo da Empresa */}
      <Card>
        <CardHeader>
          <CardTitle>🖼️ Logo da Empresa</CardTitle>
          <CardDescription>
            Logo padrão que aparecerá em todos os orçamentos e PDFs gerados.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Preview do logo atual ou novo */}
          <div className="flex items-center gap-6">
            <div className="w-64 h-32 border rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
              {logoPreview ? (
                <Image
                  src={logoPreview}
                  alt="Preview do logo"
                  width={256}
                  height={128}
                  className="object-contain max-h-full"
                />
              ) : logoUrl ? (
                <Image
                  src={logoUrl}
                  alt="Logo da empresa"
                  width={256}
                  height={128}
                  className="object-contain max-h-full"
                />
              ) : (
                <div className="text-center text-muted-foreground">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Nenhum logo definido</p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              
              {logoPreview ? (
                <div className="flex gap-2">
                  <Button onClick={handleUploadLogo} disabled={savingConfig}>
                    {savingConfig && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    <Save className="mr-2 h-4 w-4" /> Salvar Logo
                  </Button>
                  <Button variant="outline" onClick={handleCancelLogoPreview}>
                    <X className="mr-2 h-4 w-4" /> Cancelar
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="mr-2 h-4 w-4" /> Selecionar Logo
                  </Button>
                  {logoUrl && (
                    <Button variant="outline" onClick={handleRemoveLogo} disabled={savingConfig}>
                      <Trash2 className="mr-2 h-4 w-4" /> Remover
                    </Button>
                  )}
                </div>
              )}
              
              <p className="text-xs text-muted-foreground">
                Formatos: PNG, JPG, WEBP. Tamanho máximo: 2MB.
                <br />
                Recomendado: fundo transparente, proporção ~3:1.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Seção: Processos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>🔧 Processos</CardTitle>
            <CardDescription>
              Gerencie os processos disponíveis para seleção nos itens dos orçamentos.
              <br />
              <span className="text-xs">Arraste os itens para reordenar.</span>
            </CardDescription>
          </div>
          {!showAddForm && (
            <Button onClick={() => setShowAddForm(true)}>
              <Plus className="mr-2 h-4 w-4" /> Novo Processo
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Formulário de novo processo */}
          {showAddForm && (
            <div className="flex items-end gap-4 p-4 bg-secondary/30 rounded-lg">
              <div className="flex-1 space-y-2">
                <Label>Código</Label>
                <Input
                  placeholder="ex: tempera-especial"
                  value={newProcesso.codigo}
                  onChange={(e) => setNewProcesso({ ...newProcesso, codigo: e.target.value })}
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label>Nome</Label>
                <Input
                  placeholder="ex: Têmpera Especial"
                  value={newProcesso.nome}
                  onChange={(e) => setNewProcesso({ ...newProcesso, nome: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleAddProcesso} disabled={savingProcessos}>
                  {savingProcessos && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  <Save className="mr-2 h-4 w-4" /> Salvar
                </Button>
                <Button variant="outline" onClick={() => { setShowAddForm(false); setNewProcesso({ codigo: '', nome: '' }) }}>
                  <X className="mr-2 h-4 w-4" /> Cancelar
                </Button>
              </div>
            </div>
          )}

          {/* Lista de processos com drag & drop */}
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={processos.map(p => p.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-2">
                {processos.map((processo) => (
                  <SortableProcessoItem
                    key={processo.id}
                    processo={processo}
                    editingId={editingId}
                    editForm={editForm}
                    setEditForm={setEditForm}
                    onStartEdit={handleStartEdit}
                    onCancelEdit={handleCancelEdit}
                    onSaveEdit={handleSaveEdit}
                    onToggleAtivo={handleToggleAtivo}
                    onDelete={setDeleteId}
                    saving={savingProcessos}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>

          {processos.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhum processo cadastrado.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir processo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O processo será removido permanentemente.
              <br /><br />
              <strong>Atenção:</strong> Orçamentos existentes que usam este processo não serão afetados.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteProcesso} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
