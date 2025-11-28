'use client'

import { useState } from 'react'
import { Plus, GripVertical, Trash2, Edit, Copy, ChevronDown, ChevronUp } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { ItemForm } from './item-form'
import { useItens } from '@/lib/hooks/use-itens'
import { useToast } from '@/hooks/use-toast'
import { OrcamentoItemWithAnexos } from '@/lib/types/app'
import { formatCurrency } from '@/lib/utils/format'

interface ItemListProps {
  orcamentoId: string
  itens: OrcamentoItemWithAnexos[]
  onItensChange: (itens: OrcamentoItemWithAnexos[]) => void
}

export function ItemList({ orcamentoId, itens, onItensChange }: ItemListProps) {
  const { toast } = useToast()
  const { addItem, updateItem, deleteItem, saving } = useItens(orcamentoId)
  
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<OrcamentoItemWithAnexos | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  const handleAddItem = async (data: any) => {
    const ordem = itens.length
    const preco_total = data.quantidade * data.preco_unitario
    
    const { data: item, error } = await addItem({ ...data, preco_total, ordem })
    
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao adicionar item', description: (error as any).message })
    } else if (item) {
      onItensChange([...itens, item])
      setShowForm(false)
      toast({ title: 'Item adicionado com sucesso!' })
    }
  }

  const handleUpdateItem = async (data: any) => {
    if (!editingItem) return
    
    const preco_total = data.quantidade * data.preco_unitario
    const { data: item, error } = await updateItem(editingItem.id, { ...data, preco_total })
    
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao atualizar item', description: (error as any).message })
    } else if (item) {
      onItensChange(itens.map(i => i.id === item.id ? item : i))
      setEditingItem(null)
      toast({ title: 'Item atualizado com sucesso!' })
    }
  }

  const handleDeleteItem = async () => {
    if (!deleteId) return
    
    const { error } = await deleteItem(deleteId)
    
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao excluir item' })
    } else {
      onItensChange(itens.filter(i => i.id !== deleteId))
      toast({ title: 'Item excluído com sucesso!' })
    }
    setDeleteId(null)
  }

  const handleDuplicateItem = async (item: OrcamentoItemWithAnexos) => {
    const { id, created_at, anexos, ...data } = item
    const ordem = itens.length
    
    const { data: newItem, error } = await addItem({ ...data, ordem })
    
    if (error) {
      toast({ variant: 'destructive', title: 'Erro ao duplicar item' })
    } else if (newItem) {
      onItensChange([...itens, newItem])
      toast({ title: 'Item duplicado com sucesso!' })
    }
  }

  return (
    <div className="space-y-4">
      {/* Lista de itens */}
      {itens.length === 0 && !showForm && (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum item adicionado. Clique no botão abaixo para adicionar.
        </div>
      )}

      {itens.map((item) => (
        <Collapsible
          key={item.id}
          open={expandedId === item.id}
          onOpenChange={(open) => setExpandedId(open ? item.id : null)}
        >
          <Card className="overflow-hidden">
            <div className="flex items-center gap-2 p-4 bg-secondary/30">
              <GripVertical className="h-5 w-5 text-muted-foreground cursor-grab" />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-semibold">{item.codigo_item}</span>
                  <span className="text-muted-foreground truncate">{item.item}</span>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <span className="text-sm text-muted-foreground">
                  {item.quantidade} {item.unidade}
                </span>
                <span className="font-semibold">
                  {formatCurrency(item.preco_total)}
                </span>
                
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="icon">
                    {expandedId === item.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>
              </div>
            </div>

            <CollapsibleContent>
              <CardContent className="pt-4 space-y-4">
                {editingItem?.id === item.id ? (
                  <ItemForm
                    initialData={item}
                    onSubmit={handleUpdateItem}
                    onCancel={() => setEditingItem(null)}
                    loading={saving}
                  />
                ) : (
                  <>
                    {/* Detalhes do item */}
                    <div className="grid gap-4 md:grid-cols-3 text-sm">
                      <div>
                        <span className="text-muted-foreground">Preço Unitário:</span>{' '}
                        <span className="font-medium">{formatCurrency(item.preco_unitario)}</span>
                      </div>
                      {item.peso_unitario && (
                        <div>
                          <span className="text-muted-foreground">Peso Unit.:</span>{' '}
                          <span className="font-medium">{item.peso_unitario} kg</span>
                        </div>
                      )}
                      {item.material && (
                        <div>
                          <span className="text-muted-foreground">Material:</span>{' '}
                          <span className="font-medium">{item.material}</span>
                        </div>
                      )}
                      {item.prazo_entrega && (
                        <div>
                          <span className="text-muted-foreground">Prazo:</span>{' '}
                          <span className="font-medium">{item.prazo_entrega}</span>
                        </div>
                      )}
                      {item.faturamento_minimo && (
                        <div>
                          <span className="text-muted-foreground">Fat. Mínimo:</span>{' '}
                          <span className="font-medium">{item.faturamento_minimo}</span>
                        </div>
                      )}
                    </div>

                    {/* Processos */}
                    {item.processos && item.processos.length > 0 && (
                      <div>
                        <span className="text-sm text-muted-foreground">Processos:</span>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {item.processos.map((p) => (
                            <Badge key={p} variant="secondary">{p}</Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Ações */}
                    <div className="flex gap-2 pt-2 border-t">
                      <Button variant="outline" size="sm" onClick={() => setEditingItem(item)}>
                        <Edit className="mr-2 h-4 w-4" /> Editar
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => handleDuplicateItem(item)}>
                        <Copy className="mr-2 h-4 w-4" /> Duplicar
                      </Button>
                      <Button variant="outline" size="sm" className="text-red-600" onClick={() => setDeleteId(item.id)}>
                        <Trash2 className="mr-2 h-4 w-4" /> Excluir
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>
      ))}

      {/* Formulário de novo item */}
      {showForm && (
        <Card>
          <CardContent className="pt-6">
            <ItemForm
              onSubmit={handleAddItem}
              onCancel={() => setShowForm(false)}
              loading={saving}
            />
          </CardContent>
        </Card>
      )}

      {/* Botão adicionar */}
      {!showForm && !editingItem && (
        <Button onClick={() => setShowForm(true)} className="w-full" variant="outline">
          <Plus className="mr-2 h-4 w-4" /> Adicionar Item
        </Button>
      )}

      {/* Dialog de confirmação de exclusão */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir item?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. O item será removido do orçamento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteItem} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}


