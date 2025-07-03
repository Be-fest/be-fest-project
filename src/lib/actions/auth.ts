'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServerClient, createAdminClient } from '@/lib/supabase/server'
import { checkEmailExists, checkDocumentExists, verifySession } from '@/lib/dal'
import { removeMask } from '@/utils/formatters'
import { createClient } from '@supabase/supabase-js'
import { Database } from '@/types/database'

// Validation schemas
const registerClientSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string(),
  cpf: z.string().min(11, 'CPF inválido'),
  phone: z.string().min(10, 'Telefone inválido')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
})

const registerProviderSchema = z.object({
  companyName: z.string().min(2, 'Nome da empresa deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string(),
  cnpj: z.string().min(14, 'CNPJ inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  areaOfOperation: z.string().min(1, 'Área de atuação é obrigatória')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
})

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(1, 'Senha é obrigatória')
})

// Esquema para email de recuperação
const forgotPasswordSchema = z.object({
  email: z.string().email('Email inválido')
})

// Schema para atualização completa de perfil
const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  phone: z.string().optional(),
  organizationName: z.string().optional(),
  cnpj: z.string().optional()
})

// Result types for better type safety
type ActionResult<T = any> = {
  success: boolean
  error?: string
  data?: T
}

export async function registerClientAction(formData: FormData): Promise<ActionResult> {
  try {
    // Parse and validate form data
    const rawData = {
      fullName: formData.get('fullName') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
      cpf: formData.get('cpf') as string,
      phone: formData.get('phone') as string,
    }

    console.log('Raw form data:', rawData)

    const validatedData = registerClientSchema.parse(rawData)

    // Clean masks
    const cpf = removeMask(validatedData.cpf)
    const phone = removeMask(validatedData.phone)

    console.log('Cleaned data:', { cpf, phone })

    // Criar cliente Supabase sem cookies (anon key) para signup
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    )

    console.log('Attempting client signup with trigger...')
    
    // Preparar metadados completos para o trigger SQL
    const userMetadata = {
      role: 'client',
      full_name: validatedData.fullName,
      cpf: cpf,
      whatsapp_number: phone
    }
    
    console.log('Sending client metadata to Supabase:', userMetadata)
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: userMetadata
      }
    })

    if (signUpError) {
      console.error('SignUp error:', signUpError)
      
      if (signUpError.message.includes('User already registered')) {
        return { success: false, error: 'Este email já está em uso' }
      }
      
      return { success: false, error: `Erro ao criar usuário: ${signUpError.message}` }
    }

    if (!signUpData.user) {
      return { success: false, error: 'Erro ao criar usuário: usuário não retornado' }
    }

    console.log('User created successfully with trigger:', signUpData.user.id)

    // Aguardar um pouco para garantir que o trigger foi executado
    await new Promise(resolve => setTimeout(resolve, 500))

    console.log('Client registration completed successfully')
    
    return { 
      success: true, 
      data: { 
        message: 'Conta criada com sucesso! Verifique seu email para confirmar sua conta antes de fazer login.' 
      } 
    }
    
  } catch (error) {
    console.error('Client registration failed:', error)
    
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return { success: false, error: firstError.message }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Ocorreu um erro ao criar sua conta' 
    }
  }
}

