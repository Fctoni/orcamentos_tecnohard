import { Database } from './database'

export type Orcamento = Database['public']['Tables']['orcamentos']['Row']
export type OrcamentoInsert = Database['public']['Tables']['orcamentos']['Insert']
export type OrcamentoUpdate = Database['public']['Tables']['orcamentos']['Update']

export type OrcamentoItem = Database['public']['Tables']['orcamento_itens']['Row']
export type OrcamentoItemInsert = Database['public']['Tables']['orcamento_itens']['Insert']
export type OrcamentoItemUpdate = Database['public']['Tables']['orcamento_itens']['Update']

export type OrcamentoAnexo = Database['public']['Tables']['orcamento_anexos']['Row']
export type OrcamentoAnexoInsert = Database['public']['Tables']['orcamento_anexos']['Insert']

export type Processo = Database['public']['Tables']['processos']['Row']

export interface OrcamentoWithItems extends Orcamento {
  itens: OrcamentoItemWithAnexos[]
}

export interface OrcamentoItemWithAnexos extends OrcamentoItem {
  anexos: OrcamentoAnexo[]
}

export type OrcamentoStatus = 
  | 'cadastrado' 
  | 'aguardando-informacoes' 
  | 'enviado' 
  | 'em-negociacao' 
  | 'aprovado' 
  | 'rejeitado'

export const STATUS_CONFIG: Record<OrcamentoStatus, { label: string; color: string; icon: string }> = {
  'cadastrado': { label: 'Cadastrado', color: 'bg-gray-500', icon: '📝' },
  'aguardando-informacoes': { label: 'Aguardando Informações', color: 'bg-yellow-500', icon: '⏳' },
  'enviado': { label: 'Enviado', color: 'bg-blue-500', icon: '📤' },
  'em-negociacao': { label: 'Em Negociação', color: 'bg-orange-500', icon: '💬' },
  'aprovado': { label: 'Aprovado', color: 'bg-green-500', icon: '✅' },
  'rejeitado': { label: 'Rejeitado', color: 'bg-red-500', icon: '❌' },
}


