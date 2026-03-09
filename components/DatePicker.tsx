'use client'

import { useState, useRef, useEffect } from 'react'

const MESES_PT = [
  'Janeiro','Fevereiro','Março','Abril','Maio','Junho',
  'Julho','Agosto','Setembro','Outubro','Novembro','Dezembro',
]
const DIAS_PT = ['Dom','Seg','Ter','Qua','Qui','Sex','Sáb']

interface DatePickerProps {
  value: string           // formato YYYY-MM-DD
  onChange: (v: string) => void
  disabled?: boolean
  placeholder?: string
}

export default function DatePicker({ value, onChange, disabled, placeholder = 'Selecionar data' }: DatePickerProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const hoje = new Date()
  const dataAtual = value ? new Date(value + 'T12:00:00') : hoje
  const [viewYear,  setViewYear]  = useState(dataAtual.getFullYear())
  const [viewMonth, setViewMonth] = useState(dataAtual.getMonth())

  // Fecha ao clicar fora
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Sincroniza a view quando o valor externo muda
  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T12:00:00')
      setViewYear(d.getFullYear())
      setViewMonth(d.getMonth())
    }
  }, [value])

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1) }
    else setViewMonth(m => m - 1)
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1) }
    else setViewMonth(m => m + 1)
  }

  const primeiroDia = new Date(viewYear, viewMonth, 1).getDay()
  const diasNoMes   = new Date(viewYear, viewMonth + 1, 0).getDate()
  const cells: (number | null)[] = [
    ...Array(primeiroDia).fill(null),
    ...Array.from({ length: diasNoMes }, (_, i) => i + 1),
  ]

  function selecionar(dia: number) {
    const mm = String(viewMonth + 1).padStart(2, '0')
    const dd = String(dia).padStart(2, '0')
    onChange(`${viewYear}-${mm}-${dd}`)
    setOpen(false)
  }

  function irParaHoje() {
    setViewMonth(hoje.getMonth())
    setViewYear(hoje.getFullYear())
    const mm = String(hoje.getMonth() + 1).padStart(2, '0')
    const dd = String(hoje.getDate()).padStart(2, '0')
    onChange(`${hoje.getFullYear()}-${mm}-${dd}`)
    setOpen(false)
  }

  function isHoje(dia: number) {
    return dia === hoje.getDate() && viewMonth === hoje.getMonth() && viewYear === hoje.getFullYear()
  }
  function isSelecionado(dia: number) {
    if (!value) return false
    const d = new Date(value + 'T12:00:00')
    return dia === d.getDate() && viewMonth === d.getMonth() && viewYear === d.getFullYear()
  }

  const labelData = value
    ? new Date(value + 'T12:00:00').toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
    : placeholder

  return (
    <div ref={ref} className="relative">
      {/* Botão disparador */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 border border-border-light rounded-2xl bg-white hover:border-wagner focus:outline-none focus:ring-2 focus:ring-wagner transition-all disabled:opacity-50"
      >
        <span className={`flex items-center gap-2 text-base font-medium ${value ? 'text-text-primary' : 'text-text-muted'}`}>
          <span className="text-lg">📅</span>
          {labelData}
        </span>
        <svg
          className={`w-4 h-4 text-text-muted transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none" stroke="currentColor" viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Painel do calendário */}
      {open && (
        <div className="absolute z-30 mt-1 w-full bg-white border-2 border-wagner/30 rounded-2xl shadow-2xl overflow-hidden">

          {/* Header — mês/ano + navegação */}
          <div className="flex items-center justify-between px-3 py-3 bg-gradient-to-r from-wagner to-wagner-dark">
            <button
              type="button"
              onClick={prevMonth}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-white text-xl font-bold hover:bg-white/20 active:scale-90 transition-all"
            >‹</button>
            <span className="text-white font-bold text-sm tracking-wide">
              {MESES_PT[viewMonth]} {viewYear}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="w-8 h-8 flex items-center justify-center rounded-lg text-white text-xl font-bold hover:bg-white/20 active:scale-90 transition-all"
            >›</button>
          </div>

          {/* Cabeçalho dos dias */}
          <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50">
            {DIAS_PT.map(d => (
              <div key={d} className="py-2 text-center text-xs font-bold text-text-muted">{d}</div>
            ))}
          </div>

          {/* Grade */}
          <div className="grid grid-cols-7 p-2 gap-0.5">
            {cells.map((dia, i) => {
              if (!dia) return <div key={i} />
              const sel  = isSelecionado(dia)
              const hj   = isHoje(dia)
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => selecionar(dia)}
                  className={[
                    'w-full aspect-square rounded-xl text-sm font-semibold transition-all active:scale-90',
                    sel                  ? 'bg-wagner text-white shadow-md'           : '',
                    !sel && hj           ? 'border-2 border-wagner text-wagner'       : '',
                    !sel && !hj          ? 'text-text-primary hover:bg-wagner/10'     : '',
                  ].join(' ')}
                >
                  {dia}
                </button>
              )
            })}
          </div>

          {/* Rodapé — botão Hoje */}
          <div className="px-3 pb-3">
            <button
              type="button"
              onClick={irParaHoje}
              className="w-full py-2 rounded-xl text-sm font-bold text-wagner border-2 border-wagner/30 hover:bg-wagner/10 active:scale-95 transition-all"
            >
              Ir para hoje
            </button>
          </div>

        </div>
      )}
    </div>
  )
}
