const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || ''
const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID || ''

export async function sendTelegramMessage(message: string): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.warn('Telegram credentials not configured')
    return false
  }

  try {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: 'HTML',
      }),
    })

    const data = await response.json()
    return data.ok === true
  } catch (error) {
    console.error('Error sending Telegram message:', error)
    return false
  }
}

export function formatTelegramMonthReport(
  totalSpent: number,
  byCard: Record<string, number>,
  byCategory: Record<string, number>,
  openInstallments: number,
  expenses: Array<{ motivo: string; valor: number; data: string }>
): string {
  let message = '📊 <b>Relatório Mensal - FamilyHub</b>\n\n'

  message += `💰 <b>Total Gasto:</b> R$ ${totalSpent.toFixed(2)}\n\n`

  message += '<b>Por Cartão:</b>\n'
  Object.entries(byCard).forEach(([card, amount]) => {
    message += `  ${card}: R$ ${amount.toFixed(2)}\n`
  })

  message += '\n<b>Principais Categorias:</b>\n'
  Object.entries(byCategory).forEach(([category, amount]) => {
    message += `  ${category}: R$ ${amount.toFixed(2)}\n`
  })

  message += `\n📌 <b>Parcelamentos Abertos:</b> ${openInstallments}\n`

  message += '\n<b>Últimos Lançamentos:</b>\n'
  expenses.slice(0, 5).forEach((exp) => {
    message += `  • ${exp.motivo}: R$ ${exp.valor.toFixed(2)} (${exp.data})\n`
  })

  return message
}

export function formatTelegramReminder(
  title: string,
  date: string,
  time: string
): string {
  return `📅 <b>Lembrete de Compromisso!</b>\n\n${title}\nData: ${date}\nHora: ${time}`
}
