import 'server-only'
import { cache } from 'react'
import { createServerClient } from '@/lib/supabase/server'
import { User } from '@supabase/supabase-js'

// Cache the session verification to avoid multiple calls
export const verifySession = cache(async () => {
  try {
    const supabase = await createServerClient()
    const { data: { session }, error } = await supabase.auth.getSession()
    
    if (error || !session) {
      return null
    }

    return session
  } catch (error) {
    console.error('Session verification failed:', error)
    return null
  }
})

// Get current user with authentication check
export const getCurrentUser = cache(async () => {
  const session = await verifySession()
  
  if (!session) {
    return null
  }

  try {
    const supabase = await createServerClient()
    const { data: user, error } = await supabase
      .from('users')
      .select('id, role, full_name, whatsapp_number, email, organization_name, cnpj')
      .eq('id', session.user.id)
      .single()

    if (error) {
      console.error('Failed to fetch user:', error)
      return null
    }

    return {
      ...user,
      email: user.email || session.user.email
    }
  } catch (error) {
    console.error('Database error:', error)
    return null
  }
})

// Get user by ID with authorization check
export const getUserById = cache(async (userId: string) => {
  const currentUser = await getCurrentUser()
  
  if (!currentUser) {
    throw new Error('Unauthorized: No active session')
  }

  // Only admins or the user themselves can access user data
  const isAdmin = currentUser.role === 'admin'
  const isSelf = currentUser.id === userId

  if (!isAdmin && !isSelf) {
    throw new Error('Forbidden: Insufficient permissions')
  }

  try {
    const supabase = await createServerClient()
    const { data: user, error } = await supabase
      .from('users')
      .select('id, role, full_name, whatsapp_number, email, organization_name, cnpj')
      .eq('id', userId)
      .single()

    if (error) {
      throw new Error(`Failed to fetch user: ${error.message}`)
    }

    return user
  } catch (error) {
    console.error('Database error:', error)
    throw error
  }
})

// Check if email exists in auth.users
export const checkEmailExists = cache(async (email: string) => {
  try {
    // Simplified check - we'll let Supabase handle duplicate email validation
    // during the actual registration process
    return false;
  } catch (error) {
    console.error('Email validation error:', error)
    return false;
  }
})

// Check if document (CPF/CNPJ) exists in user_metadata
export const checkDocumentExists = cache(async (document: string) => {
  try {
    // Simplified check - we'll handle duplicates at the application level
    // during registration if needed
    return false;
  } catch (error) {
    console.error('Document validation error:', error)
    return false;
  }
})

// Data Transfer Object for user profile - controls what data is exposed
export const getUserProfileDTO = cache(async (userId: string) => {
  const currentUser = await getCurrentUser()
  
  if (!currentUser) {
    return null
  }

  const isAdmin = currentUser.role === 'admin'
  const isSelf = currentUser.id === userId

  if (!isAdmin && !isSelf) {
    return null
  }

  try {
    const user = await getUserById(userId)
    
    // Return only appropriate fields based on permissions
    return {
      id: user.id,
      full_name: user.full_name,
      email: isAdmin || isSelf ? user.email : null,
      role: isAdmin ? user.role : null,
      phone: isAdmin || isSelf ? user.whatsapp_number : null,
      organization_name: isAdmin || isSelf ? user.organization_name : null,
      cnpj: isAdmin || isSelf ? user.cnpj : null
    }
  } catch (error) {
    console.error('Failed to get user profile DTO:', error)
    return null
  }
})

