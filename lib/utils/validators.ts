import { z } from 'zod'

// Schemas de Autenticação
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter no mínimo 6 caracteres'),
})

export const registerSchema = z.object({
  name: z
    .string()
    .min(1, 'Nome é obrigatório')
    .min(3, 'Nome deve ter no mínimo 3 caracteres'),
  email: z
    .string()
    .min(1, 'Email é obrigatório')
    .email('Email inválido'),
  password: z
    .string()
    .min(1, 'Senha é obrigatória')
    .min(6, 'Senha deve ter no mínimo 6 caracteres'),
  confirmPassword: z
    .string()
    .min(1, 'Confirmação de senha é obrigatória'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'As senhas não coincidem',
  path: ['confirmPassword'],
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>

// Schemas de Orçamento
export const orcamentoSchema = z.object({
  cliente: z.string().min(1, 'Cliente é obrigatório'),
  contato: z.string().optional().nullable(),
  frete: z.string().optional().nullable(),
  validade: z.date().optional().nullable(),
  observacoes: z.string().optional().nullable(),
  ocultar_valor_total: z.boolean(),
  status: z.enum([
    'cadastrado',
    'aguardando-informacoes',
    'enviado',
    'em-negociacao',
    'aprovado',
    'rejeitado'
  ]),
})

export const itemSchema = z.object({
  codigo_item: z.string().min(1, 'Código é obrigatório'),
  item: z.string().min(1, 'Descrição é obrigatória'),
  unidade: z.string().min(1, 'Unidade é obrigatória'),
  quantidade: z.number().min(0.01, 'Lote mínimo deve ser maior que zero'),
  peso_unitario: z.number().optional().nullable(),
  preco_unitario: z.number().min(0.01, 'Preço é obrigatório'),
  material: z.string().optional().nullable(),
  processos: z.array(z.string()).optional().nullable(),
  prazo_entrega: z.string().optional().nullable(),
  faturamento_minimo: z.string().optional().nullable(),
})

export type OrcamentoFormData = z.infer<typeof orcamentoSchema>
export type ItemFormData = z.infer<typeof itemSchema>
