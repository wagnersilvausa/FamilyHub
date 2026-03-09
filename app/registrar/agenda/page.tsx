'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Button from '@/components/Button'
import Toast from '@/components/Toast'
import { supabase } from '@/lib/supabase'
import { getCurrentDate, getCurrentTime } from '@/lib/utils'
import DatePicker from '@/components/DatePicker'

const TIPOS = ['Consulta Médica', 'Escola', 'Atividade', 'Compromisso', 'Outro']

export default function AgendaPage() {
  const [titulo, setTitulo] = useState('')
  const [tipo, setTipo] = useState(TIPOS[0])
  const [data, setData] = useState(getCurrentDate())
  const [hora, setHora] = useState(getCurrentTime())
  const [observacao, setObservacao] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!titulo || !data) {
      setToast({ message: 'Preencha título e data!', type: 'error' })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.from('agenda').insert([
        {
          titulo,
          tipo,
          data,
          hora,
          observacao,
        },
      ])

      if (error) throw error

      setToast({ message: '✅ Compromisso criado com sucesso!', type: 'success' })
      setTitulo('')
      setTipo(TIPOS[0])
      setData(getCurrentDate())
      setHora(getCurrentTime())
      setObservacao('')
    } catch (error) {
      console.error('Erro ao criar compromisso:', error)
      setToast({ message: '❌ Erro ao criar compromisso', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/20 pb-24">
      <Header title="📅 Criar Compromisso" showBack={true} backHref="/registrar" />

      <div className="max-w-2xl mx-auto p-4 pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Título */}
          <div>
            <label className="block text-sm font-semibold text-primary mb-2.5">Título</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex: Consulta com Dr. Silva"
              className="w-full px-4 py-3 border border-border-light rounded-2xl focus:ring-2 focus:ring-wagner focus:outline-none text-primary placeholder-muted"
              disabled={loading}
            />
          </div>

          {/* Tipo */}
          <div>
            <label className="block text-sm font-semibold text-primary mb-2.5">Tipo</label>
            <select
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
              className="w-full px-4 py-3 border border-border-light rounded-2xl focus:ring-2 focus:ring-wagner focus:outline-none text-primary"
              disabled={loading}
            >
              {TIPOS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          {/* Data */}
          <div>
            <label className="block text-sm font-semibold text-primary mb-2.5">Data</label>
            <DatePicker value={data} onChange={setData} disabled={loading} />
          </div>

          {/* Hora */}
          <div>
            <label className="block text-sm font-semibold text-primary mb-2.5">Hora</label>
            <input
              type="time"
              value={hora}
              onChange={(e) => setHora(e.target.value)}
              className="w-full px-4 py-3 border border-border-light rounded-2xl focus:ring-2 focus:ring-wagner focus:outline-none text-primary"
              disabled={loading}
            />
          </div>

          {/* Observação */}
          <div>
            <label className="block text-sm font-semibold text-primary mb-2.5">Observação</label>
            <textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Detalhes adicionais..."
              className="w-full px-4 py-3 border border-border-light rounded-2xl focus:ring-2 focus:ring-wagner focus:outline-none text-primary placeholder-muted resize-none h-24"
              disabled={loading}
            />
          </div>

          {/* Botão Submit */}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Salvando...' : '💾 Salvar Compromisso'}
          </Button>
        </form>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
