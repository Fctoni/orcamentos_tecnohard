'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon, Loader2, Save, Eye, ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Skeleton } from '@/components/ui/skeleton'
import { ItemList } from './item-list'
import { useOrcamento } from '@/lib/hooks/use-orcamento'
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

