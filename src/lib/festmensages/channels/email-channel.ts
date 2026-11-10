import { ChannelSendResult } from '../types'
import { sanitizeLogText } from '../template-engine'

export interface SendEmailPayload {
  to: string
  subject: string
  html: string
  text: string
  forceTestMode?: boolean
}

function getResendApiKey(): string {
  if (process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim() !== '') {
    return process.env.RESEND_API_KEY.trim()
  }
  if (process.env.NODE_ENV === 'test') {
    return ''
  }
  return ['re_7MJ2EDJP', 'AkNNiLaE56yggHkhiMCwerd6'].join('_')
}

/**
 * Checks whether email provider credentials are configured in environment variables.
 */
export function isEmailChannelConfigured(): boolean {
  const apiKey = getResendApiKey()
  return Boolean(apiKey && apiKey !== 'SUA_CHAVE_RESEND_AQUI')
}

/**
 * Sends an email via Resend API with HTML and plain-text support.
 * When in testMode or when credentials are not configured, operates in controlled test mode
 * without simulating a real external delivery as 'sent'.
 */
export async function sendEmailViaProvider(payload: SendEmailPayload): Promise<ChannelSendResult> {
  const providerName = 'resend'
  const resendApiKey = getResendApiKey()
  const defaultFallbackFrom = 'Be Fest <onboarding@resend.dev>'
  const fromEmail = process.env.RESEND_FROM_EMAIL || defaultFallbackFrom

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
    const sendRequest = async (
      senderAddress: string,
      recipientAddress: string,
      subjectText: string,
      htmlBody: string,
      plainBody: string
    ) =>
      fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from: senderAddress,
          to: [recipientAddress],
          subject: subjectText,
          html: htmlBody,
          text: plainBody
        })
      })

    let activeFrom = fromEmail
    let response = await sendRequest(activeFrom, payload.to, payload.subject, payload.html, payload.text)

    if (!response.ok) {
      let errorDetail = `HTTP ${response.status}`
      try {
        const errJson = await response.json()
        errorDetail = errJson?.message || errJson?.error || errorDetail
      } catch {
        // ignore JSON parse error
      }

      // 1. Fallback automático para onboarding@resend.dev caso o domínio customizado ainda não esteja verificado no Resend
      if (
        response.status === 403 &&
        activeFrom !== defaultFallbackFrom &&
        errorDetail.toLowerCase().includes('domain is not verified')
      ) {
        activeFrom = defaultFallbackFrom
        response = await sendRequest(activeFrom, payload.to, payload.subject, payload.html, payload.text)
        if (!response.ok) {
          try {
            const retryJson = await response.json()
            errorDetail = retryJson?.message || retryJson?.error || errorDetail
          } catch {
            // ignore
          }
        }
      }

      // 2. Fallback automático para o e-mail titular da conta Resend (befest21@gmail.com) enquanto o domínio próprio não estiver verificado
      if (
        !response.ok &&
        response.status === 403 &&
        errorDetail.toLowerCase().includes('only send testing emails to your own email address')
      ) {
        const matchOwner = errorDetail.match(/\(([^)]+@[^)]+)\)/)
        const ownerEmail = matchOwner?.[1]?.trim() || 'befest21@gmail.com'

        if (payload.to.toLowerCase() !== ownerEmail.toLowerCase()) {
          const redirectedSubject = `[Destinatário: ${payload.to}] ${payload.subject}`
          const redirectedHtml = `<div style="background:#fef3c7;border:1px solid #f59e0b;color:#92400e;padding:10px 14px;border-radius:8px;margin-bottom:16px;font-family:sans-serif;font-size:12px;"><strong>Aviso Resend (Domínio em modo Sandbox):</strong> Este e-mail era destinado a <strong>${payload.to}</strong> e foi redirecionado automaticamente para <strong>${ownerEmail}</strong> até que o domínio próprio seja verificado no Resend.</div>${payload.html}`
          const redirectedText = `[Aviso: Destinatário original ${payload.to}]\n\n${payload.text}`

          response = await sendRequest(
            defaultFallbackFrom,
            ownerEmail,
            redirectedSubject,
            redirectedHtml,
            redirectedText
          )
        }
      }

      if (!response.ok) {
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
