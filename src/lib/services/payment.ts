// Serviço para integração com a API de pagamento
export interface PaymentLinkRequest {
  event_id?: string;
  service_ids?: string[];
  event_service_id?: string;
}

export interface EventDetails {
  id: string;
  title: string;
  event_date: string;
  start_time: string | null;
  location: string | null;
  full_guests: number;
  half_guests: number;
  free_guests: number;
  total_guests: number;
}

export interface ServiceProvider {
  id: string;
  name: string;
}

export interface ServiceDetail {
  id: string;
  name: string;
  description: string | null;
  category: string;
  images_urls: string[] | null;
  min_guests: number;
  max_guests: number | null;
  price_per_guest: number;
  service_value: number;
  provider: ServiceProvider;
  event_service_id: string;
}

export interface Pricing {
  subtotal: number;
  befest_fee: number;
  total: number;
  fee_percentage: number;
}

export interface PaymentLinkResponse {
  preference_id: string;
  init_point: string; // Link de produção - sempre usado
  sandbox_init_point: string; // Link de sandbox - não usado mais
  event: EventDetails;
  services: ServiceDetail[];
  pricing: Pricing;
  services_count: number;
  event_service_ids: string[];
  service_names: string[];
}

export interface PaymentError {
  message: string;
}

function getApiBaseUrl(): string {
  if (process.env.NODE_ENV === 'development') {
    return 'https://be-fest-api.onrender.com';
  }
  
  return process.env.NEXT_PUBLIC_API_URL || 'https://be-fest-api.onrender.com';
}

export async function generatePaymentLink(
  request: PaymentLinkRequest
): Promise<PaymentLinkResponse> {
  try {
    const apiUrl = getApiBaseUrl();
    console.log('🌐 Fazendo requisição para:', `${apiUrl}/generate-link`);
    console.log('📦 Dados enviados:', request);
    
    const requestBody = {
      event_id: request.event_id,
      service_ids: request.service_ids || []
    };
    
    console.log('🔍 Request body final:', JSON.stringify(requestBody, null, 2));
    
    try {
      JSON.parse(JSON.stringify(requestBody));
      console.log('✅ JSON válido');
    } catch (jsonError) {
      console.error('❌ JSON inválido:', jsonError);
      throw new Error('JSON inválido');
    }
    
    const response = await fetch(`${apiUrl}/generate-link`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify(requestBody),
      mode: 'cors',
      credentials: 'omit',
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na resposta da API:', response.status, errorText);
      throw new Error(`Erro ${response.status}: ${errorText}`);
    }

    const data = await response.json();
    console.log('✅ Resposta da API:', data);

    return data as PaymentLinkResponse;
  } catch (error) {
    console.error('❌ Erro ao gerar link de pagamento:', error);
    throw error;
  }
}

// Função para redirecionar para o pagamento
export function redirectToPayment(paymentData: PaymentLinkResponse) {
  // Sempre usar o link de produção (init_point)
  const paymentUrl = paymentData.init_point;
  
  console.log('🔗 Redirecionando para:', paymentUrl);
  window.location.href = paymentUrl;
} 