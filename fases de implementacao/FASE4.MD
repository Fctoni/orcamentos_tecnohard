# ✏️ FASE 4: Criação/Edição de Orçamentos

**Duração Estimada:** Semanas 2-3  
**Objetivo:** CRUD completo de orçamentos com itens

---

## 📋 Checklist de Tarefas

- [ ] 4.1 Criar hook `useOrcamento` (single)
- [ ] 4.2 Criar hook `useItens`
- [ ] 4.3 Criar schema de validação do orçamento
- [ ] 4.4 Criar página de novo orçamento
- [ ] 4.5 Criar página de edição
- [ ] 4.6 Criar componente OrcamentoForm
- [ ] 4.7 Criar componente ItemForm
- [ ] 4.8 Criar componente ItemList
- [ ] 4.9 Implementar cálculos automáticos
- [ ] 4.10 Implementar geração de número
- [ ] 4.11 Implementar reordenação de itens
- [ ] 4.12 Buscar processos do banco

---

## 4.1 Hook useOrcamento

**`lib/hooks/use-orcamento.ts`:**

```typescript
'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { OrcamentoWithItems, OrcamentoInsert, OrcamentoUpdate } from '@/lib/types/app'

export function useOrcamento(id?: string) {
  const supabase = createClient()
  const [orcamento, setOrcamento] = useState<OrcamentoWithItems | null>(null)
  const [loading, setLoading] = useState(!!id)
  const [saving, setSaving] = useState(false)

  const fetchOrcamento = useCallback(async () => {
    if (!id) return
    setLoading(true)
    
    try {
      const { data, error } = await supabase
        .from('orcamentos')
        .select(`
          *,
          itens:orcamento_itens(
            *,
            anexos:orcamento_anexos(*)
          )
        `)
        .eq('id', id)
        .single()

      if (error) throw error
      
      // Ordenar itens
      if (data?.itens) {
        data.itens.sort((a: any, b: any) => a.ordem - b.ordem)
      }
      
      setOrcamento(data)
    } catch (error) {
      console.error('Erro ao buscar orçamento:', error)
    } finally {
      setLoading(false)
    }
  }, [id, supabase])

  useEffect(() => {
    if (id) fetchOrcamento()
  }, [id, fetchOrcamento])

  const createOrcamento = async (data: Omit<OrcamentoInsert, 'numero'>) => {
    setSaving(true)
    try {
      // Gerar número do orçamento
      const { data: numeroData, error: numeroError } = await supabase
        .rpc('gerar_numero_orcamento')

      if (numeroError) throw numeroError

      const { data: orcamentoData, error } = await supabase
        .from('orcamentos')
        .insert({ ...data, numero: numeroData })
        .select()
        .single()

      if (error) throw error
      return { data: orcamentoData, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setSaving(false)
    }
  }

  const updateOrcamento = async (data: OrcamentoUpdate) => {
    if (!id) return { data: null, error: new Error('ID não fornecido') }
    
    setSaving(true)
    try {
      const { data: orcamentoData, error } = await supabase
        .from('orcamentos')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      
      // Atualizar estado local
      setOrcamento(prev => prev ? { ...prev, ...orcamentoData } : null)
      
      return { data: orcamentoData, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setSaving(false)
    }
  }

  const duplicateOrcamento = async (sourceId: string) => {
    setSaving(true)
    try {
      // Buscar orçamento original
      const { data: original, error: fetchError } = await supabase
        .from('orcamentos')
        .select('*, itens:orcamento_itens(*)')
        .eq('id', sourceId)
        .single()

      if (fetchError) throw fetchError

      // Criar novo orçamento
      const { data: novoOrcamento, error: createError } = await createOrcamento({
        cliente: original.cliente,
        contato: original.contato,
        frete: original.frete,
        validade: original.validade,
        observacoes: original.observacoes,
        ocultar_valor_total: original.ocultar_valor_total,
        status: 'cadastrado',
      })

      if (createError) throw createError

      // Copiar itens (sem anexos)
      if (original.itens?.length > 0) {
        const itensParaCopiar = original.itens.map((item: any) => ({
          orcamento_id: novoOrcamento.id,
          codigo_item: item.codigo_item,
          item: item.item,
          unidade: item.unidade,
          quantidade: item.quantidade,
          peso_unitario: item.peso_unitario,
          preco_unitario: item.preco_unitario,
          preco_total: item.preco_total,
          material: item.material,
          processos: item.processos,
          prazo_entrega: item.prazo_entrega,
          faturamento_minimo: item.faturamento_minimo,
          ordem: item.ordem,
        }))

        await supabase.from('orcamento_itens').insert(itensParaCopiar)
      }

      return { data: novoOrcamento, error: null }
    } catch (error) {
      return { data: null, error }
    } finally {
      setSaving(false)
    }
  }

  return {
    orcamento,
    loading,
    saving,
    refresh: fetchOrcamento,
    createOrcamento,
    updateOrcamento,
    duplicateOrcamento,
  }
}
```

