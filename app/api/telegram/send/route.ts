import { sendTelegramMessage } from '@/lib/telegram'

export async function POST(request: Request) {
  try {
    const { message } = await request.json()

    if (!message) {
      return Response.json({ error: 'Message is required' }, { status: 400 })
    }

    const success = await sendTelegramMessage(message)

    if (!success) {
      return Response.json({ error: 'Failed to send message' }, { status: 500 })
    }

    return Response.json({ success: true })
  } catch (error) {
    console.error('API Error:', error)
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
