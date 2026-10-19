import { createAdminClient } from '@/lib/supabase/server'
import { dispatchFestEvent } from './engine'
import { formatPrice } from '@/utils/pricingUtils'

/**
 * 1. Gatilho: Cadastro de novo Cliente
 */
export async function triggerClientRegistered(params: {
  userId: string
  fullName: string
  email: string
  phone?: string | null
}) {
  try {
    await dispatchFestEvent({
      eventType: 'client.registered',
      entityId: params.userId,
      client: {
        id: params.userId,
        role: 'client',
        name: params.fullName,
        email: params.email,
        phone: params.phone || null
      },
      variables: {
        nome: params.fullName,
        email: params.email,
        data_cadastro: new Date().toLocaleDateString('pt-BR')
      }
    })
  } catch (err) {
    console.error('[FestMensages] Erro em triggerClientRegistered:', err)
  }
}

/**
 * 2. Gatilho: Cadastro de novo Prestador
 */
export async function triggerProviderRegistered(params: {
  userId: string
  companyName: string
  email: string
  phone?: string | null
}) {
  try {
    await dispatchFestEvent({
      eventType: 'provider.registered',
      entityId: params.userId,
      provider: {
        id: params.userId,
        role: 'provider',
        name: params.companyName,
        email: params.email,
        phone: params.phone || null
      },
      variables: {
        nome: params.companyName,
        email: params.email,
        data_cadastro: new Date().toLocaleDateString('pt-BR')
      }
    })
  } catch (err) {
    console.error('[FestMensages] Erro em triggerProviderRegistered:', err)
  }
}

/**
 * 3. Gatilho: Cadastro de Serviço pelo Prestador (exclusivo prestador)
 */
export async function triggerServiceCreated(params: {
  serviceId: string
  serviceName: string
  providerId: string
}) {
  try {
    const supabase = createAdminClient()
    const { data: provider } = await supabase
      .from('users')
      .select('id, full_name, organization_name, email, whatsapp_number')
      .eq('id', params.providerId)
      .maybeSingle()

    if (!provider) return

    const providerName = provider.organization_name || provider.full_name || 'Prestador'
    await dispatchFestEvent({
      eventType: 'service.created',
      entityId: params.serviceId,
      provider: {
        id: provider.id,
        role: 'provider',
        name: providerName,
        email: provider.email,
        phone: provider.whatsapp_number
      },
      variables: {
        nome: providerName,
        nome_prestador: providerName,
        servico_contratado: params.serviceName
      }
    })
  } catch (err) {
    console.error('[FestMensages] Erro em triggerServiceCreated:', err)
  }
}

/**
 * 4. Gatilho: Envio de Orçamento (BudgetCreator / budgets table)
 */
export async function triggerBudgetSent(params: {
  budgetId: string
  providerId: string
  clientName: string
  clientEmail?: string | null
  clientPhone?: string | null
  eventDate: string
  startTime?: string | null
  totalPrice: number
  paymentLink?: string | null
  selectedServices?: { serviceName?: string }[] | any
}) {
  try {
    const supabase = createAdminClient()
    const { data: provider } = await supabase
      .from('users')
      .select('id, full_name, organization_name, email, whatsapp_number')
      .eq('id', params.providerId)
      .maybeSingle()

    const providerName = provider?.organization_name || provider?.full_name || 'Prestador Be Fest'
    const servicesList = Array.isArray(params.selectedServices)
      ? params.selectedServices.map((s: any) => s.serviceName || s.name).filter(Boolean).join(', ')
      : 'Serviços selecionados'

    const formattedDate = params.eventDate
      ? new Date(params.eventDate + 'T12:00:00').toLocaleDateString('pt-BR')
      : 'A definir'

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://befest.vercel.app'

    await dispatchFestEvent({
      eventType: 'budget.sent',
      entityId: params.budgetId,
      client:
        params.clientEmail || params.clientPhone
          ? {
              id: null,
              role: 'client',
              name: params.clientName,
              email: params.clientEmail || null,
              phone: params.clientPhone || null
            }
          : null,
      provider: provider
        ? {
            id: provider.id,
            role: 'provider',
            name: providerName,
            email: provider.email,
            phone: provider.whatsapp_number
          }
        : null,
      variables: {
        nome_cliente: params.clientName,
        nome_prestador: providerName,
        servico_contratado: servicesList || 'Orçamento Personalizado',
        data_evento: formattedDate,
        horario_evento: params.startTime || 'A definir',
        valor_pedido: formatPrice(params.totalPrice || 0),
        link_pagamento: params.paymentLink || `${siteUrl}/perfil`,
        link_agenda: `${siteUrl}/dashboard/prestador`
      }
    })
  } catch (err) {
    console.error('[FestMensages] Erro em triggerBudgetSent:', err)
  }
}

