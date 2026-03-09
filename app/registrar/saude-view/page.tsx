'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Card from '@/components/Card'
import { supabase, SaudeConsulta, Medicamento } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'

export default function SaudeViewPage() {
  const [tab, setTab] = useState<'consulta' | 'medicamento'>('consulta')
  const [consultas, setConsultas] = useState<SaudeConsulta[]>([])
  const [medicamentos, setMedicamentos] = useState<Medicamento[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarDados()
  }, [tab])

  const carregarDados = async () => {
    try {
      setLoading(true)

      if (tab === 'consulta') {
        const { data, error } = await supabase
          .from('saude_consultas')
          .select('*')
          .order('data', { ascending: false })

        if (error) throw error
        setConsultas(data || [])
      } else {
        const { data, error } = await supabase
          .from('medicamentos')
          .select('*')
          .order('created_at', { ascending: false })

        if (error) throw error
        setMedicamentos(data || [])
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/20 pb-24">
      <Header title="🏥 Saúde" showBack={true} backHref="/registrar" />

      <div className="max-w-2xl mx-auto p-4 pt-6">
        {/* Tabs with underline animation */}
        <div className="flex gap-4 mb-8 border-b border-border-light">
          <button
            onClick={() => setTab('consulta')}
            className={`pb-3 px-1 font-semibold text-sm transition-all relative ${
              tab === 'consulta'
                ? 'text-wagner'
                : 'text-secondary hover:text-primary'
            }`}
          >
            📋 Consultas
            {tab === 'consulta' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-wagner rounded-full" />
            )}
          </button>
          <button
            onClick={() => setTab('medicamento')}
            className={`pb-3 px-1 font-semibold text-sm transition-all relative ${
              tab === 'medicamento'
                ? 'text-wagner'
                : 'text-secondary hover:text-primary'
            }`}
          >
            💊 Medicamentos
            {tab === 'medicamento' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-wagner rounded-full" />
            )}
          </button>
        </div>

        {/* Conteúdo */}
        {loading ? (
          <p className="text-center text-secondary py-8">Carregando...</p>
        ) : tab === 'consulta' ? (
          <div className="space-y-3">
            {consultas.length === 0 ? (
              <p className="text-center text-secondary py-8">Nenhuma consulta registrada</p>
            ) : (
              consultas.map((consulta) => (
                <Card key={consulta.id} elevated className="border-l-4 border-success">
                  <div className="space-y-3">
                    <p className="font-bold text-primary">🏥 {consulta.medico}</p>
                    <p className="text-sm text-secondary">{formatDate(consulta.data)}</p>

                    {consulta.observacoes && (
                      <div className="bg-success/5 p-3 rounded-lg border border-success/20">
                        <p className="text-xs font-semibold text-primary mb-1">Observações:</p>
                        <p className="text-sm text-secondary">{consulta.observacoes}</p>
                      </div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {medicamentos.length === 0 ? (
              <p className="text-center text-secondary py-8">Nenhum medicamento registrado</p>
            ) : (
              medicamentos.map((med) => (
                <Card key={med.id} elevated className="border-l-4 border-warning">
                  <div className="space-y-3">
                    <p className="font-bold text-primary">💊 {med.nome}</p>
                    <div className="bg-warning/5 p-3 rounded-lg border border-warning/20">
                      <p className="text-sm font-semibold text-primary mb-2">
                        Dose: <span className="text-warning">{med.dose}</span>
                      </p>
                      <p className="text-sm font-semibold text-primary">
                        Frequência: <span className="text-warning">{med.frequencia}</span>
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
