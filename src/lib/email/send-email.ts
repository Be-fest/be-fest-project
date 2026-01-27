import { createServerClient } from '@/lib/supabase/server'

interface SendEmailParams {
    to: string
    templateType: 'welcome_client' | 'welcome_provider'
    variables: {
        nome: string
        email: string
        data_cadastro: string
    }
}

interface EmailResult {
    success: boolean
    error?: string
}

/**
 * Replace template variables with actual values
 */
function replaceVariables(template: string, variables: Record<string, string>): string {
    let result = template
    for (const [key, value] of Object.entries(variables)) {
        result = result.replace(new RegExp(`{{${key}}}`, 'g'), value)
    }
    return result
}

/**
 * Send welcome email to new user
 */
export async function sendWelcomeEmail(params: SendEmailParams): Promise<EmailResult> {
    try {
        const { to, templateType, variables } = params

        // Get template from database
        const supabase = await createServerClient()
        const { data: template, error: templateError } = await supabase
            .from('email_templates')
            .select('*')
            .eq('type', templateType)
            .eq('is_active', true)
            .single()

        if (templateError || !template) {
            console.log(`Email template ${templateType} not found or inactive, skipping email`)
            return { success: true } // Return success to not block registration
        }

        // Replace variables in subject and content
        const subject = replaceVariables(template.subject, variables)
        const htmlContent = replaceVariables(template.content, variables)

        // Check if Resend API key is configured
        const resendApiKey = process.env.RESEND_API_KEY

        if (!resendApiKey) {
            console.log('RESEND_API_KEY not configured, skipping email send')
            console.log('Would send email to:', to)
            console.log('Subject:', subject)
            // In development, just log and return success
            return { success: true }
        }

        // Send email via Resend
        const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${resendApiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                from: process.env.RESEND_FROM_EMAIL || 'Be Fest <noreply@befest.com.br>',
                to: [to],
                subject: subject,
                html: htmlContent
            })
        })

        if (!response.ok) {
            const errorData = await response.json()
            console.error('Resend API error:', errorData)
            return {
                success: false,
                error: errorData.message || 'Erro ao enviar email'
            }
        }

        const data = await response.json()
        console.log('Email sent successfully:', data.id)

        return { success: true }
    } catch (error) {
        console.error('Send email error:', error)
        // Don't block registration if email fails
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Erro ao enviar email'
        }
    }
}

/**
 * Send welcome email to new client
 */
export async function sendWelcomeClientEmail(
    email: string,
    fullName: string
): Promise<EmailResult> {
    return sendWelcomeEmail({
        to: email,
        templateType: 'welcome_client',
        variables: {
            nome: fullName,
            email: email,
            data_cadastro: new Date().toLocaleDateString('pt-BR')
        }
    })
}

/**
 * Send welcome email to new provider
 */
export async function sendWelcomeProviderEmail(
    email: string,
    fullName: string
): Promise<EmailResult> {
    return sendWelcomeEmail({
        to: email,
        templateType: 'welcome_provider',
        variables: {
            nome: fullName,
            email: email,
            data_cadastro: new Date().toLocaleDateString('pt-BR')
        }
    })
}
