import { createAdminClient } from '../supabase/server'
import {
  FestTemplate,
  FestRule,
  FestQueueItem,
  FestLogItem,
  FestCampaign,
  FestUserPreferences,
  FestChannelConfig,
  FestDispatchInput,
  FestSingleChannel,
  FestRecipientInfo
} from './types'
import {
  DEFAULT_TEMPLATES,
  DEFAULT_RULES,
  DEFAULT_CAMPAIGNS,
  DEFAULT_CHANNEL_CONFIGS
} from './defaults'
import {
  renderFestTemplate,
  normalizeWhatsAppPhone,
  sanitizeLogText
} from './template-engine'
import { sendEmailViaProvider, isEmailChannelConfigured } from './channels/email-channel'
import { sendWhatsAppViaProvider, isWhatsAppChannelConfigured } from './channels/whatsapp-channel'

/**
 * In-memory fallback store used when Supabase tables are not yet migrated or during unit tests.
 */
interface MemoryStore {
  templates: Map<string, FestTemplate>
  rules: Map<string, FestRule>
  queue: Map<string, FestQueueItem>
  idempotencyIndex: Map<string, string>
  logs: FestLogItem[]
  campaigns: Map<string, FestCampaign>
  preferences: Map<string, FestUserPreferences>
  channelConfigs: Map<FestSingleChannel, FestChannelConfig>
}

const memoryStore: MemoryStore = {
  templates: new Map(DEFAULT_TEMPLATES.map((t) => [t.code, { ...t }])),
  rules: new Map(DEFAULT_RULES.map((r) => [r.code, { ...r }])),
  queue: new Map(),
  idempotencyIndex: new Map(),
  logs: [],
  campaigns: new Map(DEFAULT_CAMPAIGNS.map((c) => [c.id, { ...c }])),
  preferences: new Map(),
  channelConfigs: new Map(DEFAULT_CHANNEL_CONFIGS.map((c) => [c.channel, { ...c }]))
}

export function resetFestMensagesMemoryStore(): void {
  memoryStore.templates = new Map(DEFAULT_TEMPLATES.map((t) => [t.code, { ...t }]))
  memoryStore.rules = new Map(DEFAULT_RULES.map((r) => [r.code, { ...r }]))
  memoryStore.queue.clear()
  memoryStore.idempotencyIndex.clear()
  memoryStore.logs = []
  memoryStore.campaigns = new Map(DEFAULT_CAMPAIGNS.map((c) => [c.id, { ...c }]))
  memoryStore.preferences.clear()
  memoryStore.channelConfigs = new Map(DEFAULT_CHANNEL_CONFIGS.map((c) => [c.channel, { ...c }]))
}

export function getFestMensagesMemoryStore(): MemoryStore {
  return memoryStore
}

/**
 * Progressive backoff intervals in minutes:
 * Attempt 1 -> 5 min, Attempt 2 -> 30 min, Attempt 3+ -> 120 min
 */
export function calculateRetryBackoffMinutes(attemptNumber: number): number {
  if (attemptNumber <= 1) return 5
  if (attemptNumber === 2) return 30
  return 120
}

function getSafeSupabaseAdmin() {
  try {
    if (
      process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.SUPABASE_SERVICE_ROLE_KEY &&
      process.env.NODE_ENV !== 'test'
    ) {
      return createAdminClient()
    }
  } catch {
    // Fallback to memory store when env vars are missing
  }
  return null
}

/**
 * Loads all templates (merging DB records with built-in defaults).
 */
export async function getTemplates(): Promise<FestTemplate[]> {
  const supabase = getSafeSupabaseAdmin()
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('festmensages_templates')
        .select('*')
        .order('name', { ascending: true })

      if (!error && data && data.length > 0) {
        for (const row of data) {
          memoryStore.templates.set(row.code, row as FestTemplate)
        }
      }
    } catch {
      // Table may not be migrated yet; use memoryStore
    }
  }
  return Array.from(memoryStore.templates.values())
}

/**
 * Loads all automation rules (merging DB records with built-in defaults).
 */
export async function getRules(): Promise<FestRule[]> {
  const supabase = getSafeSupabaseAdmin()
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('festmensages_rules')
        .select('*')
        .order('name', { ascending: true })

      if (!error && data && data.length > 0) {
        for (const row of data) {
          memoryStore.rules.set(row.code, row as FestRule)
        }
      }
    } catch {
      // Fallback to memoryStore
    }
  }
  return Array.from(memoryStore.rules.values())
}

/**
 * Loads channel configurations with live credential check.
 */
