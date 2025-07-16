'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import type { Event, EventService } from '@/types/database'
import { calculateGuestCount } from '@/utils/formatters'

// Validation schemas
const saveCartEventSchema = z.object({
  title: z.string().min(1, 'Nome do evento é obrigatório'),
  event_date: z.string().min(1, 'Data do evento é obrigatória'),
  start_time: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  guest_count: z.coerce.number().min(1, 'Número de convidados deve ser maior que 0').optional(),
  full_guests: z.coerce.number().min(0).optional(),
  half_guests: z.coerce.number().min(0).optional(),
  free_guests: z.coerce.number().min(0).optional()
})

const addServiceToCartSchema = z.object({
  event_id: z.string().uuid('ID do evento inválido'),
  service_id: z.string().uuid('ID do serviço inválido'),
  provider_id: z.string().uuid('ID do prestador inválido'),
  quantity: z.coerce.number().min(1, 'Quantidade deve ser maior que 0').optional().default(1),
  client_notes: z.string().optional().nullable()
})

// Result types
type ActionResult<T = any> = {
  success: boolean
  error?: string
  data?: T
}

// Helper function to get current user
async function getCurrentUser() {
  try {
    const supabase = await createServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error) {
      console.error('Erro ao buscar usuário:', error)
      throw new Error('Erro de autenticação')
    }
    
    if (!user) {
      throw new Error('Usuário não autenticado')
    }
    
    return user
  } catch (error) {
    console.error('Erro na autenticação:', error)
    throw new Error('Usuário não autenticado')
  }
}

// ================================================================
// CART ACTIONS
// ================================================================

export async function saveCartEventAction(eventData: {
  title: string
  event_date: string
  start_time?: string | null
  location?: string | null
  guest_count?: number
  full_guests?: number
  half_guests?: number
  free_guests?: number
  event_id?: string // Para atualizar evento existente
}): Promise<ActionResult<Event>> {
  try {
    console.log('saveCartEventAction iniciado com:', eventData);
    
    const user = await getCurrentUser()
    console.log('Usuário autenticado:', user.id);
    
    const supabase = await createServerClient()

    // Verificar se o usuário é um cliente
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    console.log('Dados do usuário:', userData);

    if (!userData || userData.role !== 'client') {
      console.error('Usuário não é cliente:', userData);
      return { success: false, error: 'Apenas clientes podem criar eventos' }
    }

    const validatedData = saveCartEventSchema.parse(eventData)
    console.log('Dados validados:', validatedData);
    
    // Usar os valores individuais ou calcular a partir deles
    const fullGuests = validatedData.full_guests || 0;
    const halfGuests = validatedData.half_guests || 0;
    const freeGuests = validatedData.free_guests || 0;
    
    // Calcular guest_count total usando nossa função
    const totalGuests = calculateGuestCount(fullGuests, halfGuests, freeGuests);

    const eventPayload = {
      client_id: user.id,
      title: validatedData.title,
      event_date: validatedData.event_date,
      start_time: validatedData.start_time,
      location: validatedData.location,
      guest_count: totalGuests, // Usar o valor calculado
      full_guests: fullGuests,
      half_guests: halfGuests,
      free_guests: freeGuests,
      status: 'draft' as const
    }

    console.log('Payload do evento:', eventPayload);

    let result

    if (eventData.event_id) {
      console.log('Atualizando evento existente:', eventData.event_id);
      // Atualizar evento existente
      const { data: event, error } = await supabase
        .from('events')
        .update(eventPayload)
        .eq('id', eventData.event_id)
        .eq('client_id', user.id) // Garantir que o usuário é o dono
        .select()
        .single()

      if (error) {
        console.error('Error updating event:', error)
        return { success: false, error: 'Erro ao atualizar evento' }
      }

      result = event
    } else {
      console.log('Criando novo evento');
      // Criar novo evento
      const { data: event, error } = await supabase
        .from('events')
        .insert(eventPayload)
        .select()
        .single()

      if (error) {
        console.error('Error creating event:', error)
        return { success: false, error: 'Erro ao criar evento' }
      }

      result = event
    }

    console.log('Evento salvo com sucesso:', result);
    revalidatePath('/perfil')
    return { success: true, data: result }
  } catch (error) {
    console.error('Save cart event failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao salvar evento' 
    }
  }
}

