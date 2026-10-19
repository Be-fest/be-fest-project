import { ChannelSendResult } from '../types'
import { normalizeWhatsAppPhone, sanitizeLogText } from '../template-engine'

export interface SendWhatsAppPayload {
  toPhone: string
  text: string
  templateName?: string | null
  languageCode?: string
  templateParameters?: string[]
  forceTestMode?: boolean
}

/**
 * Checks whether official WhatsApp Business API credentials are configured via environment variables.
 * Supports Meta WhatsApp Cloud API (WHATSAPP_ACCESS_TOKEN + WHATSAPP_PHONE_NUMBER_ID)
 * or a compatible official gateway URL (WHATSAPP_API_URL + WHATSAPP_ACCESS_TOKEN).
 */
export function isWhatsAppChannelConfigured(): boolean {
  const token = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const customApiUrl = process.env.WHATSAPP_API_URL

  const hasToken = Boolean(token && token.trim() !== '' && token !== 'SEU_TOKEN_WHATSAPP_AQUI')
  const hasEndpoint = Boolean((phoneId && phoneId.trim() !== '') || (customApiUrl && customApiUrl.trim() !== ''))

  return hasToken && hasEndpoint
}

/**
 * Sends a WhatsApp message using the official WhatsApp Business Cloud API (or configured official provider).
 * Supports both approved WhatsApp template messages and standard text messages.
 * If credentials are not configured or forceTestMode is true, logs in test mode without faking delivery.
 */
export async function sendWhatsAppViaProvider(payload: SendWhatsAppPayload): Promise<ChannelSendResult> {
  const providerName = process.env.WHATSAPP_PROVIDER || 'whatsapp_cloud_api'
  const normalizedPhone = normalizeWhatsAppPhone(payload.toPhone)

  if (!normalizedPhone) {
    return {
      success: false,
      delivered: false,
      isTestMode: Boolean(payload.forceTestMode),
      isTemporaryFailure: false,
      providerName,
      deliveryStatus: 'failed',
      error: 'Número de WhatsApp inválido ou ausente'
    }
  }

  // Modo de teste ou credenciais externas ainda não configuradas
  if (payload.forceTestMode || !isWhatsAppChannelConfigured()) {
    const reason = payload.forceTestMode
      ? 'Modo de teste ativo'
      : 'Credenciais WHATSAPP_ACCESS_TOKEN / WHATSAPP_PHONE_NUMBER_ID não configuradas'

    console.info(
      `[FestMensages][WhatsApp][MODO TESTE] (${reason}) -> Para: +${normalizedPhone} | Template: ${payload.templateName || 'text'}`
    )

    return {
      success: true,
      delivered: false,
      isTestMode: true,
      providerName,
      providerMessageId: `test-wa-${Date.now()}`,
      deliveryStatus: 'test_mode_logged'
    }
  }

  const token = process.env.WHATSAPP_ACCESS_TOKEN!
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const apiVersion = process.env.WHATSAPP_API_VERSION || 'v21.0'
  const endpoint =
    process.env.WHATSAPP_API_URL ||
    `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`

  const useApprovedTemplate =
    Boolean(payload.templateName) && process.env.WHATSAPP_USE_TEMPLATES === 'true'

  const requestBody = useApprovedTemplate
    ? {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: normalizedPhone,
        type: 'template',
        template: {
          name: payload.templateName,
          language: {
            code: payload.languageCode || 'pt_BR'
          },
          components:
            payload.templateParameters && payload.templateParameters.length > 0
              ? [
                  {
                    type: 'body',
                    parameters: payload.templateParameters.map((param) => ({
                      type: 'text',
                      text: param
                    }))
                  }
                ]
              : []
        }
      }
    : {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to: normalizedPhone,
        type: 'text',
        text: {
          preview_url: true,
          body: payload.text
        }
      }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      let errorDetail = `HTTP ${response.status}`
      try {
        const errData = await response.json()
        errorDetail =
          errData?.error?.message ||
          errData?.message ||
          JSON.stringify(errData?.error || errData)
      } catch {
        // ignore JSON parse failure
      }

      // Rate limit (429 / Meta error code 130429) or server 5xx are temporary failures eligible for retry
      const isTemporary = response.status === 429 || response.status >= 500
      return {
        success: false,
        delivered: false,
        isTestMode: false,
        isTemporaryFailure: isTemporary,
        providerName,
        deliveryStatus: 'failed',
        error: sanitizeLogText(`Erro WhatsApp API (${response.status}): ${errorDetail}`)
      }
    }

    const data = await response.json()
    const messageId =
      data?.messages?.[0]?.id || data?.messageId || data?.id || `wa-${Date.now()}`
    const messageStatus = data?.messages?.[0]?.message_status || 'accepted'

    return {
      success: true,
      delivered: true,
      isTestMode: false,
      providerName,
      providerMessageId: String(messageId),
      deliveryStatus: messageStatus === 'accepted' || messageStatus === 'sent' ? 'sent' : 'queued'
    }
  } catch (err) {
    const message =
      err instanceof Error ? err.message : 'Falha de conexão com provedor de WhatsApp'
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