/**
 * 5. Gatilho: Chegada de Pedido / Atualização de Status de Pedido (event_services)
 * Cobre:
 * - pending_provider_approval -> order.created (Cliente + Prestador)
 * - waiting_payment -> order.waiting_payment (Instruções de pagamento ao Cliente + Aviso ao Prestador)
 * - approved -> payment.approved (Confirmação de pagamento ao Cliente + 1ª Parcela/Reserva ao Prestador)
 * - completed -> event.completed (Solicitação de avaliação pós-evento ao Cliente + Aviso ao Prestador)
 */
export async function triggerEventServiceNotification(
  eventServiceId: string,
  targetStatus:
    | 'pending_provider_approval'
    | 'waiting_payment'
    | 'approved'
    | 'completed'
    | 'installment_2_paid'
) {
  try {
    const supabase = createAdminClient()
    const { data: order } = await supabase
      .from('event_services')
      .select(`
        id,
        event_id,
        service_id,
        provider_id,
        booking_status,
        total_estimated_price,
        event:events (
          id,
          title,
          event_date,
          start_time,
          location,
          client_id,
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
      .eq('id', eventServiceId)
      .maybeSingle()

    if (!order) return

    const ev = (order as any).event
    const cli = ev?.client
    const prov = (order as any).provider
    const srv = (order as any).service

    const clientName = cli?.full_name || 'Cliente'
    const providerName = prov?.organization_name || prov?.full_name || 'Prestador'
    const serviceName = srv?.name || 'Serviço'
    const orderNumber = `#${String(order.id).slice(0, 8).toUpperCase()}`
    const formattedDate = ev?.event_date
      ? new Date(ev.event_date + 'T12:00:00').toLocaleDateString('pt-BR')
      : 'Data a definir'
    const formattedTime = ev?.start_time ? String(ev.start_time).slice(0, 5) : 'Horário a definir'
    const formattedPrice = formatPrice(Number(order.total_estimated_price || 0))
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://befest.vercel.app'

    let festEventType = 'order.created'
    let paymentStatus:
      | 'pending'
      | 'waiting_payment'
      | 'approved'
      | 'installment_2_paid' = 'pending'
    let statusLabel = 'Pendente de aprovação'

    if (targetStatus === 'pending_provider_approval') {
      festEventType = 'order.created'
      paymentStatus = 'pending'
      statusLabel = 'Aguardando confirmação na agenda'
    } else if (targetStatus === 'waiting_payment') {
      festEventType = 'order.waiting_payment'
      paymentStatus = 'waiting_payment'
      statusLabel = 'Aguardando pagamento'
    } else if (targetStatus === 'approved') {
      festEventType = 'payment.approved'
      paymentStatus = 'approved'
      statusLabel = 'Pagamento Aprovado'
    } else if (targetStatus === 'installment_2_paid') {
      festEventType = 'payment.installment_2_paid'
      paymentStatus = 'installment_2_paid'
      statusLabel = '2ª Parcela Confirmada'
    } else if (targetStatus === 'completed') {
      festEventType = 'event.completed'
      paymentStatus = 'approved'
      statusLabel = 'Concluído'
    }

    await dispatchFestEvent({
      eventType: festEventType,
      entityId: order.id,
      paymentStatus,
      client: cli
        ? {
            id: cli.id,
            role: 'client',
            name: clientName,
            email: cli.email,
            phone: cli.whatsapp_number
          }
        : null,
      provider: prov
        ? {
            id: prov.id,
            role: 'provider',
            name: providerName,
            email: prov.email,
            phone: prov.whatsapp_number
          }
        : null,
      variables: {
        numero_pedido: orderNumber,
        servico_contratado: serviceName,
        nome_cliente: clientName,
        nome_prestador: providerName,
        data_evento: formattedDate,
        horario_evento: formattedTime,
        local_evento: ev?.location || 'Local informado no pedido',
        valor_pedido: formattedPrice,
        status_pagamento: statusLabel,
        link_pedido:
          targetStatus === 'pending_provider_approval'
            ? `${siteUrl}/dashboard/prestador`
            : `${siteUrl}/perfil`,
        link_agenda: `${siteUrl}/dashboard/prestador`,
        link_pagamento: `${siteUrl}/pagamento?eventId=${order.event_id}&services=${order.id}`,
        link_avaliacao: `${siteUrl}/perfil?avaliar=${order.id}`
      }
    })
  } catch (err) {
    console.error('[FestMensages] Erro em triggerEventServiceNotification:', err)
  }
}
