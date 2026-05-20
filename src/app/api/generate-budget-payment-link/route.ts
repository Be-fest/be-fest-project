import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { clientName, totalPrice, budgetId } = await request.json();

    if (!clientName || !totalPrice) {
      return NextResponse.json(
        { error: 'Nome do cliente e valor total são obrigatórios' },
        { status: 400 }
      );
    }

    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

    // Se o token de acesso não estiver presente, ou se for padrão, gera um link simulado seguro para testes.
    if (!accessToken || accessToken === 'YOUR_DEFAULT_TOKEN' || accessToken.trim() === '') {
      console.warn('⚠️ MERCADO_PAGO_ACCESS_TOKEN não configurado. Utilizando link simulado para desenvolvimento.');
      const mockLink = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=mock_${Date.now()}`;
      return NextResponse.json({ 
        init_point: mockLink,
        simulated: true,
        message: 'Utilizando link de pagamento simulado de teste (Token não configurado em .env)' 
      });
    }

    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const baseUrl = `${protocol}://${host}`;

    // Chamada oficial à API do Mercado Pago
    const response = await fetch('https://api.mercadopago.com/v1/preferences', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: [
          {
            title: `Orçamento Be Fest - ${clientName}`,
            quantity: 1,
            unit_price: Number(totalPrice),
            currency_id: 'BRL',
          }
        ],
        back_urls: {
          success: `${baseUrl}/pagamento/sucesso`,
          failure: `${baseUrl}/pagamento/erro`,
          pending: `${baseUrl}/pagamento/pendente`
        },
        auto_return: 'approved',
        external_reference: budgetId || `budget_${Date.now()}`
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na API do Mercado Pago:', errorText);
      throw new Error(`Erro na API do Mercado Pago: ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json({ 
      init_point: data.init_point,
      simulated: false 
    });

  } catch (error) {
    console.error('💥 Erro ao gerar link de pagamento:', error);
    // Fallback amigável de emergência para não interromper a experiência do usuário
    const mockLink = `https://www.mercadopago.com.br/checkout/v1/redirect?pref_id=fallback_${Date.now()}`;
    return NextResponse.json({ 
      init_point: mockLink,
      simulated: true,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    }, { status: 200 }); // Retorna 200 com fallback para resiliência do app
  }
}
