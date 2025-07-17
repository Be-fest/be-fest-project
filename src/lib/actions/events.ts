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
  full_guests: z.coerce.number().min(0, 'Número de convidados integrais deve ser 0 ou maior').optional(),
  half_guests: z.coerce.number().min(0, 'Número de convidados meia deve ser 0 ou maior').optional(),
  free_guests: z.coerce.number().min(0, 'Número de convidados gratuitos deve ser 0 ou maior').optional(),
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
  full_guests: z.coerce.number().min(0, 'Número de convidados integrais deve ser 0 ou maior').optional(),
  half_guests: z.coerce.number().min(0, 'Número de convidados meia deve ser 0 ou maior').optional(),
  free_guests: z.coerce.number().min(0, 'Número de convidados gratuitos deve ser 0 ou maior').optional(),
  budget: z.coerce.number().min(0, 'Orçamento deve ser maior ou igual a 0').optional().nullable(),
  status: z.enum(['draft', 'published', 'completed', 'cancelled']).optional()
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
    console.log('📥 [GET_EVENTS] Buscando eventos com filtros:', filters);
    
    const supabase = await createServerClient()
    
    let query = supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false })

    // Apply filters
    if (filters?.client_id) {
      console.log('🔍 [GET_EVENTS] Filtrando por client_id:', filters.client_id);
      query = query.eq('client_id', filters.client_id)
    }
    
    if (filters?.status) {
      console.log('🔍 [GET_EVENTS] Filtrando por status:', filters.status);
      query = query.eq('status', filters.status)
    }
    
    if (filters?.search) {
      console.log('🔍 [GET_EVENTS] Filtrando por busca:', filters.search);
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,location.ilike.%${filters.search}%`)
    }
    
    if (filters?.limit) {
      console.log('🔍 [GET_EVENTS] Limitando resultados:', filters.limit);
      query = query.limit(filters.limit)
    }

    const { data: events, error } = await query

    if (error) {
      console.error('❌ [GET_EVENTS] Erro ao buscar eventos:', error)
      return { success: false, error: `Erro ao buscar eventos: ${error.message}` }
    }

    console.log('✅ [GET_EVENTS] Eventos encontrados:', events?.length || 0);
    return { success: true, data: events || [] }
  } catch (error) {
    console.error('💥 [GET_EVENTS] Falha ao buscar eventos:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro inesperado ao buscar eventos' 
    }
  }
}

export async function getClientEventsAction(): Promise<ActionResult<Event[]>> {
  try {
    console.log('📥 [CLIENT_EVENTS] Buscando eventos do cliente...');
    
    const user = await getCurrentUser()
    console.log('👤 [CLIENT_EVENTS] Usuário autenticado:', user.id);
    
    const result = await getEventsAction({ client_id: user.id })
    console.log('📋 [CLIENT_EVENTS] Resultado da busca:', result);
    
    return result
  } catch (error) {
    console.error('💥 [CLIENT_EVENTS] Falha ao buscar eventos do cliente:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro inesperado ao buscar seus eventos' 
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
      console.error('Erro ao buscar evento:', error)
      return { success: false, error: 'Evento não encontrado' }
    }

    // Verificar se o usuário tem acesso ao evento (cliente ou prestador)
    const isOwner = event.client_id === user.id;
    const isProvider = event.event_services?.some((es: any) => es.provider_id === user.id);
    
    const hasAccess = isOwner || isProvider;

    if (!hasAccess) {
      return { success: false, error: 'Acesso negado' }
    }

    return { success: true, data: event as EventWithServices }
  } catch (error) {
    console.error('❌ [GET_EVENT] Erro geral:', error)
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
      full_guests: formData.get('full_guests') as string || '0',
      half_guests: formData.get('half_guests') as string || '0',
      free_guests: formData.get('free_guests') as string || '0',
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
    console.log('✏️ [UPDATE] Iniciando atualização do evento...');
    
    const user = await getCurrentUser()
    console.log('👤 [UPDATE] Usuário autenticado:', user.id);
    
    const rawData = {
      id: formData.get('id') as string,
      title: formData.get('title') as string,
      description: formData.get('description') as string || null,
      event_date: formData.get('event_date') as string,
      start_time: formData.get('start_time') as string || null,
      location: formData.get('location') as string || null,
      guest_count: formData.get('guest_count') as string,
      full_guests: formData.get('full_guests') as string,
      half_guests: formData.get('half_guests') as string,
      free_guests: formData.get('free_guests') as string,
      budget: formData.get('budget') as string || null,
      status: formData.get('status') as string || null, // Permitir null
    }

    console.log('📝 [UPDATE] Dados recebidos:', rawData);

    // Remover campos null/undefined/empty para evitar validação desnecessária
    const cleanedData = Object.fromEntries(
      Object.entries(rawData).filter(([_, value]) => value !== null && value !== undefined && value !== '')
    );

    console.log('📝 [UPDATE] Dados limpos:', cleanedData);

    const validatedData = updateEventSchema.parse(cleanedData)
    console.log('✅ [UPDATE] Dados validados:', validatedData);
    
    const supabase = await createServerClient()

    // Verificar se o evento pertence ao usuário
    console.log('🔍 [UPDATE] Verificando propriedade do evento...');
    const { data: existingEvent, error: fetchError } = await supabase
      .from('events')
      .select('client_id, status, title')
      .eq('id', validatedData.id)
      .single()

    if (fetchError) {
      console.error('❌ [UPDATE] Erro ao buscar evento:', fetchError);
      return { success: false, error: `Erro ao buscar evento: ${fetchError.message}` }
    }

    if (!existingEvent) {
      console.error('❌ [UPDATE] Evento não encontrado:', validatedData.id);
      return { success: false, error: 'Evento não encontrado' }
    }

    if (existingEvent.client_id !== user.id) {
      console.error('🚫 [UPDATE] Acesso negado. Event client_id:', existingEvent.client_id, 'User id:', user.id);
      return { success: false, error: 'Acesso negado - evento não pertence ao usuário' }
    }

    console.log('✅ [UPDATE] Evento encontrado e validado:', existingEvent.title);

    // Verificar se a data não é no passado (apenas se for fornecida)
    if (validatedData.event_date) {
      const eventDate = new Date(validatedData.event_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (eventDate < today) {
        console.error('🚫 [UPDATE] Data no passado:', validatedData.event_date);
        return { success: false, error: 'A data do evento não pode ser no passado' }
      }
    }

    // Não permitir edição de eventos já finalizados
    if (existingEvent.status === 'completed' || existingEvent.status === 'cancelled') {
      console.error('🚫 [UPDATE] Status não permite edição:', existingEvent.status);
      return { success: false, error: 'Não é possível editar eventos finalizados ou cancelados' }
    }

    const updateData: Partial<EventUpdate> = {}
    Object.keys(validatedData).forEach(key => {
      const value = validatedData[key as keyof typeof validatedData]
      if (key !== 'id' && value !== undefined && value !== null) {
        (updateData as any)[key] = value
      }
    })

    console.log('📝 [UPDATE] Dados para atualização:', updateData);

    const { data: event, error: updateError } = await supabase
      .from('events')
      .update(updateData)
      .eq('id', validatedData.id)
      .eq('client_id', user.id) // Segurança extra
      .select()
      .single()

    if (updateError) {
      console.error('❌ [UPDATE] Erro ao atualizar evento:', updateError);
      return { success: false, error: `Erro ao atualizar evento: ${updateError.message}` }
    }

    if (!event) {
      console.error('❌ [UPDATE] Evento não retornado após atualização');
      return { success: false, error: 'Erro ao atualizar evento - nenhum dado retornado' }
    }

    console.log('✅ [UPDATE] Evento atualizado com sucesso:', event.title);

    // Limpar cache
    revalidatePath('/minhas-festas')
    revalidatePath(`/minhas-festas/${validatedData.id}`)
    revalidatePath('/dashboard')
    revalidatePath('/perfil')
    
    console.log('🎉 [UPDATE] Atualização concluída com sucesso!');
    return { success: true, data: event }
  } catch (error) {
    console.error('💥 [UPDATE] Falha na atualização:', error)
    
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      console.error('📋 [UPDATE] Erro de validação:', firstError.message);
      return { success: false, error: `Erro de validação: ${firstError.message}` }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro inesperado ao atualizar evento' 
    }
  }
}

export async function updateEventStatusAction(eventId: string, status: string): Promise<ActionResult<Event>> {
  try {
    console.log('📝 [STATUS] Iniciando atualização de status:', { eventId, status });
    
    const user = await getCurrentUser()
    console.log('👤 [STATUS] Usuário autenticado:', user.id);
    
    const supabase = await createServerClient()

    // Verificar se o evento pertence ao usuário
    console.log('🔍 [STATUS] Verificando propriedade do evento...');
    const { data: existingEvent, error: fetchError } = await supabase
      .from('events')
      .select('client_id, status, title')
      .eq('id', eventId)
      .single()

    if (fetchError) {
      console.error('❌ [STATUS] Erro ao buscar evento:', fetchError);
      return { success: false, error: `Erro ao buscar evento: ${fetchError.message}` }
    }

    if (!existingEvent) {
      console.error('❌ [STATUS] Evento não encontrado:', eventId);
      return { success: false, error: 'Evento não encontrado' }
    }

    console.log('✅ [STATUS] Evento encontrado:', {
      id: eventId,
      title: existingEvent.title,
      currentStatus: existingEvent.status,
      newStatus: status,
      client_id: existingEvent.client_id,
      user_id: user.id
    });

    if (existingEvent.client_id !== user.id) {
      console.error('🚫 [STATUS] Acesso negado. Event client_id:', existingEvent.client_id, 'User id:', user.id);
      return { success: false, error: 'Acesso negado - evento não pertence ao usuário' }
    }

    // Validar transições de status
    const validTransitions: Record<string, string[]> = {
      'draft': ['published', 'cancelled'],
      'published': ['waiting_payment', 'completed', 'cancelled'],
      'waiting_payment': ['completed', 'cancelled'],
      'completed': [], // Status final
      'cancelled': [] // Status final
    }

    const currentStatus = existingEvent.status || 'draft'
    const allowedStatuses = validTransitions[currentStatus] || []

    if (!allowedStatuses.includes(status)) {
      console.error('🚫 [STATUS] Transição inválida:', { from: currentStatus, to: status, allowed: allowedStatuses });
      return { success: false, error: `Não é possível alterar status de ${currentStatus} para ${status}` }
    }

    console.log('✅ [STATUS] Transição válida, atualizando...');

    // Atualizar o status
    const { data: event, error } = await supabase
      .from('events')
      .update({ 
        status, 
        updated_at: new Date().toISOString() 
      })
      .eq('id', eventId)
      .eq('client_id', user.id) // Segurança extra
      .select()
      .single()

    if (error) {
      console.error('❌ [STATUS] Erro ao atualizar:', error);
      
      // Tentar buscar o evento atualizado diretamente se a atualização não retornou os dados
      console.log('🔄 [STATUS] Tentando buscar evento atualizado...');
      const { data: eventData, error: directError } = await supabase
        .from('events')
        .select('*')
        .eq('id', eventId)
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
    console.log('🗑️ [DELETE] Iniciando exclusão do evento:', eventId);
    
    const user = await getCurrentUser()
    console.log('👤 [DELETE] Usuário autenticado:', user.id);
    
    const supabase = await createServerClient()

    // Verificar se o evento pertence ao usuário
    console.log('🔍 [DELETE] Buscando evento no banco...');
    const { data: existingEvent, error: fetchError } = await supabase
      .from('events')
      .select('client_id, status, title')
      .eq('id', eventId)
      .single()

    if (fetchError) {
      console.error('❌ [DELETE] Erro ao buscar evento:', fetchError);
      return { success: false, error: `Erro ao buscar evento: ${fetchError.message}` }
    }

    if (!existingEvent) {
      console.error('❌ [DELETE] Evento não encontrado:', eventId);
      return { success: false, error: 'Evento não encontrado' }
    }

    console.log('✅ [DELETE] Evento encontrado:', {
      id: eventId,
      title: existingEvent.title,
      client_id: existingEvent.client_id,
      status: existingEvent.status,
      user_id: user.id
    });

    if (existingEvent.client_id !== user.id) {
      console.error('🚫 [DELETE] Acesso negado. Event client_id:', existingEvent.client_id, 'User id:', user.id);
      return { success: false, error: 'Acesso negado - evento não pertence ao usuário' }
    }

    // Não permitir exclusão de eventos publicados ou completos
    if (existingEvent.status === 'published' || existingEvent.status === 'completed') {
      console.error('🚫 [DELETE] Status não permite exclusão:', existingEvent.status);
      return { success: false, error: 'Não é possível excluir eventos publicados ou completos' }
    }

    // Verificar se o evento tem serviços aprovados
    console.log('🔍 [DELETE] Verificando serviços aprovados...');
    const { data: approvedServices, error: servicesError } = await supabase
      .from('event_services')
      .select('id')
      .eq('event_id', eventId)
      .eq('booking_status', 'approved')
      .limit(1)

    if (servicesError) {
      console.error('❌ [DELETE] Erro ao verificar serviços:', servicesError);
    }

    if (approvedServices && approvedServices.length > 0) {
      console.error('🚫 [DELETE] Evento tem serviços aprovados:', approvedServices.length);
      return { success: false, error: 'Não é possível excluir evento com serviços aprovados' }
    }

    console.log('✅ [DELETE] Validações passaram, executando exclusão...');

    // Primeiro deletar todos os event_services relacionados
    const { error: deleteServicesError } = await supabase
      .from('event_services')
      .delete()
      .eq('event_id', eventId)

    if (deleteServicesError) {
      console.error('❌ [DELETE] Erro ao deletar serviços do evento:', deleteServicesError);
      // Continuar mesmo se der erro, pois pode não ter serviços
    } else {
      console.log('✅ [DELETE] Serviços do evento deletados');
    }

    // Agora deletar o evento
    const { error: deleteError, count } = await supabase
      .from('events')
      .delete({ count: 'exact' })
      .eq('id', eventId)
      .eq('client_id', user.id) // Segurança extra

    if (deleteError) {
      console.error('❌ [DELETE] Erro ao deletar evento:', deleteError);
      return { success: false, error: `Erro ao excluir evento: ${deleteError.message}` }
    }

    console.log('✅ [DELETE] Evento deletado com sucesso. Linhas afetadas:', count);

    if (count === 0) {
      console.error('⚠️ [DELETE] Nenhuma linha foi deletada');
      return { success: false, error: 'O evento não foi encontrado ou você não tem permissão para excluí-lo' }
    }

    // Limpar cache
    revalidatePath('/minhas-festas')
    revalidatePath('/dashboard')
    revalidatePath('/perfil')
    
    console.log('🎉 [DELETE] Exclusão concluída com sucesso!');
    return { success: true }
  } catch (error) {
    console.error('💥 [DELETE] Falha na exclusão:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro inesperado ao excluir evento' 
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