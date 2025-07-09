'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { Event, EventInsert, EventUpdate, EventWithServices } from '@/types/database'

// Validation schemas
const createEventSchema = z.object({
  title: z.string().min(2, 'Título deve ter pelo menos 2 caracteres').max(100, 'Título deve ter no máximo 100 caracteres'),
  description: z.string().max(1000, 'Descrição deve ter no máximo 1000 caracteres').optional().nullable(),
  event_date: z.string().min(1, 'Data do evento é obrigatória'),
  start_time: z.string().optional().nullable(),
  location: z.string().max(200, 'Localização deve ter no máximo 200 caracteres').optional().nullable(),
  guest_count: z.coerce.number().min(1, 'Número de convidados deve ser maior que 0').optional(),
  budget: z.coerce.number().min(0, 'Orçamento deve ser maior ou igual a 0').optional().nullable()
})

const updateEventSchema = z.object({
  id: z.string().uuid('ID inválido'),
  title: z.string().min(2, 'Título deve ter pelo menos 2 caracteres').max(100, 'Título deve ter no máximo 100 caracteres').optional(),
  description: z.string().max(1000, 'Descrição deve ter no máximo 1000 caracteres').optional().nullable(),
  event_date: z.string().min(1, 'Data do evento é obrigatória').optional(),
  start_time: z.string().optional().nullable(),
  location: z.string().max(200, 'Localização deve ter no máximo 200 caracteres').optional().nullable(),
  guest_count: z.coerce.number().min(1, 'Número de convidados deve ser maior que 0').optional(),
  budget: z.coerce.number().min(0, 'Orçamento deve ser maior ou igual a 0').optional().nullable(),
  status: z.enum(['draft', 'planning', 'confirmed', 'completed', 'cancelled']).optional()
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
// EVENTS ACTIONS
// ================================================================

export async function getEventsAction(filters?: {
  client_id?: string
  status?: string
  search?: string
  limit?: number
}): Promise<ActionResult<Event[]>> {
  try {
    const supabase = await createServerClient()
    
    let query = supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters?.client_id) {
      query = query.eq('client_id', filters.client_id)
    }
    
    if (filters?.status) {
      query = query.eq('status', filters.status)
    }
    
    if (filters?.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,location.ilike.%${filters.search}%`)
    }
    
    if (filters?.limit) {
      query = query.limit(filters.limit)
    }

    const { data: events, error } = await query

    if (error) {
      console.error('Error fetching events:', error)
      return { success: false, error: 'Erro ao buscar eventos' }
    }

    return { success: true, data: events }
  } catch (error) {
    console.error('Events fetch failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao buscar eventos' 
    }
  }
}

export async function getClientEventsAction(): Promise<ActionResult<Event[]>> {
  try {
    const user = await getCurrentUser()
    return getEventsAction({ client_id: user.id })
  } catch (error) {
    console.error('Client events fetch failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao buscar seus eventos' 
    }
  }
}

export async function getEventByIdAction(eventId: string): Promise<ActionResult<EventWithServices>> {
  try {
    const user = await getCurrentUser()
    const supabase = await createServerClient()
    
    const { data: event, error } = await supabase
      .from('events')
      .select(`
        *,
        client:users!events_client_id_fkey (
          id,
          full_name,
          email,
          whatsapp_number
        ),
        event_services (
          *,
          service:services (
            *,
            provider:users!services_provider_id_fkey (
              id,
              full_name,
              organization_name,
              logo_url,
              area_of_operation
            )
          )
        )
      `)
      .eq('id', eventId)
      .single()

    if (error) {
      console.error('Error fetching event:', error)
      return { success: false, error: 'Evento não encontrado' }
    }

    // Verificar se o usuário tem acesso ao evento (cliente ou prestador)
    const hasAccess = event.client_id === user.id || 
      event.event_services?.some((es: any) => es.provider_id === user.id)

    if (!hasAccess) {
      return { success: false, error: 'Acesso negado' }
    }

    return { success: true, data: event as EventWithServices }
  } catch (error) {
    console.error('Event fetch failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao buscar evento' 
    }
  }
}

export async function createEventAction(formData: FormData): Promise<ActionResult<Event>> {
  try {
    const user = await getCurrentUser()
    
    const rawData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string || null,
      event_date: formData.get('event_date') as string,
      start_time: formData.get('start_time') as string || null,
      location: formData.get('location') as string || null,
      guest_count: formData.get('guest_count') as string || '0',
      budget: formData.get('budget') as string || null
    }

    const validatedData = createEventSchema.parse(rawData)
    const supabase = await createServerClient()

    // Verificar se o usuário é um cliente
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || userData.role !== 'client') {
      return { success: false, error: 'Apenas clientes podem criar eventos' }
    }

    // Verificar se a data não é no passado
    const eventDate = new Date(validatedData.event_date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    if (eventDate < today) {
      return { success: false, error: 'A data do evento não pode ser no passado' }
    }

    const eventData: EventInsert = {
      ...validatedData,
      client_id: user.id,
      status: 'draft'
    }

    const { data: event, error } = await supabase
      .from('events')
      .insert([eventData])
      .select()
      .single()

    if (error) {
      console.error('Error creating event:', error)
      return { success: false, error: 'Erro ao criar evento' }
    }

    revalidatePath('/minhas-festas')
    revalidatePath('/dashboard')
    
    return { success: true, data: event }
  } catch (error) {
    console.error('Event creation failed:', error)
    
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return { success: false, error: firstError.message }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao criar evento' 
    }
  }
}

export async function updateEventAction(formData: FormData): Promise<ActionResult<Event>> {
  try {
    const user = await getCurrentUser()
    
    const rawData = {
      id: formData.get('id') as string,
      title: formData.get('title') as string,
      description: formData.get('description') as string || null,
      event_date: formData.get('event_date') as string,
      start_time: formData.get('start_time') as string || null,
      location: formData.get('location') as string || null,
      guest_count: formData.get('guest_count') as string,
      budget: formData.get('budget') as string || null,
      status: formData.get('status') as string
    }

    const validatedData = updateEventSchema.parse(rawData)
    const supabase = await createServerClient()

    // Verificar se o evento pertence ao usuário
    const { data: existingEvent } = await supabase
      .from('events')
      .select('client_id, status')
      .eq('id', validatedData.id)
      .single()

    if (!existingEvent || existingEvent.client_id !== user.id) {
      return { success: false, error: 'Evento não encontrado ou acesso negado' }
    }

    // Verificar se a data não é no passado (apenas se for fornecida)
    if (validatedData.event_date) {
      const eventDate = new Date(validatedData.event_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (eventDate < today) {
        return { success: false, error: 'A data do evento não pode ser no passado' }
      }
    }

    // Não permitir edição de eventos já finalizados
    if (existingEvent.status === 'completed' || existingEvent.status === 'cancelled') {
      return { success: false, error: 'Não é possível editar eventos finalizados ou cancelados' }
    }

    const updateData: Partial<EventUpdate> = {}
    Object.keys(validatedData).forEach(key => {
      if (key !== 'id' && validatedData[key as keyof typeof validatedData] !== undefined) {
        updateData[key as keyof EventUpdate] = validatedData[key as keyof typeof validatedData]
      }
    })

    const { data: event, error } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', validatedData.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating event:', error)
      return { success: false, error: 'Erro ao atualizar evento' }
    }

    revalidatePath('/minhas-festas')
    revalidatePath(`/minhas-festas/${validatedData.id}`)
    revalidatePath('/dashboard')
    
    return { success: true, data: event }
  } catch (error) {
    console.error('Event update failed:', error)
    
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return { success: false, error: firstError.message }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao atualizar evento' 
    }
  }
}

export async function updateEventStatusAction(eventId: string, status: string): Promise<ActionResult<Event>> {
  try {
    console.log('updateEventStatusAction iniciado:', { eventId, status });
    
    const user = await getCurrentUser()
    console.log('Usuário autenticado:', user.id);
    
    const supabase = await createServerClient()

    // Verificar se o evento pertence ao usuário
    console.log('Verificando evento no banco...');
    const { data: existingEvent, error: fetchError } = await supabase
      .from('events')
      .select('client_id, status')
      .eq('id', eventId)
      .single()

    if (fetchError) {
      console.error('Erro ao buscar evento:', fetchError);
      return { success: false, error: `Erro ao buscar evento: ${fetchError.message}` }
    }

    if (!existingEvent) {
      console.error('Evento não encontrado:', eventId);
      return { success: false, error: 'Evento não encontrado' }
    }

    console.log('Evento encontrado:', existingEvent);

    if (existingEvent.client_id !== user.id) {
      console.error('Acesso negado. Event client_id:', existingEvent.client_id, 'User id:', user.id);
      return { success: false, error: 'Acesso negado - evento não pertence ao usuário' }
    }

    // Validar transições de status - permitir mais flexibilidade
    const validTransitions: Record<string, string[]> = {
      'draft': ['planning', 'cancelled'],
      'planning': ['confirmed', 'cancelled', 'draft'], // Permitir voltar para draft
      'confirmed': ['completed', 'cancelled'],
      'completed': [],
      'cancelled': ['draft'] // Permitir reativar evento cancelado
    }

    const allowedStatuses = validTransitions[existingEvent.status] || []
    console.log('Transição de status:', {
      from: existingEvent.status,
      to: status,
      allowedStatuses
    });
    
    // Se não há transições definidas ou a transição não é permitida
    if (allowedStatuses.length > 0 && !allowedStatuses.includes(status)) {
      const errorMsg = `Transição inválida: "${existingEvent.status}" -> "${status}". Transições permitidas: ${allowedStatuses.join(', ')}`;
      console.error(errorMsg);
      return { success: false, error: errorMsg }
    }

    console.log('Atualizando status do evento...');
    
    // Usar SQL direto para evitar problemas de tipos
    const { data: event, error: updateError } = await supabase
      .rpc('update_event_status', {
        event_id: eventId,
        new_status: status,
        user_id: user.id
      })

    if (updateError) {
      console.error('Erro com RPC, tentando update direto:', updateError);
      
      // Fallback: tentar update direto
      const { data: eventData, error: directError } = await supabase
        .from('events')
        .update({ status: status })
        .eq('id', eventId)
        .eq('client_id', user.id)
        .select()
        .single()

      if (directError) {
        console.error('Erro ao atualizar status do evento:', directError);
        return { success: false, error: `Erro ao atualizar status: ${directError.message}` }
      }

      console.log('Status do evento atualizado com sucesso (fallback):', eventData);
      
      revalidatePath('/minhas-festas')
      revalidatePath(`/minhas-festas/${eventId}`)
      revalidatePath('/dashboard')
      
      return { success: true, data: eventData }
    }

    if (!event) {
      console.error('Evento não retornado após atualização');
      return { success: false, error: 'Evento não foi atualizado corretamente' }
    }

    console.log('Status do evento atualizado com sucesso:', event);

    revalidatePath('/minhas-festas')
    revalidatePath(`/minhas-festas/${eventId}`)
    revalidatePath('/dashboard')
    
    return { success: true, data: event }
  } catch (error) {
    console.error('updateEventStatusAction falhou:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro inesperado ao atualizar status do evento' 
    }
  }
}

export async function deleteEventAction(eventId: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    const supabase = await createServerClient()

    // Verificar se o evento pertence ao usuário
    const { data: existingEvent } = await supabase
      .from('events')
      .select('client_id, status')
      .eq('id', eventId)
      .single()

    if (!existingEvent || existingEvent.client_id !== user.id) {
      return { success: false, error: 'Evento não encontrado ou acesso negado' }
    }

    // Não permitir exclusão de eventos confirmados ou completos
    if (existingEvent.status === 'confirmed' || existingEvent.status === 'completed') {
      return { success: false, error: 'Não é possível excluir eventos confirmados ou completos' }
    }

    // Verificar se o evento tem serviços aprovados
    const { data: approvedServices } = await supabase
      .from('event_services')
      .select('id')
      .eq('event_id', eventId)
      .eq('booking_status', 'approved')
      .limit(1)

    if (approvedServices && approvedServices.length > 0) {
      return { success: false, error: 'Não é possível excluir evento com serviços aprovados' }
    }

    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', eventId)

    if (error) {
      console.error('Error deleting event:', error)
      return { success: false, error: 'Erro ao excluir evento' }
    }

    revalidatePath('/minhas-festas')
    revalidatePath('/dashboard')
    
    return { success: true }
  } catch (error) {
    console.error('Event deletion failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao excluir evento' 
    }
  }
}

// ================================================================
// PROVIDER EVENTS ACTIONS
// ================================================================

export async function getProviderEventsAction(): Promise<ActionResult<EventWithServices[]>> {
  try {
    const user = await getCurrentUser()
    const supabase = await createServerClient()
    
    // Buscar eventos que têm serviços do prestador
    const { data: events, error } = await supabase
      .from('events')
      .select(`
        *,
        client:users!events_client_id_fkey (
          id,
          full_name,
          email,
          whatsapp_number
        ),
        event_services!inner (
          *,
          service:services (
            *,
            provider:users!services_provider_id_fkey (
              id,
              full_name,
              organization_name,
              logo_url,
              area_of_operation
            )
          )
        )
      `)
      .eq('event_services.provider_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching provider events:', error)
      return { success: false, error: 'Erro ao buscar eventos' }
    }

    return { success: true, data: events as EventWithServices[] }
  } catch (error) {
    console.error('Provider events fetch failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao buscar eventos' 
    }
  }
} 