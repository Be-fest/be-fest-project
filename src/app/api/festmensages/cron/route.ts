import { NextRequest, NextResponse } from 'next/server'
import { processDueQueueItems, processScheduledReminders } from '@/lib/festmensages/engine'

/**
 * Scheduled job endpoint to process retry queue and upcoming event agenda reminders.
 * Protected via CRON_SECRET when configured in environment.
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ success: false, error: 'Não autorizado' }, { status: 401 })
    }
  }

  const queueResult = await processDueQueueItems()
  const remindersResult = await processScheduledReminders()

  return NextResponse.json({
    success: true,
    timestamp: new Date().toISOString(),
    queue: queueResult,
    reminders: remindersResult
  })
}