export async function addServiceToCartAction(serviceData: {
  event_id: string
  service_id: string
  provider_id: string
  quantity?: number
  client_notes?: string | null
}): Promise<ActionResult<EventService>> {
  try {
    const user = await getCurrentUser()
    const supabase = await createServerClient()

    const validatedData = addServiceToCartSchema.parse(serviceData)

    // Verificar se o evento pertence ao usuário
    const { data: event } = await supabase
      .from('events')
      .select('client_id')
      .eq('id', validatedData.event_id)
      .single()

    if (!event || event.client_id !== user.id) {
      return { success: false, error: 'Evento não encontrado ou acesso negado' }
    }

    // Verificar se o serviço já foi adicionado ao evento (incluindo provider_id)
    const { data: existingService } = await supabase
      .from('event_services')
      .select('*')
      .eq('event_id', validatedData.event_id)
      .eq('service_id', validatedData.service_id)
      .eq('provider_id', validatedData.provider_id)
      .single()

    if (existingService) {
      console.log('✅ Serviço já existe, retornando existente:', existingService.id);
      // Retornar o serviço existente sem modificar nada
      return { success: true, data: existingService }
    }

    // Buscar dados do serviço para calcular preços
    const { data: service } = await supabase
      .from('services')
      .select('base_price, price_per_guest')
      .eq('id', validatedData.service_id)
      .single()

    if (!service) {
      return { success: false, error: 'Serviço não encontrado' }
    }

    console.log('🆕 Criando novo event_service:', {
      event_id: validatedData.event_id,
      service_id: validatedData.service_id,
      provider_id: validatedData.provider_id
    });

    // Criar novo event_service
    const { data: eventService, error } = await supabase
      .from('event_services')
      .insert({
        event_id: validatedData.event_id,
        service_id: validatedData.service_id,
        provider_id: validatedData.provider_id,
        price_per_guest_at_booking: service.price_per_guest || service.base_price,
        client_notes: validatedData.client_notes,
        booking_status: 'pending_provider_approval'
      })
      .select()
      .single()

    if (error) {
      console.error('❌ Error creating event service:', error)
      
      // Se o erro for de duplicação devido à constraint única
      if (error.code === '23505') { // Unique constraint violation
        console.log('🔄 Constraint única violada, buscando serviço existente...');
        const { data: existingService } = await supabase
          .from('event_services')
          .select('*')
          .eq('event_id', validatedData.event_id)
          .eq('service_id', validatedData.service_id)
          .eq('provider_id', validatedData.provider_id)
          .single()

        if (existingService) {
          console.log('✅ Serviço encontrado após violação de constraint:', existingService.id);
          return { success: true, data: existingService }
        }
      }
      
      return { success: false, error: 'Erro ao adicionar serviço' }
    }

    console.log('✅ Event service criado com sucesso:', eventService.id);
    revalidatePath('/perfil')
    revalidatePath(`/minhas-festas/${validatedData.event_id}`)
    return { success: true, data: eventService }
  } catch (error) {
    console.error('Add service to cart failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao adicionar serviço' 
    }
  }
}

export async function removeServiceFromCartAction(eventServiceId: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    const supabase = await createServerClient()

    // Verificar se o event_service pertence ao usuário
    const { data: eventService } = await supabase
      .from('event_services')
      .select(`
        id,
        event_id,
        event:events!inner (client_id)
      `)
      .eq('id', eventServiceId)
      .single()

    if (!eventService || (eventService.event as any).client_id !== user.id) {
      return { success: false, error: 'Serviço não encontrado ou acesso negado' }
    }

    const { error } = await supabase
      .from('event_services')
      .delete()
      .eq('id', eventServiceId)

    if (error) {
      console.error('Error removing event service:', error)
      return { success: false, error: 'Erro ao remover serviço' }
    }

    revalidatePath('/minhas-festas')
    revalidatePath(`/minhas-festas/${eventService.event_id}`)
    return { success: true }
  } catch (error) {
    console.error('Remove service from cart failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao remover serviço' 
    }
  }
}

export async function getCartEventAction(eventId: string): Promise<ActionResult<Event & { event_services: EventService[] }>> {
  try {
    const user = await getCurrentUser()
    const supabase = await createServerClient()

    const { data: event, error } = await supabase
      .from('events')
      .select(`
        *,
        event_services (
          *,
          service:services (
            *,
            provider:users!services_provider_id_fkey (
              id,
              full_name,
              organization_name,
              logo_url
            )
          )
        )
      `)
      .eq('id', eventId)
      .eq('client_id', user.id)
      .single()

    if (error) {
      console.error('Error fetching cart event:', error)
      return { success: false, error: 'Evento não encontrado' }
    }

    return { success: true, data: event as any }
  } catch (error) {
    console.error('Get cart event failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao buscar evento' 
    }
  }
}

