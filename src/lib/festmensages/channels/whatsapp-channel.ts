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
 * or Z-API / compatible gateway URL (WHATSAPP_API_URL + optional WHATSAPP_ACCESS_TOKEN).
 */
export function isWhatsAppChannelConfigured(): boolean {
  const token = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const customApiUrl = process.env.WHATSAPP_API_URL

  const hasCustomUrl = Boolean(customApiUrl && customApiUrl.trim() !== '')
  if (hasCustomUrl && customApiUrl!.toLowerCase().includes('z-api.io')) {
    return true
  }

  const hasToken = Boolean(token && token.trim() !== '' && token !== 'SEU_TOKEN_WHATSAPP_AQUI')
  const hasEndpoint = Boolean((phoneId && phoneId.trim() !== '') || hasCustomUrl)

  return hasToken && hasEndpoint
}

/**
 * Sends a WhatsApp message using Z-API or the official WhatsApp Business Cloud API.
 * Supports both approved WhatsApp template messages and standard text messages.
 * If credentials are not configured or forceTestMode is true, logs in test mode without faking delivery.
 */
export async function sendWhatsAppViaProvider(payload: SendWhatsAppPayload): Promise<ChannelSendResult> {
  const customApiUrl = process.env.WHATSAPP_API_URL
  const isZApi = Boolean(customApiUrl && customApiUrl.toLowerCase().includes('z-api.io'))
  const providerName = process.env.WHATSAPP_PROVIDER || (isZApi ? 'z-api' : 'whatsapp_cloud_api')
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
      : 'Credenciais WHATSAPP_API_URL / WHATSAPP_ACCESS_TOKEN não configuradas'

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

  const token = process.env.WHATSAPP_ACCESS_TOKEN || ''
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const apiVersion = process.env.WHATSAPP_API_VERSION || 'v21.0'
  const endpoint =
    customApiUrl ||
    `https://graph.facebook.com/${apiVersion}/${phoneNumberId}/messages`

  const useApprovedTemplate =
    !isZApi && Boolean(payload.templateName) && process.env.WHATSAPP_USE_TEMPLATES === 'true'

  const requestBody = isZApi
    ? {
        phone: normalizedPhone,
        message: payload.text
      }
    : useApprovedTemplate
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

  const headers: Record<string, string> = {
    'Content-Type': 'application/json'
  }

  if (isZApi) {
    if (token.trim() !== '') {
      headers['Client-Token'] = token.trim()
    }
  } else {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestBody)
    })

    if (!response.ok) {
      let errorDetail = `HTTP ${response.status}`
      try {
        const errData = await response.json()
        errorDetail =
          errData?.error?.message ||
          errData?.message ||
          errData?.error ||
          JSON.stringify(errData)
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
      data?.zapiMessageId || data?.messageId || data?.messages?.[0]?.id || data?.id || `wa-${Date.now()}`
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
