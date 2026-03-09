'use client'

import { useState } from 'react'
import Header from '@/components/Header'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Toast from '@/components/Toast'
import { supabase } from '@/lib/supabase'
import DatePicker from '@/components/DatePicker'

export default function SaudePage() {
  const [tab, setTab] = useState<'consulta' | 'medicamento'>('consulta')

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/20 pb-24">
      <Header title="🏥 Registrar Saúde" showBack={true} backHref="/registrar" />

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
            📋 Consulta
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
            💊 Medicamento
            {tab === 'medicamento' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-wagner rounded-full" />
            )}
          </button>
        </div>

        {/* Conteúdo */}
        {tab === 'consulta' && <FormConsulta />}
        {tab === 'medicamento' && <FormMedicamento />}
      </div>
    </div>
  )
}

function FormConsulta() {
  const [medico, setMedico] = useState('')
  const [data, setData] = useState('')
  const [observacoes, setObservacoes] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!medico || !data) {
      setToast({ message: 'Preencha médico e data!', type: 'error' })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.from('saude_consultas').insert([
        {
          medico,
          data,
          observacoes,
          foto_url: null,
        },
      ])

      if (error) throw error

      setToast({ message: '✅ Consulta registrada com sucesso!', type: 'success' })
      setMedico('')
      setData('')
      setObservacoes('')
    } catch (error) {
      console.error('Erro ao registrar consulta:', error)
      setToast({ message: '❌ Erro ao registrar consulta', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Médico */}
      <div>
        <label className="block text-sm font-semibold text-primary mb-2.5">Médico</label>
        <input
          type="text"
          value={medico}
          onChange={(e) => setMedico(e.target.value)}
          placeholder="Ex: Dr. Silva"
          className="w-full px-4 py-3 border border-border-light rounded-2xl focus:ring-2 focus:ring-wagner focus:outline-none text-primary placeholder-muted"
          disabled={loading}
        />
      </div>

      {/* Data */}
      <div>
        <label className="block text-sm font-semibold text-primary mb-2.5">Data</label>
        <DatePicker value={data} onChange={setData} disabled={loading} placeholder="Selecionar data da consulta" />
      </div>

      {/* Observações */}
      <div>
        <label className="block text-sm font-semibold text-primary mb-2.5">Observações</label>
        <textarea
          value={observacoes}
          onChange={(e) => setObservacoes(e.target.value)}
          placeholder="Diagnóstico, prescrição, etc..."
          className="w-full px-4 py-3 border border-border-light rounded-2xl focus:ring-2 focus:ring-wagner focus:outline-none text-primary placeholder-muted resize-none h-24"
          disabled={loading}
        />
      </div>

      {/* Botão Submit */}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Salvando...' : '💾 Salvar Consulta'}
      </Button>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </form>
  )
}

function FormMedicamento() {
  const [nome, setNome] = useState('')
  const [dose, setDose] = useState('')
  const [frequencia, setFrequencia] = useState('1x ao dia')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!nome || !dose) {
      setToast({ message: 'Preencha nome e dose!', type: 'error' })
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase.from('medicamentos').insert([
        {
          nome,
          dose,
          frequencia,
        },
      ])

      if (error) throw error

      setToast({ message: '✅ Medicamento registrado com sucesso!', type: 'success' })
      setNome('')
      setDose('')
      setFrequencia('1x ao dia')
    } catch (error) {
      console.error('Erro ao registrar medicamento:', error)
      setToast({ message: '❌ Erro ao registrar medicamento', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Nome */}
      <div>
        <label className="block text-sm font-semibold text-primary mb-2.5">Nome do Medicamento</label>
        <input
          type="text"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
          placeholder="Ex: Ritalina"
          className="w-full px-4 py-3 border border-border-light rounded-2xl focus:ring-2 focus:ring-wagner focus:outline-none text-primary placeholder-muted"
          disabled={loading}
        />
      </div>

      {/* Dose */}
      <div>
        <label className="block text-sm font-semibold text-primary mb-2.5">Dose</label>
        <input
          type="text"
          value={dose}
          onChange={(e) => setDose(e.target.value)}
          placeholder="Ex: 5mg"
          className="w-full px-4 py-3 border border-border-light rounded-2xl focus:ring-2 focus:ring-wagner focus:outline-none text-primary placeholder-muted"
          disabled={loading}
        />
      </div>

      {/* Frequência */}
      <div>
        <label className="block text-sm font-semibold text-primary mb-2.5">Frequência</label>
        <input
          type="text"
          value={frequencia}
          onChange={(e) => setFrequencia(e.target.value)}
          placeholder="Ex: 1x ao dia"
          className="w-full px-4 py-3 border border-border-light rounded-2xl focus:ring-2 focus:ring-wagner focus:outline-none text-primary placeholder-muted"
          disabled={loading}
        />
      </div>

      {/* Botão Submit */}
      <Button type="submit" disabled={loading} className="w-full">
        {loading ? 'Salvando...' : '💾 Salvar Medicamento'}
      </Button>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </form>
  )
}
