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
    let redirectTo = '/perfil'
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

// Upload de imagem de perfil para o Supabase Storage
export async function uploadProfileImageAction(formData: FormData): Promise<ActionResult<string>> {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }
    
    const file = formData.get('image') as File
    
    if (!file) {
      return { success: false, error: 'Nenhum arquivo selecionado' }
    }

    // Validar tipo de arquivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.' }
    }

    // Validar tamanho (max 5MB)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      return { success: false, error: 'Arquivo muito grande. Tamanho máximo: 5MB' }
    }

    const supabase = await createServerClient()

    // Gerar nome único para o arquivo de perfil
    const fileExt = file.name.split('.').pop()
    const fileName = `${user.id}/profiles/profile-${Date.now()}.${fileExt}`

    // Upload para o bucket 'be-fest-images'
    const { data, error } = await supabase.storage
      .from('be-fest-images')
      .upload(fileName, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Erro no upload do perfil:', error)
      return { success: false, error: 'Erro ao fazer upload da imagem de perfil' }
    }

    // Obter URL pública da imagem
    const { data: { publicUrl } } = supabase.storage
      .from('be-fest-images')
      .getPublicUrl(fileName)

    return { 
      success: true, 
      data: publicUrl 
    }
  } catch (error) {
    console.error('Profile image upload failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro inesperado no upload da imagem' 
    }
  }
}

// Deletar imagem de perfil do storage
export async function deleteProfileImageAction(imageUrl: string): Promise<ActionResult<void>> {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }
    
    const supabase = await createServerClient()

    // Extrair o caminho do arquivo da URL
    const url = new URL(imageUrl)
    const pathParts = url.pathname.split('/')
    const fileName = pathParts[pathParts.length - 1]
    const filePath = `${user.id}/profiles/${fileName}`

    const { error } = await supabase.storage
      .from('be-fest-images')
      .remove([filePath])

    if (error) {
      console.error('Erro ao deletar imagem de perfil:', error)
      return { success: false, error: 'Erro ao deletar imagem de perfil' }
    }

    return { success: true }
  } catch (error) {
    console.error('Profile image deletion failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro inesperado ao deletar imagem' 
    }
  }
}

// Esquema para atualização de perfil do prestador
const updateProviderProfileSchema = z.object({
  organization_name: z.string().min(1, 'Nome da empresa é obrigatório').optional(),
  full_name: z.string().min(1, 'Nome é obrigatório').optional(),
  whatsapp_number: z.string().min(8, 'Telefone deve ter pelo menos 8 dígitos').optional(),
  area_of_operation: z.string().min(1, 'Área de atuação é obrigatória').optional(),
  cnpj: z.string().min(11, 'CNPJ deve ter pelo menos 11 dígitos').optional(),
  profile_image: z.string().url('URL da imagem inválida').optional().or(z.literal(''))
})

// Atualizar perfil completo do prestador
export async function updateProviderProfileAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }
    
    // Extrair dados do FormData e filtrar campos vazios
    const rawData: Record<string, string | undefined> = {}
    
    const fields = [
      'organization_name',
      'full_name', 
      'whatsapp_number',
      'area_of_operation',
      'cnpj',
      'profile_image'
    ]
    
    fields.forEach(field => {
      const value = formData.get(field) as string
      if (value && value.trim() !== '') {
        rawData[field] = value.trim()
      }
    })

    console.log('Dados extraídos do FormData:', rawData)

    const validatedData = updateProviderProfileSchema.parse(rawData)
    const supabase = await createServerClient()

    // Verificar se o usuário é um prestador
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (!userData || userData.role !== 'provider') {
      return { success: false, error: 'Apenas prestadores podem atualizar este perfil' }
    }

    // Construir objeto de atualização apenas com campos fornecidos
    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (validatedData.organization_name) {
      updateData.organization_name = validatedData.organization_name
    }

    if (validatedData.full_name) {
      updateData.full_name = validatedData.full_name
    }

    if (validatedData.whatsapp_number) {
      updateData.whatsapp_number = removeMask(validatedData.whatsapp_number)
    }

    if (validatedData.area_of_operation) {
      updateData.area_of_operation = validatedData.area_of_operation
    }

    if (validatedData.cnpj) {
      updateData.cnpj = removeMask(validatedData.cnpj)
    }

    if (validatedData.profile_image) {
      updateData.profile_image = validatedData.profile_image
    }

    console.log('Dados para atualização:', updateData)

    const { error } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', user.id)

    if (error) {
      console.error('Error updating provider profile:', error)
      return { success: false, error: 'Erro ao atualizar perfil do prestador' }
    }

    // Revalidate profile data
    revalidatePath('/dashboard/prestador')

    return { 
      success: true, 
      data: { message: 'Perfil atualizado com sucesso!' } 
    }

  } catch (error) {
    console.error('Provider profile update failed:', error)
    
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return { success: false, error: firstError.message }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Ocorreu um erro ao atualizar o perfil do prestador' 
    }
  }
} 