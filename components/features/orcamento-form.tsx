'use client'

import { useState, useEffect, useRef } from 'react'
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
import { useConfiguracoes } from '@/lib/hooks/use-configuracoes'
import { useToast } from '@/hooks/use-toast'
import { orcamentoSchema, type OrcamentoFormData } from '@/lib/utils/validators'
import { formatCurrency } from '@/lib/utils/format'
import { STATUS_CONFIG, OrcamentoItemWithAnexos } from '@/lib/types/app'
import { cn } from '@/lib/utils'

interface OrcamentoFormProps {
  orcamentoId?: string
}

export function OrcamentoForm({ orcamentoId: initialOrcamentoId }: OrcamentoFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  
  // ID pode ser o inicial (prop) ou um novo criado via auto-save
  const [currentOrcamentoId, setCurrentOrcamentoId] = useState<string | undefined>(initialOrcamentoId)
  const isEditing = !!currentOrcamentoId
  
  const { orcamento, loading, saving, createOrcamento, updateOrcamento } = useOrcamento(currentOrcamentoId)
  const { getElaboradoPorDefault, getObservacoesDefault, loading: loadingConfig } = useConfiguracoes()
  const [itens, setItens] = useState<OrcamentoItemWithAnexos[]>([])
  const [valorTotal, setValorTotal] = useState(0)
  const [autoSaving, setAutoSaving] = useState(false)
  const [shouldFocusContato, setShouldFocusContato] = useState(false)
  const [justCreated, setJustCreated] = useState(false) // Evita mostrar skeleton após auto-save
  const autoSaveTriggered = useRef(false)
  const contatoInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<OrcamentoFormData>({
    resolver: zodResolver(orcamentoSchema),
    defaultValues: {
      cliente: '',
      contato: '',
      frete: '',
      validade: null,
      observacoes: '',
      observacoes_internas: '',
      elaborado_por: '',
      prazo_faturamento: null,
      ocultar_valor_total: true,
      status: 'cadastrado',
    },
  })

  // Preencher defaults quando for novo orçamento e config carregar
  useEffect(() => {
    if (!initialOrcamentoId && !loadingConfig) {
      const elaboradoPorDefault = getElaboradoPorDefault()
      const observacoesDefault = getObservacoesDefault()
      
      if (observacoesDefault) {
        form.setValue('observacoes', observacoesDefault)
      }
      if (elaboradoPorDefault) {
        form.setValue('elaborado_por', elaboradoPorDefault)
      }
    }
  }, [initialOrcamentoId, loadingConfig, getElaboradoPorDefault, getObservacoesDefault, form])

  // Preencher form quando carregar orçamento (mas não logo após criar)
  useEffect(() => {
    if (orcamento) {
      // Se acabou de criar, não reseta o form (já tem os valores corretos)
      // mas carrega os itens caso existam
      if (justCreated) {
        setItens(orcamento.itens || [])
        setJustCreated(false) // Reseta flag após carregar
        return
      }
      
      form.reset({
        cliente: orcamento.cliente,
        contato: orcamento.contato || '',
        frete: orcamento.frete || '',
        validade: orcamento.validade ? new Date(orcamento.validade) : null,
        observacoes: orcamento.observacoes || '',
        observacoes_internas: orcamento.observacoes_internas || '',
        elaborado_por: orcamento.elaborado_por || '',
        prazo_faturamento: orcamento.prazo_faturamento || null,
        ocultar_valor_total: orcamento.ocultar_valor_total,
        status: orcamento.status,
      })
      setItens(orcamento.itens || [])
    }
  }, [orcamento, form, justCreated])

  // Recalcular valor total quando itens mudam
  useEffect(() => {
    const total = itens.reduce((acc, item) => acc + (item.preco_total || 0), 0)
    setValorTotal(total)
  }, [itens])

  // Focar no campo contato após auto-save (com delay para garantir que o DOM estabilizou)
  useEffect(() => {
    if (shouldFocusContato) {
      const timer = setTimeout(() => {
        contatoInputRef.current?.focus()
        setShouldFocusContato(false)
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [shouldFocusContato])

  // Auto-salvar quando cliente é preenchido e perde foco (apenas para novo orçamento)
  const handleClienteBlur = async () => {
    const clienteValue = form.getValues('cliente')?.trim()
    
    // Só auto-salva se: tem cliente, não está editando, não está salvando, e ainda não foi acionado
    if (!clienteValue || isEditing || saving || autoSaving || autoSaveTriggered.current) {
      return
    }
    
    autoSaveTriggered.current = true
    setAutoSaving(true)
    
    try {
      const formData = form.getValues()
      const { data: novoOrcamento, error } = await createOrcamento({
        ...formData,
        validade: formData.validade?.toISOString().split('T')[0] || null,
      })
      
      if (error) throw error
      
      // Marca que acabou de criar (evita mostrar skeleton)
      setJustCreated(true)
      
      // Atualiza o ID localmente (sem refresh da página)
      setCurrentOrcamentoId(novoOrcamento.id)
      
      // Atualiza a URL silenciosamente (sem navegação)
      window.history.replaceState(null, '', `/orcamentos/${novoOrcamento.id}/editar`)
      
      toast({ 
        title: '✨ Orcamento criado!',
        description: 'Agora voce pode adicionar itens.',
      })
      
      // Sinaliza para focar no campo contato após a re-renderização
      setShouldFocusContato(true)
    } catch (error: any) {
      autoSaveTriggered.current = false
      toast({
        variant: 'destructive',
        title: 'Erro ao criar orcamento',
        description: error.message,
      })
    } finally {
      setAutoSaving(false)
    }
  }

  // Auto-salvar campo individual ao perder foco (para orcamentos ja criados)
  const handleFieldAutoSave = async (fieldName: keyof OrcamentoFormData) => {
    // So auto-salva se o orcamento ja existe
    if (!currentOrcamentoId || saving || autoSaving) {
      return
    }

    setAutoSaving(true)
    
    try {
      const formData = form.getValues()
      const updateData: Record<string, any> = {}
      
      // Pega apenas o campo que foi alterado
      if (fieldName === 'validade') {
        updateData[fieldName] = formData.validade?.toISOString().split('T')[0] || null
      } else {
        updateData[fieldName] = formData[fieldName]
      }
      
      const { error } = await updateOrcamento(updateData)
      
      if (error) throw error
      
      // Feedback discreto - nao mostra toast para cada campo
      console.log(`Campo ${fieldName} salvo automaticamente`)
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: error.message,
      })
    } finally {
      setAutoSaving(false)
    }
  }

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
        
        // Marca que acabou de criar (evita mostrar skeleton)
        setJustCreated(true)
        
        // Atualiza o ID localmente (sem refresh da página)
        setCurrentOrcamentoId(novoOrcamento.id)
        autoSaveTriggered.current = true
        
        // Atualiza a URL silenciosamente
        window.history.replaceState(null, '', `/orcamentos/${novoOrcamento.id}/editar`)
        
        toast({ title: 'Orçamento criado com sucesso!' })
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Erro ao salvar',
        description: error.message,
      })
    }
  }

  // Não mostra skeleton se acabou de criar (evita perder o foco)
  if (loading && !justCreated) {
    return <FormSkeleton />
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col h-[calc(100vh-120px)]">
        {/* Cabeçalho fixo - Botões de ação com Status no meio */}
        <div className="flex flex-wrap gap-2 items-center justify-between pb-4 border-b mb-4 shrink-0">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center gap-2 space-y-0">
                <FormLabel className="text-sm font-medium">Status</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="w-[200px]">
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

          <div className="flex items-center gap-2">
            {/* Indicador de auto-save */}
            {autoSaving && (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin" />
                Salvando...
              </span>
            )}
            {isEditing && (
              <Button type="button" variant="outline" onClick={() => router.push(`/orcamentos/${currentOrcamentoId}`)}>
                <Eye className="mr-2 h-4 w-4" /> Visualizar
              </Button>
            )}
            <Button type="submit" disabled={saving || autoSaving}>
              {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              <Save className="mr-2 h-4 w-4" />
              Salvar
            </Button>
          </div>
        </div>

        {/* Conteúdo scrollável */}
        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
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
                    <Input 
                      placeholder="Nome do cliente" 
                      {...field} 
                      onBlur={(e) => {
                        field.onBlur()
                        handleClienteBlur()
                      }}
                    />
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
                    <Input 
                      placeholder="Nome da pessoa de contato" 
                      {...field} 
                      ref={(el) => {
                        field.ref(el)
                        contatoInputRef.current = el
                      }}
                      value={field.value || ''} 
                      onBlur={(e) => {
                        field.onBlur()
                        handleFieldAutoSave('contato')
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Seção: Itens - apenas se editando */}
        {isEditing && currentOrcamentoId && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>📦 Itens do Orçamento</CardTitle>
              <div className="flex items-center gap-4">
                <FormField
                  control={form.control}
                  name="ocultar_valor_total"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                      <FormControl>
                        <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                      <FormLabel className="text-sm font-normal cursor-pointer">
                        Ocultar total
                      </FormLabel>
                    </FormItem>
                  )}
                />
                {!form.watch('ocultar_valor_total') && (
                  <div className="text-lg font-semibold">
                    Total: {formatCurrency(valorTotal)}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <ItemList
                orcamentoId={currentOrcamentoId}
                itens={itens}
                onItensChange={setItens}
              />
            </CardContent>
          </Card>
        )}

        {!isEditing && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              {autoSaving ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <p>Criando orçamento...</p>
                </div>
              ) : (
                <p>Preencha o nome do cliente para habilitar os itens.</p>
              )}
            </CardContent>
          </Card>
        )}

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
                    <Input 
                      placeholder="CIF, FOB ou texto livre" 
                      {...field} 
                      value={field.value || ''} 
                      onBlur={(e) => {
                        field.onBlur()
                        handleFieldAutoSave('frete')
                      }}
                    />
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
                        onSelect={(date) => {
                          field.onChange(date)
                          // Auto-save apos selecionar data (com pequeno delay para garantir que o valor foi atualizado)
                          setTimeout(() => handleFieldAutoSave('validade'), 100)
                        }}
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
              name="prazo_faturamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Prazo de Faturamento</FormLabel>
                  <FormControl>
                    <Input 
                      type="text" 
                      placeholder="Ex: 30 dias, a vista, etc."
                      {...field}
                      value={field.value ?? ''}
                      onBlur={(e) => {
                        field.onBlur()
                        handleFieldAutoSave('prazo_faturamento')
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Observacoes</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observacoes gerais..." 
                      className="min-h-[100px]" 
                      {...field} 
                      value={field.value || ''} 
                      onBlur={(e) => {
                        field.onBlur()
                        handleFieldAutoSave('observacoes')
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="elaborado_por"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>✍️ Elaborado por</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Ex: Jose Adair Giubel&#10;Fone / email: (54) 3218-2168 / email@empresa.com" 
                      className="min-h-[80px]" 
                      {...field} 
                      value={field.value || ''} 
                      onBlur={(e) => {
                        field.onBlur()
                        handleFieldAutoSave('elaborado_por')
                      }}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    Aparece no PDF. Default vem das configuracoes, editavel por orcamento.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Seção: Observações Internas */}
        <Card>
          <CardHeader>
            <CardTitle>📝 Observacoes Internas</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="observacoes_internas"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <Textarea 
                      placeholder="Anotacoes internas sobre este orcamento..." 
                      className="min-h-[100px]" 
                      {...field} 
                      value={field.value || ''} 
                      onBlur={(e) => {
                        field.onBlur()
                        handleFieldAutoSave('observacoes_internas')
                      }}
                    />
                  </FormControl>
                  <p className="text-xs text-muted-foreground">
                    ⚠️ Uso interno - NAO aparece no PDF
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        </div>
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


