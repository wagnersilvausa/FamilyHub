'use client'

import { useEffect, useState } from 'react'
import Header from '@/components/Header'
import Card from '@/components/Card'
import { supabase } from '@/lib/supabase'
import { formatDate } from '@/lib/utils'

interface Foto {
  id: string
  titulo: string
  descricao?: string
  foto_url: string
  data?: string
  created_at: string
}

export default function FotosGaleriaPage() {
  const [fotos, setFotos] = useState<Foto[]>([])
  const [busca, setBusca] = useState('')
  const [loading, setLoading] = useState(true)
  const [fotoSelecionada, setFotoSelecionada] = useState<Foto | null>(null)

  useEffect(() => {
    carregarFotos()
  }, [busca])

  const carregarFotos = async () => {
    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('fotos')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error

      let result = data as Foto[] || []

      if (busca) {
        result = result.filter(
          (foto) =>
            foto.titulo.toLowerCase().includes(busca.toLowerCase()) ||
            (foto.descricao && foto.descricao.toLowerCase().includes(busca.toLowerCase()))
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
                src={fotoSelecionada.foto_url}
                alt={fotoSelecionada.titulo}
                className="w-full h-auto"
              />

              <div className="p-5">
                <p className="font-bold text-primary mb-2">
                  {fotoSelecionada.titulo}
                </p>
                <p className="text-xs text-muted mb-4">{formatDate(fotoSelecionada.data || fotoSelecionada.created_at)}</p>

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
                  src={foto.foto_url}
                  alt={foto.titulo}
                  className="w-full h-40 object-cover group-hover:scale-105 transition-transform"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent/20 flex flex-col justify-end p-3">
                  <p className="text-white font-semibold text-sm line-clamp-2">{foto.titulo}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
