'use client'

import Link from 'next/link'

interface HeaderProps {
  title: string
  showBack?: boolean
  backHref?: string
}

export default function Header({ title, showBack = true, backHref = '/' }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 bg-dark border-b border-slate-700/50 backdrop-blur-md bg-opacity-95">
      <div className="flex items-center justify-between max-w-2xl mx-auto px-4 py-3 md:py-4">
        {showBack && (
          <Link href={backHref}>
            <button
              className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-slate-700/50 transition-all active:scale-95 text-slate-300 hover:text-white"
              aria-label="Voltar"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          </Link>
        )}
        <h1 className={`text-xl md:text-2xl font-bold text-white flex-1 ${showBack ? 'text-center px-2' : 'pl-0'}`}>
          {title}
        </h1>
        {showBack && <div className="w-10" />}
      </div>
    </header>
  )
}
