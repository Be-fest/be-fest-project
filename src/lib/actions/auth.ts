'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServerClient, createAdminClient } from '@/lib/supabase/server'
import { checkEmailExists, checkDocumentExists, verifySession, getCurrentUser } from '@/lib/dal'
import { removeMask } from '@/utils/formatters'
import { Database } from '@/types/database'

// Validation schemas
const registerClientSchema = z.object({
  fullName: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string(),
  cpf: z.string().optional(),
  cnpj: z.string().optional(),
  phone: z.string().min(10, 'Telefone inválido')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
}).refine((data) => data.cpf || data.cnpj, {
  message: "CPF ou CNPJ é obrigatório",
  path: ["cpf"],
})

const registerProviderSchema = z.object({
  companyName: z.string().min(2, 'Nome da empresa deve ter pelo menos 2 caracteres'),
  email: z.string().email('Email inválido'),
  password: z.string().min(8, 'Senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string(),
  cnpj: z.string().min(14, 'CNPJ inválido'),
  phone: z.string().min(10, 'Telefone inválido'),
  areaOfOperation: z.string().min(1, 'Subcategoria é obrigatória')
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
  organizationName: z.string().optional(),
  areaOfOperation: z.string().optional()
})

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
      cnpj: formData.get('cnpj') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      state: formData.get('state') as string,
    }

    console.log('Raw form data:', rawData)

    // Validar que ao menos um documento (CPF ou CNPJ) foi fornecido
    if (!rawData.cpf && !rawData.cnpj) {
      return { success: false, error: 'CPF ou CNPJ é obrigatório' }
    }

    const validatedData = registerClientSchema.parse(rawData)

    // Clean masks - apenas para o documento que foi fornecido
    const cpf = rawData.cpf && validatedData.cpf ? removeMask(validatedData.cpf) : null
    const cnpj = rawData.cnpj && validatedData.cnpj ? removeMask(validatedData.cnpj) : null
    const phone = removeMask(validatedData.phone)

    console.log('Cleaned data:', { cpf, cnpj, phone })

    // Usar createServerClient que usa a anon key
    const supabase = await createServerClient()

    console.log('Creating client with server client...')
    
    // Criar usuário usando signUp normal (com anon key)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          full_name: validatedData.fullName,
          cpf: cpf,
          cnpj: cnpj,
          whatsapp_number: phone
        }
      }
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

    // Extrair coordenadas se fornecidas
    const latitude = formData.get('latitude') as string
    const longitude = formData.get('longitude') as string

    // Preparar dados para inserção
    const insertData: any = {
      id: authData.user.id,
      role: 'client',
      full_name: validatedData.fullName,
      email: validatedData.email,
      cpf: cpf,
      cnpj: cnpj,
      whatsapp_number: phone,
      address: rawData.address,
      state: rawData.state
    }

    // Adicionar coordenadas se disponíveis
    if (latitude && longitude) {
      insertData.latitude = parseFloat(latitude)
      insertData.longitude = parseFloat(longitude)
      insertData.raio_atuacao = 50 // Valor padrão para clientes
    }

    // Inserir manualmente na tabela users com role 'client'
    const { error: insertError } = await supabase
      .from('users')
      .insert(insertData)

    if (insertError) {
      console.error('User profile creation error:', insertError)
      
      // Se falhar ao criar o perfil, tentar deletar o usuário criado
      try {
        const supabaseAdmin = createAdminClient()
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      } catch (deleteError) {
        console.error('Error deleting user after profile creation failure:', deleteError)
      }
      
      return { success: false, error: 'Erro ao criar perfil do usuário' }
    }

    console.log('Client registration completed successfully')
    
    // Fazer login automático após cadastro bem-sucedido
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    })

    if (signInError || !signInData.user) {
      console.error('Auto-login error after registration:', signInError)
      // Mesmo com erro no login automático, o cadastro foi bem-sucedido
      return { 
        success: true, 
        data: { 
          message: 'Conta criada com sucesso! Faça login para continuar.',
          requiresLogin: true
        } 
      }
    }

    console.log('Auto-login successful for client:', signInData.user.id)
    
    // Revalidar cache após login
    revalidatePath('/', 'layout')
    revalidatePath('/auth/login', 'page')
    
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
  
  // Usar redirect para forçar navegação e estabelecer sessão
  console.log('Redirecting to home page...')
  redirect('/')
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
      address: formData.get('address') as string,
      state: formData.get('state') as string,
    }

    console.log('Raw provider form data:', rawData)

    const validatedData = registerProviderSchema.parse(rawData)

    // Clean masks
    const cnpj = removeMask(validatedData.cnpj)
    const phone = removeMask(validatedData.phone)

    console.log('Cleaned provider data:', { cnpj, phone })

    // Usar createServerClient que usa a anon key
    const supabase = await createServerClient()

    console.log('Creating provider with server client...')
    
    // Criar usuário usando signUp normal (com anon key)
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: validatedData.email,
      password: validatedData.password,
      options: {
        data: {
          full_name: validatedData.companyName,
          organization_name: validatedData.companyName,
          cnpj: cnpj,
          whatsapp_number: phone,
          area_of_operation: validatedData.areaOfOperation
        }
      }
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

    // Extrair coordenadas se fornecidas
    const latitude = formData.get('latitude') as string
    const longitude = formData.get('longitude') as string

    // Preparar dados para inserção
    const insertData: any = {
      id: authData.user.id,
      role: 'provider',
      full_name: validatedData.companyName,
      email: validatedData.email,
      organization_name: validatedData.companyName,
      cnpj: cnpj,
      whatsapp_number: phone,
      area_of_operation: validatedData.areaOfOperation,
      address: rawData.address,
      state: rawData.state
    }

    // Adicionar coordenadas se disponíveis
    if (latitude && longitude) {
      insertData.latitude = parseFloat(latitude)
      insertData.longitude = parseFloat(longitude)
      insertData.raio_atuacao = 50 // Valor padrão para prestadores
    }

    // Inserir manualmente na tabela users com role 'provider'
    const { error: insertError } = await supabase
      .from('users')
      .insert(insertData)

    if (insertError) {
      console.error('Provider profile creation error:', insertError)
      
      // Se falhar ao criar o perfil, tentar deletar o usuário criado
      try {
        const supabaseAdmin = createAdminClient()
        await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
      } catch (deleteError) {
        console.error('Error deleting user after profile creation failure:', deleteError)
      }
      
      return { success: false, error: 'Erro ao criar perfil do prestador' }
    }

    console.log('Provider registration completed successfully')
    
    // Fazer login automático após cadastro bem-sucedido
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: validatedData.email,
      password: validatedData.password,
    })

    if (signInError || !signInData.user) {
      console.error('Auto-login error after provider registration:', signInError)
      // Mesmo com erro no login automático, o cadastro foi bem-sucedido
      return { 
        success: true, 
        data: { 
          message: 'Conta criada com sucesso! Faça login para continuar.',
          requiresLogin: true
        } 
      }
    }

    console.log('Auto-login successful for provider:', signInData.user.id)
    
    // Revalidar cache após login
    revalidatePath('/', 'layout')
    revalidatePath('/auth/login', 'page')
    
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
  
  // Usar redirect para forçar navegação e estabelecer sessão
  console.log('Redirecting to provider dashboard...')
  redirect('/dashboard/prestador')
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

    // Check for returnUrl parameter
    const returnUrl = formData.get('returnUrl') as string
    
    // Determine redirect URL based on user role or returnUrl
    let redirectTo = '/' // Página principal por padrão
    
    if (returnUrl && returnUrl.trim() !== '') {
      // Validate returnUrl to prevent open redirect attacks
      const url = new URL(returnUrl, process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000')
      const allowedHosts = [
        'localhost:3000',
        'https://be-fest-api.onrender.com',
        process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, '') || ''
      ]
      
      if (allowedHosts.includes(url.host)) {
        redirectTo = returnUrl
      } else {
        // If returnUrl is invalid, use default redirect
        if (user.role === 'provider') {
          redirectTo = '/dashboard/prestador'
        } else if (user.role === 'admin') {
          redirectTo = '/admin'
        } else {
          redirectTo = '/' // Página principal para clientes
        }
      }
    } else {
      // No returnUrl, use default redirect based on role
      if (user.role === 'provider') {
        redirectTo = '/dashboard/prestador'
      } else if (user.role === 'admin') {
        redirectTo = '/admin'
      } else {
        redirectTo = '/' // Página principal para clientes
      }
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

// Upload de banner do perfil do prestador
export async function uploadBannerImageAction(formData: FormData): Promise<ActionResult<string>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const file = formData.get('image') as File | null
    if (!file) {
      return { success: false, error: 'Arquivo de imagem não fornecido' }
    }

    const supabase = await createServerClient()

    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}.${fileExt}`
    const filePath = `${user.id}/banners/${fileName}`

    const { error: uploadError } = await supabase.storage
      .from('be-fest-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
        contentType: file.type || 'image/jpeg'
      })

    if (uploadError) {
      console.error('Erro no upload do banner:', uploadError)
      return { success: false, error: 'Erro ao fazer upload do banner' }
    }

    // Obter URL pública
    const { data: { publicUrl } } = supabase.storage
      .from('be-fest-images')
      .getPublicUrl(filePath)

    return { success: true, data: publicUrl }
  } catch (error) {
    console.error('Banner image upload failed:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro inesperado no upload do banner'
    }
  }
}

// Deletar banner do storage (opcional)
export async function deleteBannerImageAction(imageUrl: string): Promise<ActionResult<void>> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    const supabase = await createServerClient()
    const url = new URL(imageUrl)
    const parts = url.pathname.split('/')
    const fileName = parts[parts.length - 1]
    const filePath = `${user.id}/banners/${fileName}`

    const { error } = await supabase.storage
      .from('be-fest-images')
      .remove([filePath])

    if (error) {
      console.error('Erro ao deletar banner:', error)
      return { success: false, error: 'Erro ao deletar banner' }
    }

    return { success: true }
  } catch (error) {
    console.error('Banner image deletion failed:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Erro inesperado ao deletar banner' }
  }
}

// Esquema para atualização de perfil do prestador
const updateProviderProfileSchema = z.object({
  organization_name: z.string().min(1, 'Nome da empresa é obrigatório').optional(),
  organization_description: z.string().optional(),
  full_name: z.string().min(1, 'Nome é obrigatório').optional(),
  whatsapp_number: z.string().min(8, 'Telefone deve ter pelo menos 8 dígitos').optional(),
  area_of_operation: z.string().min(1, 'Subcategoria é obrigatória').optional(),
  address: z.string().min(1, 'Endereço é obrigatório').optional(),
  cnpj: z.string().min(11, 'CNPJ deve ter pelo menos 11 dígitos').optional(),
  profile_image: z.string().url('URL da imagem inválida').optional().or(z.literal('')),
  profile_banner_url: z.string().url('URL do banner inválida').optional().or(z.literal(''))
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
      'organization_description',
      'full_name', 
      'whatsapp_number',
      'area_of_operation',
      'address',
      'cnpj',
      'profile_image',
      'profile_banner_url'
    ]
    
    fields.forEach(field => {
      const value = formData.get(field) as string
      if (value && value.trim() !== '') {
        rawData[field] = value.trim()
      }
    })

    // Extrair coordenadas se fornecidas
    const latitude = formData.get('latitude') as string
    const longitude = formData.get('longitude') as string
    const raio_atuacao = formData.get('raio_atuacao') as string

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

    if (validatedData.organization_description !== undefined) {
      updateData.organization_description = validatedData.organization_description
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

    if (validatedData.address) {
      updateData.address = validatedData.address
    }

    if (validatedData.cnpj) {
      updateData.cnpj = removeMask(validatedData.cnpj)
    }

    if (validatedData.profile_image) {
      updateData.profile_image = validatedData.profile_image
    }

    if (validatedData.profile_banner_url !== undefined) {
      updateData.profile_banner_url = validatedData.profile_banner_url
    }

    // Atualizar coordenadas se fornecidas
    if (latitude && longitude) {
      updateData.latitude = parseFloat(latitude)
      updateData.longitude = parseFloat(longitude)
      updateData.raio_atuacao = raio_atuacao ? parseInt(raio_atuacao) : 50
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

// Esquema para alteração de senha
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória'),
  newPassword: z.string().min(8, 'Nova senha deve ter pelo menos 8 caracteres'),
  confirmPassword: z.string().min(1, 'Confirmação de senha é obrigatória')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Nova senha e confirmação não coincidem",
  path: ["confirmPassword"],
})

export async function changePasswordAction(formData: FormData): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return { success: false, error: 'Usuário não autenticado' }
    }

    // Parse and validate form data
    const rawData = {
      currentPassword: formData.get('currentPassword') as string,
      newPassword: formData.get('newPassword') as string,
      confirmPassword: formData.get('confirmPassword') as string,
    }

    const validatedData = changePasswordSchema.parse(rawData)
    const supabase = await createServerClient()

    // Verificar senha atual
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email!,
      password: validatedData.currentPassword,
    })

    if (signInError) {
      return { success: false, error: 'Senha atual incorreta' }
    }

    // Alterar senha
    const { error: updateError } = await supabase.auth.updateUser({
      password: validatedData.newPassword
    })

    if (updateError) {
      console.error('Error updating password:', updateError)
      return { success: false, error: 'Erro ao alterar senha' }
    }

    return { 
      success: true, 
      data: { message: 'Senha alterada com sucesso!' } 
    }

  } catch (error) {
    console.error('Change password failed:', error)
    
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return { success: false, error: firstError.message }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Ocorreu um erro ao alterar a senha' 
    }
  }
}