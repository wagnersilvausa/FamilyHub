'use client'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  variant?: 'primary' | 'secondary' | 'danger' | 'success'
  size?: 'sm' | 'md' | 'lg'
  disabled?: boolean
  className?: string
  icon?: React.ReactNode
}

export default function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  size = 'lg',
  disabled = false,
  className = '',
  icon,
}: ButtonProps) {
  const baseClasses =
    'font-bold rounded-lg transition-all active:scale-[0.97] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'

  const variantClasses = {
    primary: 'bg-gradient-to-r from-wagner to-wagner-dark hover:shadow-lg shadow-md hover:from-wagner hover:to-wagner-dark text-white',
    secondary: 'bg-gradient-to-r from-slate-300 to-slate-400 hover:shadow-lg shadow-md text-slate-900',
    danger: 'bg-gradient-to-r from-red-500 to-red-600 hover:shadow-lg shadow-md hover:shadow-red-500/50 text-white',
    success: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg shadow-md hover:shadow-green-500/50 text-white',
  }

  const sizeClasses = {
    sm: 'py-2 px-3 text-sm',
    md: 'py-3 px-4 text-base',
    lg: 'py-3 px-6 text-lg md:py-4 md:px-8 md:text-xl',
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      {children}
    </button>
  )
}
