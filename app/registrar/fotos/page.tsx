'use client'

import { useState, useRef } from 'react'
import Header from '@/components/Header'
import Button from '@/components/Button'
import Card from '@/components/Card'
import Toast from '@/components/Toast'
import { supabase } from '@/lib/supabase'
import { getCurrentDate } from '@/lib/utils'

const CATEGORIAS = {
  'Comprovantes de Gasto': ['Nota Fiscal', 'Comprovante de Pagamento', 'Recibo'],
  'Despesas do Dia a Dia': ['Gasolina', 'Supermercado', 'Uber/Transporte', 'Alimentação'],
  'Saúde': ['Receita Médica', 'Laudo/Exame', 'Medicação', 'Encaminhamento'],
  'Documentos Gerais': ['Documento Pessoal', 'Escola/Material', 'Outros'],
}

export default function FotosPage() {
  const [titulo, setTitulo] = useState('')
  const [categoria, setCategoria] = useState('Comprovantes de Gasto')
  const [subcategoria, setSubcategoria] = useState('Nota Fiscal')
  const [descricao, setDescricao] = useState('')
  const [fotoPreview, setFotoPreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const cameraRef = useRef<HTMLInputElement>(null)
  const galeriaRef = useRef<HTMLInputElement>(null)

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (event) => {
        setFotoPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!titulo || !fotoPreview) {
      setToast({ message: 'Preencha título e tire uma foto!', type: 'error' })
      return
    }

    setLoading(true)

    try {
      // Converter data URL para blob
      const response = await fetch(fotoPreview)
      const blob = await response.blob()

      // Gerar nome único para o arquivo
      const timestamp = Date.now()
      const nomeArquivo = `fotos/${timestamp}-${titulo.replace(/\s+/g, '-')}.jpg`

      // Upload para Supabase Storage
      const { error: uploadError, data } = await supabase.storage
        .from('familyhub')
        .upload(nomeArquivo, blob, {
          contentType: 'image/jpeg',
          upsert: false,
        })

      if (uploadError) throw uploadError

      // Obter URL pública da foto
      const { data: publicUrlData } = supabase.storage
        .from('familyhub')
        .getPublicUrl(nomeArquivo)

      const fotoUrl = publicUrlData.publicUrl

      // Salvar dados no banco
      const { error: dbError } = await supabase
        .from('fotos')
        .insert([{
          titulo,
          descricao,
          foto_url: fotoUrl,
          data: getCurrentDate(),
        }])

      if (dbError) throw dbError

      setToast({ message: '✅ Foto salva com sucesso!', type: 'success' })
      setTitulo('')
      setDescricao('')
      setFotoPreview(null)
      setCategoria('Comprovantes de Gasto')
      setSubcategoria('Nota Fiscal')
    } catch (error) {
      console.error('Erro ao salvar foto:', error)
      setToast({ message: '❌ Erro ao salvar foto', type: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-violet-50/20 pb-24">
      <Header title="📷 Adicionar Foto" showBack={true} backHref="/registrar" />

      <div className="max-w-2xl mx-auto p-4 pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Upload Zone with Dashed Border */}
          <Card elevated className="h-80 flex items-center justify-center overflow-hidden border-2 border-dashed border-border-light hover:border-wagner transition-colors">
            {fotoPreview ? (
              <img src={fotoPreview} alt="Preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                <p className="text-5xl mb-3">📸</p>
                <p className="font-semibold text-primary">Nenhuma foto selecionada</p>
              </div>
            )}
          </Card>

          {/* Camera and Gallery Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              type="button"
              onClick={() => cameraRef.current?.click()}
              variant="secondary"
              className="w-full"
              disabled={loading}
            >
              📸 Tirar Foto
            </Button>
            <Button
              type="button"
              onClick={() => galeriaRef.current?.click()}
              variant="secondary"
              className="w-full"
              disabled={loading}
            >
              🖼️ Galeria
            </Button>
          </div>

          <input
            ref={cameraRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleFotoChange}
            className="hidden"
            disabled={loading}
          />
          <input
            ref={galeriaRef}
            type="file"
            accept="image/*"
            onChange={handleFotoChange}
            className="hidden"
            disabled={loading}
          />

          {/* Título */}
          <div>
            <label className="block text-sm font-semibold text-primary mb-2.5">Título</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Descrição rápida da foto"
              className="w-full px-4 py-3 border border-border-light rounded-2xl focus:ring-2 focus:ring-wagner focus:outline-none text-primary placeholder-muted"
              disabled={loading}
            />
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-semibold text-primary mb-2.5">Categoria</label>
            <select
              value={categoria}
              onChange={(e) => {
                setCategoria(e.target.value)
                setSubcategoria(CATEGORIAS[e.target.value as keyof typeof CATEGORIAS][0])
              }}
              className="w-full px-4 py-3 border border-border-light rounded-2xl focus:ring-2 focus:ring-wagner focus:outline-none text-primary"
              disabled={loading}
            >
              {Object.keys(CATEGORIAS).map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategoria */}
          <div>
            <label className="block text-sm font-semibold text-primary mb-2.5">Tipo</label>
            <select
              value={subcategoria}
              onChange={(e) => setSubcategoria(e.target.value)}
              className="w-full px-4 py-3 border border-border-light rounded-2xl focus:ring-2 focus:ring-wagner focus:outline-none text-primary"
              disabled={loading}
            >
              {CATEGORIAS[categoria as keyof typeof CATEGORIAS].map((subcat) => (
                <option key={subcat} value={subcat}>
                  {subcat}
                </option>
              ))}
            </select>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-semibold text-primary mb-2.5">Descrição</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder="Detalhes sobre a foto..."
              className="w-full px-4 py-3 border border-border-light rounded-2xl focus:ring-2 focus:ring-wagner focus:outline-none text-primary placeholder-muted resize-none h-24"
              disabled={loading}
            />
          </div>

          {/* Botão Submit */}
          <Button type="submit" disabled={loading} className="w-full">
            {loading ? 'Salvando...' : '💾 Salvar Foto'}
          </Button>
        </form>
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