export async function registerProviderAction(formData: FormData): Promise<ActionResult> {
  try {
    // Parse and validate form data
    const rawData = {
      companyName: formData.get('companyName') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      confirmPassword: formData.get('confirmPassword') as string,
      cnpj: formData.get('cnpj') as string,
      phone: formData.get('phone') as string,
      areaOfOperation: formData.get('areaOfOperation') as string,
    }

    console.log('Raw provider form data:', rawData)

    const validatedData = registerProviderSchema.parse(rawData)

    // Clean masks
    const cnpj = removeMask(validatedData.cnpj)
    const phone = removeMask(validatedData.phone)

    console.log('Cleaned provider data:', { cnpj, phone })

    // Criar cliente Supabase sem cookies (anon key) para signup
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false
        }
      }
    )

    console.log('Attempting provider signup with trigger...')
    
    // Preparar metadados completos para o trigger SQL
    const userMetadata = {
      role: 'provider',
      full_name: validatedData.companyName,
      organization_name: validatedData.companyName,
      cnpj: cnpj,
      whatsapp_number: phone,
      area_of_operation: validatedData.areaOfOperation
    }
    
    console.log('Sending user metadata to Supabase:', userMetadata)
    
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: userMetadata
      }
    })

    if (signUpError) {
      console.error('Provider SignUp error:', signUpError)
      
      if (signUpError.message.includes('User already registered')) {
        return { success: false, error: 'Este email já está em uso' }
      }
      
      return { success: false, error: `Erro ao criar usuário: ${signUpError.message}` }
    }

    if (!signUpData.user) {
      return { success: false, error: 'Erro ao criar usuário: usuário não retornado' }
    }

    console.log('Provider user created successfully with trigger:', signUpData.user.id)

    // Aguardar um pouco para garantir que o trigger foi executado
    await new Promise(resolve => setTimeout(resolve, 500))

    console.log('Provider registration completed successfully')
    
    return { 
      success: true, 
      data: { 
        message: 'Conta criada com sucesso! Verifique seu email para confirmar sua conta antes de fazer login.' 
      } 
    }
    
  } catch (error) {
    console.error('Provider registration failed:', error)
    
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return { success: false, error: firstError.message }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Ocorreu um erro ao criar sua conta' 
    }
  }
}

export async function loginAction(formData: FormData): Promise<ActionResult> {
  try {
    // Parse and validate form data
    const rawData = {
      email: formData.get('email') as string,
      password: formData.get('password') as string,
    }

    const validatedData = loginSchema.parse(rawData)

    const supabase = await createServerClient()

    // Authenticate user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    })

    if (authError) {
      console.error('Login error:', authError)
      return { success: false, error: 'Email ou senha incorretos' }
    }

    if (!authData.user) {
      return { success: false, error: 'Erro ao fazer login: usuário não encontrado' }
    }

    // Get user profile to determine redirect
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('role, organization_name, cnpj')
      .eq('id', authData.user.id)
      .single()

    if (userError) {
      console.error('User fetch error:', userError)
      
      // Fallback: criar perfil se não existir (para usuários antigos)
      if (userError.code === 'PGRST116') { // No rows returned
        console.log('User profile not found, creating fallback profile...')
        
        const { error: createError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: authData.user.email,
            role: 'client', // default
            full_name: authData.user.user_metadata?.full_name || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
        
        if (createError) {
          console.error('Failed to create fallback profile:', createError)
          return { success: false, error: 'Perfil do usuário não encontrado e não foi possível criá-lo' }
        }
        
        console.log('Fallback profile created successfully')
      } else {
        return { success: false, error: 'Erro ao carregar perfil do usuário' }
      }
    }

    console.log('Login completed successfully')
    
    // Sempre redirecionar para /dashboard primeiro, independente do tipo de usuário
    revalidatePath('/dashboard')
    revalidatePath('/')
    
    return { success: true, data: { redirectTo: '/dashboard' } }
    
  } catch (error) {
    console.error('Login failed:', error)
    
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return { success: false, error: firstError.message }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Ocorreu um erro ao fazer login' 
    }
  }
}

export async function logoutAction(): Promise<ActionResult> {
  try {
    const supabase = await createServerClient()
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error('Logout error:', error)
      return { success: false, error: 'Erro ao fazer logout' }
    }

    console.log('Logout completed successfully')
    
    // Revalidate and redirect
    revalidatePath('/')
    redirect('/')
    
  } catch (error) {
    console.error('Logout failed:', error)
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Ocorreu um erro ao fazer logout' 
    }
  }
}

export async function updateUserProfileAction(formData: FormData): Promise<ActionResult> {
  try {
    // Verify authentication
    const session = await verifySession()
    if (!session) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const supabase = await createServerClient()
    
    // Parse form data
    const fullName = formData.get('fullName') as string
    const phone = formData.get('phone') as string

    // Validate required fields
    if (!fullName || fullName.trim().length < 2) {
      return { success: false, error: 'Nome deve ter pelo menos 2 caracteres' }
    }

    // Update profile
    const { error: updateError } = await supabase
      .from('users')
      .update({
        full_name: fullName.trim(),
        whatsapp_number: phone ? removeMask(phone) : null,
        updated_at: new Date().toISOString()
      })
      .eq('id', session.user.id)

    if (updateError) {
      console.error('Profile update error:', updateError)
      return { success: false, error: 'Erro ao atualizar perfil' }
    }

    console.log('Profile updated successfully')
    
    // Revalidate cache
    revalidatePath('/dashboard')
    
    return { success: true }
    
  } catch (error) {
    console.error('Profile update failed:', error)
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Ocorreu um erro ao atualizar perfil' 
    }
  }
}

