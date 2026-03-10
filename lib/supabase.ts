import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

const isConfigured = process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!isConfigured && typeof window === 'undefined') {
  console.warn('Supabase credentials not configured. Please set environment variables.')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const isSupabaseConfigured = isConfigured

// Tipos para o banco de dados
export interface Gasto {
  id: string
  valor: number
  cartao: string
  motivo: string
  observacao: string
  data: string
  horario: string
  data_vencimento?: string | null
  parcela_atual: number
  parcelas_total: number
  valor_parcela: number
  status: 'agendado' | 'pendente' | 'quitado' | 'urgente'
  created_at: string
}

export interface ParcelaFutura {
  id: string
  gasto_id: string
  valor: number
  mes_referencia: string
  status: 'pendente' | 'quitado'
  created_at: string
}

export interface Agenda {
  id: string
  titulo: string
  tipo: string
  data: string
  hora: string
  observacao: string
  created_at: string
}

export interface SaudeConsulta {
  id: string
  medico: string
  data: string
  observacoes: string
  foto_url: string | null
  created_at: string
}

export interface Medicamento {
  id: string
  nome: string
  dose: string
  frequencia: string
  created_at: string
}

export interface Documento {
  id: string
  titulo: string
  descricao: string
  categoria: string
  subcategoria: string
  arquivo_url: string
  tipo_arquivo: string
  data: string
  created_at: string
}

export interface Audio {
  id: string
  descricao: string
  audio_url: string
  modulo: string
  created_at: string
}
