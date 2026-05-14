'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'
import { Budget, BudgetInsert, BudgetUpdate } from '@/types/database'

type ActionResult<T = any> = {
  success: boolean
  error?: string
  data?: T
}

async function getCurrentUser() {
  const supabase = await createServerClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new Error('Usuário não autenticado')
  }
  
  return user
}

export async function saveBudgetAction(budgetData: BudgetInsert): Promise<ActionResult<Budget>> {
  try {
    const user = await getCurrentUser()
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('budgets')
      .upsert({
        ...budgetData,
        provider_id: user.id
      })
      .select()
      .single()

    if (error) {
      console.error('Error saving budget:', error)
      return { success: false, error: 'Erro ao salvar orçamento' }
    }

    revalidatePath('/dashboard/prestador')
    return { success: true, data }
  } catch (error) {
    console.error('Budget save failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao salvar orçamento' 
    }
  }
}

export async function getProviderBudgetsAction(): Promise<ActionResult<Budget[]>> {
  try {
    const user = await getCurrentUser()
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('provider_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching budgets:', error)
      return { success: false, error: 'Erro ao buscar orçamentos' }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Budget fetch failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao buscar orçamentos' 
    }
  }
}

export async function updateBudgetStatusAction(id: string, status: 'draft' | 'sent' | 'paid'): Promise<ActionResult<Budget>> {
  try {
    const user = await getCurrentUser()
    const supabase = await createServerClient()

    const { data, error } = await supabase
      .from('budgets')
      .update({ status })
      .eq('id', id)
      .eq('provider_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('Error updating budget status:', error)
      return { success: false, error: 'Erro ao atualizar status do orçamento' }
    }

    revalidatePath('/dashboard/prestador')
    return { success: true, data }
  } catch (error) {
    console.error('Budget status update failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao atualizar status' 
    }
  }
}

export async function deleteBudgetAction(id: string): Promise<ActionResult> {
  try {
    const user = await getCurrentUser()
    const supabase = await createServerClient()

    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id)
      .eq('provider_id', user.id)

    if (error) {
      console.error('Error deleting budget:', error)
      return { success: false, error: 'Erro ao excluir orçamento' }
    }

    revalidatePath('/dashboard/prestador')
    return { success: true }
  } catch (error) {
    console.error('Budget deletion failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro ao excluir orçamento' 
    }
  }
}
