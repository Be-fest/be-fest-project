'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServerClient, createAdminClient } from '@/lib/supabase/server'
import { checkEmailExists, checkDocumentExists, verifySession, getCurrentUser } from '@/lib/dal'
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

// Esquema para atualização de perfil
const updateProfileSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  whatsappNumber: z.string().min(10, 'Telefone inválido'),
  organizationName: z.string().optional()
})

// Definir tipo de retorno das actions
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

    // Criar cliente Supabase Admin para criar usuário
    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('Creating client with admin client...')
    
    // Criar usuário no auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: validatedData.email,
      password: validatedData.password,
      email_confirm: true // Auto-confirmar email para não precisar de verificação
    })

    if (authError) {
      console.error('Auth creation error:', authError)
      
      if (authError.message.includes('User already registered')) {
        return { success: false, error: 'Este email já está em uso' }
      }
      
      return { success: false, error: `Erro ao criar usuário: ${authError.message}` }
    }

    if (!authData.user) {
      return { success: false, error: 'Erro ao criar usuário: usuário não retornado' }
    }

    console.log('Auth user created successfully:', authData.user.id)

    // Criar registro na tabela users com role 'client'
    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        role: 'client',
        full_name: validatedData.fullName,
        email: validatedData.email,
        cpf: cpf,
        whatsapp_number: phone
      })

    if (userError) {
      console.error('User profile creation error:', userError)
      
      // Se falhar ao criar o perfil, deletar o usuário criado
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      
      return { success: false, error: 'Erro ao criar perfil do usuário' }
    }

    console.log('Client registration completed successfully')
    
    return { 
      success: true, 
      data: { 
        message: 'Conta criada com sucesso! Você já pode fazer login.' 
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

    // Criar cliente Supabase Admin para criar usuário
    const supabaseAdmin = createClient<Database>(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    console.log('Creating provider with admin client...')
    
    // Criar usuário no auth.users
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: validatedData.email,
      password: validatedData.password,
      email_confirm: true // Auto-confirmar email para não precisar de verificação
    })

    if (authError) {
      console.error('Provider auth creation error:', authError)
      
      if (authError.message.includes('User already registered')) {
        return { success: false, error: 'Este email já está em uso' }
      }
      
      return { success: false, error: `Erro ao criar usuário: ${authError.message}` }
    }

    if (!authData.user) {
      return { success: false, error: 'Erro ao criar usuário: usuário não retornado' }
    }

    console.log('Provider auth user created successfully:', authData.user.id)

    // Criar registro na tabela users com role 'provider'
    const { error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        role: 'provider',
        full_name: validatedData.companyName,
        email: validatedData.email,
        organization_name: validatedData.companyName,
        cnpj: cnpj,
        whatsapp_number: phone,
        area_of_operation: validatedData.areaOfOperation
      })

    if (userError) {
      console.error('Provider profile creation error:', userError)
      
      // Se falhar ao criar o perfil, deletar o usuário criado
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      
      return { success: false, error: 'Erro ao criar perfil do prestador' }
    }

    console.log('Provider registration completed successfully')
    
    return { 
      success: true, 
      data: { 
        message: 'Conta criada com sucesso! Você já pode fazer login.' 
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
      .select('role')
      .eq('id', authData.user.id)
      .single()

    if (userError || !user) {
      console.error('Error fetching user profile:', userError)
      return { success: false, error: 'Erro ao carregar perfil do usuário' }
    }

    // Revalidate cache
    revalidatePath('/', 'layout')

    // Determine redirect URL based on user role
    let redirectTo = '/dashboard'
    if (user.role === 'provider') {
      redirectTo = '/dashboard/prestador'
    } else if (user.role === 'admin') {
      redirectTo = '/admin'
    }

    // Return success with redirect data instead of using redirect()
    return { 
      success: true, 
      data: { 
        redirectTo,
        message: 'Login realizado com sucesso!' 
      } 
    }

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

    // Revalidate cache
    revalidatePath('/', 'layout')

    // Return success with redirect data instead of using redirect()
    return { 
      success: true, 
      data: { 
        redirectTo: '/',
        message: 'Logout realizado com sucesso!' 
      } 
    }

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
    const user = await getCurrentUser()
    
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const rawData = {
      fullName: formData.get('fullName') as string,
      whatsappNumber: formData.get('whatsappNumber') as string,
      organizationName: formData.get('organizationName') as string || undefined
    }

    const validatedData = updateProfileSchema.parse(rawData)
    const supabase = await createServerClient()

    // Clean phone number
    const cleanPhone = removeMask(validatedData.whatsappNumber)

    const updateData: any = {
      full_name: validatedData.fullName,
      whatsapp_number: cleanPhone,
      updated_at: new Date().toISOString()
    }

    if (validatedData.organizationName) {
      updateData.organization_name = validatedData.organizationName
    }

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)

    if (error) {
      console.error('Error updating profile:', error)
      return { success: false, error: 'Erro ao atualizar perfil' }
    }

    // Revalidate profile data
    revalidatePath('/perfil')

    return { 
      success: true, 
      data: { message: 'Perfil atualizado com sucesso!' } 
    }

  } catch (error) {
    console.error('Profile update failed:', error)
    
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return { success: false, error: firstError.message }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Ocorreu um erro ao atualizar o perfil' 
    }
  }
}

