import { FestTemplate } from './types'

export interface RenderResult {
  valid: boolean
  missingVariables: string[]
  subject: string
  bodyText: string
  bodyHtml: string
}

/**
 * Extracts all {{variable}} placeholders from a template string.
 */
export function extractTemplateVariables(text: string): string[] {
  if (!text) return []
  const matches = text.match(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g) || []
  const vars = matches.map((m) => m.replace(/\{\{|\}\}/g, '').trim())
  return Array.from(new Set(vars))
}

/**
 * Normalizes raw variables map into trimmed string dictionary and blocks sensitive keys.
 */
export function normalizeVariables(
  raw: Record<string, string | number | undefined | null>
): Record<string, string> {
  const forbiddenKeys = ['password', 'senha', 'token', 'secret', 'cvv', 'card_number', 'cartao']
  const clean: Record<string, string> = {}

  for (const [key, val] of Object.entries(raw || {})) {
    if (forbiddenKeys.includes(key.toLowerCase())) {
      continue
    }
    if (val !== undefined && val !== null) {
      clean[key] = String(val).trim()
    }
  }

  return clean
}

/**
 * Validates whether all required variables for a template are present and non-empty.
 */
export function validateRequiredVariables(
  template: Pick<FestTemplate, 'required_variables' | 'subject' | 'body_text' | 'body_html'>,
  variables: Record<string, string>
): { valid: boolean; missing: string[] } {
  const requiredSet = new Set<string>(template.required_variables || [])

  // Also ensure any variable used in subject or body_text is provided
  for (const v of extractTemplateVariables(template.subject || '')) {
    requiredSet.add(v)
  }
  for (const v of extractTemplateVariables(template.body_text || '')) {
    requiredSet.add(v)
  }

  const missing: string[] = []
  for (const reqVar of requiredSet) {
    const val = variables[reqVar]
    if (val === undefined || val === null || String(val).trim() === '') {
      missing.push(reqVar)
    }
  }

  return {
    valid: missing.length === 0,
    missing
  }
}

/**
 * Replaces {{key}} placeholders with their corresponding values.
 */
export function interpolateText(text: string, variables: Record<string, string>): string {
  if (!text) return ''
  return text.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (match, varName) => {
    const value = variables[varName]
    return value !== undefined && value !== null && value !== '' ? value : match
  })
}

/**
 * Wraps HTML email body in Be Fest responsive branded layout, including LGPD footer.
 */
export function wrapBeFestEmailLayout(
  htmlBody: string,
  category: 'operational' | 'promotional',
  unsubscribeUrl?: string
): string {
  const lgpdFooter =
    category === 'promotional'
      ? `<p style="margin:8px 0 0;font-size:12px;color:#6b7280;">
           Esta é uma comunicação promocional enviada pela Be Fest em conformidade com a LGPD.
           Caso não deseje mais receber campanhas e ofertas, <a href="${unsubscribeUrl || 'https://befest.vercel.app/api/festmensages/unsubscribe'}" style="color:#A502CA;text-decoration:underline;">clique aqui para se descadastrar</a>.
         </p>`
      : `<p style="margin:8px 0 0;font-size:12px;color:#6b7280;">
           Este é um aviso operacional automático referente à sua conta ou pedido na plataforma Be Fest.
         </p>`

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Be Fest</title>
</head>
<body style="margin:0;padding:0;background-color:#f9fafb;font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#1f2937;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background-color:#f9fafb;padding:24px 12px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="max-width:600px;background-color:#ffffff;border-radius:16px;overflow:hidden;border:1px solid #f3f4f6;box-shadow:0 4px 12px rgba(0,0,0,0.04);">
          <tr>
            <td style="background:linear-gradient(135deg,#FF0080 0%,#7c3aed 100%);padding:24px 32px;text-align:center;">
              <h1 style="margin:0;color:#ffffff;font-size:24px;font-weight:800;letter-spacing:-0.5px;">Be Fest</h1>
              <p style="margin:4px 0 0;color:rgba(255,255,255,0.9);font-size:13px;">Sua festa completa em poucos cliques</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px;font-size:15px;line-height:1.6;color:#374151;">
              ${htmlBody}
            </td>
          </tr>
          <tr>
            <td style="background-color:#f9fafb;padding:20px 32px;border-top:1px solid #e5e7eb;text-align:center;">
              <p style="margin:0;font-size:12px;color:#9ca3af;font-weight:600;">© ${new Date().getFullYear()} Be Fest — Todos os direitos reservados.</p>
              ${lgpdFooter}
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/**
 * Renders a FestTemplate with provided variables and validates required fields.
 */
export function renderFestTemplate(
  template: FestTemplate,
  rawVariables: Record<string, string | number | undefined | null>,
  recipientEmail?: string | null
): RenderResult {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://befest.vercel.app'
  const unsubscribeUrl = recipientEmail
    ? `${siteUrl}/api/festmensages/unsubscribe?email=${encodeURIComponent(recipientEmail)}`
    : `${siteUrl}/api/festmensages/unsubscribe`

  const variables = normalizeVariables({
    ...rawVariables,
    link_descadastro: rawVariables.link_descadastro || unsubscribeUrl
  })

  const validation = validateRequiredVariables(template, variables)
  const subject = interpolateText(template.subject || template.name, variables)
  const bodyText = interpolateText(template.body_text, variables)
  const rawHtml = interpolateText(template.body_html || `<p>${template.body_text}</p>`, variables)
  const bodyHtml = wrapBeFestEmailLayout(rawHtml, template.category, unsubscribeUrl)

  return {
    valid: validation.valid,
    missingVariables: validation.missing,
    subject,
    bodyText,
    bodyHtml
  }
}

/**
 * Normalizes a Brazilian phone number to E.164 digits (e.g., 5521982809609).
 */
export function normalizeWhatsAppPhone(phone?: string | null): string | null {
  if (!phone) return null
  const digits = phone.replace(/\D/g, '')
  if (digits.length < 10) return null
  if (digits.startsWith('55') && (digits.length === 12 || digits.length === 13)) {
    return digits
  }
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`
  }
  return digits
}

/**
 * Redacts credentials, tokens, or sensitive fields from technical metadata/error strings.
 */
export function sanitizeLogText(text?: string | null): string {
  if (!text) return ''
  return text
    .replace(/Bearer\s+[A-Za-z0-9\-._~+/]+=*/gi, 'Bearer [REDACTED]')
    .replace(/re_[A-Za-z0-9_]+/g, 're_[REDACTED]')
    .replace(/EA[A-Za-z0-9]{15,}/g, 'EA[REDACTED]')
}