export async function forgotPasswordAction(formData: FormData): Promise<ActionResult> {
  try {
    const rawData = {
      email: formData.get('email') as string,
    }

    const validatedData = forgotPasswordSchema.parse(rawData)

    // Usar client anônimo para enviar email de recuperação
    const supabase = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
        },
      },
    )

    const { error } = await supabase.auth.resetPasswordForEmail(validatedData.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/reset-password`,
    })

    if (error) {
      console.error('Forgot password error:', error)
      return { success: false, error: 'Erro ao enviar email de recuperação. Tente novamente.' }
    }

    return { success: true, data: { message: 'Email de recuperação enviado! Verifique sua caixa de entrada.' } }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    return { success: false, error: error instanceof Error ? error.message : 'Erro inesperado' }
  }
}

export async function updateCompleteProfileAction(formData: FormData): Promise<ActionResult> {
  try {
    const session = await verifySession()
    if (!session) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const rawData = {
      fullName: formData.get('fullName') as string,
      phone: formData.get('phone') as string,
      organizationName: formData.get('organizationName') as string,
      cnpj: formData.get('cnpj') as string,
    }

    const validatedData = updateProfileSchema.parse(rawData)
    const supabase = await createServerClient()

    const updateData: any = {
      full_name: validatedData.fullName.trim(),
      updated_at: new Date().toISOString()
    }

    if (validatedData.phone) {
      updateData.whatsapp_number = removeMask(validatedData.phone)
    }

    if (validatedData.organizationName) {
      updateData.organization_name = validatedData.organizationName.trim()
    }

    if (validatedData.cnpj) {
      updateData.cnpj = removeMask(validatedData.cnpj)
    }

    const { error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', session.user.id)

    if (updateError) {
      console.error('Profile update error:', updateError)
      return { success: false, error: 'Erro ao atualizar perfil' }
    }

    revalidatePath('/perfil')
    
    return { success: true, data: { message: 'Perfil atualizado com sucesso!' } }
    
  } catch (error) {
    console.error('Profile update failed:', error)
    
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return { success: false, error: firstError.message }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Ocorreu um erro ao atualizar perfil' 
    }
  }
}

export async function deleteAccountAction(): Promise<ActionResult> {
  try {
    const session = await verifySession()
    if (!session) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const supabase = await createServerClient()

    // Verificar se o usuário tem eventos ativos
    const { data: activeEvents, error: eventsError } = await supabase
      .from('events')
      .select('id')
      .eq('user_id', session.user.id)
      .eq('status', 'active')

    if (eventsError) {
      console.error('Error checking events:', eventsError)
      return { success: false, error: 'Erro ao verificar eventos do usuário' }
    }

    if (activeEvents && activeEvents.length > 0) {
      return { 
        success: false, 
        error: 'Não é possível excluir conta com eventos ativos. Cancele ou finalize seus eventos primeiro.' 
      }
    }

    // Soft delete - marcar como deletado
    const { error: deleteError } = await supabase
      .from('users')
      .update({ 
        email: `deleted_${session.user.id}@befest.com`,
        full_name: 'Conta Excluída',
        whatsapp_number: null,
        organization_name: null,
        cnpj: null,
        updated_at: new Date().toISOString()
      })
      .eq('id', session.user.id)

    if (deleteError) {
      console.error('Account deletion error:', deleteError)
      return { success: false, error: 'Erro ao excluir conta' }
    }

    // Fazer logout
    await supabase.auth.signOut()
    
    revalidatePath('/')
    
    return { success: true, data: { message: 'Conta excluída com sucesso!' } }
    
  } catch (error) {
    console.error('Account deletion failed:', error)
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Ocorreu um erro ao excluir conta' 
    }
  }
} 