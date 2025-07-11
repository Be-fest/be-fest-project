'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { createServerClient } from '@/lib/supabase/server'
import { 
  ServiceGuestTier, 
  ServiceGuestTierInsert, 
  ServiceGuestTierUpdate,
  ServiceAgePricingRule, 
  ServiceAgePricingRuleInsert, 
  ServiceAgePricingRuleUpdate,
  ServiceDateSurcharge, 
  ServiceDateSurchargeInsert, 
  ServiceDateSurchargeUpdate 
} from '@/types/database'

// Validation schemas for Guest Tiers
const createGuestTierSchema = z.object({
  service_id: z.string().uuid('ID do serviço inválido'),
  min_total_guests: z.coerce.number().min(0, 'Número mínimo deve ser maior ou igual a 0'),
  max_total_guests: z.coerce.number().min(1, 'Número máximo deve ser maior que 0').optional().nullable(),
  base_price_per_adult: z.coerce.number().min(0, 'Preço deve ser maior ou igual a 0'),
  tier_description: z.string().max(200, 'Descrição deve ter no máximo 200 caracteres').optional().nullable()
}).refine(data => {
  if (data.max_total_guests && data.min_total_guests >= data.max_total_guests) {
    return false
  }
  return true
}, {
  message: 'Número máximo deve ser maior que o mínimo',
  path: ['max_total_guests']
})

const updateGuestTierSchema = z.object({
  id: z.string().uuid('ID inválido'),
  min_total_guests: z.coerce.number().min(0, 'Número mínimo deve ser maior ou igual a 0').optional(),
  max_total_guests: z.coerce.number().min(1, 'Número máximo deve ser maior que 0').optional().nullable(),
  base_price_per_adult: z.coerce.number().min(0, 'Preço deve ser maior ou igual a 0').optional(),
  tier_description: z.string().max(200, 'Descrição deve ter no máximo 200 caracteres').optional().nullable()
})

// Validation schemas for Age Pricing Rules
const createAgePricingRuleSchema = z.object({
  service_id: z.string().uuid('ID do serviço inválido'),
  rule_description: z.string().min(1, 'Descrição é obrigatória').max(200, 'Descrição deve ter no máximo 200 caracteres'),
  age_min_years: z.coerce.number().min(0, 'Idade mínima deve ser maior ou igual a 0'),
  age_max_years: z.coerce.number().min(0, 'Idade máxima deve ser maior ou igual a 0').optional().nullable(),
  pricing_method: z.enum(['fixed', 'percentage']),
  value: z.coerce.number().min(0, 'Valor deve ser maior ou igual a 0')
}).refine(data => {
  if (data.age_max_years && data.age_min_years >= data.age_max_years) {
    return false
  }
  return true
}, {
  message: 'Idade máxima deve ser maior que a mínima',
  path: ['age_max_years']
})

const updateAgePricingRuleSchema = z.object({
  id: z.string().uuid('ID inválido'),
  rule_description: z.string().min(1, 'Descrição é obrigatória').max(200, 'Descrição deve ter no máximo 200 caracteres').optional(),
  age_min_years: z.coerce.number().min(0, 'Idade mínima deve ser maior ou igual a 0').optional(),
  age_max_years: z.coerce.number().min(0, 'Idade máxima deve ser maior ou igual a 0').optional().nullable(),
  pricing_method: z.enum(['fixed', 'percentage']).optional(),
  value: z.coerce.number().min(0, 'Valor deve ser maior ou igual a 0').optional()
})

// Validation schemas for Date Surcharges
const createDateSurchargeSchema = z.object({
  service_id: z.string().uuid('ID do serviço inválido'),
  surcharge_description: z.string().min(1, 'Descrição é obrigatória').max(200, 'Descrição deve ter no máximo 200 caracteres'),
  start_date: z.string().min(1, 'Data de início é obrigatória'),
  end_date: z.string().min(1, 'Data de fim é obrigatória'),
  surcharge_type: z.enum(['fixed', 'percentage']),
  surcharge_value: z.coerce.number().min(0, 'Valor deve ser maior ou igual a 0')
}).refine(data => {
  const startDate = new Date(data.start_date)
  const endDate = new Date(data.end_date)
  return startDate <= endDate
}, {
  message: 'Data de fim deve ser posterior à data de início',
  path: ['end_date']
})

