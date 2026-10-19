import { ChannelSendResult } from '../types'
import { sanitizeLogText } from '../template-engine'

export interface SendEmailPayload {
  to: string
  subject: string
  html: string
  text: string
  forceTestMode?: boolean
}

/**
 * Checks whether email provider credentials are configured in environment variables.
 */
export function isEmailChannelConfigured(): boolean {
  const apiKey = process.env.RESEND_API_KEY
  return Boolean(apiKey && apiKey.trim() !== '' && apiKey !== 'SUA_CHAVE_RESEND_AQUI')
}

/**
 * Sends an email via Resend API with HTML and plain-text support.
 * When in testMode or when credentials are not configured, operates in controlled test mode
 * without simulating a real external delivery as 'sent'.
 */
export async function sendEmailViaProvider(payload: SendEmailPayload): Promise<ChannelSendResult> {
  const providerName = 'resend'
  const resendApiKey = process.env.RESEND_API_KEY
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'Be Fest <noreply@befest.com.br>'

  if (!payload.to || !payload.to.includes('@')) {
    return {
      success: false,
      delivered: false,
      isTestMode: Boolean(payload.forceTestMode),
      isTemporaryFailure: false,
      providerName,
      deliveryStatus: 'failed',
      error: 'Endereço de e-mail do destinatário inválido ou ausente'
    }
  }

  // Modo de teste explícito ou falta de credenciais externas configuradas
  if (payload.forceTestMode || !isEmailChannelConfigured()) {
    const reason = payload.forceTestMode
      ? 'Modo de teste ativo'
      : 'Credencial RESEND_API_KEY não configurada no ambiente'

    console.info(`[FestMensages][Email][MODO TESTE] (${reason}) -> Para: ${payload.to} | Assunto: ${payload.subject}`)

    return {
      success: true,
      delivered: false,
      isTestMode: true,
      providerName,
      providerMessageId: `test-email-${Date.now()}`,
      deliveryStatus: 'test_mode_logged'
    }
  }

  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${resendApiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: fromEmail,
        to: [payload.to],
        subject: payload.subject,
        html: payload.html,
        text: payload.text
      })
    })

    if (!response.ok) {
      let errorDetail = `HTTP ${response.status}`
      try {
        const errJson = await response.json()
        errorDetail = errJson?.message || errJson?.error || errorDetail
      } catch {
        // ignore JSON parse error
      }

      const isTemporary = response.status === 429 || response.status >= 500
      return {
        success: false,
        delivered: false,
        isTestMode: false,
        isTemporaryFailure: isTemporary,
        providerName,
        deliveryStatus: 'failed',
        error: sanitizeLogText(`Erro Resend API (${response.status}): ${errorDetail}`)
      }
    }

    const data = await response.json()
    return {
      success: true,
      delivered: true,
      isTestMode: false,
      providerName,
      providerMessageId: data?.id || `resend-${Date.now()}`,
      deliveryStatus: 'sent'
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Falha de conexão com servidor de e-mail'
    return {
      success: false,
      delivered: false,
      isTestMode: false,
      isTemporaryFailure: true,
      providerName,
      deliveryStatus: 'failed',
      error: sanitizeLogText(message)
    }
  }
}
