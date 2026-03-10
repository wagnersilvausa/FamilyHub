'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Toast from '@/components/Toast'
import { supabase, Gasto } from '@/lib/supabase'
import { formatCurrency, getCurrentMonth, groupBy, sum } from '@/lib/utils'

interface ParcelaFutura {
  id: string
  valor: number
  status: string
  mes_referencia: string
}

export default function RelatorioPage() {
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [parcelas, setParcelas] = useState<ParcelaFutura[]>([])
  const [loading, setLoading] = useState(true)
  const [enviando, setEnviando] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const currentMonth = getCurrentMonth()

  useEffect(() => {
    carregarGastos()
  }, [])

  const carregarGastos = async () => {
    try {
      setLoading(true)
      const [ano, mes] = currentMonth.split('-')
      const dataInicio = `${ano}-${mes}-01`
      const mesProximo = parseInt(mes) === 12 ? 1 : parseInt(mes) + 1
      const anoProximo = parseInt(mes) === 12 ? parseInt(ano) + 1 : parseInt(ano)
      const dataFim = `${anoProximo}-${String(mesProximo).padStart(2, '0')}-01`

      const { data, error } = await supabase
        .from('gastos')
        .select('*')
        .gte('data', dataInicio)
        .lt('data', dataFim)
        .order('data', { ascending: false })

      console.log('🔍 Carregando gastos do mês:', { data, error })
      if (error) throw error
      setGastos(data || [])

      // Carregar TODAS as parcelas pendentes (não só do mês atual)
      const { data: parcelasData, error: parcelasError } = await supabase
        .from('parcelas_futuras')
        .select('*')
        .eq('status', 'pendente')

      if (parcelasError) throw parcelasError
      setParcelas(parcelasData || [])
    } catch (error) {
      console.error('❌ Erro ao carregar gastos:', error)
    } finally {
      setLoading(false)
    }
  }

  // Calcular total com lógica correta para parcelados
  const totalGastos = sum(gastos.map((g) => {
    // Se é parcelado, contar apenas a parcela deste mês (valor_parcela)
    // Se é à vista, contar o valor total
    if (g.parcelas_total > 1) {
      return g.valor_parcela
    }
    return g.valor
  }))

  const totalParcelado = sum(parcelas.map((p) => p.valor))
  // Total a pagar esse mês é SÓ os gastos do mês (não soma com parcelas futuras)
  const totalAPagar = totalGastos
  const gastosPorCartao = groupBy(gastos, 'cartao')
  const gastosPorStatus = groupBy(gastos, 'status')

  const handleEnviarRelatorio = async () => {
    setEnviando(true)

    try {
      // Criar mensagem formatada
      let mensagem = `📊 <b>Relatório Mensal - ${currentMonth}</b>\n\n`

      mensagem += `💰 <b>Total de Gastos:</b> ${formatCurrency(totalGastos)}\n`

      if (totalParcelado > 0) {
        mensagem += `📋 <b>Parcelamentos que Faltam:</b> ${formatCurrency(totalParcelado)}\n`
      }

      mensagem += `🎯 <b>Total a Pagar Este Mês:</b> <b>${formatCurrency(totalAPagar)}</b>\n\n`

      mensagem += '<b>🏦 Por Cartão:</b>\n'
      Object.entries(gastosPorCartao).forEach(([cartao, gastos]) => {
        const total = sum(gastos.map((g) => g.valor))
        mensagem += `  • ${cartao}: ${formatCurrency(total)}\n`
      })

      mensagem += '\n<b>📌 Por Status:</b>\n'
      Object.entries(gastosPorStatus).forEach(([status, gastos]) => {
        const total = sum(gastos.map((g) => g.valor))
        const icon = status === 'quitado' ? '✅' : status === 'pendente' ? '⏳' : status === 'agendado' ? '📅' : '🔴'
        mensagem += `  ${icon} ${status}: ${formatCurrency(total)} (${gastos.length} gastos)\n`
      })

      if (parcelas.length > 0) {
        mensagem += `\n<b>📋 Parcelas Pendentes Este Mês:</b> ${parcelas.length} parcelas\n`
      }

      mensagem += '\n<b>📝 Últimos Lançamentos:</b>\n'
      gastos.slice(0, 5).forEach((gasto) => {
        mensagem += `  • ${gasto.motivo}: ${formatCurrency(gasto.valor)} (${gasto.data})\n`
      })

      // Enviar para API
      const response = await fetch('/api/telegram/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: mensagem,
        }),
      })

      if (!response.ok) throw new Error('Erro ao enviar relatório')

      setToast({ message: '✅ Relatório enviado para Wagner!', type: 'success' })
    } catch (error) {
      console.error('Erro ao enviar relatório:', error)
      setToast({ message: '❌ Erro ao enviar relatório', type: 'error' })
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/20 pb-24">
      <Header title="📊 Relatório do Mês" showBack={true} backHref="/registrar" />

      <div className="max-w-2xl mx-auto p-4 pt-6 space-y-6">
        {/* Cards com 3 Totais */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {/* Total de Gastos */}
          <Card elevated className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <div className="space-y-2">
              <p className="text-sm font-semibold opacity-90">💰 Gastos do Mês</p>
              <p className="text-3xl font-bold">{formatCurrency(totalGastos)}</p>
              <p className="text-xs opacity-75">{gastos.length} gastos</p>
            </div>
          </Card>

          {/* Total Parcelado */}
          <Card elevated className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
            <div className="space-y-2">
              <p className="text-sm font-semibold opacity-90">📋 Parceladas Pendentes</p>
              <p className="text-3xl font-bold">{formatCurrency(totalParcelado)}</p>
              <p className="text-xs opacity-75">{parcelas.length} parcelas</p>
            </div>
          </Card>

          {/* Total a Pagar */}
          <Card elevated className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <div className="space-y-2">
              <p className="text-sm font-semibold opacity-90">🎯 Total a pagar esse mês</p>
              <p className="text-3xl font-bold">{formatCurrency(totalAPagar)}</p>
              <p className="text-xs opacity-75">{currentMonth}</p>
            </div>
          </Card>
        </div>

        {/* Por Cartão */}
        {loading ? (
          <p className="text-center text-secondary py-8">Carregando...</p>
        ) : (
          <>
            <div>
              <h3 className="text-xl font-bold text-primary mb-4">🏦 Por Cartão</h3>
              <div className="space-y-2">
                {Object.entries(gastosPorCartao).map(([cartao, cartaoGastos]) => (
                  <Card key={cartao} elevated>
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-primary">{cartao}</p>
                      <div className="text-right">
                        <p className="text-lg font-bold text-wagner">
                          {formatCurrency(sum(cartaoGastos.map((g) => g.valor)))}
                        </p>
                        <p className="text-xs text-secondary">{cartaoGastos.length} gastos</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Por Status */}
            <div>
              <h3 className="text-xl font-bold text-primary mb-4">📌 Por Status</h3>
              <div className="space-y-2">
                {Object.entries(gastosPorStatus).map(([status, statusGastos]) => (
                  <Card key={status} elevated>
                    <div className="flex justify-between items-center">
                      <p className="font-semibold text-primary capitalize">{status}</p>
                      <div className="text-right">
                        <p className="text-lg font-bold text-success">
                          {formatCurrency(sum(statusGastos.map((g) => g.valor)))}
                        </p>
                        <p className="text-xs text-secondary">{statusGastos.length} gastos</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Últimos Gastos */}
            <div>
              <h3 className="text-xl font-bold text-primary mb-4">📝 Últimos Gastos</h3>
              <div className="space-y-2">
                {gastos.slice(0, 5).map((gasto) => (
                  <Card key={gasto.id} elevated>
                    <div className="flex justify-between items-center gap-3">
                      <div>
                        <p className="font-semibold text-primary">{gasto.motivo}</p>
                        <p className="text-xs text-secondary mt-1">
                          {gasto.cartao} - {gasto.data}
                        </p>
                      </div>
                      <p className="text-lg font-bold text-wagner flex-shrink-0">{formatCurrency(gasto.valor)}</p>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            {/* Botão Enviar */}
            <Button
              onClick={handleEnviarRelatorio}
              disabled={enviando || gastos.length === 0}
              variant="danger"
              className="w-full"
            >
              {enviando ? 'Enviando...' : '📤 Fechar Mês e Enviar p/ Wagner'}
            </Button>
          </>
        )}
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
