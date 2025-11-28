'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Save, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useProcessos } from '@/lib/hooks/use-processos'
import { itemSchema, type ItemFormData } from '@/lib/utils/validators'
import { OrcamentoItem } from '@/lib/types/app'

interface ItemFormProps {
  initialData?: OrcamentoItem
  onSubmit: (data: ItemFormData) => void
  onCancel: () => void
  loading?: boolean
}

const UNIDADES = ['kg', 'pç', 'un', 'cx', 'm', 'm²', 'm³', 'L', 'ton']

export function ItemForm({ initialData, onSubmit, onCancel, loading }: ItemFormProps) {
  const { processos } = useProcessos()
  
  const form = useForm<ItemFormData>({
    resolver: zodResolver(itemSchema),
    defaultValues: {
      codigo_item: initialData?.codigo_item || '',
      item: initialData?.item || '',
      unidade: initialData?.unidade || 'kg',
      quantidade: initialData?.quantidade || 1,
      peso_unitario: initialData?.peso_unitario || null,
      preco_unitario: initialData?.preco_unitario || 0,
      material: initialData?.material || '',
      processos: initialData?.processos || [],
      prazo_entrega: initialData?.prazo_entrega || '',
      faturamento_minimo: initialData?.faturamento_minimo || '',
    },
  })

  const handleSubmit = (data: ItemFormData) => {
    onSubmit(data)
  }

  const toggleProcesso = (codigo: string) => {
    const current = form.getValues('processos') || []
    if (current.includes(codigo)) {
      form.setValue('processos', current.filter(p => p !== codigo))
    } else {
      form.setValue('processos', [...current, codigo])
    }
  }

  const selectedProcessos = form.watch('processos') || []

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="codigo_item"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código *</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: ITEM-001" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="item"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Descrição *</FormLabel>
                <FormControl>
                  <Input placeholder="Descrição do item" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <FormField
            control={form.control}
            name="quantidade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Quantidade *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="unidade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unidade *</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {UNIDADES.map(u => (
                      <SelectItem key={u} value={u}>{u}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="peso_unitario"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peso Unit. (kg)</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.001" 
                    {...field} 
                    value={field.value ?? ''} 
                    onChange={e => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="preco_unitario"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço Unitário *</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" min="0.01" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <FormField
            control={form.control}
            name="material"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Material</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Aço SAE 1045" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="prazo_entrega"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prazo de Entrega</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: 15 dias úteis" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="faturamento_minimo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Faturamento Mínimo</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: R$ 500,00" {...field} value={field.value || ''} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Processos */}
        <div>
          <FormLabel>Processos</FormLabel>
          <div className="flex flex-wrap gap-2 mt-2">
            {processos.map((processo) => (
              <label
                key={processo.id}
                className="flex items-center gap-2 px-3 py-2 rounded-md border cursor-pointer hover:bg-secondary/50"
              >
                <Checkbox
                  checked={selectedProcessos.includes(processo.nome)}
                  onCheckedChange={() => toggleProcesso(processo.nome)}
                />
                <span className="text-sm">{processo.nome}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Botões */}
        <div className="flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>
            <X className="mr-2 h-4 w-4" /> Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            <Save className="mr-2 h-4 w-4" />
            {initialData ? 'Atualizar' : 'Adicionar'}
          </Button>
        </div>
      </form>
    </Form>
  )
}


