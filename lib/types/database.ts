export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      orcamentos: {
        Row: {
          id: string
          numero: string
          cliente: string
          contato: string | null
          frete: string | null
          validade: string | null
          observacoes: string | null
          status: OrcamentoStatus
          ocultar_valor_total: boolean
          valor_total: number
          prazo_faturamento: string | null
          created_at: string
          created_by: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          id?: string
          numero: string
          cliente: string
          contato?: string | null
          frete?: string | null
          validade?: string | null
          observacoes?: string | null
          status?: OrcamentoStatus
          ocultar_valor_total?: boolean
          valor_total?: number
          prazo_faturamento?: string | null
          created_at?: string
          created_by?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          id?: string
          numero?: string
          cliente?: string
          contato?: string | null
          frete?: string | null
          validade?: string | null
          observacoes?: string | null
          status?: OrcamentoStatus
          ocultar_valor_total?: boolean
          valor_total?: number
          prazo_faturamento?: string | null
          created_at?: string
          created_by?: string | null
          updated_at?: string
          updated_by?: string | null
        }
      }
      orcamento_itens: {
        Row: {
          id: string
          orcamento_id: string
          codigo_item: string
          item: string
          unidade: string
          quantidade: number
          peso_unitario: number | null
          preco_unitario: number
          preco_total: number
          material: string | null
          processos: string[] | null
          prazo_entrega: string | null
          faturamento_minimo: string | null
          ordem: number
          created_at: string
        }
        Insert: {
          id?: string
          orcamento_id: string
          codigo_item: string
          item: string
          unidade: string
          quantidade?: number
          peso_unitario?: number | null
          preco_unitario: number
          preco_total: number
          material?: string | null
          processos?: string[] | null
          prazo_entrega?: string | null
          faturamento_minimo?: string | null
          ordem?: number
          created_at?: string
        }
        Update: {
          id?: string
          orcamento_id?: string
          codigo_item?: string
          item?: string
          unidade?: string
          quantidade?: number
          peso_unitario?: number | null
          preco_unitario?: number
          preco_total?: number
          material?: string | null
          processos?: string[] | null
          prazo_entrega?: string | null
          faturamento_minimo?: string | null
          ordem?: number
          created_at?: string
        }
      }
      orcamento_anexos: {
        Row: {
          id: string
          item_id: string
          nome_arquivo: string
          storage_path: string
          tipo_arquivo: string
          tamanho: number
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          item_id: string
          nome_arquivo: string
          storage_path: string
          tipo_arquivo: string
          tamanho: number
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          item_id?: string
          nome_arquivo?: string
          storage_path?: string
          tipo_arquivo?: string
          tamanho?: number
          created_at?: string
          created_by?: string | null
        }
      }
      processos: {
        Row: {
          id: string
          codigo: string
          nome: string
          ativo: boolean
          ordem: number
          created_at: string
        }
        Insert: {
          id?: string
          codigo: string
          nome: string
          ativo?: boolean
          ordem?: number
          created_at?: string
        }
        Update: {
          id?: string
          codigo?: string
          nome?: string
          ativo?: boolean
          ordem?: number
          created_at?: string
        }
      }
      sequencia_orcamentos: {
        Row: {
          ano: number
          ultimo_numero: number
        }
        Insert: {
          ano: number
          ultimo_numero?: number
        }
        Update: {
          ano?: number
          ultimo_numero?: number
        }
      }
    }
    Functions: {
      gerar_numero_orcamento: {
        Args: Record<string, never>
        Returns: string
      }
    }
  }
}

export type OrcamentoStatus = 
  | 'cadastrado' 
  | 'aguardando-informacoes' 
  | 'enviado' 
  | 'em-negociacao' 
  | 'aprovado' 
  | 'rejeitado'