const updateDateSurchargeSchema = z.object({
  id: z.string().uuid('ID inválido'),
  surcharge_description: z.string().min(1, 'Descrição é obrigatória').max(200, 'Descrição deve ter no máximo 200 caracteres').optional(),
  start_date: z.string().min(1, 'Data de início é obrigatória').optional(),
  end_date: z.string().min(1, 'Data de fim é obrigatória').optional(),
  surcharge_type: z.enum(['fixed', 'percentage']).optional(),
  surcharge_value: z.coerce.number().min(0, 'Valor deve ser maior ou igual a 0').optional()
})

// Result types
type ActionResult<T = any> = {
  success: boolean
  error?: string
  data?: T
}

// Helper function to get current user
async function getCurrentUser() {
  const supabase = await createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new Error('Usuário não autenticado')
  }
  
  return user
}

// Helper function to verify service ownership
async function verifyServiceOwnership(serviceId: string, userId: string) {
  const supabase = await createServerClient()
  
  const { data: service } = await supabase
    .from('services')
    .select('provider_id')
    .eq('id', serviceId)
    .single()

  if (!service || service.provider_id !== userId) {
    throw new Error('Serviço não encontrado ou acesso negado')
  }
  
  return service
}

// ================================================================
// GUEST TIERS ACTIONS
// ================================================================

export async function getServiceGuestTiersAction(serviceId: string): Promise<ActionResult<ServiceGuestTier[]>> {
  try {
    const supabase = await createServerClient()
    
    const { data: tiers, error } = await supabase
      .from('service_guest_tiers')
      .select('*')
      .eq('service_id', serviceId)
      .order('min_total_guests', { ascending: true })

    if (error) {
      console.error('Error fetching guest tiers:', error)
      return { success: false, error: 'Erro ao buscar faixas de convidados' }
    }

    return { success: true, data: tiers }
  } catch (error) {
    console.error('Guest tiers fetch failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao buscar faixas de convidados' 
    }
  }
}

export async function createGuestTierAction(formData: FormData): Promise<ActionResult<ServiceGuestTier>> {
  try {
    const user = await getCurrentUser()
    
    const rawData = {
      service_id: formData.get('service_id') as string,
      min_total_guests: formData.get('min_total_guests') as string,
      max_total_guests: formData.get('max_total_guests') as string || null,
      base_price_per_adult: formData.get('base_price_per_adult') as string,
      tier_description: formData.get('tier_description') as string || null
    }

    const validatedData = createGuestTierSchema.parse(rawData)
    const supabase = await createServerClient()

    // Verificar se o serviço pertence ao usuário
    await verifyServiceOwnership(validatedData.service_id, user.id)

    // Verificar se não há sobreposição com outras faixas
    const { data: existingTiers } = await supabase
      .from('service_guest_tiers')
      .select('min_total_guests, max_total_guests')
      .eq('service_id', validatedData.service_id)

    if (existingTiers) {
      for (const tier of existingTiers) {
        const tierMax = tier.max_total_guests || Infinity
        const newMax = validatedData.max_total_guests || Infinity
        
        // Verificar sobreposição
        if (
          (validatedData.min_total_guests >= tier.min_total_guests && validatedData.min_total_guests < tierMax) ||
          (newMax > tier.min_total_guests && validatedData.min_total_guests < tier.min_total_guests)
        ) {
          return { success: false, error: 'Esta faixa de convidados se sobrepõe a uma faixa existente' }
        }
      }
    }

    const { data: tier, error } = await supabase
      .from('service_guest_tiers')
      .insert([validatedData])
      .select()
      .single()

    if (error) {
      console.error('Error creating guest tier:', error)
      return { success: false, error: 'Erro ao criar faixa de convidados' }
    }

    revalidatePath('/dashboard/prestador')
    
    return { success: true, data: tier }
  } catch (error) {
    console.error('Guest tier creation failed:', error)
    
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return { success: false, error: firstError.message }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao criar faixa de convidados' 
    }
  }
}