export async function getChannelConfigs(): Promise<FestChannelConfig[]> {
  const supabase = getSafeSupabaseAdmin()
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('festmensages_channel_configs')
        .select('*')

      if (!error && data && data.length > 0) {
        for (const row of data) {
          memoryStore.channelConfigs.set(row.channel as FestSingleChannel, row as FestChannelConfig)
        }
      }
    } catch {
      // Fallback
    }
  }

  return Array.from(memoryStore.channelConfigs.values()).map((cfg) => ({
    ...cfg,
    has_credentials:
      cfg.channel === 'email' ? isEmailChannelConfigured() : isWhatsAppChannelConfigured()
  }))
}

/**
 * Checks recipient LGPD communication preferences.
 */
export async function getRecipientPreferences(
  userId?: string | null,
  email?: string | null
): Promise<FestUserPreferences> {
  const key = userId || email?.toLowerCase() || ''
  if (key && memoryStore.preferences.has(key)) {
    return memoryStore.preferences.get(key)!
  }

  const supabase = getSafeSupabaseAdmin()
  if (supabase && (userId || email)) {
    try {
      let query = supabase.from('festmensages_preferences').select('*')
      if (userId) {
        query = query.eq('user_id', userId)
      } else if (email) {
        query = query.eq('email', email.toLowerCase())
      }
      const { data } = await query.maybeSingle()
      if (data) {
        const pref = data as FestUserPreferences
        if (key) memoryStore.preferences.set(key, pref)
        return pref
      }
    } catch {
      // Fallback
    }
  }

  return {
    user_id: userId || null,
    email: email || null,
    operational_email: true,
    operational_whatsapp: true,
    promotional_email: true,
    promotional_whatsapp: true,
    consent_source: 'platform_default',
    consent_purpose: 'order_updates_and_platform_communications',
    unsubscribed_at: null,
    updated_at: new Date().toISOString()
  }
}

/**
 * Updates user LGPD communication preferences (e.g. promotional opt-out / unsubscribe).
 */
export async function updateRecipientPreferences(
  input: {
    userId?: string | null
    email?: string | null
    phone?: string | null
    promotionalEmail?: boolean
    promotionalWhatsapp?: boolean
    operationalEmail?: boolean
    operationalWhatsapp?: boolean
    unsubscribeAllPromotional?: boolean
    reason?: string
  }
): Promise<FestUserPreferences> {
  const existing = await getRecipientPreferences(input.userId, input.email)
  const nowIso = new Date().toISOString()

  const updated: FestUserPreferences = {
    ...existing,
    user_id: input.userId ?? existing.user_id,
    email: (input.email ?? existing.email)?.toLowerCase() || null,
    phone: input.phone ?? existing.phone,
    operational_email: input.operationalEmail ?? existing.operational_email,
    operational_whatsapp: input.operationalWhatsapp ?? existing.operational_whatsapp,
    promotional_email: input.unsubscribeAllPromotional
      ? false
      : (input.promotionalEmail ?? existing.promotional_email),
    promotional_whatsapp: input.unsubscribeAllPromotional
      ? false
      : (input.promotionalWhatsapp ?? existing.promotional_whatsapp),
    unsubscribed_at: input.unsubscribeAllPromotional ? nowIso : existing.unsubscribed_at,
    unsubscribe_reason: input.reason ?? existing.unsubscribe_reason,
    updated_at: nowIso
  }

  if (updated.user_id) memoryStore.preferences.set(updated.user_id, updated)
  if (updated.email) memoryStore.preferences.set(updated.email, updated)

  const supabase = getSafeSupabaseAdmin()
  if (supabase) {
    try {
      await supabase.from('festmensages_preferences').upsert(updated, {
        onConflict: updated.user_id ? 'user_id' : 'email'
      })
    } catch {
      // Ignore if table not yet migrated
    }
  }

  return updated
}

export interface DispatchSummary {
  eventType: string
  matchedRules: number
  enqueued: number
  sent: number
  testModeLogged: number
  skippedDuplicates: number
  skippedConsent: number
  blockedPaymentGuard: number
  failedValidation: number
  failedDelivery: number
  items: FestQueueItem[]
}

const CONFIRMED_PAYMENT_STATUSES = new Set([
  'approved',
  'paid',
  'installment_1_paid',
  'installment_2_paid'
])

/**
 * Central FestMensages Event Dispatcher.
 * Never throws unhandled exceptions to callers so core business flows are never interrupted.
 */
