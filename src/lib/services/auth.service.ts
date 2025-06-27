import { SupabaseClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'
import { BaseService } from './base.service'
import { Profile, ProviderProfile } from '@/types/database'

export class AuthService extends BaseService {
  constructor(supabase: SupabaseClient<Database>) {
    super(supabase, 'profiles')
  }

  async signUp(email: string, password: string, data: { 
    full_name: string
    role: 'client' | 'provider'
    avatar_url?: string
  }) {
    const { data: authData, error: signUpError } = await this.supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: data.full_name,
          avatar_url: data.avatar_url
        }
      }
    })

    if (signUpError) throw signUpError

    // Update the role in the profile
    if (authData.user) {
      await this.update<Profile, Partial<Profile>>(authData.user.id, {
        role: data.role
      })
    }

    return authData
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password
    })

    if (error) throw error
    return data
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut()
    if (error) throw error
  }

  async getCurrentUser() {
    const { data: { user }, error } = await this.supabase.auth.getUser()
    if (error) throw error
    return user
  }

  async getCurrentProfile(): Promise<Profile | null> {
    const user = await this.getCurrentUser()
    if (!user) return null
    return this.getById<Profile>(user.id)
  }

  async updateProfile(id: string, data: Partial<Profile>) {
    return this.update<Profile, Partial<Profile>>(id, data)
  }

  async createProviderProfile(data: Omit<ProviderProfile, 'id' | 'created_at' | 'updated_at' | 'rating'>) {
    const currentUser = await this.getCurrentUser()
    if (!currentUser) throw new Error('User not authenticated')

    // First update the user role to provider if not already
    await this.update<Profile, Partial<Profile>>(currentUser.id, {
      role: 'provider'
    })

    // Then create the provider profile
    return this.handleError<ProviderProfile>(
      this.supabase
        .from('provider_profiles')
        .insert({
          ...data,
          id: currentUser.id
        })
        .select()
        .single()
    )
  }

  async getProviderProfile(id: string): Promise<ProviderProfile | null> {
    return this.handleError<ProviderProfile>(
      this.supabase
        .from('provider_profiles')
        .select('*')
        .eq('id', id)
        .single()
    )
  }

  async updateProviderProfile(id: string, data: Partial<Omit<ProviderProfile, 'id' | 'created_at' | 'updated_at'>>) {
    return this.handleError<ProviderProfile>(
      this.supabase
        .from('provider_profiles')
        .update(data)
        .eq('id', id)
        .select()
        .single()
    )
  }

  async resetPassword(email: string) {
    const { error } = await this.supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?next=/auth/update-password`
    })
    if (error) throw error
  }

  async updatePassword(password: string) {
    const { error } = await this.supabase.auth.updateUser({
      password
    })
    if (error) throw error
  }
} 