'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate, daysUntil, getCurrentMonth } from '@/lib/utils'

interface Gasto { id: string; valor: number; motivo: string; cartao: string; data: string; status: string; parcelas_total: number; parcela_atual: number }
interface Agenda { id: string; titulo: string; tipo: string; data: string; hora: string; observacao: string }
interface Parcela { id: string; valor: number; mes_referencia: string }

export default function PainelPage() {
  const [gastos,    setGastos]    = useState<Gasto[]>([])
  const [agenda,    setAgenda]    = useState<Agenda[]>([])
  const [parcelas,  setParcelas]  = useState<Parcela[]>([])
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        const mes  = getCurrentMonth()
        const hoje = new Date().toISOString().split('T')[0]
        const em7  = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]

        // ── 3 queries em PARALELO ──────────────────────────────────────────
        const [gRes, aRes, pRes] = await Promise.all([
          supabase
            .from('gastos')
            .select('id, valor, motivo, cartao, data, status, parcelas_total, parcela_atual')
            .like('data', `${mes}%`)
            .order('data', { ascending: false })
            .limit(50),
          supabase
            .from('agenda')
            .select('id, titulo, tipo, data, hora, observacao')
            .gte('data', hoje)
            .lte('data', em7)
            .order('data', { ascending: true })
            .limit(10),
          supabase
            .from('parcelas_futuras')
            .select('id, valor, mes_referencia')
            .eq('status', 'pendente')
            .order('mes_referencia', { ascending: true })
            .limit(20),
        ])

        if (cancelled) return
        setGastos(gRes.data  ?? [])
        setAgenda(aRes.data  ?? [])
        setParcelas(pRes.data ?? [])
      } catch (err) {
        console.error(err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  const totalGastos   = useMemo(() => gastos.reduce((s, g) => s + g.valor, 0),   [gastos])
  const totalParcelas = useMemo(() => parcelas.reduce((s, p) => s + p.valor, 0), [parcelas])

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <Header title="🏠 Painel" showBack />

      <div className="max-w-2xl mx-auto px-4 pt-4 space-y-5">

        {/* ── Hero ── */}
        <div className="relative overflow-hidden rounded-3xl p-6 text-white" style={{ background: 'linear-gradient(135deg,#4f46e5,#7c3aed,#6366f1)' }}>
          <div className="absolute -top-6 -right-6 w-32 h-32 rounded-full opacity-15" style={{ background: 'radial-gradient(circle,#fff,transparent)' }} />
          <p className="text-white/70 text-sm mb-0.5">Bem-vindo de volta 👋</p>
          <h1 className="text-3xl font-black text-white" style={{ letterSpacing: '-0.02em' }}>Olá, Wagner!</h1>
          <p className="text-white/70 text-sm mt-1">Acompanhamento do Davi</p>
        </div>

        {loading ? <SkeletonCards /> : (
          <>
            {/* ── Resumo ── */}
            <div className="grid grid-cols-2 gap-3">
              <StatCard label="Total do mês" value={formatCurrency(totalGastos)} icon="💰" color="#4f46e5" />
              <StatCard label="Parcelamentos" value={formatCurrency(totalParcelas)} icon="📋" color="#d97706" />
            </div>

            {/* ── Próximos compromissos ── */}
            {agenda.length > 0 && (
              <Section title="📅 Próximos Compromissos" href="/painel/timeline">
                {agenda.slice(0, 3).map(c => {
                  const d = daysUntil(c.data)
                  return (
                    <div key={c.id} className="bg-white rounded-2xl px-4 py-3 border border-slate-100 shadow-sm flex items-start gap-3">
                      <div className="mt-0.5 w-9 h-9 rounded-xl bg-violet-100 flex items-center justify-center text-base flex-shrink-0">📅</div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-slate-800 text-sm truncate">{c.titulo}</p>
                        <p className="text-xs text-slate-500">{formatDate(c.data)} às {c.hora}</p>
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded-full flex-shrink-0 mt-0.5 ${
                        d === 0 ? 'bg-red-100 text-red-700' : d === 1 ? 'bg-yellow-100 text-yellow-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {d === 0 ? 'Hoje' : d === 1 ? 'Amanhã' : `${d}d`}
                      </span>
                    </div>
                  )
                })}
              </Section>
            )}

            {/* ── Últimos gastos ── */}
            {gastos.length > 0 && (
              <Section title="💰 Últimos Gastos" href="/registrar/gastos">
                {gastos.slice(0, 3).map(g => (
                  <div key={g.id} className="bg-white rounded-2xl px-4 py-3 border border-slate-100 shadow-sm flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-rose-100 flex items-center justify-center text-base flex-shrink-0">💸</div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-slate-800 text-sm truncate">{g.motivo}</p>
                      <p className="text-xs text-slate-500">{g.cartao} · {formatDate(g.data)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-bold text-slate-800 text-sm">{formatCurrency(g.valor)}</p>
                      <StatusBadge s={g.status} />
                    </div>
                  </div>
                ))}
              </Section>
            )}

            {/* ── Parcelamentos ── */}
            {parcelas.length > 0 && (
              <Section title="📋 Parcelamentos Abertos">
                {parcelas.slice(0, 3).map(p => (
                  <div key={p.id} className="bg-amber-50 rounded-2xl px-4 py-3 border border-amber-100 flex justify-between items-center">
                    <p className="text-sm font-semibold text-slate-700">{p.mes_referencia}</p>
                    <p className="font-bold text-amber-600">{formatCurrency(p.valor)}</p>
                  </div>
                ))}
              </Section>
            )}

            {/* ── Acesso rápido ── */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <QuickLink href="/registrar" icon="👵" label="Painel Luzia" sub="Registros" />
              <QuickLink href="/painel/timeline" icon="📺" label="Timeline" sub="Todos eventos" />
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Sub-componentes ────────────────────────────────────────────────────────────

function StatCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <p className="text-xs text-slate-500 font-medium">{label}</p>
        <span className="text-xl">{icon}</span>
      </div>
      <p className="text-xl font-black" style={{ color, letterSpacing: '-0.02em' }}>{value}</p>
    </div>
  )
}

function Section({ title, href, children }: { title: string; href?: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2 px-1">
        <h2 className="text-base font-black text-slate-800">{title}</h2>
        {href && <Link href={href}><span className="text-xs font-bold text-indigo-600">Ver todos →</span></Link>}
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function StatusBadge({ s }: { s: string }) {
  const m = { quitado: 'bg-green-100 text-green-700', pendente: 'bg-yellow-100 text-yellow-700', urgente: 'bg-red-100 text-red-700' }
  const l = { quitado: '✅ Quitado', pendente: '⏳ Pendente', urgente: '🔴 Urgente' }
  return <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${m[s as keyof typeof m] ?? m.pendente}`}>{l[s as keyof typeof l] ?? s}</span>
}

function QuickLink({ href, icon, label, sub }: { href: string; icon: string; label: string; sub: string }) {
  return (
    <Link href={href}>
      <div className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:border-indigo-300 transition-colors text-center cursor-pointer">
        <p className="text-2xl mb-1">{icon}</p>
        <p className="font-bold text-slate-800 text-sm">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{sub}</p>
      </div>
    </Link>
  )
}

function SkeletonCards() {
  return (
    <div className="space-y-4 animate-pulse">
      <div className="grid grid-cols-2 gap-3">
        <div className="h-20 bg-slate-200 rounded-2xl" />
        <div className="h-20 bg-slate-200 rounded-2xl" />
      </div>
      {[1,2,3].map(i => <div key={i} className="h-16 bg-slate-100 rounded-2xl" />)}
    </div>
  )
}
