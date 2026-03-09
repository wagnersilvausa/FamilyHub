'use client'

import { useEffect, useState, useMemo } from 'react'
import Header from '@/components/Header'
import { supabase } from '@/lib/supabase'
import { formatDate, formatCurrency } from '@/lib/utils'

interface TimelineEvent {
  id: string
  date: string
  title: string
  description: string
  type: 'gasto' | 'compromisso' | 'consulta' | 'documento'
  icon: string
}

const TYPE_STYLES = {
  gasto:       { border: 'border-l-blue-500',   bg: 'bg-blue-500',   label: '💰 Gastos' },
  compromisso: { border: 'border-l-green-500',  bg: 'bg-green-500',  label: '📅 Agenda' },
  consulta:    { border: 'border-l-red-500',    bg: 'bg-red-500',    label: '🏥 Saúde' },
  documento:   { border: 'border-l-purple-500', bg: 'bg-purple-500', label: '📋 Docs' },
} as const

export default function TimelinePage() {
  const [events, setEvents]     = useState<TimelineEvent[]>([])
  const [loading, setLoading]   = useState(true)
  const [filtroTipo, setFiltro] = useState<'todos' | TimelineEvent['type']>('todos')

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        // ── Todas as queries em PARALELO ────────────────────────────────────
        const [gastosRes, agendaRes, consultasRes, docsRes] = await Promise.all([
          supabase
            .from('gastos')
            .select('id, data, motivo, valor, cartao')
            .order('data', { ascending: false })
            .limit(200),
          supabase
            .from('agenda')
            .select('id, data, titulo, tipo, hora')
            .order('data', { ascending: false })
            .limit(200),
          supabase
            .from('saude_consultas')
            .select('id, data, medico, observacoes')
            .order('data', { ascending: false })
            .limit(100),
          supabase
            .from('documentos')
            .select('id, data, titulo, categoria')
            .order('data', { ascending: false })
            .limit(100),
        ])

        if (cancelled) return

        const list: TimelineEvent[] = []

        gastosRes.data?.forEach((g) =>
          list.push({
            id: `g-${g.id}`,
            date: g.data,
            title: g.motivo,
            description: `${formatCurrency(g.valor)} · ${g.cartao}`,
            type: 'gasto',
            icon: '💰',
          })
        )
        agendaRes.data?.forEach((c) =>
          list.push({
            id: `a-${c.id}`,
            date: c.data,
            title: c.titulo,
            description: `${c.tipo} às ${c.hora}`,
            type: 'compromisso',
            icon: '📅',
          })
        )
        consultasRes.data?.forEach((c) =>
          list.push({
            id: `s-${c.id}`,
            date: c.data,
            title: `Dr. ${c.medico}`,
            description: c.observacoes || 'Consulta médica',
            type: 'consulta',
            icon: '🏥',
          })
        )
        docsRes.data?.forEach((d) =>
          list.push({
            id: `d-${d.id}`,
            date: d.data,
            title: d.titulo,
            description: d.categoria,
            type: 'documento',
            icon: '📋',
          })
        )

        list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        setEvents(list)
      } catch (err) {
        console.error(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  // filtro memoizado — não recalcula sem necessidade
  const filtered = useMemo(
    () => filtroTipo === 'todos' ? events : events.filter(e => e.type === filtroTipo),
    [events, filtroTipo]
  )

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <Header title="📺 Timeline do Davi" showBack backHref="/painel" />

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-4">

        {/* ── Filtros ── */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
          <FilterBtn active={filtroTipo === 'todos'} onClick={() => setFiltro('todos')}>🗂️ Todos</FilterBtn>
          {(Object.keys(TYPE_STYLES) as TimelineEvent['type'][]).map(t => (
            <FilterBtn key={t} active={filtroTipo === t} onClick={() => setFiltro(t)}>
              {TYPE_STYLES[t].label}
            </FilterBtn>
          ))}
        </div>

        {/* ── Lista ── */}
        {loading ? (
          <SkeletonList />
        ) : filtered.length === 0 ? (
          <p className="text-center text-slate-500 py-12">Nenhum evento encontrado</p>
        ) : (
          <div className="space-y-2">
            {filtered.map((ev) => {
              const s = TYPE_STYLES[ev.type]
              return (
                <div
                  key={ev.id}
                  className={`bg-white rounded-2xl px-4 py-3 border-l-4 ${s.border} shadow-sm flex gap-3 items-start`}
                >
                  <div className={`mt-0.5 w-9 h-9 rounded-full ${s.bg} flex items-center justify-center text-sm text-white flex-shrink-0`}>
                    {ev.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-slate-800 text-sm leading-tight truncate">{ev.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5 truncate">{ev.description}</p>
                  </div>
                  <p className="text-xs text-slate-400 flex-shrink-0 mt-0.5">{formatDate(ev.date)}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Sub-componentes leves ─────────────────────────────────────────────────────

function FilterBtn({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
        active ? 'bg-slate-800 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-400'
      }`}
    >
      {children}
    </button>
  )
}

function SkeletonList() {
  return (
    <div className="space-y-2">
      {[1, 2, 3, 4, 5].map(i => (
        <div key={i} className="bg-white rounded-2xl px-4 py-3 border-l-4 border-l-slate-200 flex gap-3 items-center animate-pulse">
          <div className="w-9 h-9 rounded-full bg-slate-200 flex-shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 bg-slate-200 rounded w-1/2" />
            <div className="h-2.5 bg-slate-100 rounded w-3/4" />
          </div>
          <div className="h-2.5 w-14 bg-slate-100 rounded" />
        </div>
      ))}
    </div>
  )
}