export async function dispatchFestEvent(input: FestDispatchInput): Promise<DispatchSummary> {
  const summary: DispatchSummary = {
    eventType: input.eventType,
    matchedRules: 0,
    enqueued: 0,
    sent: 0,
    testModeLogged: 0,
    skippedDuplicates: 0,
    skippedConsent: 0,
    blockedPaymentGuard: 0,
    failedValidation: 0,
    failedDelivery: 0,
    items: []
  }

  try {
    const allRules = await getRules()
    const allTemplates = await getTemplates()
    const channelConfigs = await getChannelConfigs()

    const templateMap = new Map(allTemplates.map((t) => [t.code, t]))
    const channelConfigMap = new Map(channelConfigs.map((c) => [c.channel, c]))

    // 1. Identify matching active rules for this eventType
    const matchingRules = allRules.filter(
      (r) => r.is_active && r.event_type === input.eventType
    )
    summary.matchedRules = matchingRules.length

    if (matchingRules.length === 0) {
      return summary
    }

    for (const rule of matchingRules) {
      const template = templateMap.get(rule.template_code)
      if (!template || !template.is_active) {
        continue
      }

      // 2. Payment confirmation guard: NEVER send payment confirmation if payment is pending/unconfirmed
      const isPaymentConfirmationEvent =
        rule.conditions?.require_approved_payment ||
        input.eventType === 'payment.approved' ||
        input.eventType === 'payment.approved_client' ||
        input.eventType === 'payment.installment_1_provider' ||
        input.eventType === 'payment.installment_2_paid' ||
        input.eventType === 'payment.installment_2_provider'

      if (isPaymentConfirmationEvent) {
        const status = input.paymentStatus || ''
        const allowedList = rule.conditions?.allowed_payment_statuses
        const isConfirmed = allowedList
          ? allowedList.includes(status)
          : CONFIRMED_PAYMENT_STATUSES.has(status)

        if (!isConfirmed) {
          summary.blockedPaymentGuard++
          continue
        }
      }

      // 3. Determine recipients strictly respecting role separation
      const targetRecipients: FestRecipientInfo[] = []
      if (
        (rule.recipient_type === 'client' || rule.recipient_type === 'both') &&
        (template.recipient_type === 'client' || template.recipient_type === 'both') &&
        input.client &&
        input.client.role === 'client'
      ) {
        targetRecipients.push(input.client)
      }

      if (
        (rule.recipient_type === 'provider' || rule.recipient_type === 'both') &&
        (template.recipient_type === 'provider' || template.recipient_type === 'both') &&
        input.provider &&
        input.provider.role === 'provider'
      ) {
        targetRecipients.push(input.provider)
      }

      // 4. Determine target channels
      const effectiveChannelSpec = input.overrideChannel || rule.channel
      const channelsToSend: FestSingleChannel[] =
        effectiveChannelSpec === 'both'
          ? ['email', 'whatsapp']
          : [effectiveChannelSpec as FestSingleChannel]

      for (const recipient of targetRecipients) {
        const prefs = await getRecipientPreferences(recipient.id, recipient.email)

        for (const singleChannel of channelsToSend) {
          // Verify channel iscompatible with template
          if (template.channel !== 'both' && template.channel !== singleChannel) {
            continue
          }

          const channelCfg = channelConfigMap.get(singleChannel)
          if (channelCfg && !channelCfg.is_enabled) {
            continue
          }

          // Check recipient contact info for this channel
          if (singleChannel === 'email' && !recipient.email) {
            continue
          }
          if (singleChannel === 'whatsapp' && !normalizeWhatsAppPhone(recipient.phone)) {
            continue
          }

          // 5. Check LGPD consent & preferences (operational vs promotional)
          if (template.category === 'promotional') {
            if (prefs.unsubscribed_at) {
              summary.skippedConsent++
              continue
            }
            if (singleChannel === 'email' && !prefs.promotional_email) {
              summary.skippedConsent++
              continue
            }
            if (singleChannel === 'whatsapp' && !prefs.promotional_whatsapp) {
              summary.skippedConsent++
              continue
            }
          } else {
            if (singleChannel === 'email' && !prefs.operational_email) {
              summary.skippedConsent++
              continue
            }
            if (singleChannel === 'whatsapp' && !prefs.operational_whatsapp) {
              summary.skippedConsent++
              continue
            }
          }

          // 6. Check Idempotency / Deduplication
          const recipientIdentifier =
            recipient.id ||
            (singleChannel === 'email'
              ? recipient.email?.toLowerCase()
              : normalizeWhatsAppPhone(recipient.phone)) ||
            recipient.name

          const idempotencyKey = `${input.eventType}:${input.entityId}:${recipient.role}:${recipientIdentifier}:${singleChannel}:${template.code}`

          const existingDuplicate = await findExistingByIdempotencyKey(idempotencyKey)
          if (
            existingDuplicate &&
            !rule.allow_repeat &&
            ['sent', 'processing', 'pending', 'test_mode_logged'].includes(existingDuplicate.status)
          ) {
            summary.skippedDuplicates++
            continue
          }

          // 7. Render & Validate Template Variables
          const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://befest.vercel.app'
          const mergedVars: Record<string, string | number | undefined | null> = {
            link_pedido: `${siteUrl}/perfil`,
            link_agenda: `${siteUrl}/dashboard/prestador`,
            link_pagamento: `${siteUrl}/perfil`,
            link_avaliacao: `${siteUrl}/perfil?avaliar=true`,
            link_campanha: `${siteUrl}/servicos`,
            data_cadastro: new Date().toLocaleDateString('pt-BR'),
            ...input.variables,
            nome: recipient.name,
            email: recipient.email || String(input.variables.email || '')
          }

          const rendered = renderFestTemplate(template, mergedVars, recipient.email)
          const nowIso = new Date().toISOString()
          const scheduledFor =
            rule.delay_minutes > 0
              ? new Date(Date.now() + rule.delay_minutes * 60_000).toISOString()
              : nowIso

          const isTestMode = Boolean(input.forceTestMode || channelCfg?.test_mode)

          const queueItem: FestQueueItem = {
            id: `fmq-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            idempotency_key: idempotencyKey,
            event_type: input.eventType,
            entity_id: input.entityId,
            rule_code: rule.code,
            template_code: template.code,
            recipient_id: recipient.id || null,
            recipient_role: recipient.role,
            recipient_name: recipient.name,
            recipient_email: recipient.email || null,
            recipient_phone: normalizeWhatsAppPhone(recipient.phone),
            channel: singleChannel,
            category: template.category,
            variables: Object.fromEntries(
              Object.entries(mergedVars)
                .filter(([, v]) => v !== undefined && v !== null)
                .map(([k, v]) => [k, String(v)])
            ),
            rendered_subject: rendered.subject,
            rendered_body_text: rendered.bodyText,
            rendered_body_html: rendered.bodyHtml,
            status: 'pending',
            scheduled_for: scheduledFor,
            attempts: 0,
            max_attempts: rule.max_attempts || 3,
            next_retry_at: null,
            last_error: null,
            provider_name: null,
            provider_message_id: null,
            delivery_status: null,
            is_test: isTestMode,
            sent_at: null,
            created_at: nowIso,
            updated_at: nowIso
          }

          // Block sending if mandatory variables are missing
          if (!rendered.valid) {
            queueItem.status = 'failed'
            queueItem.attempts = 1
            queueItem.last_error = `Variáveis obrigatórias ausentes: ${rendered.missingVariables.join(', ')}`
            await saveQueueItem(queueItem)
            await appendLogItem({
              id: `fml-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              queue_id: queueItem.id,
              event_type: queueItem.event_type,
              template_code: queueItem.template_code,
              recipient_id: queueItem.recipient_id,
              recipient_role: queueItem.recipient_role,
              recipient_name: queueItem.recipient_name,
              recipient_email: queueItem.recipient_email,
              recipient_phone: queueItem.recipient_phone,
              channel: queueItem.channel,
              status: 'failed_validation',
              attempt_number: 1,
              provider_name: 'festmensages_validator',
              error_message: queueItem.last_error,
              is_test: isTestMode,
              metadata: { missing_variables: rendered.missingVariables },
              created_at: nowIso
            })
            summary.failedValidation++
            summary.items.push(queueItem)
            continue
          }

          await saveQueueItem(queueItem)
          summary.enqueued++

          // Process immediately if scheduled_for <= now
          if (rule.delay_minutes <= 0) {
            const processed = await processQueueItem(queueItem, template)
            if (processed.status === 'sent') {
              summary.sent++
            } else if (processed.status === 'test_mode_logged') {
              summary.testModeLogged++
            } else if (processed.status === 'failed') {
              summary.failedDelivery++
            }
            summary.items.push(processed)
          } else {
            summary.items.push(queueItem)
          }
        }
      }
    }
  } catch (err) {
    console.error('[FestMensages] Erro não-bloqueante no dispatchFestEvent:', sanitizeLogText(String(err)))
  }

  return summary
}