// Get user events/parties
export const getUserEvents = cache(async (userId?: string) => {
  const currentUser = await getCurrentUser()
  
  if (!currentUser) {
    throw new Error('Unauthorized: No active session')
  }

  const targetUserId = userId || currentUser.id
  const isAdmin = currentUser.role === 'admin'
  const isSelf = currentUser.id === targetUserId

  if (!isAdmin && !isSelf) {
    throw new Error('Forbidden: Insufficient permissions')
  }

  try {
    const supabase = await createServerClient()
    const { data: events, error } = await supabase
      .from('events')
      .select(`
        id,
        title,
        description,
        event_date,
        start_time,
        location,
        budget,
        guest_count,
        status,
        created_at,
        updated_at
      `)
      .eq('client_id', targetUserId)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Failed to fetch user events: ${error.message}`)
    }

    return events || []
  } catch (error) {
    console.error('Database error:', error)
    throw error
  }
})

// Update user profile
export const updateUserProfile = async (userId: string, updates: {
  full_name?: string
  whatsapp_number?: string
  organization_name?: string
  cnpj?: string
}) => {
  const currentUser = await getCurrentUser()
  
  if (!currentUser) {
    throw new Error('Unauthorized: No active session')
  }

  const isAdmin = currentUser.role === 'admin'
  const isSelf = currentUser.id === userId

  if (!isAdmin && !isSelf) {
    throw new Error('Forbidden: Insufficient permissions')
  }

  try {
    const supabase = await createServerClient()
    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update user profile: ${error.message}`)
    }

    return data
  } catch (error) {
    console.error('Database error:', error)
    throw error
  }
}

// Delete user account
export const deleteUserAccount = async (userId: string) => {
  const currentUser = await getCurrentUser()
  
  if (!currentUser) {
    throw new Error('Unauthorized: No active session')
  }

  const isAdmin = currentUser.role === 'admin'
  const isSelf = currentUser.id === userId

  if (!isAdmin && !isSelf) {
    throw new Error('Forbidden: Insufficient permissions')
  }

  try {
    const supabase = await createServerClient()
    
    // First, check if user has any active events or bookings
    const { data: activeEvents, error: eventsError } = await supabase
      .from('events')
      .select('id')
      .eq('client_id', userId)
      .neq('status', 'cancelled')
      .neq('status', 'completed')

    if (eventsError) {
      throw new Error(`Failed to check user events: ${eventsError.message}`)
    }

    if (activeEvents && activeEvents.length > 0) {
      throw new Error('Não é possível excluir conta com eventos ativos. Cancele ou finalize seus eventos primeiro.')
    }

    // Soft delete - mark as deleted instead of actually deleting
    const { error } = await supabase
      .from('users')
      .update({ 
        email: `deleted_${userId}@befest.com`,
        full_name: 'Conta Excluída',
        whatsapp_number: null,
        organization_name: null,
        cnpj: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (error) {
      throw new Error(`Failed to delete user account: ${error.message}`)
    }

    return true
  } catch (error) {
    console.error('Database error:', error)
    throw error
  }
}

// Get user statistics
export const getUserStats = cache(async (userId?: string) => {
  const currentUser = await getCurrentUser()
  
  if (!currentUser) {
    return null
  }

  const targetUserId = userId || currentUser.id
  const isAdmin = currentUser.role === 'admin'
  const isSelf = currentUser.id === targetUserId

  if (!isAdmin && !isSelf) {
    return null
  }

  try {
    const supabase = await createServerClient()
    
    // Get events count by status
    const { data: eventsStats, error: eventsError } = await supabase
      .from('events')
      .select('status')
      .eq('client_id', targetUserId)

    if (eventsError) {
      console.error('Failed to fetch events stats:', eventsError)
      return null
    }

    // Count events by status
    const eventsByStatus = eventsStats?.reduce((acc: any, event) => {
      acc[event.status] = (acc[event.status] || 0) + 1
      return acc
    }, {}) || {}

    return {
      totalEvents: eventsStats?.length || 0,
      activeEvents: eventsByStatus.active || 0,
      completedEvents: eventsByStatus.completed || 0,
      cancelledEvents: eventsByStatus.cancelled || 0,
      pendingEvents: eventsByStatus.pending || 0,
      draftEvents: eventsByStatus.draft || 0
    }
  } catch (error) {
    console.error('Database error:', error)
    return null
  }
}) 