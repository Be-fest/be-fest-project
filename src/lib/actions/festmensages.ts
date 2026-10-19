'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '../supabase/server'
import {
  FestTemplate,
  FestRule,
  FestCampaign,
  FestChannelConfig,
  FestQueueItem,
  FestLogItem,
  FestSingleChannel
} from '../festmensages/types'
import {
  getTemplates,
  getRules,
  getQueueItems,
  getLogItems,
  getCampaigns,
  getChannelConfigs,
  saveTemplate,
  saveRule,
  saveCampaign,
  saveChannelConfig,
  retryFailedNotification,
  processDueQueueItems,
  processScheduledReminders,
  executeCampaign,
  dispatchFestEvent
} from '../festmensages/engine'
import { SUPPORTED_VARIABLES } from '../festmensages/defaults'
import { renderFestTemplate } from '../festmensages/template-engine'

type ActionResult<T = any> = {
  success: boolean
  error?: string
  data?: T
}

const SUPER_ADMIN_EMAILS = ['befestsuperadmin@superadm.com']

/**
 * Verifies that the current user is an authenticated administrator or super_admin.
 * Blocks unauthorized users from viewing or dispatching FestMensages notifications.
 */
export async function verifyAdminPermission(overrideUser?: {
  id: string
  role: string
  email?: string
}): Promise<{ authorized: boolean; userId?: string; error?: string }> {
  try {
    if (overrideUser) {
      const isSuper = overrideUser.email && SUPER_ADMIN_EMAILS.includes(overrideUser.email.toLowerCase())
      if (overrideUser.role === 'admin' || overrideUser.role === 'super_admin' || isSuper) {
        return { authorized: true, userId: overrideUser.id }
      }
      return { authorized: false, error: 'Acesso negado: permissão de administrador necessária' }
    }

    const supabase = await createServerClient()
    const {
      data: { user },
      error: authErr
    } = await supabase.auth.getUser()

    if (authErr || !user) {
      return { authorized: false, error: 'Usuário não autenticado' }
    }

    if (user.email && SUPER_ADMIN_EMAILS.includes(user.email.toLowerCase())) {
      return { authorized: true, userId: user.id }
    }

    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .maybeSingle()

    if (!userData || (userData.role !== 'admin' && (userData.role as string) !== 'super_admin')) {
      return { authorized: false, error: 'Acesso restrito a administradores da Be Fest' }
    }

    return { authorized: true, userId: user.id }
  } catch {
    return { authorized: false, error: 'Erro ao validar permissões administrativas' }
  }
}

export interface FestDashboardOverview {
  stats: {
    totalProcessed: number
    sent: number
    failed: number
    pending: number
    testModeLogged: number
    emailSent: number
    whatsappSent: number
  }
  templates: FestTemplate[]
  rules: FestRule[]
  queue: FestQueueItem[]
  logs: FestLogItem[]
  campaigns: FestCampaign[]
  channelConfigs: FestChannelConfig[]
  supportedVariables: typeof SUPPORTED_VARIABLES
}

export async function getFestMensagesOverviewAction(): Promise<ActionResult<FestDashboardOverview>> {
  const perm = await verifyAdminPermission()
  if (!perm.authorized) {
    return { success: false, error: perm.error }
  }

  try {
    const [templates, rules, queue, logs, campaigns, channelConfigs] = await Promise.all([
      getTemplates(),
      getRules(),
      getQueueItems(),
      getLogItems(),
      getCampaigns(),
      getChannelConfigs()
    ])

    const sent = queue.filter((q) => q.status === 'sent').length
    const testModeLogged = queue.filter((q) => q.status === 'test_mode_logged').length
    const failed = queue.filter((q) => q.status === 'failed').length
    const pending = queue.filter((q) => q.status === 'pending' || q.status === 'processing').length
    const emailSent = queue.filter(
      (q) => q.channel === 'email' && (q.status === 'sent' || q.status === 'test_mode_logged')
    ).length
    const whatsappSent = queue.filter(
      (q) => q.channel === 'whatsapp' && (q.status === 'sent' || q.status === 'test_mode_logged')
    ).length

    return {
      success: true,
      data: {
        stats: {
          totalProcessed: queue.length,
          sent,
          failed,
          pending,
          testModeLogged,
          emailSent,
          whatsappSent
        },
        templates,
        rules,
        queue,
        logs,
        campaigns,
        channelConfigs,
        supportedVariables: SUPPORTED_VARIABLES
      }
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro ao carregar dados do FestMensages'
    }
  }
}

