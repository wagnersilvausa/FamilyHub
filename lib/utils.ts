export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export function formatDate(date: Date | string): string {
  const d = new Date(date)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d)
}

export function formatDateTime(date: Date | string): string {
  const d = new Date(date)
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export function formatTime(timeString: string): string {
  const [hours, minutes] = timeString.split(':')
  return `${hours}:${minutes}`
}

export function getCurrentDate(): string {
  const now = new Date()
  return now.toISOString().split('T')[0]
}

export function getCurrentTime(): string {
  const now = new Date()
  return now.toTimeString().slice(0, 5)
}

export function getCurrentMonth(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
}

export function getNextMonthDate(date: string, months: number = 1): string {
  const d = new Date(date)
  d.setMonth(d.getMonth() + months)
  return d.toISOString().split('T')[0]
}

export function daysUntil(targetDate: string): number {
  const target = new Date(targetDate)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  target.setHours(0, 0, 0, 0)
  const diff = target.getTime() - today.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export function truncateText(text: string, length: number): string {
  if (text.length > length) {
    return text.slice(0, length) + '...'
  }
  return text
}

export function groupBy<T>(array: T[], key: keyof T): Record<string, T[]> {
  return array.reduce(
    (result, item) => {
      const groupKey = String(item[key])
      if (!result[groupKey]) {
        result[groupKey] = []
      }
      result[groupKey].push(item)
      return result
    },
    {} as Record<string, T[]>
  )
}

export function sum(array: number[]): number {
  return array.reduce((acc, val) => acc + val, 0)
}

export function calculateGastoStatus(dataVencimento: string | null, currentStatus: string): string {
  if (!dataVencimento || currentStatus === 'quitado') return currentStatus

  const days = daysUntil(dataVencimento)

  if (days <= 3 && days >= 0) {
    return 'pendente'
  } else if (days > 3) {
    return 'agendado'
  } else if (days < 0) {
    return 'urgente' // Vencido
  }

  return currentStatus
}
