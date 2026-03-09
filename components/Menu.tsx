'use client'

import Link from 'next/link'

interface MenuItem {
  icon: string
  label: string
  href: string
}

interface MenuProps {
  items: MenuItem[]
  currentPath?: string
}

export default function Menu({ items, currentPath = '' }: MenuProps) {
  return (
    <nav className="fixed bottom-4 left-0 right-0 max-w-2xl mx-auto px-4 pointer-events-none">
      <div className="bg-white rounded-full shadow-glass backdrop-blur-md border border-slate-100 flex justify-around items-center py-3 px-2 pointer-events-auto">
        {items.map((item) => {
          const isActive = currentPath === item.href
          return (
            <Link key={item.href} href={item.href} className="flex-1">
              <button
                className={`relative w-full py-2 px-3 flex flex-col items-center justify-center transition-all duration-300 rounded-full ${
                  isActive
                    ? 'text-wagner'
                    : 'text-text-muted hover:text-text-secondary'
                }`}
              >
                {isActive && (
                  <div className="absolute inset-0 bg-wagner/10 rounded-full -z-10 animate-pulse-soft" />
                )}
                <span className="text-4xl mb-1 transition-transform duration-300" style={{
                  transform: isActive ? 'scale(1.1)' : 'scale(1)'
                }}>
                  {item.icon}
                </span>
                <span className={`text-xs font-semibold transition-colors ${isActive ? 'text-wagner' : ''}`}>
                  {item.label}
                </span>
              </button>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
