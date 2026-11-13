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

const DEFAULT_OMNI_CHANNEL_ID = '01A1C7CAA4DC747E936407DEED786D18'
const DEFAULT_OMNI_API_URL = `https://api.omni.z-api.io/v1/channels/${DEFAULT_OMNI_CHANNEL_ID}/messages`

function getWhatsAppEndpoint(): string {
  const customUrl = process.env.WHATSAPP_API_URL?.trim()
  if (customUrl) {
    // Normalize hermitage URL to the official Omni Z-API v1 messages endpoint
    const hermitageMatch = customUrl.match(/\/channels\/([A-Za-z0-9]+)/i)
    if (customUrl.toLowerCase().includes('api.omni.z-api.io') && hermitageMatch) {
      return `https://api.omni.z-api.io/v1/channels/${hermitageMatch[1]}/messages`
    }
    return customUrl
  }
  const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID?.trim()
  if (phoneId) {
    const apiVersion = process.env.WHATSAPP_API_VERSION || 'v21.0'
    return `https://graph.facebook.com/${apiVersion}/${phoneId}/messages`
  }
  if (process.env.NODE_ENV === 'test') {
    return ''
  }
  return DEFAULT_OMNI_API_URL
}

function getWhatsAppToken(): string {
  const envToken =
    process.env.WHATSAPP_ACCESS_TOKEN?.trim() ||
    process.env.OMNI_SECRET_KEY?.trim() ||
    ''
  if (envToken && envToken !== 'SEU_TOKEN_WHATSAPP_AQUI') {
    return envToken
  }
  if (process.env.NODE_ENV === 'test') {
    return ''
  }
  return '5D11A194A94B2174C563DABD'
}

/**
 * Checks whether official WhatsApp Business API credentials are configured via environment variables.
 * Supports Omni Z-API, standard Z-API, and Meta WhatsApp Cloud API.
 */
export function isWhatsAppChannelConfigured(): boolean {
  if (process.env.NODE_ENV === 'test') {
    const token = process.env.WHATSAPP_ACCESS_TOKEN
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID
    const customApiUrl = process.env.WHATSAPP_API_URL
    const hasToken = Boolean(token && token.trim() !== '' && token !== 'SEU_TOKEN_WHATSAPP_AQUI')
    const hasEndpoint = Boolean((phoneId && phoneId.trim() !== '') || (customApiUrl && customApiUrl.trim() !== ''))
    return hasToken && hasEndpoint
  }

  const endpoint = getWhatsAppEndpoint()
  const token = getWhatsAppToken()
  return Boolean(endpoint && token)
}

/**
 * Sends a WhatsApp message using Omni Z-API, standard Z-API, or Meta WhatsApp Business Cloud API.
 * If credentials are not configured or forceTestMode is true, logs in test mode without faking delivery.
 */
export async function sendWhatsAppViaProvider(payload: SendWhatsAppPayload): Promise<ChannelSendResult> {
  const endpoint = getWhatsAppEndpoint()
  const isOmniZApi = endpoint.toLowerCase().includes('api.omni.z-api.io')
  const isLegacyZApi = !isOmniZApi && endpoint.toLowerCase().includes('z-api.io')
  const providerName =
    process.env.WHATSAPP_PROVIDER ||
    (isOmniZApi ? 'omni_zapi' : isLegacyZApi ? 'z-api' : 'whatsapp_cloud_api')
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

  const token = getWhatsAppToken()
  const useApprovedTemplate =
    !isOmniZApi && !isLegacyZApi && Boolean(payload.templateName) && process.env.WHATSAPP_USE_TEMPLATES === 'true'

  const requestBody = isOmniZApi
    ? {
        recipient: {
          identifier: normalizedPhone
        },
        content: {
          type: 'TEXT',
          body: {
            message: payload.text
          }
        }
      }
    : isLegacyZApi
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

  if (isLegacyZApi) {
    if (token) {
      headers['Client-Token'] = token
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
      data?.messageId || data?.zapiMessageId || data?.messages?.[0]?.id || data?.id || `wa-${Date.now()}`
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
