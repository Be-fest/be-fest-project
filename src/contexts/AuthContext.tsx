'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { AuthService } from '@/services/auth.service'

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
  address?: string
  city?: string
  state?: string
  postal_code?: string
  created_at: string
  updated_at: string
}

interface AuthUser extends User {
  profile?: UserProfile
}

interface LoginFormData {
  email: string
  password: string
}

interface RegisterFormData {
  fullName: string
  email: string
  password: string
  confirmPassword: string
  whatsapp?: string
}

interface ProviderRegisterFormData {
  organizationName: string
  cnpj: string
  email: string
  password: string
  confirmPassword: string
  whatsapp?: string
  areaOfOperation?: string
}

interface AuthContextType {
  user: AuthUser | null
  profile: UserProfile | null
  login: (data: LoginFormData) => Promise<void>
  register: (data: RegisterFormData) => Promise<void>
  registerProvider: (data: ProviderRegisterFormData) => Promise<void>
  logout: () => Promise<void>
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const authService = new AuthService()

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const { user: currentUser, profile: currentProfile } = await authService.getCurrentUser()
        setUser(currentUser)
        setProfile(currentProfile)
      } catch (error) {
        console.error('Auth initialization error:', error)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    const { data: { subscription } } = authService.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const userProfile = await authService.getUserProfile(session.user.id)
          setUser(session.user)
          setProfile(userProfile)
        } else {
          setUser(null)
          setProfile(null)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const login = async (data: LoginFormData) => {
    setLoading(true)
    try {
      const { user: loggedUser, profile: userProfile } = await authService.signIn(data.email, data.password)
      setUser(loggedUser)
      setProfile(userProfile)
    } finally {
      setLoading(false)
    }
  }

  const register = async (data: RegisterFormData) => {
    if (data.password !== data.confirmPassword) {
      throw new Error('Passwords do not match')
    }

    setLoading(true)
    try {
      await authService.signUp(data.email, data.password, {
        full_name: data.fullName,
        whatsapp_number: data.whatsapp,
      })
    } finally {
      setLoading(false)
    }
  }

  const registerProvider = async (data: ProviderRegisterFormData) => {
    if (data.password !== data.confirmPassword) {
      throw new Error('Passwords do not match')
    }

    setLoading(true)
    try {
      await authService.signUpProvider(data.email, data.password, {
        organization_name: data.organizationName,
        cnpj: data.cnpj,
        whatsapp_number: data.whatsapp,
        area_of_operation: data.areaOfOperation,
      })
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    setLoading(true)
    try {
      await authService.signOut()
      setUser(null)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthContext.Provider value={{
      user,
      profile,
      login,
      register,
      registerProvider,
      logout,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