export async function upsertFestTemplateAction(
  templateInput: Partial<FestTemplate> & { code: string; name: string; body_text: string }
): Promise<ActionResult<FestTemplate>> {
  const perm = await verifyAdminPermission()
  if (!perm.authorized) {
    return { success: false, error: perm.error }
  }

  if (!templateInput.code?.trim() || !templateInput.name?.trim() || !templateInput.body_text?.trim()) {
    return { success: false, error: 'Código, nome e texto da mensagem são obrigatórios' }
  }

  const allTemplates = await getTemplates()
  const existing = allTemplates.find((t) => t.code === templateInput.code)
  const nowIso = new Date().toISOString()

  const merged: FestTemplate = {
    id: existing?.id || templateInput.id || `tpl-${Date.now()}`,
    code: templateInput.code.trim(),
    name: templateInput.name.trim(),
    description: templateInput.description ?? existing?.description ?? '',
    category: templateInput.category || existing?.category || 'operational',
    recipient_type: templateInput.recipient_type || existing?.recipient_type || 'client',
    channel: templateInput.channel || existing?.channel || 'both',
    subject: templateInput.subject ?? existing?.subject ?? templateInput.name,
    body_text: templateInput.body_text.trim(),
    body_html:
      templateInput.body_html?.trim() ||
      existing?.body_html ||
      `<p>${templateInput.body_text.trim()}</p>`,
    whatsapp_template_name:
      templateInput.whatsapp_template_name ?? existing?.whatsapp_template_name ?? null,
    whatsapp_language_code: 'pt_BR',
    required_variables: templateInput.required_variables ?? existing?.required_variables ?? ['nome'],
    is_active: templateInput.is_active ?? existing?.is_active ?? true,
    created_at: existing?.created_at || nowIso,
    updated_at: nowIso
  }

  const saved = await saveTemplate(merged)
  revalidatePath('/admin/festmensages')
  return { success: true, data: saved }
}

export async function toggleFestTemplateActiveAction(code: string): Promise<ActionResult<FestTemplate>> {
  const perm = await verifyAdminPermission()
  if (!perm.authorized) {
    return { success: false, error: perm.error }
  }

  const templates = await getTemplates()
  const target = templates.find((t) => t.code === code)
  if (!target) {
    return { success: false, error: 'Modelo não encontrado' }
  }

  target.is_active = !target.is_active
  const saved = await saveTemplate(target)
  revalidatePath('/admin/festmensages')
  return { success: true, data: saved }
}

export async function upsertFestRuleAction(
  ruleInput: Partial<FestRule> & { code: string; name: string; event_type: string; template_code: string }
): Promise<ActionResult<FestRule>> {
  const perm = await verifyAdminPermission()
  if (!perm.authorized) {
    return { success: false, error: perm.error }
  }

  const rules = await getRules()
  const existing = rules.find((r) => r.code === ruleInput.code)
  const nowIso = new Date().toISOString()

  const merged: FestRule = {
    id: existing?.id || ruleInput.id || `rule-${Date.now()}`,
    code: ruleInput.code.trim(),
    name: ruleInput.name.trim(),
    description: ruleInput.description ?? existing?.description ?? '',
    event_type: ruleInput.event_type,
    recipient_type: ruleInput.recipient_type || existing?.recipient_type || 'client',
    channel: ruleInput.channel || existing?.channel || 'both',
    template_code: ruleInput.template_code,
    delay_minutes: Number(ruleInput.delay_minutes ?? existing?.delay_minutes ?? 0),
    conditions: ruleInput.conditions ?? existing?.conditions ?? {},
    allow_repeat: Boolean(ruleInput.allow_repeat ?? existing?.allow_repeat ?? false),
    cooldown_hours: Number(ruleInput.cooldown_hours ?? existing?.cooldown_hours ?? 0),
    max_attempts: Number(ruleInput.max_attempts ?? existing?.max_attempts ?? 3),
    is_active: ruleInput.is_active ?? existing?.is_active ?? true,
    created_at: existing?.created_at || nowIso,
    updated_at: nowIso
  }

  const saved = await saveRule(merged)
  revalidatePath('/admin/festmensages')
  return { success: true, data: saved }
}

