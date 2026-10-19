import { NextRequest, NextResponse } from 'next/server'
import { updateRecipientPreferences } from '@/lib/festmensages/engine'

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get('email')
  const userId = request.nextUrl.searchParams.get('userId')

  if (!email && !userId) {
    return new NextResponse(
      `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Descadastro — Be Fest</title></head>
      <body style="font-family:sans-serif;background:#f9fafb;padding:40px;text-align:center;">
        <div style="max-width:480px;margin:0 auto;background:#fff;padding:32px;border-radius:16px;box-shadow:0 2px 10px rgba(0,0,0,0.06);">
          <h2 style="color:#520029;">Gerenciar Comunicações Be Fest</h2>
          <p style="color:#4b5563;">Informe um e-mail válido no link de descadastro para atualizar suas preferências promocionais.</p>
        </div>
      </body></html>`,
      { status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
    )
  }

  await updateRecipientPreferences({
    userId,
    email,
    unsubscribeAllPromotional: true,
    reason: 'Opt-out via link LGPD'
  })

  return new NextResponse(
    `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"><title>Descadastro Confirmado — Be Fest</title></head>
    <body style="font-family:sans-serif;background:#f9fafb;padding:40px;text-align:center;">
      <div style="max-width:480px;margin:0 auto;background:#fff;padding:32px;border-radius:16px;box-shadow:0 2px 10px rgba(0,0,0,0.06);">
        <h2 style="color:#7c3aed;">Descadastro Realizado com Sucesso ✅</h2>
        <p style="color:#374151;">O endereço <strong>${email || userId}</strong> foi removido das nossas listas de campanhas promocionais e sazonais, em conformidade com a LGPD.</p>
        <p style="color:#6b7280;font-size:13px;">Nota: Avisos estritamente operacionais sobre pedidos e reservas em andamento continuam ativos para sua segurança.</p>
        <a href="/" style="display:inline-block;margin-top:16px;padding:10px 20px;background:#FF0080;color:#fff;text-decoration:none;border-radius:8px;font-weight:bold;">Voltar para a Be Fest</a>
      </div>
    </body></html>`,
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  )
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, userId, reason } = body || {}

    if (!email && !userId) {
      return NextResponse.json(
        { success: false, error: 'E-mail ou ID do usuário é obrigatório' },
        { status: 400 }
      )
    }

    const updated = await updateRecipientPreferences({
      userId,
      email,
      unsubscribeAllPromotional: true,
      reason: reason || 'Opt-out via API LGPD'
    })

    return NextResponse.json({
      success: true,
      preferences: updated
    })
  } catch {
    return NextResponse.json(
      { success: false, error: 'Erro ao processar descadastro' },
      { status: 500 }
    )
  }
}
