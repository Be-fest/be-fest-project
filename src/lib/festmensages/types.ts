export type FestChannel = 'email' | 'whatsapp' | 'both'
export type FestSingleChannel = 'email' | 'whatsapp'
export type FestRecipientType = 'client' | 'provider' | 'both'
export type FestSingleRecipientRole = 'client' | 'provider'
export type FestCategory = 'operational' | 'promotional'

export type FestEventType =
  // Ocasiões Cliente
  | 'client.registered'
  | 'budget.sent_to_client'
  | 'order.created_client'
  | 'order.waiting_payment_client'
  | 'payment.approved_client'
  | 'event.reminder_client'
  | 'event.post_evaluation_client'
  // Ocasiões Prestador
  | 'provider.registered'
  | 'service.created_provider'
  | 'budget.sent_provider'
  | 'order.created_provider'
  | 'order.waiting_payment_provider'
  | 'payment.installment_1_provider'
  | 'event.reminder_provider'
  | 'payment.installment_2_provider'
  | 'event.post_evaluation_provider'
  // Eventos compostos (disparam para ambos conforme regras)
  | 'order.created'
  | 'order.waiting_payment'
  | 'payment.approved'
  | 'event.reminder'
  | 'event.completed'
  // Sazonalidade e Relacionamento
  | 'campaign.client_seasonality'
  | 'campaign.client_points_coupons'
  | 'campaign.client_inactive'
  | 'campaign.provider_participation'
  | 'campaign.provider_seasonality'
  | 'campaign.provider_festplus'
  | 'campaign.provider_inactive'

export type FestQueueStatus =
  | 'pending'
  | 'processing'
  | 'sent'
  | 'failed'
  | 'cancelled'
  | 'skipped'
  | 'test_mode_logged'

export interface FestTemplate {
  id: string
  code: string
  name: string
  description: string
  category: FestCategory
  recipient_type: FestRecipientType
  channel: FestChannel
  subject: string
  body_text: string
  body_html: string
  whatsapp_template_name?: string | null
  whatsapp_language_code?: string
  required_variables: string[]
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface FestRule {
  id: string
  code: string
  name: string
  description: string
  event_type: FestEventType | string
  recipient_type: FestRecipientType
  channel: FestChannel
  template_code: string
  delay_minutes: number
  conditions: {
    require_approved_payment?: boolean
    allowed_payment_statuses?: string[]
    days_before_event?: number
    days_after_event?: number
    only_role?: FestSingleRecipientRole
  }
  allow_repeat: boolean
  cooldown_hours: number
  max_attempts: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface FestRecipientInfo {
  id?: string | null
  role: FestSingleRecipientRole
  name: string
  email?: string | null
  phone?: string | null
}

export interface FestDispatchInput {
  eventType: FestEventType | string
  entityId: string
  client?: FestRecipientInfo | null
  provider?: FestRecipientInfo | null
  paymentStatus?: 'pending' | 'waiting_payment' | 'approved' | 'paid' | 'installment_1_paid' | 'installment_2_paid' | 'cancelled'
  variables: Record<string, string | number | undefined | null>
  forceTestMode?: boolean
  overrideChannel?: FestChannel
}

export interface FestQueueItem {
  id: string
  idempotency_key: string
  event_type: string
  entity_id?: string | null
  rule_code?: string | null
  template_code: string
  recipient_id?: string | null
  recipient_role: FestSingleRecipientRole
  recipient_name: string
  recipient_email?: string | null
  recipient_phone?: string | null
  channel: FestSingleChannel
  category: FestCategory
  variables: Record<string, string>
  rendered_subject?: string | null
  rendered_body_text: string
  rendered_body_html?: string | null
  status: FestQueueStatus
  scheduled_for: string
  attempts: number
  max_attempts: number
  next_retry_at?: string | null
  last_error?: string | null
  provider_name?: string | null
  provider_message_id?: string | null
  delivery_status?: string | null
  is_test: boolean
  sent_at?: string | null
  created_at: string
  updated_at: string
}

export interface FestLogItem {
  id: string
  queue_id?: string | null
  event_type: string
  template_code: string
  recipient_id?: string | null
  recipient_role: FestSingleRecipientRole
  recipient_name?: string | null
  recipient_email?: string | null
  recipient_phone?: string | null
  channel: FestSingleChannel
  status: string
  attempt_number: number
  provider_name?: string | null
  provider_message_id?: string | null
  delivery_status?: string | null
  error_message?: string | null
  is_test: boolean
  metadata: Record<string, unknown>
  created_at: string
}

export interface FestCampaign {
  id: string
  name: string
  description: string
  campaign_type:
    | 'seasonality'
    | 'points_coupons'
    | 'inactive_clients'
    | 'inactive_providers'
    | 'festplus'
    | 'provider_campaign'
  target_audience:
    | 'all_clients'
    | 'inactive_clients'
    | 'all_providers'
    | 'inactive_providers'
    | 'festplus_eligible'
  channel: FestChannel
  template_code: string
  custom_variables: Record<string, string>
  inactive_days_threshold?: number
  start_date: string
  end_date: string
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'cancelled'
  total_eligible: number
  total_sent: number
  total_failed: number
  last_executed_at?: string | null
  created_at: string
  updated_at: string
}

export interface FestUserPreferences {
  user_id?: string | null
  email?: string | null
  phone?: string | null
  operational_email: boolean
  operational_whatsapp: boolean
  promotional_email: boolean
  promotional_whatsapp: boolean
  consent_source: string
  consent_purpose: string
  unsubscribed_at?: string | null
  unsubscribe_reason?: string | null
  updated_at: string
}

export interface FestChannelConfig {
  channel: FestSingleChannel
  provider_name: string
  is_enabled: boolean
  test_mode: boolean
  rate_limit_per_minute: number
  has_credentials?: boolean
  config_metadata: Record<string, unknown>
  updated_at: string
}

export interface ChannelSendResult {
  success: boolean
  delivered: boolean
  isTestMode: boolean
  isTemporaryFailure?: boolean
  providerName: string
  providerMessageId?: string
  deliveryStatus: 'sent' | 'queued' | 'test_mode_logged' | 'failed'
  error?: string
}