export async function toggleFestRuleActiveAction(code: string): Promise<ActionResult<FestRule>> {
  const perm = await verifyAdminPermission()
  if (!perm.authorized) {
    return { success: false, error: perm.error }
  }

  const rules = await getRules()
  const target = rules.find((r) => r.code === code)
  if (!target) {
    return { success: false, error: 'Regra não encontrada' }
  }

  target.is_active = !target.is_active
  const saved = await saveRule(target)
  revalidatePath('/admin/festmensages')
  return { success: true, data: saved }
}

export async function retryFestNotificationAction(queueId: string): Promise<ActionResult<FestQueueItem>> {
  const perm = await verifyAdminPermission()
  if (!perm.authorized) {
    return { success: false, error: perm.error }
  }

  const res = await retryFailedNotification(queueId)
  revalidatePath('/admin/festmensages')
  return {
    success: res.success,
    error: res.error,
    data: res.item
  }
}

export async function processFestQueueAndRemindersAction(): Promise<
  ActionResult<{ processedCount: number; sentCount: number; remindersTriggered: number }>
> {
  const perm = await verifyAdminPermission()
  if (!perm.authorized) {
    return { success: false, error: perm.error }
  }

  const qRes = await processDueQueueItems()
  const rRes = await processScheduledReminders()
  revalidatePath('/admin/festmensages')
  return {
    success: true,
    data: {
      processedCount: qRes.processedCount,
      sentCount: qRes.sentCount,
      remindersTriggered: rRes.remindersTriggered
    }
  }
}

export async function upsertFestCampaignAction(
  campaignInput: Partial<FestCampaign> & {
    name: string
    template_code: string
    start_date: string
    end_date: string
  }
): Promise<ActionResult<FestCampaign>> {
  const perm = await verifyAdminPermission()
  if (!perm.authorized) {
    return { success: false, error: perm.error }
  }

  const campaigns = await getCampaigns()
  const existing = campaignInput.id ? campaigns.find((c) => c.id === campaignInput.id) : undefined
  const nowIso = new Date().toISOString()

  const merged: FestCampaign = {
    id: existing?.id || campaignInput.id || `camp-${Date.now()}`,
    name: campaignInput.name.trim(),
    description: campaignInput.description ?? existing?.description ?? '',
    campaign_type: campaignInput.campaign_type || existing?.campaign_type || 'seasonality',
    target_audience: campaignInput.target_audience || existing?.target_audience || 'all_clients',
    channel: campaignInput.channel || existing?.channel || 'both',
    template_code: campaignInput.template_code,
    custom_variables: campaignInput.custom_variables || existing?.custom_variables || {},
    inactive_days_threshold: Number(
      campaignInput.inactive_days_threshold ?? existing?.inactive_days_threshold ?? 60
    ),
    start_date: campaignInput.start_date,
    end_date: campaignInput.end_date,
    status: campaignInput.status || existing?.status || 'scheduled',
    total_eligible: existing?.total_eligible ?? 0,
    total_sent: existing?.total_sent ?? 0,
    total_failed: existing?.total_failed ?? 0,
    last_executed_at: existing?.last_executed_at ?? null,
    created_at: existing?.created_at || nowIso,
    updated_at: nowIso
  }

  const saved = await saveCampaign(merged)
  revalidatePath('/admin/festmensages')
  return { success: true, data: saved }
}

export async function runFestCampaignAction(
  campaignId: string,
  forceTestMode = false
): Promise<
  ActionResult<{ totalEligible: number; totalSent: number; totalSkippedConsent: number }>
> {
  const perm = await verifyAdminPermission()
  if (!perm.authorized) {
    return { success: false, error: perm.error }
  }

  const res = await executeCampaign(campaignId, undefined, { forceTestMode })
  revalidatePath('/admin/festmensages')
  if (!res.success) {
    return { success: false, error: res.error }
  }
  return {
    success: true,
    data: {
      totalEligible: res.totalEligible,
      totalSent: res.totalSent,
      totalSkippedConsent: res.totalSkippedConsent
    }
  }
}

