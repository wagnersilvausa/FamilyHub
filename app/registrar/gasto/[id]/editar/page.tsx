'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Header from '@/components/Header'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Toast from '@/components/Toast'
import { supabase, Gasto } from '@/lib/supabase'
import { getCurrentDate, getCurrentTime, formatDate } from '@/lib/utils'
import DatePicker from '@/components/DatePicker'

const CARTOES = ['Itaú', 'Marisa', 'Nubank', 'Inter', 'Bradesco', 'C6', 'Outros']
const OPCOES_PARCELAS = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 18, 24]
const SUGESTOES_MOTIVO = [
  'Supermercado', 'Farmácia', 'Combustível', 'Restaurante',
  'Conta de luz', 'Conta de água', 'Internet', 'Aluguel',
  'Roupas', 'Médico', 'Escola', 'Transporte', 'Outros',
]

function mascaraParaNumero(mascarado: string): number {
  return parseFloat(mascarado.replace(/\./g, '').replace(',', '.')) || 0
}

function aplicarMascara(raw: string): string {
  const digitos = raw.replace(/\D/g, '')
  if (!digitos) return ''
  const num = parseInt(digitos, 10)
  return (num / 100).toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
}

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function EditarGastoPage() {
  const router = useRouter()
  const params = useParams()
  const gastoId = params.id as string

  const [valorMascara, setValorMascara] = useState('')
  const [cartao, setCartao] = useState(CARTOES[0])
  const [motivo, setMotivo] = useState('')
  const [observacao, setObservacao] = useState('')
  const [dataGasto, setDataGasto] = useState(getCurrentDate())
  const [dataVencimento, setDataVencimento] = useState('')
  const [status, setStatus] = useState<'agendado' | 'pendente' | 'quitado' | 'urgente'>('quitado')

  const [showParcelamento, setShowParcelamento] = useState(false)
  const [isParcelado, setIsParcelado] = useState(false)
  const [totalParcelas, setTotalParcelas] = useState(2)
  const [parcelaAtual, setParcelaAtual] = useState(1)

  const [showSugestoes, setShowSugestoes] = useState(false)
  const [sugestoesFiltradas, setSugestoesFiltradas] = useState<string[]>([])
  const motivoRef = useRef<HTMLDivElement>(null)

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [loading, setLoading] = useState(false)
  const [carregando, setCarregando] = useState(true)

  const valorNumerico = mascaraParaNumero(valorMascara)
  const valorParcela = isParcelado && totalParcelas > 0 ? valorNumerico / totalParcelas : valorNumerico
  const parcelasRestantes = totalParcelas - parcelaAtual
  const isUltimaParcela = isParcelado && parcelaAtual === totalParcelas

  // Carregar gasto ao montar
  useEffect(() => {
    carregarGasto()
  }, [gastoId])

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

  // Quando muda para parcelado, define status como pendente
  useEffect(() => {
    if (isParcelado) setStatus('pendente')
  }, [isParcelado])

  async function carregarGasto() {
    try {
      const { data, error } = await supabase
        .from('gastos')
        .select('*')
        .eq('id', gastoId)
        .single()

      if (error) throw error
      if (!data) {
        setToast({ message: 'Gasto não encontrado', type: 'error' })
        router.push('/registrar/gastos')
        return
      }

      // Preencher formulário
      const gasto = data as Gasto
      setValorMascara(formatBRL(gasto.valor))
      setCartao(gasto.cartao)
      setMotivo(gasto.motivo)
      setObservacao(gasto.observacao || '')
      setDataGasto(gasto.data)
      setDataVencimento(gasto.data_vencimento || '')
      setStatus(gasto.status as any)
      setIsParcelado(gasto.parcelas_total > 1)
      setTotalParcelas(gasto.parcelas_total)
      setParcelaAtual(gasto.parcela_atual)
    } catch (error) {
      console.error('Erro ao carregar gasto:', error)
      setToast({ message: 'Erro ao carregar gasto', type: 'error' })
    } finally {
      setCarregando(false)
    }
  }

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

      const { error } = await supabase
        .from('gastos')
        .update({
          valor: valorNumerico,
          cartao,
          motivo,
          observacao,
          data: dataGasto,
          data_vencimento: dataVencimento || null,
          parcela_atual: isParcelado ? parcelaAtual : 1,
          parcelas_total: numParcelas,
          valor_parcela: vParcela,
          status: dataVencimento ? undefined : status,
        })
        .eq('id', gastoId)

      if (error) throw error

      setToast({ message: '✅ Gasto atualizado com sucesso!', type: 'success' })
      setTimeout(() => router.push('/registrar/gastos'), 1500)
    } catch (error) {
      console.error('Erro ao atualizar gasto:', error)
      setToast({ message: '❌ Erro ao atualizar gasto', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  if (carregando) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/20 pb-24">
        <Header title="📝 Editar Gasto" showBack={true} backHref="/registrar/gastos" />
        <div className="max-w-2xl mx-auto p-4 pt-6">
          <p className="text-center text-secondary">Carregando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/20 pb-24">
      <Header title="📝 Editar Gasto" showBack={true} backHref="/registrar/gastos" />

      <div className="max-w-2xl mx-auto p-4 pt-6 space-y-5">
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Preview de valor */}
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

          {/* Valor */}
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

          {/* Data do gasto */}
          <div>
            <label className="block text-base font-bold mb-2 text-text-primary">Data do Gasto</label>
            <DatePicker value={dataGasto} onChange={setDataGasto} disabled={loading} />
          </div>

          {/* Data de Vencimento */}
          <div>
            <label className="block text-base font-bold mb-2 text-text-primary">📅 Data de Vencimento (opcional)</label>
            <DatePicker value={dataVencimento} onChange={setDataVencimento} disabled={loading} />
            {dataVencimento && (
              <p className="text-sm text-text-muted mt-2">
                ⏰ Status automático: Pendente em menos de 3 dias
              </p>
            )}
          </div>

          {/* Cartão */}
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

          {/* Motivo */}
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

          {/* Observação */}
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

          {/* Status */}
          <div>
            <label className="block text-base font-bold mb-3 text-text-primary">Status</label>
            {dataVencimento && (
              <div className="mb-3 p-3 bg-blue-50 border border-blue-200 rounded-xl">
                <p className="text-sm text-blue-800 font-medium">
                  ✓ Status será automático baseado na data de vencimento
                </p>
              </div>
            )}
            <div className="space-y-2">
              {([
                { value: 'quitado',  label: 'Quitado',  icon: '✅', desc: 'Pagamento concluído' },
                { value: 'pendente', label: 'Pendente', icon: '⏳', desc: 'A ser pago' },
                { value: 'urgente',  label: 'Urgente',  icon: '🔴', desc: 'Pagamento imediato' },
              ] as const).map(({ value, label, icon, desc }) => (
                <label
                  key={value}
                  className={`flex items-center p-3 rounded-xl border-2 transition-all ${
                    dataVencimento
                      ? 'cursor-not-allowed opacity-50 border-border-light bg-slate-50'
                      : `cursor-pointer ${
                          status === value
                            ? value === 'urgente'
                              ? 'border-red-400 bg-red-50'
                              : 'border-wagner bg-wagner/10'
                            : 'border-border-light hover:border-wagner'
                        }`
                  }`}
                >
                  <input
                    type="radio"
                    name="status"
                    value={value}
                    checked={status === value}
                    onChange={() => setStatus(value)}
                    className="w-5 h-5"
                    disabled={loading || !!dataVencimento}
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

          {/* Botão submit */}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? '💾 Salvando...' : '💾 Atualizar Gasto'}
          </Button>

        </form>
      </div>

      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
    </div>
  )
}
