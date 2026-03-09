'use client'

import { useState, useRef, useEffect } from 'react'
import Header from '@/components/Header'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Toast from '@/components/Toast'
import { supabase } from '@/lib/supabase'
import { getCurrentDate, getCurrentTime } from '@/lib/utils'
import DatePicker from '@/components/DatePicker'

// ─── Constantes ──────────────────────────────────────────────────────────────

const CARTOES = ['Itaú', 'Marisa', 'Nubank', 'Inter', 'Bradesco', 'C6', 'Outros']

const OPCOES_PARCELAS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 18, 24]

const SUGESTOES_MOTIVO = [
  'Supermercado', 'Farmácia', 'Combustível', 'Restaurante',
  'Conta de luz', 'Conta de água', 'Internet', 'Aluguel',
  'Roupas', 'Médico', 'Escola', 'Transporte', 'Outros',
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Converte string de máscara (ex: "1.250,50") para número (1250.5) */
function mascaraParaNumero(mascarado: string): number {
  return parseFloat(mascarado.replace(/\./g, '').replace(',', '.')) || 0
}

/** Aplica máscara monetária brasileira em tempo real */
function aplicarMascara(raw: string): string {
  // Mantém apenas dígitos
  const digitos = raw.replace(/\D/g, '')
  if (!digitos) return ''
  // Trata os dois últimos dígitos como centavos
  const num = parseInt(digitos, 10)
  return (num / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

/** Formata número para exibição pt-BR */
function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

// ─── Componente Principal ─────────────────────────────────────────────────────

export default function RegistroGastoPage() {
  // Valor com máscara
  const [valorMascara, setValorMascara] = useState('')

  // Campos do gasto
  const [cartao, setCartao] = useState(CARTOES[0])
  const [motivo, setMotivo] = useState('')
  const [observacao, setObservacao] = useState('')
  const [dataGasto, setDataGasto] = useState(getCurrentDate())
  const [status, setStatus] = useState<'pendente' | 'quitado' | 'urgente'>('quitado')

  // Parcelamento
  const [showParcelamento, setShowParcelamento] = useState(false)
  const [isParcelado, setIsParcelado] = useState(false)
  const [totalParcelas, setTotalParcelas] = useState(2)
  const [parcelaAtual, setParcelaAtual] = useState(1)

  // Autocomplete motivo
  const [showSugestoes, setShowSugestoes] = useState(false)
  const [sugestoesFiltradas, setSugestoesFiltradas] = useState<string[]>([])
  const motivoRef = useRef<HTMLDivElement>(null)

  // UI
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [loading, setLoading] = useState(false)

  // ── Derivados ──────────────────────────────────────────────────────────────

  const valorNumerico = mascaraParaNumero(valorMascara)
  const valorParcela = isParcelado && totalParcelas > 0 ? valorNumerico / totalParcelas : valorNumerico
  const parcelasRestantes = totalParcelas - parcelaAtual
  const isUltimaParcela = isParcelado && parcelaAtual === totalParcelas

  // ── Efeitos ────────────────────────────────────────────────────────────────

  // Quando muda para parcelado, define status como pendente
  useEffect(() => {
    if (isParcelado) setStatus('pendente')
  }, [isParcelado])

  // Fecha sugestões ao clicar fora
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (motivoRef.current && !motivoRef.current.contains(e.target as Node)) {
        setShowSugestoes(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // ── Handlers ───────────────────────────────────────────────────────────────

  function handleValorChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValorMascara(aplicarMascara(e.target.value))
  }

  function handleMotivoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value
    setMotivo(v)
    if (v.length > 0) {
      const filtradas = SUGESTOES_MOTIVO.filter((s) =>
        s.toLowerCase().includes(v.toLowerCase())
      )
      setSugestoesFiltradas(filtradas)
      setShowSugestoes(filtradas.length > 0)
    } else {
      setSugestoesFiltradas(SUGESTOES_MOTIVO)
      setShowSugestoes(true)
    }
  }

  function handleMotivoFocus() {
    setSugestoesFiltradas(
      motivo.length > 0
        ? SUGESTOES_MOTIVO.filter((s) => s.toLowerCase().includes(motivo.toLowerCase()))
        : SUGESTOES_MOTIVO
    )
    setShowSugestoes(true)
  }

  function selecionarSugestao(s: string) {
    setMotivo(s)
    setShowSugestoes(false)
  }

  function handleParcelaAtualChange(v: number) {
    const clamped = Math.max(1, Math.min(v, totalParcelas))
    setParcelaAtual(clamped)
  }

  function resetForm() {
    setValorMascara('')
    setCartao(CARTOES[0])
    setMotivo('')
    setObservacao('')
    setDataGasto(getCurrentDate())
    setStatus('quitado')
    setIsParcelado(false)
    setShowParcelamento(false)
    setTotalParcelas(2)
    setParcelaAtual(1)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!valorNumerico || !motivo) {
      setToast({ message: 'Preencha valor e motivo!', type: 'error' })
      return
    }

    setLoading(true)

    try {
      const numParcelas = isParcelado ? totalParcelas : 1
      const vParcela = isParcelado ? valorParcela : valorNumerico

      const { data: gastoData, error: gastoError } = await supabase
        .from('gastos')
        .insert([{
          valor: valorNumerico,
          cartao,
          motivo,
          observacao,
          data: dataGasto,
          horario: getCurrentTime(),
          parcela_atual: isParcelado ? parcelaAtual : 1,
          parcelas_total: numParcelas,
          valor_parcela: vParcela,
          status,
        }])
        .select()

      if (gastoError) throw gastoError

      // Cria parcelas futuras apenas para gastos parcelados
      if (isParcelado && gastoData && gastoData[0]) {
        const gastoId = gastoData[0].id
        const parcelasFuturas = []

        for (let i = parcelaAtual + 1; i <= numParcelas; i++) {
          const dataProxima = new Date(dataGasto)
          dataProxima.setMonth(dataProxima.getMonth() + (i - parcelaAtual))
          const mesReferencia = `${dataProxima.getFullYear()}-${String(
            dataProxima.getMonth() + 1
          ).padStart(2, '0')}`

          parcelasFuturas.push({
            gasto_id: gastoId,
            valor: vParcela,
            mes_referencia: mesReferencia,
            status: 'pendente',
          })
        }

        if (parcelasFuturas.length > 0) {
          const { error: parcelasError } = await supabase
            .from('parcelas_futuras')
            .insert(parcelasFuturas)
          if (parcelasError) throw parcelasError
        }
      }

      setToast({ message: '✅ Gasto registrado com sucesso!', type: 'success' })
      resetForm()
    } catch (error) {
      console.error('Erro ao registrar gasto:', error)
      setToast({ message: '❌ Erro ao registrar gasto', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/20 pb-24">
      <Header title="💰 Registrar Gasto" showBack={true} backHref="/registrar" />

      <div className="max-w-2xl mx-auto p-4 pt-6 space-y-5">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* ── Preview de valor ── */}
          {valorNumerico > 0 && (
            <Card variant="gradient" className="text-center py-5">
              <p className="text-white/70 text-sm mb-1">Valor Total</p>
              <p className="text-4xl font-bold text-white">R$ {valorMascara}</p>
              {isParcelado && totalParcelas > 0 && (
                <p className="text-white/80 text-sm mt-2">
                  {totalParcelas}× de R$ {formatBRL(valorParcela)}
                </p>
              )}
            </Card>
          )}

          {/* ── Valor com máscara ── */}
          <div>
            <label className="block text-base font-bold mb-2 text-text-primary">Valor (R$)</label>
            <input
              inputMode="numeric"
              value={valorMascara}
              onChange={handleValorChange}
              placeholder="0,00"
              className={`w-full p-4 text-2xl font-bold border-2 rounded-2xl focus:outline-none focus:ring-2 focus:ring-wagner focus:border-transparent transition-all bg-white ${
                status === 'urgente' ? 'border-red-400' : 'border-border-light'
              }`}
              disabled={loading}
            />
          </div>

          {/* ── Data do gasto ── */}
          <div>
            <label className="block text-base font-bold mb-2 text-text-primary">Data do Gasto</label>
            <DatePicker value={dataGasto} onChange={setDataGasto} disabled={loading} />
          </div>

          {/* ── Cartão ── */}
          <div>
            <label className="block text-base font-bold mb-3 text-text-primary">Cartão</label>
            <div className="grid grid-cols-2 gap-2">
              {CARTOES.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setCartao(c)}
                  disabled={loading}
                  className={`p-3 rounded-xl font-semibold transition-all ${
                    cartao === c
                      ? 'bg-wagner text-white shadow-lg scale-105'
                      : 'bg-white border border-border-light text-text-primary hover:border-wagner'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* ── Motivo com autocomplete ── */}
          <div ref={motivoRef} className="relative">
            <label className="block text-base font-bold mb-2 text-text-primary">Motivo</label>
            <input
              type="text"
              value={motivo}
              onChange={handleMotivoChange}
              onFocus={handleMotivoFocus}
              placeholder="Ex: Supermercado, Farmácia..."
              className="w-full p-4 text-base border-2 border-border-light rounded-2xl focus:outline-none focus:ring-2 focus:ring-wagner focus:border-transparent transition-all bg-white"
              disabled={loading}
              autoComplete="off"
            />
            {showSugestoes && sugestoesFiltradas.length > 0 && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-border-light rounded-2xl shadow-xl overflow-hidden">
                {sugestoesFiltradas.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onMouseDown={() => selecionarSugestao(s)}
                    className="w-full text-left px-4 py-3 text-sm text-text-primary hover:bg-wagner/10 hover:text-wagner transition-colors font-medium border-b border-slate-50 last:border-0"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Observação ── */}
          <div>
            <label className="block text-base font-bold mb-2 text-text-primary">Observação</label>
            <textarea
              value={observacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Detalhes adicionais..."
              className="w-full p-4 text-base border-2 border-border-light rounded-2xl focus:outline-none focus:ring-2 focus:ring-wagner focus:border-transparent transition-all bg-white h-24 resize-none"
              disabled={loading}
            />
          </div>

          {/* ── Seção de Parcelamento ── */}
          <div className={`rounded-2xl border-2 transition-all ${showParcelamento ? 'border-wagner/40 bg-white' : 'border-transparent'}`}>
            <button
              type="button"
              onClick={() => setShowParcelamento(!showParcelamento)}
              className="w-full flex items-center justify-between px-4 py-3 text-base font-bold text-wagner hover:text-wagner-dark transition-colors"
            >
              <span>📋 Parcelamento</span>
              <span className="text-lg transition-transform duration-200" style={{ display: 'inline-block', transform: showParcelamento ? 'rotate(90deg)' : 'rotate(0deg)' }}>▶</span>
            </button>

            {showParcelamento && (
              <div className="px-4 pb-4 space-y-4">

                {/* Toggle À vista / Parcelado */}
                <div className="flex rounded-xl overflow-hidden border-2 border-border-light">
                  <button
                    type="button"
                    onClick={() => setIsParcelado(false)}
                    className={`flex-1 py-3 text-sm font-bold transition-all ${
                      !isParcelado
                        ? 'bg-wagner text-white'
                        : 'bg-white text-text-secondary hover:bg-slate-50'
                    }`}
                  >
                    💵 À vista
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsParcelado(true)}
                    className={`flex-1 py-3 text-sm font-bold transition-all ${
                      isParcelado
                        ? 'bg-wagner text-white'
                        : 'bg-white text-text-secondary hover:bg-slate-50'
                    }`}
                  >
                    🗓️ Parcelado
                  </button>
                </div>

                {/* Campos de parcelamento */}
                {isParcelado && (
                  <div className="space-y-4">

                    {/* Total de parcelas */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-text-primary">Total de parcelas</label>
                      <select
                        value={totalParcelas}
                        onChange={(e) => {
                          const v = parseInt(e.target.value)
                          setTotalParcelas(v)
                          if (parcelaAtual > v) setParcelaAtual(v)
                        }}
                        className="w-full p-3 text-base border-2 border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-wagner focus:border-transparent bg-white font-semibold"
                        disabled={loading}
                      >
                        {OPCOES_PARCELAS.map((n) => (
                          <option key={n} value={n}>{n}x</option>
                        ))}
                      </select>
                    </div>

                    {/* Parcela atual */}
                    <div>
                      <label className="block text-sm font-semibold mb-2 text-text-primary">
                        Parcela atual
                        <span className="ml-2 text-text-muted font-normal">(qual parcela estou pagando agora?)</span>
                      </label>
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => handleParcelaAtualChange(parcelaAtual - 1)}
                          className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-text-primary font-bold text-xl flex items-center justify-center transition-all active:scale-95"
                        >−</button>
                        <input
                          type="number"
                          min={1}
                          max={totalParcelas}
                          value={parcelaAtual}
                          onChange={(e) => handleParcelaAtualChange(parseInt(e.target.value) || 1)}
                          className="flex-1 p-3 text-center text-xl font-bold border-2 border-border-light rounded-xl focus:outline-none focus:ring-2 focus:ring-wagner focus:border-transparent bg-white"
                          disabled={loading}
                        />
                        <button
                          type="button"
                          onClick={() => handleParcelaAtualChange(parcelaAtual + 1)}
                          className="w-11 h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-text-primary font-bold text-xl flex items-center justify-center transition-all active:scale-95"
                        >+</button>
                      </div>
                    </div>

                    {/* Resumo calculado */}
                    {valorNumerico > 0 && (
                      <div className="bg-gradient-to-br from-wagner/10 to-wagner-dark/10 rounded-xl p-4 border border-wagner/20 space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-text-secondary">Valor por parcela</span>
                          <span className="font-bold text-wagner text-lg">R$ {formatBRL(valorParcela)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-text-secondary">Valor total da compra</span>
                          <span className="font-bold text-text-primary">R$ {formatBRL(valorNumerico)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-text-secondary">Parcelas restantes</span>
                          <span className={`font-bold text-lg ${parcelasRestantes === 0 ? 'text-success' : 'text-text-primary'}`}>
                            {parcelasRestantes}x
                          </span>
                        </div>
                        <div className="border-t border-wagner/20 pt-2 mt-2">
                          {isUltimaParcela ? (
                            <div className="flex items-center justify-center gap-2 py-1 rounded-lg bg-success/20 border border-success/30">
                              <span className="text-success font-bold text-sm">🎉 Última parcela!</span>
                            </div>
                          ) : (
                            <p className="text-center text-sm font-semibold text-text-secondary">
                              Parcela{' '}
                              <span className="text-wagner font-bold">{parcelaAtual}</span>
                              {' '}de{' '}
                              <span className="text-text-primary font-bold">{totalParcelas}</span>
                              {' '}— faltam{' '}
                              <span className="text-wagner font-bold">{parcelasRestantes}× de R$ {formatBRL(valorParcela)}</span>
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Status ── */}
          <div>
            <label className="block text-base font-bold mb-3 text-text-primary">Status</label>
            <div className="space-y-2">
              {([
                { value: 'quitado',  label: 'Quitado',  icon: '✅', desc: 'Pagamento concluído' },
                { value: 'pendente', label: 'Pendente', icon: '⏳', desc: 'A ser pago' },
                { value: 'urgente',  label: 'Urgente',  icon: '🔴', desc: 'Pagamento imediato' },
              ] as const).map(({ value, label, icon, desc }) => (
                <label
                  key={value}
                  className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    status === value
                      ? value === 'urgente'
                        ? 'border-red-400 bg-red-50'
                        : 'border-wagner bg-wagner/10'
                      : 'border-border-light hover:border-wagner'
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={value}
                    checked={status === value}
                    onChange={() => setStatus(value)}
                    className="w-5 h-5"
                    disabled={loading}
                  />
                  <span className="text-xl ml-3">{icon}</span>
                  <span className="ml-2 flex-1">
                    <span className="block text-base font-semibold text-text-primary">{label}</span>
                    <span className="block text-xs text-text-muted">{desc}</span>
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* ── Botão submit ── */}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? '💾 Salvando...' : '💾 Salvar Gasto'}
          </Button>

        </form>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  )
}
