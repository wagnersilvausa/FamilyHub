'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Card from '@/components/Card'
import { supabase, Gasto } from '@/lib/supabase'
import { formatCurrency, formatDate, getCurrentMonth } from '@/lib/utils'

interface ParcelaFutura {
  id: string
  valor: number
  status: string
  mes_referencia: string
}

export default function GastosPage() {
  const [gastos, setGastos] = useState<Gasto[]>([])
  const [parcelas, setParcelas] = useState<ParcelaFutura[]>([])
  const [filtroMes, setFiltroMes] = useState(getCurrentMonth())
  const [filtroCartao, setFiltroCartao] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    carregarGastos()
  }, [filtroMes, filtroCartao])

  const carregarGastos = async () => {
    try {
      setLoading(true)
      let query = supabase.from('gastos').select('*')

      // Filtro por mês - convertendo DATE para string
      if (filtroMes) {
        const [ano, mes] = filtroMes.split('-')
        const dataInicio = `${ano}-${mes}-01`
        const mesProximo = parseInt(mes) === 12 ? 1 : parseInt(mes) + 1
        const anoProximo = parseInt(mes) === 12 ? parseInt(ano) + 1 : parseInt(ano)
        const dataFim = `${anoProximo}-${String(mesProximo).padStart(2, '0')}-01`
        query = query.gte('data', dataInicio).lt('data', dataFim)
      }

      // Filtro por cartão
      if (filtroCartao) {
        query = query.eq('cartao', filtroCartao)
      }

      const { data, error } = await query.order('data', { ascending: false })

      console.log('🔍 Carregando gastos:', { data, error })
      if (error) throw error
      setGastos(data || [])

      // Carregar parcelas futuras do mês
      carregarParcelas()
    } catch (error) {
      console.error('❌ Erro ao carregar gastos:', error)
    } finally {
      setLoading(false)
    }
  }

  const carregarParcelas = async () => {
    try {
      // Carregar TODAS as parcelas pendentes (não só do mês)
      const { data, error } = await supabase
        .from('parcelas_futuras')
        .select('*')
        .eq('status', 'pendente')

      if (error) throw error
      setParcelas(data || [])
    } catch (error) {
      console.error('❌ Erro ao carregar parcelas:', error)
    }
  }

  // Calcular total com lógica correta para parcelados
  const totalGastos = gastos.reduce((sum, gasto) => {
    // Se é parcelado, contar apenas a parcela deste mês (valor_parcela)
    // Se é à vista, contar o valor total
    if (gasto.parcelas_total > 1) {
      return sum + gasto.valor_parcela
    }
    return sum + gasto.valor
  }, 0)

  const totalParcelado = parcelas.reduce((sum, parcela) => sum + parcela.valor, 0)
  // Total a pagar esse mês é SÓ os gastos do mês (não soma com parcelas futuras)
  const totalAPagar = totalGastos

  const gastosAgrupadosPorCartao = gastos.reduce(
    (acc, gasto) => {
      if (!acc[gasto.cartao]) acc[gasto.cartao] = 0
      acc[gasto.cartao] += gasto.valor
      return acc
    },
    {} as Record<string, number>
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'quitado':
        return 'bg-green-100 text-green-800'
      case 'pendente':
        return 'bg-yellow-100 text-yellow-800'
      case 'urgente':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'quitado':
        return '✅'
      case 'pendente':
        return '⏳'
      case 'urgente':
        return '🔴'
      case 'agendado':
        return '📅'
      default:
        return '•'
    }
  }

  const handleDeleteGasto = async (id: string) => {
    if (!confirm('Tem certeza que quer deletar este gasto?')) return

    try {
      const { error } = await supabase.from('gastos').delete().eq('id', id)
      if (error) throw error
      carregarGastos()
    } catch (error) {
      console.error('Erro ao deletar gasto:', error)
      alert('❌ Erro ao deletar gasto')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/20 pb-24">
      <Header title="💰 Meus Gastos" showBack={true} backHref="/registrar" />

      <div className="max-w-2xl mx-auto p-4 pt-6 space-y-6">
        {/* Hero Card com 3 Totais */}
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
              <p className="text-xs opacity-75">{filtroMes}</p>
            </div>
          </Card>
        </div>

        {/* Gastos por Cartão */}
        {Object.keys(gastosAgrupadosPorCartao).length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-primary mb-4">Por Cartão</h3>
            <div className="space-y-2">
              {Object.entries(gastosAgrupadosPorCartao).map(([cartao, total]) => (
                <Card key={cartao} elevated>
                  <div className="flex justify-between items-center">
                    <p className="font-semibold text-primary">{cartao}</p>
                    <p className="text-lg font-bold text-wagner">
                      {formatCurrency(total)}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Filtros - Chip Style */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-primary mb-3">Filtrar por Mês</label>
            <input
              type="month"
              value={filtroMes}
              onChange={(e) => setFiltroMes(e.target.value)}
              className="w-full px-4 py-3 border border-border-light rounded-2xl focus:ring-2 focus:ring-wagner focus:outline-none text-primary"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-primary mb-3">Filtrar por Cartão</label>
            <select
              value={filtroCartao}
              onChange={(e) => setFiltroCartao(e.target.value)}
              className="w-full px-4 py-3 border border-border-light rounded-2xl focus:ring-2 focus:ring-wagner focus:outline-none text-primary"
            >
              <option value="">Todos os Cartões</option>
              {Object.keys(gastosAgrupadosPorCartao).map((cartao) => (
                <option key={cartao} value={cartao}>
                  {cartao}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lista de Gastos */}
        <div>
          <h3 className="text-xl font-bold text-primary mb-4">Lançamentos</h3>
          {loading ? (
            <p className="text-center text-secondary py-8">Carregando...</p>
          ) : gastos.length === 0 ? (
            <p className="text-center text-secondary py-8">Nenhum gasto encontrado</p>
          ) : (
            <div className="space-y-3">
              {gastos.map((gasto) => (
                <Card key={gasto.id} elevated>
                  <div className="space-y-3">
                    <div className="flex justify-between items-start gap-3">
                      <div className="flex-1">
                        <p className="font-bold text-primary">{gasto.motivo}</p>
                        <p className="text-sm text-secondary">{gasto.cartao}</p>
                      </div>
                      <p className="text-2xl font-bold text-wagner">
                        {formatCurrency(gasto.valor)}
                      </p>
                    </div>

                    <div className="flex justify-between items-center text-sm gap-2">
                      <p className="text-secondary">{formatDate(gasto.data)} às {gasto.horario}</p>
                      <span className={`px-3 py-1.5 rounded-full font-semibold text-xs ${getStatusColor(gasto.status)}`}>
                        {getStatusIcon(gasto.status)} {gasto.status}
                      </span>
                    </div>

                    {gasto.parcelas_total > 1 && (
                      <div className="bg-blue-50/60 p-2.5 rounded-lg text-sm text-secondary border border-border-light">
                        📋 Parcela {gasto.parcela_atual} de {gasto.parcelas_total} - R${' '}
                        {gasto.valor_parcela.toFixed(2)} por parcela
                      </div>
                    )}

                    {gasto.observacao && (
                      <p className="text-sm text-secondary italic">"{gasto.observacao}"</p>
                    )}

                    {gasto.data_vencimento && (
                      <p className="text-xs text-text-muted">
                        📅 Vencimento: {formatDate(gasto.data_vencimento)}
                      </p>
                    )}

                    {/* Botões de ação */}
                    <div className="flex gap-2 pt-2 border-t border-border-light">
                      <a
                        href={`/registrar/gasto/${gasto.id}/editar`}
                        className="flex-1 py-2 px-3 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold transition-colors text-center"
                      >
                        ✏️ Editar
                      </a>
                      <button
                        onClick={() => handleDeleteGasto(gasto.id)}
                        className="flex-1 py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 rounded-lg text-sm font-semibold transition-colors"
                      >
                        🗑️ Deletar
                      </button>
                    </div>
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
