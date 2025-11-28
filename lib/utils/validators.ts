import { z } from 'zod'

export const orcamentoSchema = z.object({
  cliente: z.string().min(1, 'Cliente é obrigatório'),
  contato: z.string().optional(),
  frete: z.string().optional(),
  validade: z.string().optional(),
  observacoes: z.string().optional(),
  status: z.enum([
    'cadastrado',
    'aguardando-informacoes',
    'enviado',
    'em-negociacao',
    'aprovado',
    'rejeitado'
  ]).default('cadastrado'),
  ocultar_valor_total: z.boolean().default(false),
})

export const orcamentoItemSchema = z.object({
  codigo_item: z.string().min(1, 'Código do item é obrigatório'),
  item: z.string().min(1, 'Descrição do item é obrigatória'),
  unidade: z.string().min(1, 'Unidade é obrigatória'),
  quantidade: z.number().min(0.01, 'Quantidade deve ser maior que zero'),
  peso_unitario: z.number().optional(),
  preco_unitario: z.number().min(0, 'Preço unitário não pode ser negativo'),
  material: z.string().optional(),
  processos: z.array(z.string()).optional(),
  prazo_entrega: z.string().optional(),
  faturamento_minimo: z.string().optional(),
})

export type OrcamentoFormData = z.infer<typeof orcamentoSchema>
export type OrcamentoItemFormData = z.infer<typeof orcamentoItemSchema>


