'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { supabase } from '@/lib/supabase'

// ─── Config ───────────────────────────────────────────────────────────────────

// Data de nascimento do Davi — Wagner pode editar aqui
const DAVI_NASCIMENTO = new Date('2017-12-10')

// 30 frases motivacionais pt-BR (rotacionadas por dia do mês)
const FRASES = [
  'A família é o maior presente que a vida pode dar. 🌸',
  'Cada dia é uma nova chance de amar mais. 💛',
  'O amor de uma mãe é eterno e incondicional. ❤️',
  'Pequenos momentos formam grandes memórias. ✨',
  'A paciência é a maior virtude de quem ama. 🌿',
  'Cuidar é a forma mais pura de amor. 🤍',
  'Hoje é um novo dia cheio de possibilidades. ☀️',
  'Cada sorriso do Davi é uma bênção. 😊',
  'Persistência transforma sonhos em realidade. 🌟',
  'A gratidão abre as portas da alegria. 🙏',
  'Lar é onde o coração está em paz. 🏠',
  'O amor cresce quando é compartilhado. 💕',
  'Família não é apenas sangue, é cuidado. 🌺',
  'A força de uma família está na união. 💪',
  'Cada dia com você é um presente. 🎁',
  'O futuro pertence a quem acredita em seus sonhos. 🚀',
  'Cuide de quem você ama hoje, não amanhã. 💝',
  'A felicidade está nas pequenas coisas. 🌈',
  'Juntos somos mais fortes. 🤝',
  'Amor e dedicação constroem famílias sólidas. 🏗️',
  'Um abraço vale mais que mil palavras. 🤗',
  'Seja a luz na vida de quem você ama. 💡',
  'O tempo com a família é sempre bem gasto. ⏰',
  'Sorria! Você é amada e importante. 😄',
  'A leveza do amor alivia qualquer peso. 🕊️',
  'Cada passo dado com amor vale a pena. 👣',
  'Cultivar amor é a melhor herança. 🌱',
  'A vida fica mais bela quando compartilhada. 🎨',
  'Você é capaz de tudo que se propõe. 🦋',
  'Hoje escolha a alegria e o amor. 🌻',
]

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Gasto {
  id: string
  motivo: string
  valor: number
  data: string
  status: 'quitado' | 'pendente' | 'urgente'
  cartao: string
}

interface Compromisso {
  id: string
  titulo: string
  tipo: string
  data: string
  hora: string
  observacao: string
}

interface Clima {
  temp: string
  condicao: string
  icone: string
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function calcularIdade(nasc: Date): {
  anos: number
  meses: number
  diasParaAniversario: number
  ehHojeAniversario: boolean
  proximoAniversarioData: string
} {
  const hoje = new Date()
  hoje.setHours(0, 0, 0, 0)

  const nascNorm = new Date(nasc)
  nascNorm.setHours(0, 0, 0, 0)

  // Idade em anos completos
  let anos = hoje.getFullYear() - nascNorm.getFullYear()
  const jaPaссouAnivEsteAno =
    hoje.getMonth() > nascNorm.getMonth() ||
    (hoje.getMonth() === nascNorm.getMonth() && hoje.getDate() >= nascNorm.getDate())
  if (!jaPaссouAnivEsteAno) anos--

  // Meses completos desde o último aniversário
  const ultimoAniv = new Date(hoje.getFullYear() - (jaPaссouAnivEsteAno ? 0 : 1), nascNorm.getMonth(), nascNorm.getDate())
  let meses = (hoje.getFullYear() - ultimoAniv.getFullYear()) * 12 + (hoje.getMonth() - ultimoAniv.getMonth())
  if (hoje.getDate() < ultimoAniv.getDate()) meses--
  meses = meses % 12

  // Próximo aniversário
  const proxAniv = new Date(hoje.getFullYear(), nascNorm.getMonth(), nascNorm.getDate())
  if (proxAniv <= hoje) proxAniv.setFullYear(hoje.getFullYear() + 1)
  const ehHoje = proxAniv.getFullYear() === hoje.getFullYear() &&
                 proxAniv.getMonth() === hoje.getMonth() &&
                 proxAniv.getDate() === hoje.getDate()

  const diff = proxAniv.getTime() - hoje.getTime()
  const dias = ehHoje ? 0 : Math.ceil(diff / (1000 * 60 * 60 * 24))

  const proxData = proxAniv.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })

  return { anos, meses, diasParaAniversario: dias, ehHojeAniversario: ehHoje, proximoAniversarioData: proxData }
}