export async function syncCartWithDatabaseAction(cartData: {
  partyData: {
    eventName: string
    eventDate: string
    startTime?: string
    location?: string
    fullGuests: number
    halfGuests: number
    freeGuests: number
  }
  cartItems: Array<{
    id: string
    serviceId: string
    serviceName: string
    providerId: string
    quantity: number
  }>
  eventId?: string
}): Promise<ActionResult<{ eventId: string }>> {
  try {
    console.log('syncCartWithDatabaseAction iniciado com:', cartData);
    
    // Primeiro, salvar/atualizar o evento
    const eventResult = await saveCartEventAction({
      title: cartData.partyData.eventName,
      event_date: cartData.partyData.eventDate,
      start_time: cartData.partyData.startTime,
      location: cartData.partyData.location,
      full_guests: cartData.partyData.fullGuests,
      half_guests: cartData.partyData.halfGuests,
      free_guests: cartData.partyData.freeGuests,
      event_id: cartData.eventId
    })

    console.log('Resultado do saveCartEventAction:', eventResult);

    if (!eventResult.success) {
      return { success: false, error: eventResult.error }
    }

    const eventId = eventResult.data!.id
    console.log('EventId criado/atualizado:', eventId);

    // Depois, sincronizar os serviços
    for (const item of cartData.cartItems) {
      console.log('Sincronizando serviço:', item);
      
      const serviceResult = await addServiceToCartAction({
        event_id: eventId,
        service_id: String(item.serviceId), // Converter para string
        provider_id: item.providerId,
        quantity: item.quantity
      })

      console.log('Resultado do addServiceToCartAction:', serviceResult);

      if (!serviceResult.success) {
        console.error('Erro ao sincronizar serviço:', serviceResult.error)
        // Continuar com outros serviços mesmo se um falhar
      }
    }

    console.log('Sincronização concluída com sucesso, eventId:', eventId);
    revalidatePath('/minhas-festas')
    revalidatePath(`/minhas-festas/${eventId}`)
    return { success: true, data: { eventId } }
  } catch (error) {
    console.error('Sync cart with database failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao sincronizar carrinho' 
    }
  }
} 

export async function cleanDuplicateServicesAction(eventId: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    const supabase = await createServerClient()

    // Verificar se o evento pertence ao usuário
    const { data: event } = await supabase
      .from('events')
      .select('client_id')
      .eq('id', eventId)
      .single()

    if (!event || event.client_id !== user.id) {
      return { success: false, error: 'Evento não encontrado ou acesso negado' }
    }

    // Buscar todos os serviços do evento
    const { data: eventServices } = await supabase
      .from('event_services')
      .select('id, service_id, provider_id, created_at')
      .eq('event_id', eventId)
      .order('created_at', { ascending: true })

    if (!eventServices || eventServices.length === 0) {
      return { success: true, data: { removedCount: 0 } }
    }

    // Agrupar por service_id + provider_id
    const serviceGroups = new Map<string, typeof eventServices>()
    
    for (const service of eventServices) {
      const key = `${service.service_id}-${service.provider_id}`
      if (!serviceGroups.has(key)) {
        serviceGroups.set(key, [])
      }
      serviceGroups.get(key)!.push(service)
    }

    // Identificar duplicatas (manter apenas o primeiro de cada grupo)
    const duplicateIds: string[] = []
    
    for (const [key, services] of serviceGroups) {
      if (services.length > 1) {
        console.log(`Encontrado ${services.length} duplicatas para ${key}`)
        // Remover todos exceto o primeiro (mais antigo)
        const toRemove = services.slice(1)
        duplicateIds.push(...toRemove.map(s => s.id))
      }
    }

    if (duplicateIds.length === 0) {
      console.log('Nenhuma duplicata encontrada')
      return { success: true, data: { removedCount: 0 } }
    }

    console.log(`Removendo ${duplicateIds.length} serviços duplicados:`, duplicateIds)

    // Remover as duplicatas
    const { error } = await supabase
      .from('event_services')
      .delete()
      .in('id', duplicateIds)

    if (error) {
      console.error('Error removing duplicate services:', error)
      return { success: false, error: 'Erro ao remover serviços duplicados' }
    }

    console.log(`${duplicateIds.length} serviços duplicados removidos com sucesso`)
    
    revalidatePath('/minhas-festas')
    revalidatePath(`/minhas-festas/${eventId}`)
    
    return { success: true, data: { removedCount: duplicateIds.length } }
  } catch (error) {
    console.error('Clean duplicate services failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao limpar serviços duplicados' 
    }
  }
} 