---

## 4.2 Hook useItens

**`lib/hooks/use-itens.ts`:**

```typescript
'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { OrcamentoItemInsert, OrcamentoItemUpdate, OrcamentoItemWithAnexos } from '@/lib/types/app'

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
```

---

## 4.3 Hook useProcessos

**`lib/hooks/use-processos.ts`:**

```typescript
'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Processo } from '@/lib/types/app'

export function useProcessos() {
  const supabase = createClient()
  const [processos, setProcessos] = useState<Processo[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      const { data } = await supabase
        .from('processos')
        .select('*')
        .eq('ativo', true)
        .order('ordem')
      
      setProcessos(data || [])
      setLoading(false)
    }
    fetch()
  }, [supabase])

  return { processos, loading }
}
```

---

## 4.4 Schema de Validação

**Adicionar em `lib/utils/validators.ts`:**

```typescript
// ... schemas existentes ...

export const orcamentoSchema = z.object({
  cliente: z.string().min(1, 'Cliente é obrigatório'),
  contato: z.string().optional().nullable(),
  frete: z.string().optional().nullable(),
  validade: z.date().optional().nullable(),
  observacoes: z.string().optional().nullable(),
  ocultar_valor_total: z.boolean().default(false),
  status: z.enum([
    'cadastrado',
    'aguardando-informacoes',
    'enviado',
    'em-negociacao',
    'aprovado',
    'rejeitado'
  ]).default('cadastrado'),
})

export const itemSchema = z.object({
  codigo_item: z.string().min(1, 'Código é obrigatório'),
  item: z.string().min(1, 'Descrição é obrigatória'),
  unidade: z.string().min(1, 'Unidade é obrigatória'),
  quantidade: z.coerce.number().min(0.01, 'Quantidade deve ser maior que zero'),
  peso_unitario: z.coerce.number().optional().nullable(),
  preco_unitario: z.coerce.number().min(0.01, 'Preço é obrigatório'),
  material: z.string().optional().nullable(),
  processos: z.array(z.string()).optional().nullable(),
  prazo_entrega: z.string().optional().nullable(),
  faturamento_minimo: z.string().optional().nullable(),
})

export type OrcamentoFormData = z.infer<typeof orcamentoSchema>
export type ItemFormData = z.infer<typeof itemSchema>
```

---

## 4.5 Página de Novo Orçamento

**`app/(dashboard)/orcamentos/novo/page.tsx`:**

```typescript
import { OrcamentoForm } from '@/components/features/orcamento-form'

export default function NovoOrcamentoPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">➕ Novo Orçamento</h1>
      <OrcamentoForm />
    </div>
  )
}
```

---

## 4.6 Página de Edição

**`app/(dashboard)/orcamentos/[id]/editar/page.tsx`:**

```typescript
import { OrcamentoForm } from '@/components/features/orcamento-form'

interface Props {
  params: { id: string }
}

export default function EditarOrcamentoPage({ params }: Props) {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">✏️ Editar Orçamento</h1>
      <OrcamentoForm orcamentoId={params.id} />
    </div>
  )
}
```

---

## 4.7 Componente OrcamentoForm (Estrutura Principal)

**`components/features/orcamento-form.tsx`:**

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon, Loader2, Save, Eye, ArrowLeft, Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import { ItemList } from './item-list'
import { useOrcamento } from '@/lib/hooks/use-orcamento'
import { useItens } from '@/lib/hooks/use-itens'
import { useToast } from '@/hooks/use-toast'
import { orcamentoSchema, type OrcamentoFormData } from '@/lib/utils/validators'
import { formatCurrency } from '@/lib/utils/format'
import { STATUS_CONFIG, OrcamentoItemWithAnexos } from '@/lib/types/app'
import { cn } from '@/lib/utils'

interface OrcamentoFormProps {
  orcamentoId?: string
}