function getMesAtual(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function formatBRL(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function formatDataBR(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

// ─── Subcomponentes ───────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: string }) {
  const map = {
    quitado:  { bg: 'bg-emerald-100', text: 'text-emerald-700', label: '✅ Quitado' },
    pendente: { bg: 'bg-amber-100',   text: 'text-amber-700',   label: '⏳ Pendente' },
    urgente:  { bg: 'bg-red-100',     text: 'text-red-700',     label: '🔴 Urgente' },
  }
  const s = map[status as keyof typeof map] ?? map.pendente
  return (
    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  )
}

// ─── Página Principal ─────────────────────────────────────────────────────────

export default function RegistrarPage() {
  const [gastos, setGastos]           = useState<Gasto[]>([])
  const [proximoEvento, setProximo]   = useState<Compromisso | null>(null)
  const [clima, setClima]             = useState<Clima | null>(null)
  const [loadingData, setLoadingData] = useState(true)
  const [notaRapida, setNotaRapida]   = useState('')

  const fraseDia = useMemo(() => FRASES[(new Date().getDate() - 1) % FRASES.length], [])
  const dadosDavi = useMemo(() => calcularIdade(DAVI_NASCIMENTO), [])
  const { anos, meses, diasParaAniversario, ehHojeAniversario, proximoAniversarioData } = dadosDavi

  // ── Busca dados ──────────────────────────────────────────────────────────────
  useEffect(() => {
    async function loadData() {
      try {
        const mes  = getMesAtual()
        const hoje = new Date().toISOString().split('T')[0]

        // ── Supabase em PARALELO ─────────────────────────────────────────
        const [gRes, evRes] = await Promise.all([
          supabase
            .from('gastos')
            .select('id, motivo, valor, data, status, cartao')
            .gte('data', `${mes}-01`)
            .lte('data', `${mes}-31`)
            .order('data', { ascending: false })
            .limit(50),
          supabase
            .from('agenda')
            .select('id, titulo, tipo, data, hora, observacao')
            .gte('data', hoje)
            .order('data', { ascending: true })
            .limit(1),
        ])
        setGastos(gRes.data ?? [])
        setProximo(evRes.data?.[0] ?? null)

        // ── Clima com timeout de 4s ──────────────────────────────────────
        try {
          const ctrl = new AbortController()
          const timer = setTimeout(() => ctrl.abort(), 4000)
          const resp = await fetch('https://wttr.in/Belo+Horizonte?format=j1', { signal: ctrl.signal })
          clearTimeout(timer)
          if (resp.ok) {
            const json = await resp.json()
            const cur  = json.current_condition?.[0]
            setClima({
              temp:    cur?.temp_C ?? '--',
              condicao: cur?.weatherDesc?.[0]?.value ?? '',
              icone:   cur?.weatherIconUrl?.[0]?.value ?? '',
            })
          }
        } catch {
          // clima indisponível — falha silenciosa
        }
      } catch (e) {
        console.error(e)
      } finally {
        setLoadingData(false)
      }
    }
    loadData()
  }, [])

  // ── Derivados ────────────────────────────────────────────────────────────────
  const totalMes        = gastos.reduce((s, g) => s + (g.valor || 0), 0)
  const pendentes       = gastos.filter(g => g.status === 'pendente' || g.status === 'urgente')
  const urgentes        = gastos.filter(g => g.status === 'urgente')
  const ultimosGastos   = gastos.slice(0, 3)

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <>

      <div className="min-h-screen pb-24" style={{ background: '#f8f4ff' }}>

        {/* ══ HEADER HERO ═══════════════════════════════════════════════════════ */}
        <div
          className="relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg,#f43f5e,#ec4899,#db2777,#be185d)', paddingBottom: 40 }}
        >
          {/* blobs */}
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-20" style={{ background: 'radial-gradient(circle,#fff,transparent)' }} />
            <div className="absolute bottom-0 left-8 w-32 h-32 rounded-full opacity-10"  style={{ background: 'radial-gradient(circle,#fff,transparent)' }} />
          </div>

          {/* top bar */}
          <div className="relative flex items-center justify-between px-4 pt-12 pb-6">
            <Link href="/">
              <button className="w-10 h-10 rounded-xl flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 transition-all">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            </Link>

            {/* Sino de notificações */}
            <div className="relative">
              <Link href="/registrar/gastos">
                <button className="w-10 h-10 rounded-xl flex items-center justify-center text-white/80 hover:text-white hover:bg-white/15 transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                  {pendentes.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-amber-400 text-slate-900 text-xs font-black flex items-center justify-center">
                      {pendentes.length > 9 ? '9+' : pendentes.length}
                    </span>
                  )}
                </button>
              </Link>
            </div>
          </div>

          {/* saudação */}
          <div className="relative px-5 pb-2">
            <p className="text-white/70 text-sm font-medium mb-0.5">Bem-vinda de volta 🌸</p>
            <h1 className="text-4xl font-black text-white mb-1" style={{ letterSpacing: '-0.02em' }}>Olá, Luzia! 👋</h1>
            <p className="text-white/80 text-base">Seu painel de controle familiar</p>
          </div>

          {/* clima inline no header */}
          {clima && (
            <div className="relative mx-4 mt-4 flex items-center gap-2 px-3 py-2 rounded-2xl" style={{ background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)' }}>
              <span className="text-2xl">🌤️</span>
              <span className="text-white font-bold text-sm">{clima.temp}°C</span>
              <span className="text-white/70 text-sm">· {clima.condicao} · Belo Horizonte</span>
            </div>
          )}
        </div>

        {/* ══ CONTEÚDO ══════════════════════════════════════════════════════════ */}
        <div className="max-w-2xl mx-auto px-4 space-y-5" style={{ marginTop: -20 }}>

          {/* ── Alerta de pendentes ── */}
          {pendentes.length > 0 && (
            <Link href="/registrar/gastos" className="block fade-up">
              <div
                className="rounded-2xl p-4 flex items-center gap-3 shadow-md"
                style={{ background: urgentes.length > 0 ? 'linear-gradient(135deg,#fef2f2,#fee2e2)' : 'linear-gradient(135deg,#fffbeb,#fef3c7)', border: urgentes.length > 0 ? '1.5px solid #fca5a5' : '1.5px solid #fcd34d' }}
              >
                <div className="text-2xl">{urgentes.length > 0 ? '🔴' : '⚠️'}</div>
                <div className="flex-1">
                  <p className="font-bold text-sm" style={{ color: urgentes.length > 0 ? '#dc2626' : '#b45309' }}>
                    {urgentes.length > 0
                      ? `${urgentes.length} conta${urgentes.length > 1 ? 's' : ''} urgente${urgentes.length > 1 ? 's' : ''}!`
                      : `${pendentes.length} conta${pendentes.length > 1 ? 's' : ''} pendente${pendentes.length > 1 ? 's' : ''}`
                    }
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: urgentes.length > 0 ? '#ef4444' : '#d97706' }}>
                    Toque para ver e resolver
                  </p>
                </div>
                <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </Link>
          )}

          {/* ── Resumo do Mês ── */}
          <div className="fade-up-1">
            <div className="rounded-3xl p-5 text-white shadow-lg" style={{ background: 'linear-gradient(135deg,#f43f5e,#ec4899,#db2777)' }}>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">Resumo do Mês</p>
                  <p className="text-3xl font-black" style={{ letterSpacing: '-0.02em' }}>
                    {loadingData ? '...' : formatBRL(totalMes)}
                  </p>
                  <p className="text-white/70 text-sm mt-1">Total gasto em {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</p>
                </div>
                <div className="text-4xl">💸</div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-2">
                {[
                  { label: 'Registros',  value: gastos.length,                          icon: '📋' },
                  { label: 'Pendentes',  value: pendentes.length,                        icon: '⏳' },
                  { label: 'Urgentes',   value: urgentes.length,                         icon: '🔴' },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="rounded-2xl p-3 text-center" style={{ background: 'rgba(255,255,255,0.15)' }}>
                    <p className="text-lg">{icon}</p>
                    <p className="text-xl font-black text-white">{loadingData ? '-' : value}</p>
                    <p className="text-white/70 text-xs">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Próximo Compromisso ── */}
          <div className="fade-up-2">
            <h2 className="text-lg font-black text-slate-800 mb-3 px-1">📅 Próximo Compromisso</h2>
            {loadingData ? (
              <div className="rounded-2xl p-5 bg-white shadow-sm animate-pulse h-24" />
            ) : proximoEvento ? (
              <Link href="/registrar/agenda-view" className="block">
                <div className="action-card rounded-2xl p-5 bg-white shadow-sm border border-violet-100 hover:border-violet-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0" style={{ background: 'linear-gradient(135deg,#ede9fe,#ddd6fe)' }}>
                      📅
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 truncate">{proximoEvento.titulo}</p>
                      <p className="text-sm text-slate-500 mt-0.5">{proximoEvento.tipo}</p>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-xs font-semibold text-violet-600 bg-violet-100 px-2 py-0.5 rounded-full">
                          {formatDataBR(proximoEvento.data)}
                        </span>
                        {proximoEvento.hora && (
                          <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            🕐 {proximoEvento.hora}
                          </span>
                        )}
                      </div>
                    </div>
                    <svg className="w-4 h-4 text-slate-300 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ) : (
              <div className="rounded-2xl p-5 bg-white shadow-sm border border-slate-100 text-center">
                <p className="text-2xl mb-1">🎉</p>
                <p className="text-slate-600 font-semibold text-sm">Nenhum compromisso próximo</p>
                <p className="text-slate-400 text-xs mt-1">Aproveite o tempo livre!</p>
              </div>
            )}
          </div>

          {/* ── Últimos Gastos ── */}
          <div className="fade-up-3">
            <div className="flex items-center justify-between mb-3 px-1">
              <h2 className="text-lg font-black text-slate-800">💰 Últimos Gastos</h2>
              <Link href="/registrar/gastos">
                <span className="text-xs font-bold text-rose-500 hover:text-rose-700 transition-colors">Ver todos →</span>
              </Link>
            </div>

            {loadingData ? (
              <div className="space-y-2">
                {[1,2,3].map(i => <div key={i} className="rounded-2xl h-16 bg-white animate-pulse" />)}
              </div>
            ) : ultimosGastos.length > 0 ? (
              <div className="space-y-2">
                {ultimosGastos.map(g => (
                  <div key={g.id} className="action-card bg-white rounded-2xl px-4 py-3 shadow-sm border border-slate-100 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0" style={{ background: 'linear-gradient(135deg,#ffe4e6,#fecdd3)' }}>
                      💸
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-800 text-sm truncate">{g.motivo}</p>
                      <p className="text-xs text-slate-400">{g.cartao} · {formatDataBR(g.data)}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="font-black text-slate-800 text-sm">{formatBRL(g.valor)}</p>
                      <div className="mt-0.5"><StatusBadge status={g.status} /></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl p-5 bg-white shadow-sm text-center">
                <p className="text-slate-500 text-sm">Nenhum gasto este mês</p>
              </div>
            )}
          </div>

          {/* ── Frase do dia ── */}
          <div className="fade-up-4">
            <div className="rounded-3xl p-5 relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#fdf4ff,#fae8ff,#f3e8ff)' }}>
              <div className="absolute top-2 left-3 text-6xl font-black opacity-10 text-purple-400 leading-none select-none">"</div>
              <p className="relative text-slate-700 font-semibold text-base leading-relaxed pl-4">
                {fraseDia}
              </p>
              <p className="text-xs text-purple-400 font-semibold mt-2 pl-4">— Frase do dia</p>
            </div>
          </div>

          {/* ── Resumo do Davi ── */}
          <div className="fade-up-5">
            <div className="rounded-3xl p-5" style={{ background: 'linear-gradient(135deg,#fefce8,#fef9c3,#fef08a)' }}>
              <div className="flex items-start gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0" style={{ background: 'rgba(255,255,255,0.7)' }}>
                  👦
                </div>
                <div>
                  <h3 className="text-lg font-black text-amber-900">Davi</h3>
                  <p className="text-amber-700 text-sm font-semibold">
                    {anos} anos e {meses} {meses === 1 ? 'mês' : 'meses'} 🎂
                  </p>
                  <p className="text-xs text-amber-500 mt-0.5">
                    Nasceu em {DAVI_NASCIMENTO.toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              {/* Contagem regressiva para o aniversário */}
              <div className="rounded-2xl p-3 mb-4 text-center" style={{ background: 'rgba(255,255,255,0.6)' }}>
                {ehHojeAniversario ? (
                  <div>
                    <p className="text-2xl mb-0.5">🎉🎂🎉</p>
                    <p className="font-black text-amber-800 text-base">Hoje é aniversário do Davi!</p>
                    <p className="text-amber-600 text-xs font-semibold">Parabéns pelos {anos} anos! 🥳</p>
                  </div>
                ) : (
                  <div>
                    <p className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-1">Próximo aniversário — {proximoAniversarioData}</p>
                    <div className="flex items-end justify-center gap-1">
                      <span className="text-4xl font-black text-amber-800" style={{ letterSpacing: '-0.04em' }}>
                        {diasParaAniversario}
                      </span>
                      <span className="text-amber-600 font-bold text-sm mb-1.5">
                        {diasParaAniversario === 1 ? 'dia' : 'dias'}
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(251,191,36,0.25)' }}>
                      <div
                        className="h-full rounded-full"
                        style={{
                          background: 'linear-gradient(90deg,#f59e0b,#fbbf24)',
                          width: `${Math.max(2, 100 - Math.min(100, (diasParaAniversario / 365) * 100))}%`,
                          transition: 'width 0.8s ease'
                        }}
                      />
                    </div>
                    <p className="text-amber-500 text-xs mt-1">
                      {diasParaAniversario <= 7 ? '🎈 Chegando aí!' : diasParaAniversario <= 30 ? '🎊 Logo logo!' : '📅 Guardando energia!'}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-amber-800 mb-1.5">✏️ Nota rápida sobre o Davi</label>
                <textarea
                  value={notaRapida}
                  onChange={e => setNotaRapida(e.target.value)}
                  placeholder="Ex: Escola, atividades, humor do dia..."
                  rows={2}
                  className="w-full px-3 py-2.5 rounded-xl text-sm text-amber-900 placeholder-amber-400 resize-none focus:outline-none focus:ring-2"
                  style={{ background: 'rgba(255,255,255,0.6)', border: '1.5px solid rgba(251,191,36,0.4)' }}
                />
              </div>
            </div>
          </div>

          {/* ══ AÇÕES RÁPIDAS ═════════════════════════════════════════════════ */}
          <div className="fade-up-6">
            <h2 className="text-lg font-black text-slate-800 mb-3 px-1">⚡ Ações Rápidas</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { href: '/registrar/gasto',  icon: '💰', title: 'Anotar Gasto',       sub: 'Registre uma despesa',     bg: 'linear-gradient(135deg,#fff1f2,#ffe4e6)', accent: '#f43f5e', border: '#fecdd3' },
                { href: '/registrar/fotos',  icon: '📷', title: 'Adicionar Foto',      sub: 'Compartilhe momentos',     bg: 'linear-gradient(135deg,#eff6ff,#dbeafe)', accent: '#3b82f6', border: '#bfdbfe' },
                { href: '/registrar/agenda', icon: '📅', title: 'Criar Compromisso',   sub: 'Agende um evento',         bg: 'linear-gradient(135deg,#f5f3ff,#ede9fe)', accent: '#8b5cf6', border: '#ddd6fe' },
                { href: '/registrar/saude',  icon: '🏥', title: 'Registrar Saúde',     sub: 'Consultas e medicações',   bg: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', accent: '#22c55e', border: '#bbf7d0' },
              ].map(({ href, icon, title, sub, bg, accent, border }) => (
                <Link key={href} href={href} className="block">
                  <div
                    className="action-card rounded-2xl p-4 h-full cursor-pointer"
                    style={{ background: bg, border: `1.5px solid ${border}` }}
                  >
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-3" style={{ background: 'rgba(255,255,255,0.7)' }}>
                      {icon}
                    </div>
                    <p className="font-black text-slate-800 text-sm leading-tight">{title}</p>
                    <p className="text-xs mt-1" style={{ color: accent }}>{sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ══ ACOMPANHAMENTO ════════════════════════════════════════════════ */}
          <div className="fade-up-7">
            <h2 className="text-lg font-black text-slate-800 mb-3 px-1">📊 Acompanhamento</h2>
            <div className="grid grid-cols-2 gap-3">
              {[
                { href: '/registrar/gastos',      icon: '💰', title: 'Meus Gastos',    sub: 'Histórico de despesas',    bg: 'linear-gradient(135deg,#fff1f2,#ffe4e6)', border: '#fecdd3' },
                { href: '/registrar/agenda-view', icon: '📅', title: 'Agenda',          sub: 'Próximos eventos',         bg: 'linear-gradient(135deg,#f5f3ff,#ede9fe)', border: '#ddd6fe' },
                { href: '/registrar/fotos-galeria',icon: '📷', title: 'Fotos',          sub: 'Galeria de momentos',      bg: 'linear-gradient(135deg,#eff6ff,#dbeafe)', border: '#bfdbfe' },
                { href: '/registrar/saude-view',  icon: '🏥', title: 'Saúde',           sub: 'Histórico de saúde',       bg: 'linear-gradient(135deg,#f0fdf4,#dcfce7)', border: '#bbf7d0' },
              ].map(({ href, icon, title, sub, bg, border }) => (
                <Link key={href} href={href} className="block">
                  <div
                    className="action-card rounded-2xl p-4 h-full cursor-pointer"
                    style={{ background: bg, border: `1.5px solid ${border}` }}
                  >
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-3" style={{ background: 'rgba(255,255,255,0.7)' }}>
                      {icon}
                    </div>
                    <p className="font-black text-slate-800 text-sm leading-tight">{title}</p>
                    <p className="text-xs text-slate-500 mt-1">{sub}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ══ FECHAR MÊS ════════════════════════════════════════════════════ */}
          <div className="fade-up-7">
            <Link href="/registrar/relatorio" className="block">
              <div
                className="action-card relative overflow-hidden rounded-3xl p-6 text-white cursor-pointer"
                style={{ background: 'linear-gradient(135deg,#f43f5e,#ec4899,#db2777)' }}
              >
                <div className="pointer-events-none absolute inset-0 overflow-hidden">
                  <div className="absolute -top-4 -right-4 w-28 h-28 rounded-full opacity-20" style={{ background: 'radial-gradient(circle,#fff,transparent)' }} />
                </div>
                <div className="relative flex items-center justify-between gap-4">
                  <div>
                    <p className="text-white/70 text-xs font-semibold uppercase tracking-wider mb-1">Encerramento Mensal</p>
                    <h3 className="text-2xl font-black">Fechar Mês 📊</h3>
                    <p className="text-white/80 text-sm mt-1">Gerar relatório e enviar para Wagner</p>
                  </div>
                  <svg className="w-8 h-8 text-white/60 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </Link>
          </div>

        </div>
      </div>
    </>
  )
}