export async function updateGuestTierAction(formData: FormData): Promise<ActionResult<ServiceGuestTier>> {
  try {
    const user = await getCurrentUser()
    
    const rawData = {
      id: formData.get('id') as string,
      min_total_guests: formData.get('min_total_guests') as string,
      max_total_guests: formData.get('max_total_guests') as string || null,
      base_price_per_adult: formData.get('base_price_per_adult') as string,
      tier_description: formData.get('tier_description') as string || null
    }

    const validatedData = updateGuestTierSchema.parse(rawData)
    const supabase = await createServerClient()

    // Verificar se a faixa existe e pertence ao usuário
    const { data: existingTier } = await supabase
      .from('service_guest_tiers')
      .select('service_id')
      .eq('id', validatedData.id)
      .single()

    if (!existingTier) {
      return { success: false, error: 'Faixa de convidados não encontrada' }
    }

    await verifyServiceOwnership(existingTier.service_id, user.id)

    const updateData: Partial<ServiceGuestTierUpdate> = {}
    
    if (validatedData.min_total_guests !== undefined) {
      updateData.min_total_guests = validatedData.min_total_guests
    }
    if (validatedData.max_total_guests !== undefined) {
      updateData.max_total_guests = validatedData.max_total_guests === null ? undefined : validatedData.max_total_guests
    }
    if (validatedData.base_price_per_adult !== undefined) {
      updateData.base_price_per_adult = validatedData.base_price_per_adult
    }
    if (validatedData.tier_description !== undefined) {
      updateData.tier_description = validatedData.tier_description === null ? undefined : validatedData.tier_description
    }

    const { data: tier, error } = await supabase
      .from('service_guest_tiers')
      .update(updateData)
      .eq('id', validatedData.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating guest tier:', error)
      return { success: false, error: 'Erro ao atualizar faixa de convidados' }
    }

    revalidatePath('/dashboard/prestador')
    
    return { success: true, data: tier }
  } catch (error) {
    console.error('Guest tier update failed:', error)
    
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return { success: false, error: firstError.message }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao atualizar faixa de convidados' 
    }
  }
}

export async function deleteGuestTierAction(tierId: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    const supabase = await createServerClient()

    // Verificar se a faixa existe e pertence ao usuário
    const { data: existingTier } = await supabase
      .from('service_guest_tiers')
      .select('service_id')
      .eq('id', tierId)
      .single()

    if (!existingTier) {
      return { success: false, error: 'Faixa de convidados não encontrada' }
    }

    await verifyServiceOwnership(existingTier.service_id, user.id)

    const { error } = await supabase
      .from('service_guest_tiers')
      .delete()
      .eq('id', tierId)

    if (error) {
      console.error('Error deleting guest tier:', error)
      return { success: false, error: 'Erro ao excluir faixa de convidados' }
    }

    revalidatePath('/dashboard/prestador')
    
    return { success: true }
  } catch (error) {
    console.error('Guest tier deletion failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao excluir faixa de convidados' 
    }
  }
}

// ================================================================
// AGE PRICING RULES ACTIONS
// ================================================================

export async function getServiceAgePricingRulesAction(serviceId: string): Promise<ActionResult<ServiceAgePricingRule[]>> {
  try {
    const supabase = await createServerClient()
    
    const { data: rules, error } = await supabase
      .from('service_age_pricing_rules')
      .select('*')
      .eq('service_id', serviceId)
      .order('age_min_years', { ascending: true })

    if (error) {
      console.error('Error fetching age pricing rules:', error)
      return { success: false, error: 'Erro ao buscar regras de preço por idade' }
    }

    return { success: true, data: rules }
  } catch (error) {
    console.error('Age pricing rules fetch failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao buscar regras de preço por idade' 
    }
  }
}

export async function createAgePricingRuleAction(formData: FormData): Promise<ActionResult<ServiceAgePricingRule>> {
  try {
    const user = await getCurrentUser()
    
    const rawData = {
      service_id: formData.get('service_id') as string,
      rule_description: formData.get('rule_description') as string,
      age_min_years: formData.get('age_min_years') as string,
      age_max_years: formData.get('age_max_years') as string || null,
      pricing_method: formData.get('pricing_method') as string,
      value: formData.get('value') as string
    }

    const validatedData = createAgePricingRuleSchema.parse(rawData)
    const supabase = await createServerClient()

    // Verificar se o serviço pertence ao usuário
    await verifyServiceOwnership(validatedData.service_id, user.id)

    const { data: rule, error } = await supabase
      .from('service_age_pricing_rules')
      .insert([validatedData])
      .select()
      .single()

    if (error) {
      console.error('Error creating age pricing rule:', error)
      return { success: false, error: 'Erro ao criar regra de preço por idade' }
    }

    revalidatePath('/dashboard/prestador')
    
    return { success: true, data: rule }
  } catch (error) {
    console.error('Age pricing rule creation failed:', error)
    
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return { success: false, error: firstError.message }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao criar regra de preço por idade' 
    }
  }
}

