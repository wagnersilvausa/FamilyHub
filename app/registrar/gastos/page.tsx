'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Card from '@/components/Card'
import { supabase, Gasto } from '@/lib/supabase'
import { formatCurrency, formatDate, getCurrentMonth } from '@/lib/utils'

export default function GastosPage() {
  const [gastos, setGastos] = useState<Gasto[]>([])
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

      // Filtro por mês
      if (filtroMes) {
        query = query.like('data', `${filtroMes}%`)
      }

      // Filtro por cartão
      if (filtroCartao) {
        query = query.eq('cartao', filtroCartao)
      }

      const { data, error } = await query.order('data', { ascending: false })

      if (error) throw error
      setGastos(data || [])
    } catch (error) {
      console.error('Erro ao carregar gastos:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalGastos = gastos.reduce((sum, gasto) => sum + gasto.valor, 0)
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
      default:
        return '•'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/20 pb-24">
      <Header title="💰 Meus Gastos" showBack={true} backHref="/registrar" />

      <div className="max-w-2xl mx-auto p-4 pt-6 space-y-6">
        {/* Hero Card */}
        <Card elevated className="bg-gradient-to-r from-wagner via-blue-500 to-purple-600 text-white">
          <div className="space-y-3">
            <p className="text-lg font-semibold opacity-90">Total no Mês</p>
            <p className="text-5xl font-bold">{formatCurrency(totalGastos)}</p>
            <p className="text-sm opacity-75">{gastos.length} gastos registrados</p>
          </div>
        </Card>

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