export async function updateFestChannelConfigAction(input: {
  channel: FestSingleChannel
  is_enabled: boolean
  test_mode: boolean
  rate_limit_per_minute: number
}): Promise<ActionResult<FestChannelConfig>> {
  const perm = await verifyAdminPermission()
  if (!perm.authorized) {
    return { success: false, error: perm.error }
  }

  const configs = await getChannelConfigs()
  const existing = configs.find((c) => c.channel === input.channel)
  if (!existing) {
    return { success: false, error: 'Canal não encontrado' }
  }

  const updated = await saveChannelConfig({
    ...existing,
    is_enabled: input.is_enabled,
    test_mode: input.test_mode,
    rate_limit_per_minute: Number(input.rate_limit_per_minute || 60)
  })

  revalidatePath('/admin/festmensages')
  return { success: true, data: updated }
}

/**
 * Controlled message test action for Admin Panel.
 * Allows testing any template in sandbox/test mode or real delivery to a test destination.
 */
export async function sendFestTestMessageAction(input: {
  templateCode: string
  channel: FestSingleChannel
  recipientName: string
  recipientEmail?: string
  recipientPhone?: string
  variables?: Record<string, string>
  sandboxMode: boolean
}): Promise<ActionResult<{ renderedSubject: string; renderedBodyText: string; status: string }>> {
  const perm = await verifyAdminPermission()
  if (!perm.authorized) {
    return { success: false, error: perm.error }
  }

  const templates = await getTemplates()
  const template = templates.find((t) => t.code === input.templateCode)
  if (!template) {
    return { success: false, error: 'Modelo de mensagem não encontrado' }
  }

  const defaultSampleVars: Record<string, string> = {}
  for (const v of SUPPORTED_VARIABLES) {
    defaultSampleVars[v.key] = v.example
  }

  const mergedVars: Record<string, string> = {
    ...defaultSampleVars,
    ...(input.variables || {}),
    nome: input.recipientName || 'Destinatário de Teste',
    email: input.recipientEmail || 'teste@befest.com.br'
  }

  const preview = renderFestTemplate(template, mergedVars, input.recipientEmail)
  if (!preview.valid) {
    return {
      success: false,
      error: `Variáveis obrigatórias ausentes: ${preview.missingVariables.join(', ')}`
    }
  }

  const recipientRole = template.recipient_type === 'provider' ? 'provider' : 'client'

  // Create a one-off test rule if needed or dispatch via test event
  const testEventType = `test.manual.${Date.now()}`
  await saveRule({
    id: `rule-test-${Date.now()}`,
    code: `rule_test_${template.code}`,
    name: `Teste Manual: ${template.name}`,
    description: 'Regra temporária para disparo de teste no painel administrativo',
    event_type: testEventType,
    recipient_type: recipientRole,
    channel: input.channel,
    template_code: template.code,
    delay_minutes: 0,
    conditions: {},
    allow_repeat: true,
    cooldown_hours: 0,
    max_attempts: 1,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  })

  const recipientObj = {
    id: null,
    role: recipientRole as 'client' | 'provider',
    name: mergedVars.nome,
    email: input.recipientEmail || 'teste@befest.com.br',
    phone: input.recipientPhone || '5521999999999'
  }

  const summary = await dispatchFestEvent({
    eventType: testEventType,
    entityId: `test-${Date.now()}`,
    paymentStatus: 'approved',
    client: recipientRole === 'client' ? recipientObj : null,
    provider: recipientRole === 'provider' ? recipientObj : null,
    variables: mergedVars,
    forceTestMode: input.sandboxMode,
    overrideChannel: input.channel
  })

  const item = summary.items[0]
  revalidatePath('/admin/festmensages')

  if (!item || item.status === 'failed') {
    return {
      success: false,
      error: item?.last_error || 'Falha ao disparar mensagem de teste'
    }
  }

  return {
    success: true,
    data: {
      renderedSubject: preview.subject,
      renderedBodyText: preview.bodyText,
      status: item.status
    }
  }
}
