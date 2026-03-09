'use client'

import Link from 'next/link'

export default function Home() {
  return (
    <>
      <div
        className="relative min-h-screen flex flex-col overflow-hidden animate-aurora"
        style={{ background: 'linear-gradient(135deg,#c7d2fe,#e9d5ff,#fbcfe8,#bfdbfe,#c7d2fe)' }}
      >

        {/* ── Bolhas decorativas animadas ── */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          {/* grande - canto superior esquerdo */}
          <div className="animate-float-a absolute -top-24 -left-24 w-96 h-96 rounded-full opacity-40"
            style={{ background: 'radial-gradient(circle, rgba(167,139,250,0.7) 0%, rgba(167,139,250,0) 70%)' }} />
          {/* média - canto superior direito */}
          <div className="animate-float-b absolute -top-10 right-0 w-72 h-72 rounded-full opacity-35"
            style={{ background: 'radial-gradient(circle, rgba(244,114,182,0.65) 0%, rgba(244,114,182,0) 70%)' }} />
          {/* pequena - centro esquerda */}
          <div className="animate-float-c absolute top-1/2 -left-16 w-56 h-56 rounded-full opacity-30"
            style={{ background: 'radial-gradient(circle, rgba(99,179,237,0.6) 0%, rgba(99,179,237,0) 70%)' }} />
          {/* pequena - baixo direita */}
          <div className="absolute bottom-10 -right-12 w-64 h-64 rounded-full opacity-35"
            style={{ background: 'radial-gradient(circle, rgba(196,181,253,0.7) 0%, rgba(196,181,253,0) 70%)', animation: 'float 6s ease-in-out -4s infinite' }} />
          {/* pontinho */}
          <div className="animate-float-b absolute bottom-32 left-16 w-32 h-32 rounded-full opacity-25"
            style={{ background: 'radial-gradient(circle, rgba(249,168,212,0.8) 0%, rgba(249,168,212,0) 70%)' }} />
        </div>

        {/* ── Conteúdo ── */}
        <main className="relative flex-1 flex flex-col items-center justify-center px-4 py-10">

          {/* Header */}
          <div className="animate-header text-center mb-10">
            {/* Logo */}
            <div className="inline-flex items-center gap-3 mb-3">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg text-2xl"
                style={{ background: 'linear-gradient(135deg,#818cf8,#c084fc,#f472b6)' }}
              >
                👨‍👩‍👦
              </div>
              <h1
                className="shimmer-text text-5xl md:text-6xl font-black tracking-tight"
                style={{ letterSpacing: '-0.03em' }}
              >
                FamilyHub
              </h1>
            </div>

            {/* Subtítulo */}
            <p className="text-lg md:text-xl font-semibold text-slate-600 mt-1">
              Acompanhamento do Davi <span className="text-yellow-400">💛</span>
            </p>
            <p className="text-sm text-slate-500 mt-1">Escolha quem está acessando</p>
          </div>

          {/* Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-2xl">

            {/* ── Luzia ── */}
            <div className="animate-card-1">
              <Link href="/registrar" className="block">
                <div className="glass-card-luzia card-hover-luzia relative rounded-3xl p-8 overflow-hidden cursor-pointer">

                  {/* Brilho de canto */}
                  <div className="absolute top-0 right-0 w-28 h-28 rounded-full opacity-20 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #f472b6 0%, transparent 70%)', transform: 'translate(30%,-30%)' }} />

                  {/* Avatar */}
                  <div className="flex flex-col items-center text-center">
                    <div
                      className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mb-5 shadow-xl"
                      style={{ background: 'linear-gradient(135deg,rgba(251,207,232,0.9),rgba(253,164,175,0.9))', border: '3px solid rgba(251,113,133,0.4)' }}
                    >
                      👵
                    </div>

                    <h2 className="text-3xl font-black text-slate-800 mb-0.5" style={{ letterSpacing: '-0.02em' }}>Luzia</h2>
                    <p className="text-sm font-medium text-slate-500 mb-6">Avó do Davi</p>

                    {/* Lista */}
                    <ul className="space-y-2.5 mb-7 w-full">
                      {[
                        { icon: '💰', label: 'Registrar gastos',     color: 'bg-rose-100 text-rose-600' },
                        { icon: '📅', label: 'Gerenciar agenda',     color: 'bg-pink-100 text-pink-600' },
                        { icon: '📸', label: 'Compartilhar momentos',color: 'bg-fuchsia-100 text-fuchsia-600' },
                      ].map(({ icon, label, color }) => (
                        <li key={label}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl"
                          style={{ background: 'rgba(255,255,255,0.5)' }}
                        >
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm ${color}`}>{icon}</span>
                          <span className="text-sm font-medium text-slate-700">{label}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Botão */}
                    <button
                      className="w-full py-3.5 rounded-2xl text-white font-bold text-base tracking-wide shadow-lg active:scale-95 transition-transform"
                      style={{ background: 'linear-gradient(135deg,#fb7185,#f43f5e,#ec4899)', boxShadow: '0 8px 24px rgba(244,63,94,0.35)' }}
                    >
                      Acessar Painel →
                    </button>
                  </div>
                </div>
              </Link>
            </div>

            {/* ── Wagner ── */}
            <div className="animate-card-2">
              <Link href="/painel" className="block">
                <div className="glass-card-wagner card-hover-wagner relative rounded-3xl p-8 overflow-hidden cursor-pointer">

                  {/* Brilho de canto */}
                  <div className="absolute top-0 right-0 w-28 h-28 rounded-full opacity-20 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #60a5fa 0%, transparent 70%)', transform: 'translate(30%,-30%)' }} />

                  {/* Avatar */}
                  <div className="flex flex-col items-center text-center">
                    <div
                      className="w-24 h-24 rounded-full flex items-center justify-center text-5xl mb-5 shadow-xl"
                      style={{ background: 'linear-gradient(135deg,rgba(207,220,253,0.9),rgba(147,197,253,0.9))', border: '3px solid rgba(96,165,250,0.4)' }}
                    >
                      👨
                    </div>

                    <h2 className="text-3xl font-black text-slate-800 mb-0.5" style={{ letterSpacing: '-0.02em' }}>Wagner</h2>
                    <p className="text-sm font-medium text-slate-500 mb-6">Pai do Davi</p>

                    {/* Lista */}
                    <ul className="space-y-2.5 mb-7 w-full">
                      {[
                        { icon: '📊', label: 'Ver painel completo',   color: 'bg-blue-100 text-blue-600' },
                        { icon: '📈', label: 'Acompanhar relatórios', color: 'bg-indigo-100 text-indigo-600' },
                        { icon: '📺', label: 'Timeline do Davi',      color: 'bg-violet-100 text-violet-600' },
                      ].map(({ icon, label, color }) => (
                        <li key={label}
                          className="flex items-center gap-3 px-3 py-2 rounded-xl"
                          style={{ background: 'rgba(255,255,255,0.5)' }}
                        >
                          <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm ${color}`}>{icon}</span>
                          <span className="text-sm font-medium text-slate-700">{label}</span>
                        </li>
                      ))}
                    </ul>

                    {/* Botão */}
                    <button
                      className="w-full py-3.5 rounded-2xl text-white font-bold text-base tracking-wide shadow-lg active:scale-95 transition-transform"
                      style={{ background: 'linear-gradient(135deg,#60a5fa,#3b82f6,#6366f1)', boxShadow: '0 8px 24px rgba(59,130,246,0.35)' }}
                    >
                      Acessar Painel →
                    </button>
                  </div>
                </div>
              </Link>
            </div>

          </div>
        </main>

        {/* ── Rodapé ── */}
        <footer className="relative text-center pb-6 pt-2">
          <p className="text-xs text-slate-500 font-medium">
            Feito com <span className="animate-heart text-rose-400">❤️</span> para a família · © 2026 FamilyHub
          </p>
        </footer>

      </div>
    </>
  )
}
