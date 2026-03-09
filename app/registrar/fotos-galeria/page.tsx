'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Card from '@/components/Card'
import { supabase, Documento } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'

const CATEGORIAS = [
  'Comprovantes de Gasto',
  'Despesas do Dia a Dia',
  'Saúde',
  'Documentos Gerais',
]

export default function FotosGaleriaPage() {
  const [fotos, setFotos] = useState<Documento[]>([])
  const [filtroCategoria, setFiltroCategoria] = useState('')
  const [busca, setBusca] = useState('')
  const [loading, setLoading] = useState(true)
  const [fotoSelecionada, setFotoSelecionada] = useState<Documento | null>(null)

  useEffect(() => {
    carregarFotos()
  }, [filtroCategoria, busca])

  const carregarFotos = async () => {
    try {
      setLoading(true)
      let query = supabase.from('documentos').select('*')

      if (filtroCategoria) {
        query = query.eq('categoria', filtroCategoria)
      }

      const { data, error } = await query.order('data', { ascending: false })

      if (error) throw error

      let result = data || []

      if (busca) {
        result = result.filter(
          (foto) =>
            foto.titulo.toLowerCase().includes(busca.toLowerCase()) ||
            foto.descricao.toLowerCase().includes(busca.toLowerCase()) ||
            foto.categoria.toLowerCase().includes(busca.toLowerCase())
        )
      }

      setFotos(result)
    } catch (error) {
      console.error('Erro ao carregar fotos:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/20 pb-24">
      <Header title="📷 Fotos" showBack={true} backHref="/registrar" />

      <div className="max-w-2xl mx-auto p-4 pt-6 space-y-5">
        {/* Modal de Foto */}
        {fotoSelecionada && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col items-center justify-center p-4">
            <button
              onClick={() => setFotoSelecionada(null)}
              className="absolute top-4 right-4 text-white text-4xl hover:opacity-70"
            >
              ✕
            </button>

            <div className="max-w-lg w-full bg-white rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={fotoSelecionada.arquivo_url}
                alt={fotoSelecionada.titulo}
                className="w-full h-auto"
              />

              <div className="p-5">
                <p className="font-bold text-primary mb-2">
                  {fotoSelecionada.titulo}
                </p>
                <p className="text-sm text-secondary mb-2">{fotoSelecionada.categoria}</p>
                <p className="text-xs text-muted mb-4">{formatDate(fotoSelecionada.data)}</p>

                {fotoSelecionada.descricao && (
                  <p className="text-sm text-secondary bg-gray-50/60 p-3 rounded-lg border border-border-light">
                    {fotoSelecionada.descricao}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Busca */}
        <div>
          <input
            type="text"
            placeholder="🔍 Buscar fotos..."
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            className="w-full px-4 py-3 border border-border-light rounded-2xl focus:ring-2 focus:ring-wagner focus:outline-none text-primary placeholder-muted"
          />
        </div>

        {/* Filtros */}
        <div>
          <label className="block text-sm font-semibold text-primary mb-2.5">Filtrar por Categoria</label>
          <select
            value={filtroCategoria}
            onChange={(e) => setFiltroCategoria(e.target.value)}
            className="w-full px-4 py-3 border border-border-light rounded-2xl focus:ring-2 focus:ring-wagner focus:outline-none text-primary"
          >
            <option value="">Todas as Categorias</option>
            {CATEGORIAS.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        {/* Grid de Fotos */}
        {loading ? (
          <p className="text-center text-secondary py-8">Carregando...</p>
        ) : fotos.length === 0 ? (
          <p className="text-center text-secondary py-8">Nenhuma foto encontrada</p>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {fotos.map((foto) => (
              <button
                key={foto.id}
                onClick={() => setFotoSelecionada(foto)}
                className="group relative overflow-hidden rounded-xl hover:shadow-lg transition-shadow border border-border-light"
              >
                <img
                  src={foto.arquivo_url}
                  alt={foto.titulo}
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent/20 flex flex-col justify-end p-3">
                  <p className="text-white font-semibold text-sm line-clamp-2">{foto.titulo}</p>
                  <p className="text-white/75 text-xs mt-1">{foto.categoria}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
