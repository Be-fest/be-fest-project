'use server'

import { revalidatePath } from 'next/cache'
import { createServerClient } from '@/lib/supabase/server'

// Types
export interface EmailTemplate {
    id: string
    type: string
    subject: string
    content: string
    is_active: boolean
    created_at: string
    updated_at: string
}

type ActionResult<T = any> = {
    success: boolean
    error?: string
    data?: T
}

/**
 * Get all email templates
 */
export async function getEmailTemplatesAction(): Promise<ActionResult<EmailTemplate[]>> {
    try {
        const supabase = await createServerClient()

        const { data, error } = await supabase
            .from('email_templates')
            .select('*')
            .order('type', { ascending: true })

        if (error) {
            console.error('Error fetching email templates:', error)
            return { success: false, error: 'Erro ao buscar templates de email' }
        }

        return { success: true, data: data || [] }
    } catch (error) {
        console.error('Email templates fetch failed:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erro ao buscar templates'
        }
    }
}

/**
 * Get email template by type
 */
export async function getEmailTemplateByTypeAction(type: string): Promise<ActionResult<EmailTemplate>> {
    try {
        const supabase = await createServerClient()

        const { data, error } = await supabase
            .from('email_templates')
            .select('*')
            .eq('type', type)
            .single()

        if (error) {
            console.error('Error fetching email template:', error)
            return { success: false, error: 'Template não encontrado' }
        }

        return { success: true, data }
    } catch (error) {
        console.error('Email template fetch failed:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erro ao buscar template'
        }
    }
}

/**
 * Update email template
 */
export async function updateEmailTemplateAction(
    id: string,
    subject: string,
    content: string
): Promise<ActionResult> {
    try {
        const supabase = await createServerClient()

        // Validate inputs
        if (!id || !subject.trim() || !content.trim()) {
            return { success: false, error: 'Dados inválidos' }
        }

        const { error } = await supabase
            .from('email_templates')
            .update({
                subject: subject.trim(),
                content: content.trim()
            })
            .eq('id', id)

        if (error) {
            console.error('Error updating email template:', error)
            return { success: false, error: 'Erro ao atualizar template' }
        }

        revalidatePath('/admin/emails')
        return { success: true }
    } catch (error) {
        console.error('Email template update failed:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erro ao atualizar template'
        }
    }
}

/**
 * Toggle email template active status
 */
export async function toggleEmailTemplateActiveAction(id: string): Promise<ActionResult> {
    try {
        const supabase = await createServerClient()

        // First get current status
        const { data: template, error: fetchError } = await supabase
            .from('email_templates')
            .select('is_active')
            .eq('id', id)
            .single()

        if (fetchError || !template) {
            return { success: false, error: 'Template não encontrado' }
        }

        // Toggle status
        const { error } = await supabase
            .from('email_templates')
            .update({ is_active: !template.is_active })
            .eq('id', id)

        if (error) {
            console.error('Error toggling email template:', error)
            return { success: false, error: 'Erro ao alterar status do template' }
        }

        revalidatePath('/admin/emails')
        return { success: true }
    } catch (error) {
        console.error('Email template toggle failed:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erro ao alterar status'
        }
    }
}

/**
 * Send test email
 */
export async function sendTestEmailAction(templateType: string, testEmail: string): Promise<ActionResult> {
    try {
        // Import sendWelcomeEmail dynamically to avoid circular dependencies
        const { sendWelcomeEmail } = await import('@/lib/email/send-email')

        const result = await sendWelcomeEmail({
            to: testEmail,
            templateType: templateType as 'welcome_client' | 'welcome_provider',
            variables: {
                nome: 'Usuário Teste',
                email: testEmail,
                data_cadastro: new Date().toLocaleDateString('pt-BR')
            }
        })

        return result
    } catch (error) {
        console.error('Test email send failed:', error)
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erro ao enviar email de teste'
        }
    }
}