export async function forgotPasswordAction(formData: FormData): Promise<ActionResult> {
  try {
    const rawData = {
      email: formData.get('email') as string
    }

    const validatedData = forgotPasswordSchema.parse(rawData)
    const supabase = await createServerClient()

    const { error } = await supabase.auth.resetPasswordForEmail(validatedData.email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`
    })

    if (error) {
      console.error('Password reset error:', error)
      return { success: false, error: 'Erro ao enviar email de recuperação' }
    }

    return { 
      success: true, 
      data: { 
        message: 'Email de recuperação enviado! Verifique sua caixa de entrada.' 
      } 
    }

  } catch (error) {
    console.error('Password reset failed:', error)
    
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return { success: false, error: firstError.message }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Ocorreu um erro ao solicitar recuperação de senha' 
    }
  }
}

export async function updateCompleteProfileAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const rawData = {
      fullName: formData.get('fullName') as string,
      whatsappNumber: formData.get('whatsappNumber') as string,
      organizationName: formData.get('organizationName') as string || undefined,
      areaOfOperation: formData.get('areaOfOperation') as string || undefined
    }

    const supabase = await createServerClient()

    // Clean phone number
    const cleanPhone = removeMask(rawData.whatsappNumber)

    const updateData: any = {
      full_name: rawData.fullName,
      whatsapp_number: cleanPhone,
      updated_at: new Date().toISOString()
    }

    if (rawData.organizationName) {
      updateData.organization_name = rawData.organizationName
    }

    if (rawData.areaOfOperation) {
      updateData.area_of_operation = rawData.areaOfOperation
    }

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)

    if (error) {
      console.error('Error updating complete profile:', error)
      return { success: false, error: 'Erro ao atualizar perfil completo' }
    }

    // Revalidate profile data
    revalidatePath('/perfil')

    return { 
      success: true, 
      data: { message: 'Perfil atualizado com sucesso!' } 
    }

  } catch (error) {
    console.error('Complete profile update failed:', error)
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Ocorreu um erro ao atualizar o perfil completo' 
    }
  }
}

export async function deleteAccountAction(): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const supabase = await createServerClient()

    // Delete user profile first (this will cascade delete related data)
    const { error: profileError } = await supabase
      .from('users')
      .delete()
      .eq('id', user.id)

    if (profileError) {
      console.error('Error deleting user profile:', profileError)
      return { success: false, error: 'Erro ao deletar perfil do usuário' }
    }

    // Then delete auth user
    const { error: authError } = await supabase.auth.admin.deleteUser(user.id)

    if (authError) {
      console.error('Error deleting auth user:', authError)
      return { success: false, error: 'Erro ao deletar usuário de autenticação' }
    }

    // Sign out and redirect
    await supabase.auth.signOut()
    revalidatePath('/', 'layout')
    redirect('/')

  } catch (error) {
    console.error('Account deletion failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Ocorreu um erro ao deletar a conta' 
    }
  }
} 