import { sendTelegramMessage, formatTelegramReminder } from '@/lib/telegram'

export async function GET(request: Request) {
  // Verificar se a requisição vem do Vercel Cron
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Import dinâmico do Supabase para evitar erros durante build
    const { supabase } = await import('@/lib/supabase')

    // Obter a data de amanhã
    const tomorrow = new Date()
    tomorrow.setDate(tomorrow.getDate() + 1)
    const tomorrowString = tomorrow.toISOString().split('T')[0]

    // Buscar compromissos para amanhã
    const { data: compromissos, error } = await supabase
      .from('agenda')
      .select('*')
      .eq('data', tomorrowString)

    if (error) throw error

    // Enviar reminder para cada compromisso
    for (const comp of compromissos || []) {
      const message = formatTelegramReminder(comp.titulo, comp.data, comp.hora)
      await sendTelegramMessage(message)
    }

    return Response.json({
      success: true,
      reminders_sent: (compromissos || []).length,
    })
  } catch (error) {
    console.error('Cron Job Error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
