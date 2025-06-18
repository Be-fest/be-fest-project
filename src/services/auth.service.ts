import { supabase } from '@/lib/supabase'

interface UserProfile {
  id: string
  role: 'client' | 'provider' | 'admin'
  full_name?: string
  email?: string
  organization_name?: string
  cnpj?: string
  whatsapp_number?: string
  logo_url?: string
  area_of_operation?: string
  created_at: string
  updated_at: string
}

export class AuthService {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    
    if (data.user) {
      const profile = await this.getUserProfile(data.user.id)
      return { user: data.user, profile }
    }

    return { user: null, profile: null }
  }

  async signUp(email: string, password: string, userData: Partial<UserProfile> = {}) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) throw error

    if (data.user) {
      await this.createUserProfile(data.user.id, {
        email,
        role: 'client',
        ...userData,
      })
    }

    return data
  }

  async signUpProvider(email: string, password: string, providerData: Partial<UserProfile>) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    })

    if (error) throw error

    if (data.user) {
      await this.createUserProfile(data.user.id, {
        email,
        role: 'provider',
        ...providerData,
      })
    }

    return data
  }

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (user) {
      const profile = await this.getUserProfile(user.id)
      return { user, profile }
    }

    return { user: null, profile: null }
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      return null
    }

    return data
  }

  async createUserProfile(userId: string, profileData: Partial<UserProfile>) {
    const { error } = await supabase
      .from('users')
      .insert({
        id: userId,
        ...profileData,
      })

    if (error) throw error
  }

  async updateUserProfile(userId: string, updates: Partial<UserProfile>) {
    const { error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)

    if (error) throw error
  }

  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback)
  }
}
