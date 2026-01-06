'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import { z } from 'zod'

// Result types
type ActionResult<T = any> = {
    success: boolean
    error?: string
    data?: T
    message?: string
}

// Chat message interface
export interface ChatMessage {
    id: string
    event_service_id: string
    sender_id: string
    message: string
    created_at: string
}

export interface ChatMessageWithSender extends ChatMessage {
    sender: {
        id: string
        full_name: string | null
        profile_image: string | null
    }
}

// Validation schemas
const sendMessageSchema = z.object({
    event_service_id: z.string().uuid('ID do serviço inválido'),
    message: z.string().min(1, 'Mensagem não pode estar vazia').max(1000, 'Mensagem muito longa')
})

// Helper function to get current user
async function getCurrentUser() {
    const supabase = await createServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        throw new Error('Usuário não autenticado')
    }

    return user
}

/**
 * Check if user can access chat for a specific event service
 * Returns true if:
 * 1. User is either the provider or the client
 * 2. Event service status is approved, waiting_payment, or in_progress
 * 3. Event date hasn't passed yet
 */
export async function canAccessChatAction(eventServiceId: string): Promise<ActionResult<{ canAccess: boolean; reason?: string }>> {
    try {
        const user = await getCurrentUser()
        const supabase = await createServerClient()

        const { data: eventService, error } = await supabase
            .from('event_services')
            .select(`
        id,
        provider_id,
        booking_status,
        event:events!inner (
          id,
          event_date,
          client_id
        )
      `)
            .eq('id', eventServiceId)
            .single()

        if (error || !eventService) {
            return { success: false, error: 'Serviço não encontrado' }
        }

        const isProvider = eventService.provider_id === user.id
        const isClient = (eventService.event as any).client_id === user.id

        if (!isProvider && !isClient) {
            return { success: true, data: { canAccess: false, reason: 'Você não tem permissão para acessar este chat' } }
        }

        const allowedStatuses = ['approved', 'waiting_payment', 'in_progress']
        if (!allowedStatuses.includes(eventService.booking_status)) {
            return { success: true, data: { canAccess: false, reason: 'Este serviço ainda não foi aprovado' } }
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const eventDate = new Date((eventService.event as any).event_date)
        eventDate.setHours(0, 0, 0, 0)

        if (eventDate < today) {
            return { success: true, data: { canAccess: false, reason: 'O chat foi desativado pois a data do evento já passou' } }
        }

        return { success: true, data: { canAccess: true } }
    } catch (error) {
        console.error('Check chat access failed:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erro ao verificar acesso ao chat'
        }
    }
}

/**
 * Get chat messages for an event service
 */
export async function getChatMessagesAction(eventServiceId: string): Promise<ActionResult<ChatMessageWithSender[]>> {
    try {
        const user = await getCurrentUser()
        const supabase = await createServerClient()

        // First verify user has access to this chat
        const accessResult = await canAccessChatAction(eventServiceId)
        if (!accessResult.success) {
            return { success: false, error: accessResult.error }
        }

        // Fetch messages
        const { data: messages, error } = await supabase
            .from('chat_messages')
            .select(`
        id,
        event_service_id,
        sender_id,
        message,
        created_at,
        sender:users!chat_messages_sender_id_fkey (
          id,
          full_name,
          profile_image
        )
      `)
            .eq('event_service_id', eventServiceId)
            .order('created_at', { ascending: true })

        if (error) {
            console.error('Error fetching chat messages:', error)
            return { success: false, error: 'Erro ao buscar mensagens' }
        }

        const formattedMessages: ChatMessageWithSender[] = (messages || []).map((msg: any) => ({
            id: msg.id,
            event_service_id: msg.event_service_id,
            sender_id: msg.sender_id,
            message: msg.message,
            created_at: msg.created_at,
            sender: {
                id: msg.sender?.id || msg.sender_id,
                full_name: msg.sender?.full_name || null,
                profile_image: msg.sender?.profile_image || null
            }
        }))

        return { success: true, data: formattedMessages }
    } catch (error) {
        console.error('Get chat messages failed:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erro ao buscar mensagens'
        }
    }
}

/**
 * Send a chat message
 */
export async function sendChatMessageAction(eventServiceId: string, message: string): Promise<ActionResult<ChatMessage>> {
    try {
        const user = await getCurrentUser()
        const supabase = await createServerClient()

        // Validate input
        const validatedData = sendMessageSchema.parse({ event_service_id: eventServiceId, message })

        // Verify user has access to this chat
        const accessResult = await canAccessChatAction(eventServiceId)
        if (!accessResult.success) {
            return { success: false, error: accessResult.error }
        }
        if (!accessResult.data?.canAccess) {
            return { success: false, error: accessResult.data?.reason || 'Você não tem permissão para enviar mensagens neste chat' }
        }

        // Insert message
        const { data: newMessage, error } = await supabase
            .from('chat_messages')
            .insert({
                event_service_id: eventServiceId,
                sender_id: user.id,
                message: validatedData.message
            })
            .select()
            .single()

        if (error) {
            console.error('Error sending message:', error)
            return { success: false, error: 'Erro ao enviar mensagem' }
        }

        return { success: true, data: newMessage }
    } catch (error) {
        console.error('Send message failed:', error)

        if (error instanceof z.ZodError) {
            const firstError = error.errors[0]
            return { success: false, error: firstError.message }
        }

        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erro ao enviar mensagem'
        }
    }
}

/**
 * Get chat info including participants and message count
 */
export async function getChatInfoAction(eventServiceId: string): Promise<ActionResult<{
    eventTitle: string
    serviceName: string
    providerName: string | null
    clientName: string | null
    messageCount: number
    canChat: boolean
    reason?: string
}>> {
    try {
        const user = await getCurrentUser()
        const supabase = await createServerClient()

        // Get event service details
        const { data: eventService, error: esError } = await supabase
            .from('event_services')
            .select(`
        id,
        provider_id,
        booking_status,
        event:events!inner (
          id,
          title,
          event_date,
          client_id,
          client:users!events_client_id_fkey (
            id,
            full_name
          )
        ),
        service:services!inner (
          id,
          name
        ),
        provider:users!event_services_provider_id_fkey (
          id,
          full_name,
          organization_name
        )
      `)
            .eq('id', eventServiceId)
            .single()

        if (esError || !eventService) {
            return { success: false, error: 'Serviço não encontrado' }
        }

        // Get message count
        const { count, error: countError } = await supabase
            .from('chat_messages')
            .select('*', { count: 'exact', head: true })
            .eq('event_service_id', eventServiceId)

        // Check if chat is available
        const accessResult = await canAccessChatAction(eventServiceId)
        const canChat = accessResult.data?.canAccess || false
        const reason = accessResult.data?.reason

        return {
            success: true,
            data: {
                eventTitle: (eventService.event as any).title,
                serviceName: (eventService.service as any).name,
                providerName: (eventService.provider as any)?.organization_name || (eventService.provider as any)?.full_name || null,
                clientName: (eventService.event as any).client?.full_name || null,
                messageCount: count || 0,
                canChat,
                reason
            }
        }
    } catch (error) {
        console.error('Get chat info failed:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erro ao buscar informações do chat'
        }
    }
}