export function OrcamentoForm({ orcamentoId }: OrcamentoFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const isEditing = !!orcamentoId
  
  const { orcamento, loading, saving, createOrcamento, updateOrcamento } = useOrcamento(orcamentoId)
  const [itens, setItens] = useState<OrcamentoItemWithAnexos[]>([])
  const [valorTotal, setValorTotal] = useState(0)

  const form = useForm<OrcamentoFormData>({
    resolver: zodResolver(orcamentoSchema),
    defaultValues: {
      cliente: '',
      contato: '',
      frete: '',
      validade: null,
      observacoes: '',
      ocultar_valor_total: false,
      status: 'cadastrado',
    },
  })

  // Preencher form quando carregar orçamento
  useEffect(() => {
    if (orcamento) {
      form.reset({
        cliente: orcamento.cliente,
        contato: orcamento.contato || '',
        frete: orcamento.frete || '',
        validade: orcamento.validade ? new Date(orcamento.validade) : null,
        observacoes: orcamento.observacoes || '',
        ocultar_valor_total: orcamento.ocultar_valor_total,
        status: orcamento.status,
      })
      setItens(orcamento.itens || [])
    }
  }, [orcamento, form])

  // Recalcular valor total quando itens mudam
  useEffect(() => {
    const total = itens.reduce((acc, item) => acc + (item.preco_total || 0), 0)
    setValorTotal(total)
  }, [itens])

  async function onSubmit(data: OrcamentoFormData) {
    try {
      if (isEditing) {
        const { error } = await updateOrcamento({
          ...data,
          validade: data.validade?.toISOString().split('T')[0] || null,
        })
        if (error) throw error
        toast({ title: 'Orçamento atualizado com sucesso!' })
      } else {
        const { data: novoOrcamento, error } = await createOrcamento({
          ...data,
          validade: data.validade?.toISOString().split('T')[0] || null,
        })
        if (error) throw error
        toast({ title: 'Orçamento criado com sucesso!' })
        router.push(`/orcamentos/${novoOrcamento.id}/editar`)
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: error.message,
      })
    }
  }

  if (loading) {
    return <FormSkeleton />
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Botões de ação */}
        <div className="flex flex-wrap gap-2 justify-between">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          <div className="flex gap-2">
            {isEditing && (
              <Button type="button" variant="outline" onClick={() => router.push(`/orcamentos/${orcamentoId}`)}>
                <Eye className="mr-2 h-4 w-4" /> Visualizar
              </Button>
            )}
            <Button type="submit" disabled={saving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Salvar
            </Button>
          </div>
        </div>

        {/* Seção: Dados do Cliente */}
        <Card>
          <CardHeader>
            <CardTitle>👤 Dados do Cliente</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="cliente"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cliente *</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome do cliente" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contato"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contato</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da pessoa de contato" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Seção: Condições Comerciais */}
        <Card>
          <CardHeader>
            <CardTitle>📋 Condições Comerciais</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="frete"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Frete</FormLabel>
                  <FormControl>
                    <Input placeholder="CIF, FOB ou texto livre" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="validade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Validade</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn('w-full pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}
                        >
                          {field.value ? format(field.value, 'dd/MM/yyyy') : 'Selecione uma data'}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value || undefined}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Observações gerais..." className="min-h-[100px]" {...field} value={field.value || ''} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Seção: Itens - apenas se editando */}
        {isEditing && orcamentoId && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>📦 Itens do Orçamento</CardTitle>
              <div className="text-lg font-semibold">
                Total: {formatCurrency(valorTotal)}
              </div>
            </CardHeader>
            <CardContent>
              <ItemList
                orcamentoId={orcamentoId}
                itens={itens}
                onItensChange={setItens}
              />
            </CardContent>
          </Card>
        )}

        {!isEditing && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              <p>Salve o orçamento primeiro para adicionar itens.</p>
            </CardContent>
          </Card>
        )}

        {/* Seção: Configurações */}
        <Card>
          <CardHeader>
            <CardTitle>⚙️ Configurações</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.icon} {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="ocultar_valor_total"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Ocultar valor total no PDF</FormLabel>
                  </div>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}

function FormSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-10 w-full" />
      <Skeleton className="h-[200px] w-full" />
      <Skeleton className="h-[200px] w-full" />
      <Skeleton className="h-[400px] w-full" />
    </div>
  )
}
```

---

## 4.8 Componente ItemList

**`components/features/item-list.tsx`:**

```typescript
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
      toast({ variant: 'destructive', title: 'Erro ao adicionar item', description: error.message })
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
      toast({ variant: 'destructive', title: 'Erro ao atualizar item', description: error.message })
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
```

---

## 4.9 Componente ItemForm

O componente ItemForm deve incluir todos os campos do item com validação. Por brevidade, consulte a estrutura em `lib/utils/validators.ts` para os campos necessários.

---

## ✅ Critérios de Conclusão da Fase 4

- [ ] Formulário de orçamento com todos os campos
- [ ] Validação em tempo real funcionando
- [ ] Criação de novo orçamento com número automático
- [ ] Edição de orçamento existente
- [ ] CRUD completo de itens
- [ ] Cálculos automáticos (preco_total, valor_total)
- [ ] Multi-select de processos funcionando
- [ ] Cards de itens expansíveis
- [ ] Duplicação de itens
- [ ] Reordenação visual (básica)
- [ ] Loading e saving states

---

## 🔗 Próxima Fase

➡️ [FASE 5: Upload de Anexos](./FASE5.MD)




