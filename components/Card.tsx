'use client'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  variant?: 'default' | 'glass' | 'gradient'
  elevated?: boolean
}

export default function Card({ children, className = '', onClick, variant = 'default', elevated = true }: CardProps) {
  const baseClasses = `rounded-2xl p-4 transition-all duration-300 ${onClick ? 'cursor-pointer' : ''}`

  const variantClasses = {
    default: 'bg-white border border-slate-100 shadow-card hover:shadow-lg',
    glass: 'glass',
    gradient: 'bg-gradient-to-br from-wagner to-wagner-dark text-white shadow-lg hover:shadow-xl',
  }

  const elevationClasses = elevated && variant === 'default' ? 'hover:-translate-y-0.5' : ''

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${elevationClasses} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  )
}
