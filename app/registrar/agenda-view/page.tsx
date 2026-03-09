'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Card from '@/components/Card'
import { supabase, Agenda } from '@/lib/supabase'
import { formatDate, daysUntil } from '@/lib/utils'

export default function AgendaViewPage() {
  const [compromissos, setCompromisos] = useState<Agenda[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroMes, setFiltroMes] = useState('')

  useEffect(() => {
    carregarCompromisos()
  }, [filtroMes])

  const carregarCompromisos = async () => {
    try {
      setLoading(true)
      let query = supabase.from('agenda').select('*')

      if (filtroMes) {
        query = query.like('data', `${filtroMes}%`)
      }

      const { data, error } = await query
        .gte('data', new Date().toISOString().split('T')[0])
        .order('data', { ascending: true })

      if (error) throw error
      setCompromisos(data || [])
    } catch (error) {
      console.error('Erro ao carregar agenda:', error)
    } finally {
      setLoading(false)
    }
  }

  const getProximoCompromisoEmDias = () => {
    if (compromissos.length === 0) return null
    return daysUntil(compromissos[0].data)
  }

  const getTipoIcon = (tipo: string) => {
    switch (tipo) {
      case 'Consulta Médica':
        return '🏥'
      case 'Escola':
        return '🎓'
      case 'Atividade':
        return '⚽'
      default:
        return '📌'
    }
  }

  const proximosDias = getProximoCompromisoEmDias()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/20 pb-24">
      <Header title="📅 Agenda" showBack={true} backHref="/registrar" />

      <div className="max-w-2xl mx-auto p-4 pt-6 space-y-6">
        {/* Próximo Compromisso */}
        {compromissos.length > 0 && proximosDias !== null && (
          <Card elevated className="bg-gradient-to-r from-success via-green-500 to-emerald-600 text-white">
            <div className="space-y-3">
              <p className="text-sm font-semibold opacity-90">Próximo Compromisso</p>
              <p className="text-4xl font-bold">{compromissos[0].titulo}</p>
              <p className="text-lg opacity-95">
                {proximosDias === 0 && 'Hoje! '}
                {proximosDias === 1 && 'Amanhã! '}
                {proximosDias! > 1 && `Em ${proximosDias} dias`}
              </p>
              <p className="text-sm opacity-85">
                {formatDate(compromissos[0].data)} às {compromissos[0].hora}
              </p>
            </div>
          </Card>
        )}

        {/* Filtro */}
        <div>
          <label className="block text-sm font-semibold text-primary mb-2.5">Filtrar por Mês</label>
          <input
            type="month"
            value={filtroMes}
            onChange={(e) => setFiltroMes(e.target.value)}
            className="w-full px-4 py-3 border border-border-light rounded-2xl focus:ring-2 focus:ring-wagner focus:outline-none text-primary"
          />
        </div>

        {/* Lista de Compromissos */}
        <div>
          <h3 className="text-xl font-bold text-primary mb-4">Compromissos</h3>
          {loading ? (
            <p className="text-center text-secondary py-8">Carregando...</p>
          ) : compromissos.length === 0 ? (
            <p className="text-center text-secondary py-8">Nenhum compromisso agendado</p>
          ) : (
            <div className="space-y-3">
              {compromissos.map((comp) => (
                <Card key={comp.id} elevated>
                  <div className="space-y-3">
                    <div className="flex items-start gap-4">
                      <span className="text-3xl flex-shrink-0">{getTipoIcon(comp.tipo)}</span>
                      <div className="flex-1">
                        <p className="font-bold text-primary">{comp.titulo}</p>
                        <p className="text-sm text-secondary">{comp.tipo}</p>
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-sm gap-2">
                      <p className="font-semibold text-primary">
                        {formatDate(comp.data)} às {comp.hora}
                      </p>
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50/60 text-blue-700">
                        {daysUntil(comp.data) === 0 && '🔴 Hoje'}
                        {daysUntil(comp.data) === 1 && '🟡 Amanhã'}
                        {daysUntil(comp.data) > 1 && `📅 ${daysUntil(comp.data)}d`}
                      </span>
                    </div>

                    {comp.observacao && (
                      <p className="text-sm text-secondary italic">"{comp.observacao}"</p>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