export async function deleteAgePricingRuleAction(ruleId: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    const supabase = await createServerClient()

    // Verificar se a regra existe e pertence ao usuário
    const { data: existingRule } = await supabase
      .from('service_age_pricing_rules')
      .select('service_id')
      .eq('id', ruleId)
      .single()

    if (!existingRule) {
      return { success: false, error: 'Regra de preço não encontrada' }
    }

    await verifyServiceOwnership(existingRule.service_id, user.id)

    const { error } = await supabase
      .from('service_age_pricing_rules')
      .delete()
      .eq('id', ruleId)

    if (error) {
      console.error('Error deleting age pricing rule:', error)
      return { success: false, error: 'Erro ao excluir regra de preço por idade' }
    }

    revalidatePath('/dashboard/prestador')
    
    return { success: true }
  } catch (error) {
    console.error('Age pricing rule deletion failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao excluir regra de preço por idade' 
    }
  }
}

// ================================================================
// DATE SURCHARGES ACTIONS
// ================================================================

export async function getServiceDateSurchargesAction(serviceId: string): Promise<ActionResult<ServiceDateSurcharge[]>> {
  try {
    const supabase = await createServerClient()
    
    const { data: surcharges, error } = await supabase
      .from('service_date_surcharges')
      .select('*')
      .eq('service_id', serviceId)
      .order('start_date', { ascending: true })

    if (error) {
      console.error('Error fetching date surcharges:', error)
      return { success: false, error: 'Erro ao buscar sobretaxas por data' }
    }

    return { success: true, data: surcharges }
  } catch (error) {
    console.error('Date surcharges fetch failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao buscar sobretaxas por data' 
    }
  }
}

export async function createDateSurchargeAction(formData: FormData): Promise<ActionResult<ServiceDateSurcharge>> {
  try {
    const user = await getCurrentUser()
    
    const rawData = {
      service_id: formData.get('service_id') as string,
      surcharge_description: formData.get('surcharge_description') as string,
      start_date: formData.get('start_date') as string,
      end_date: formData.get('end_date') as string,
      surcharge_type: formData.get('surcharge_type') as string,
      surcharge_value: formData.get('surcharge_value') as string
    }

    const validatedData = createDateSurchargeSchema.parse(rawData)
    const supabase = await createServerClient()

    // Verificar se o serviço pertence ao usuário
    await verifyServiceOwnership(validatedData.service_id, user.id)

    const { data: surcharge, error } = await supabase
      .from('service_date_surcharges')
      .insert([validatedData])
      .select()
      .single()

    if (error) {
      console.error('Error creating date surcharge:', error)
      return { success: false, error: 'Erro ao criar sobretaxa por data' }
    }

    revalidatePath('/dashboard/prestador')
    
    return { success: true, data: surcharge }
  } catch (error) {
    console.error('Date surcharge creation failed:', error)
    
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return { success: false, error: firstError.message }
    }
    
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao criar sobretaxa por data' 
    }
  }
}

export async function deleteDateSurchargeAction(surchargeId: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    const supabase = await createServerClient()

    // Verificar se a sobretaxa existe e pertence ao usuário
    const { data: existingSurcharge } = await supabase
      .from('service_date_surcharges')
      .select('service_id')
      .eq('id', surchargeId)
      .single()

    if (!existingSurcharge) {
      return { success: false, error: 'Sobretaxa não encontrada' }
    }

    await verifyServiceOwnership(existingSurcharge.service_id, user.id)

    const { error } = await supabase
      .from('service_date_surcharges')
      .delete()
      .eq('id', surchargeId)

    if (error) {
      console.error('Error deleting date surcharge:', error)
      return { success: false, error: 'Erro ao excluir sobretaxa por data' }
    }

    revalidatePath('/dashboard/prestador')
    
    return { success: true }
  } catch (error) {
    console.error('Date surcharge deletion failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao excluir sobretaxa por data' 
    }
  }
} 