/**
 * Executes a single queue item delivery attempt and updates queue + logs.
 */
export async function processQueueItem(
  item: FestQueueItem,
  template?: FestTemplate
): Promise<FestQueueItem> {
  // Prevent duplicate delivery if item was already sent
  if (item.status === 'sent') {
    return item
  }

  const attemptNumber = item.attempts + 1
  item.status = 'processing'
  item.attempts = attemptNumber
  item.updated_at = new Date().toISOString()

  const resolvedTemplate =
    template || (await getTemplates()).find((t) => t.code === item.template_code)

  let result
  if (item.channel === 'email') {
    result = await sendEmailViaProvider({
      to: item.recipient_email || '',
      subject: item.rendered_subject || resolvedTemplate?.subject || 'Notificação Be Fest',
      html: item.rendered_body_html || `<p>${item.rendered_body_text}</p>`,
      text: item.rendered_body_text,
      forceTestMode: item.is_test
    })
  } else {
    result = await sendWhatsAppViaProvider({
      toPhone: item.recipient_phone || '',
      text: item.rendered_body_text,
      templateName: resolvedTemplate?.whatsapp_template_name,
      languageCode: resolvedTemplate?.whatsapp_language_code || 'pt_BR',
      forceTestMode: item.is_test
    })
  }

  const nowIso = new Date().toISOString()
  item.provider_name = result.providerName
  item.provider_message_id = result.providerMessageId || null
  item.delivery_status = result.deliveryStatus
  item.is_test = result.isTestMode
  item.updated_at = nowIso

  if (result.success) {
    item.status = result.isTestMode ? 'test_mode_logged' : 'sent'
    item.sent_at = nowIso
    item.last_error = null
    item.next_retry_at = null
  } else {
    item.status = 'failed'
    item.last_error = sanitizeLogText(result.error || 'Erro desconhecido no envio')
    if (result.isTemporaryFailure && attemptNumber < item.max_attempts) {
      const backoffMins = calculateRetryBackoffMinutes(attemptNumber)
      item.next_retry_at = new Date(Date.now() + backoffMins * 60_000).toISOString()
    } else {
      item.next_retry_at = null
    }
  }

  await saveQueueItem(item)
  await appendLogItem({
    id: `fml-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    queue_id: item.id,
    event_type: item.event_type,
    template_code: item.template_code,
    recipient_id: item.recipient_id,
    recipient_role: item.recipient_role,
    recipient_name: item.recipient_name,
    recipient_email: item.recipient_email,
    recipient_phone: item.recipient_phone,
    channel: item.channel,
    status: item.status,
    attempt_number: attemptNumber,
    provider_name: result.providerName,
    provider_message_id: result.providerMessageId || null,
    delivery_status: result.deliveryStatus,
    error_message: item.last_error,
    is_test: result.isTestMode,
    metadata: {
      is_temporary_failure: Boolean(result.isTemporaryFailure),
      next_retry_at: item.next_retry_at
    },
    created_at: nowIso
  })

  return item
}

/**
 * Safely reprocesses a failed notification by queue ID, preventing duplicate sends.
 */
export async function retryFailedNotification(
  queueId: string,
  options?: {
    forceTestMode?: boolean
    overrideVariables?: Record<string, string>
  }
): Promise<{ success: boolean; error?: string; item?: FestQueueItem }> {
  const existing = await getQueueItemById(queueId)
  if (!existing) {
    return { success: false, error: 'Notificação não encontrada na fila' }
  }

  if (existing.status === 'sent') {
    return {
      success: false,
      error: 'Esta notificação já foi enviada anteriormente. Reprocessamento bloqueado para evitar duplicidade.',
      item: existing
    }
  }

  if (options?.forceTestMode !== undefined) {
    existing.is_test = options.forceTestMode
  }

  if (options?.overrideVariables) {
    existing.variables = {
      ...existing.variables,
      ...options.overrideVariables
    }
  }

  // Re-validate variables if it failed validation previously
  const templates = await getTemplates()
  const template = templates.find((t) => t.code === existing.template_code)
  if (template) {
    const rendered = renderFestTemplate(template, existing.variables, existing.recipient_email)
    if (!rendered.valid) {
      return {
        success: false,
        error: `Não é possível reprocessar: variáveis obrigatórias ausentes (${rendered.missingVariables.join(', ')})`,
        item: existing
      }
    }
    existing.rendered_subject = rendered.subject
    existing.rendered_body_text = rendered.bodyText
    existing.rendered_body_html = rendered.bodyHtml
  }

  const updated = await processQueueItem(existing, template)
  return {
    success: updated.status === 'sent' || updated.status === 'test_mode_logged',
    error: updated.last_error || undefined,
    item: updated
  }
}

/**
 * Processes all pending scheduled items and due automatic retries in the queue.
 */
export async function processDueQueueItems(): Promise<{
  processedCount: number
  sentCount: number
  failedCount: number
}> {
  const now = Date.now()
  const allItems = await getQueueItems()
  const dueItems = allItems.filter((item) => {
    if (item.status === 'pending' && new Date(item.scheduled_for).getTime() <= now) {
      return true
    }
    if (
      item.status === 'failed' &&
      item.next_retry_at &&
      item.attempts < item.max_attempts &&
      new Date(item.next_retry_at).getTime() <= now
    ) {
      return true
    }
    return false
  })

  let sentCount = 0
  let failedCount = 0

  for (const item of dueItems) {
    const updated = await processQueueItem(item)
    if (updated.status === 'sent' || updated.status === 'test_mode_logged') {
      sentCount++
    } else {
      failedCount++
    }
  }

  return {
    processedCount: dueItems.length,
    sentCount,
    failedCount
  }
}

/**
 * Executes a seasonal/relationship campaign validating period, target audience, and LGPD opt-in.
 */
export async function executeCampaign(
  campaignId: string,
  recipientsList?: FestRecipientInfo[],
  options?: { now?: Date; forceTestMode?: boolean }
): Promise<{
  success: boolean
  error?: string
  totalEligible: number
  totalSent: number
  totalSkippedConsent: number
}> {
  const campaigns = await getCampaigns()
  const campaign = campaigns.find((c) => c.id === campaignId)

  if (!campaign) {
    return {
      success: false,
      error: 'Campanha não encontrada',
      totalEligible: 0,
      totalSent: 0,
      totalSkippedConsent: 0
    }
  }

  if (campaign.status === 'cancelled') {
    return {
      success: false,
      error: 'Esta campanha está cancelada',
      totalEligible: 0,
      totalSent: 0,
      totalSkippedConsent: 0
    }
  }

  const now = options?.now || new Date()
  const startDate = new Date(campaign.start_date)
  const endDate = new Date(campaign.end_date)

  if (now < startDate || now > endDate) {
    return {
      success: false,
      error: `Fora do período de execução da campanha (${startDate.toLocaleDateString('pt-BR')} até ${endDate.toLocaleDateString('pt-BR')})`,
      totalEligible: 0,
      totalSent: 0,
      totalSkippedConsent: 0
    }
  }

  const templates = await getTemplates()
  const template = templates.find((t) => t.code === campaign.template_code)
  if (!template || !template.is_active) {
    return {
      success: false,
      error: 'Modelo da campanha não encontrado ou inativo',
      totalEligible: 0,
      totalSent: 0,
      totalSkippedConsent: 0
    }
  }

  // Resolve target audience
  const expectedRole: 'client' | 'provider' = campaign.target_audience.includes('provider') ||
    campaign.target_audience === 'festplus_eligible'
    ? 'provider'
    : 'client'

  let audience = recipientsList
  if (!audience) {
    audience = await fetchAudienceFromDatabase(campaign.target_audience, campaign.inactive_days_threshold)
  }

  const eligibleRecipients = audience.filter((r) => r.role === expectedRole)
  let totalSent = 0
  let totalSkippedConsent = 0

  // Create a temporary rule in memory for this campaign execution if needed
  const campaignEventType = `campaign.run.${campaign.id}`
  const tempRuleCode = `rule_campaign_${campaign.id}`
  memoryStore.rules.set(tempRuleCode, {
    id: tempRuleCode,
    code: tempRuleCode,
    name: `Execução Campanha: ${campaign.name}`,
    description: campaign.description,
    event_type: campaignEventType,
    recipient_type: expectedRole,
    channel: campaign.channel,
    template_code: campaign.template_code,
    delay_minutes: 0,
    conditions: { only_role: expectedRole },
    allow_repeat: false,
    cooldown_hours: 24,
    max_attempts: 2,
    is_active: true,
    created_at: now.toISOString(),
    updated_at: now.toISOString()
  })

  for (const person of eligibleRecipients) {
    const res = await dispatchFestEvent({
      eventType: campaignEventType,
      entityId: `${campaign.id}:${person.id || person.email || person.phone}`,
      client: expectedRole === 'client' ? person : null,
      provider: expectedRole === 'provider' ? person : null,
      variables: {
        ...campaign.custom_variables,
        nome: person.name,
        email: person.email || ''
      },
      forceTestMode: options?.forceTestMode,
      overrideChannel: campaign.channel
    })

    totalSent += res.sent + res.testModeLogged
    totalSkippedConsent += res.skippedConsent
  }

  campaign.total_eligible = eligibleRecipients.length
  campaign.total_sent += totalSent
  campaign.status = 'completed'
  campaign.last_executed_at = now.toISOString()
  campaign.updated_at = now.toISOString()
  await saveCampaign(campaign)

  return {
    success: true,
    totalEligible: eligibleRecipients.length,
    totalSent,
    totalSkippedConsent
  }
}

async function fetchAudienceFromDatabase(
  targetAudience: FestCampaign['target_audience'],
  inactiveDays = 60
): Promise<FestRecipientInfo[]> {
  const supabase = getSafeSupabaseAdmin()
  if (!supabase) return []

  try {
    const role =
      targetAudience === 'all_providers' ||
      targetAudience === 'inactive_providers' ||
      targetAudience === 'festplus_eligible'
        ? 'provider'
        : 'client'

    const { data: users } = await supabase
      .from('users')
      .select('id, role, full_name, organization_name, email, whatsapp_number, created_at')
      .eq('role', role)

    if (!users) return []

    // If inactive audience, filter users created or without activity before threshold
    const cutoffMs = Date.now() - inactiveDays * 24 * 60 * 60 * 1000

    return users
      .filter((u) => {
        if (targetAudience === 'inactive_clients' || targetAudience === 'inactive_providers') {
          return new Date(u.created_at).getTime() <= cutoffMs
        }
        return true
      })
      .map((u) => ({
        id: u.id,
        role: role as 'client' | 'provider',
        name: u.organization_name || u.full_name || 'Usuário Be Fest',
        email: u.email,
        phone: u.whatsapp_number
      }))
  } catch {
    return []
  }
}

// ============================================================================
// Persistence Helpers (Supabase + MemoryStore Dual Layer)
// ============================================================================

async function findExistingByIdempotencyKey(key: string): Promise<FestQueueItem | null> {
  const memId = memoryStore.idempotencyIndex.get(key)
  if (memId && memoryStore.queue.has(memId)) {
    return memoryStore.queue.get(memId)!
  }

  const supabase = getSafeSupabaseAdmin()
  if (supabase) {
    try {
      const { data } = await supabase
        .from('festmensages_queue')
        .select('*')
        .eq('idempotency_key', key)
        .maybeSingle()
      if (data) {
        const item = data as FestQueueItem
        memoryStore.queue.set(item.id, item)
        memoryStore.idempotencyIndex.set(key, item.id)
        return item
      }
    } catch {
      // Fallback
    }
  }
  return null
}

async function saveQueueItem(item: FestQueueItem): Promise<void> {
  memoryStore.queue.set(item.id, item)
  memoryStore.idempotencyIndex.set(item.idempotency_key, item.id)

  const supabase = getSafeSupabaseAdmin()
  if (supabase) {
    try {
      await supabase.from('festmensages_queue').upsert(item, { onConflict: 'idempotency_key' })
    } catch {
      // Ignore if table not yet migrated
    }
  }
}

async function appendLogItem(log: FestLogItem): Promise<void> {
  memoryStore.logs.unshift(log)

  const supabase = getSafeSupabaseAdmin()
  if (supabase) {
    try {
      await supabase.from('festmensages_logs').insert(log)
    } catch {
      // Ignore if table not yet migrated
    }
  }
}

export async function getQueueItemById(id: string): Promise<FestQueueItem | null> {
  if (memoryStore.queue.has(id)) {
    return memoryStore.queue.get(id)!
  }
  const supabase = getSafeSupabaseAdmin()
  if (supabase) {
    try {
      const { data } = await supabase
        .from('festmensages_queue')
        .select('*')
        .eq('id', id)
        .maybeSingle()
      if (data) {
        const item = data as FestQueueItem
        memoryStore.queue.set(item.id, item)
        return item
      }
    } catch {
      // Fallback
    }
  }
  return null
}

export async function getQueueItems(): Promise<FestQueueItem[]> {
  const supabase = getSafeSupabaseAdmin()
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('festmensages_queue')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200)

      if (!error && data && data.length > 0) {
        for (const row of data) {
          memoryStore.queue.set(row.id, row as FestQueueItem)
          memoryStore.idempotencyIndex.set(row.idempotency_key, row.id)
        }
      }
    } catch {
      // Fallback
    }
  }
  return Array.from(memoryStore.queue.values()).sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export async function getLogItems(): Promise<FestLogItem[]> {
  const supabase = getSafeSupabaseAdmin()
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('festmensages_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(250)

      if (!error && data && data.length > 0) {
        return data as FestLogItem[]
      }
    } catch {
      // Fallback
    }
  }
  return memoryStore.logs
}

export async function getCampaigns(): Promise<FestCampaign[]> {
  const supabase = getSafeSupabaseAdmin()
  if (supabase) {
    try {
      const { data, error } = await supabase
        .from('festmensages_campaigns')
        .select('*')
        .order('created_at', { ascending: false })

      if (!error && data && data.length > 0) {
        for (const row of data) {
          memoryStore.campaigns.set(row.id, row as FestCampaign)
        }
      }
    } catch {
      // Fallback
    }
  }
  return Array.from(memoryStore.campaigns.values())
}

export async function saveCampaign(campaign: FestCampaign): Promise<FestCampaign> {
  memoryStore.campaigns.set(campaign.id, { ...campaign })
  const supabase = getSafeSupabaseAdmin()
  if (supabase) {
    try {
      await supabase.from('festmensages_campaigns').upsert(campaign)
    } catch {
      // Fallback
    }
  }
  return campaign
}

export async function saveTemplate(template: FestTemplate): Promise<FestTemplate> {
  template.updated_at = new Date().toISOString()
  memoryStore.templates.set(template.code, { ...template })
  const supabase = getSafeSupabaseAdmin()
  if (supabase) {
    try {
      await supabase.from('festmensages_templates').upsert(template, { onConflict: 'code' })
    } catch {
      // Fallback
    }
  }
  return template
}

export async function saveRule(rule: FestRule): Promise<FestRule> {
  rule.updated_at = new Date().toISOString()
  memoryStore.rules.set(rule.code, { ...rule })
  const supabase = getSafeSupabaseAdmin()
  if (supabase) {
    try {
      await supabase.from('festmensages_rules').upsert(rule, { onConflict: 'code' })
    } catch {
      // Fallback
    }
  }
  return rule
}

export async function saveChannelConfig(config: FestChannelConfig): Promise<FestChannelConfig> {
  config.updated_at = new Date().toISOString()
  memoryStore.channelConfigs.set(config.channel, { ...config })
  const supabase = getSafeSupabaseAdmin()
  if (supabase) {
    try {
      const { has_credentials: _, ...dbPayload } = config
      await supabase
        .from('festmensages_channel_configs')
        .upsert(dbPayload, { onConflict: 'channel' })
    } catch {
      // Fallback
    }
  }
  return {
    ...config,
    has_credentials:
      config.channel === 'email' ? isEmailChannelConfigured() : isWhatsAppChannelConfigured()
  }
}

/**
 * Checks upcoming confirmed events (within next 48 hours) and dispatches agenda reminders idempotently.
 */
export async function processScheduledReminders(options?: {
  forceTestMode?: boolean
}): Promise<{ remindersTriggered: number }> {
  const supabase = getSafeSupabaseAdmin()
  if (!supabase) return { remindersTriggered: 0 }

  let remindersTriggered = 0
  try {
    const today = new Date()
    const inTwoDays = new Date(today.getTime() + 2 * 24 * 60 * 60 * 1000)
    const todayStr = today.toISOString().split('T')[0]
    const inTwoDaysStr = inTwoDays.toISOString().split('T')[0]

    const { data: upcomingOrders } = await supabase
      .from('event_services')
      .select(`
        id,
        booking_status,
        total_estimated_price,
        event:events!inner (
          id,
          title,
          event_date,
          start_time,
          location,
          client:users!events_client_id_fkey (
            id,
            full_name,
            email,
            whatsapp_number
          )
        ),
        service:services (
          id,
          name
        ),
        provider:users!event_services_provider_id_fkey (
          id,
          full_name,
          organization_name,
          email,
          whatsapp_number
        )
      `)
      .eq('booking_status', 'approved')
      .gte('event.event_date', todayStr)
      .lte('event.event_date', inTwoDaysStr)

    if (!upcomingOrders) return { remindersTriggered: 0 }

    for (const order of upcomingOrders as any[]) {
      const ev = order.event
      const cli = ev?.client
      const prov = order.provider
      const srv = order.service

      const res = await dispatchFestEvent({
        eventType: 'event.reminder',
        entityId: order.id,
        client: cli
          ? {
              id: cli.id,
              role: 'client',
              name: cli.full_name || 'Cliente',
              email: cli.email,
              phone: cli.whatsapp_number
            }
          : null,
        provider: prov
          ? {
              id: prov.id,
              role: 'provider',
              name: prov.organization_name || prov.full_name || 'Prestador',
              email: prov.email,
              phone: prov.whatsapp_number
            }
          : null,
        variables: {
          numero_pedido: `#${String(order.id).slice(0, 8).toUpperCase()}`,
          servico_contratado: srv?.name || 'Serviço Contratado',
          nome_cliente: cli?.full_name || 'Cliente',
          nome_prestador: prov?.organization_name || prov?.full_name || 'Prestador',
          data_evento: ev?.event_date
            ? new Date(ev.event_date + 'T12:00:00').toLocaleDateString('pt-BR')
            : '',
          horario_evento: ev?.start_time || 'A definir',
          local_evento: ev?.location || 'Local informado no pedido'
        },
        forceTestMode: options?.forceTestMode
      })

      remindersTriggered += res.sent + res.testModeLogged
    }
  } catch (err) {
    console.error('[FestMensages] Erro em processScheduledReminders:', sanitizeLogText(String(err)))
  }

  return { remindersTriggered }
}
