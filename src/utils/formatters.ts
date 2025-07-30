export const formatCPF = (value: string): string => {
  const numericValue = value.replace(/\D/g, '');
  
  if (numericValue.length <= 11) {
    return numericValue
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})/, '$1-$2');
  }
  
  return value;
};

export const formatCNPJ = (value: string): string => {
  const numericValue = value.replace(/\D/g, '');
  
  if (numericValue.length <= 14) {
    return numericValue
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})/, '$1-$2');
  }
  
  return value;
};

export const formatPhoneNumber = (value: string): string => {
  const numericValue = value.replace(/\D/g, '');
  
  if (numericValue.length <= 11) {
    if (numericValue.length <= 10) {
      return numericValue
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{4})(\d)/, '$1-$2');
    } else {
      return numericValue
        .replace(/(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d)/, '$1-$2');
    }
  }
  
  return value;
};

export const removeMask = (value: string): string => {
  return value.replace(/\D/g, '');
};

/**
 * Calcula o número total de convidados baseado nos diferentes tipos
 * @param fullGuests - Convidados pagando preço integral (13+ anos)
 * @param halfGuests - Convidados pagando meia entrada (6-12 anos)  
 * @param freeGuests - Convidados gratuitos (0-5 anos)
 * @returns Número total de convidados
 */
export function calculateGuestCount(
  fullGuests: number = 0, 
  halfGuests: number = 0, 
  freeGuests: number = 0
): number {
  return fullGuests + halfGuests + freeGuests;
}

/**
 * Valida se os valores de convidados são válidos
 * @param fullGuests - Convidados pagando preço integral
 * @param halfGuests - Convidados pagando meia entrada
 * @param freeGuests - Convidados gratuitos
 * @returns true se todos os valores são válidos (>= 0)
 */
export function validateGuestCounts(
  fullGuests: number, 
  halfGuests: number, 
  freeGuests: number
): boolean {
  return fullGuests >= 0 && halfGuests >= 0 && freeGuests >= 0;
}

/**
 * Formata a contagem de convidados para exibição
 * @param fullGuests - Convidados pagando preço integral
 * @param halfGuests - Convidados pagando meia entrada
 * @param freeGuests - Convidados gratuitos
 * @returns String formatada com o breakdown dos convidados
 */
export function formatGuestCountBreakdown(
  fullGuests: number, 
  halfGuests: number, 
  freeGuests: number
): string {
  const total = calculateGuestCount(fullGuests, halfGuests, freeGuests);
  const parts = [];
  
  if (fullGuests > 0) parts.push(`${fullGuests} integral`);
  if (halfGuests > 0) parts.push(`${halfGuests} meia`);
  if (freeGuests > 0) parts.push(`${freeGuests} gratuito`);
  
  return `${total} convidados${parts.length > 0 ? ` (${parts.join(', ')})` : ''}`;
}

/**
 * Calcula o valor total de um serviço baseado na lógica de full_guests e half_guests
 * @param fullGuests - Número de convidados inteiros (pagam preço cheio)
 * @param halfGuests - Número de convidados meia (pagam metade do preço)
 * @param pricePerGuest - Preço por convidado do serviço
 * @returns Valor total calculado
 */
export const calculateServiceTotalValue = (
  fullGuests: number,
  halfGuests: number,
  pricePerGuest: number
): number => {
  const normalizedFullGuests = fullGuests || 0;
  const normalizedHalfGuests = halfGuests || 0;
  const normalizedPricePerGuest = Number(pricePerGuest) || 0;
  
  // Aplicar a fórmula: fullGuests * pricePerGuest + halfGuests * (pricePerGuest / 2)
  const fullGuestsTotal = normalizedFullGuests * normalizedPricePerGuest;
  const halfGuestsTotal = normalizedHalfGuests * (normalizedPricePerGuest / 2);
  
  return fullGuestsTotal + halfGuestsTotal;
};

/**
 * Calcula o preço de um serviço usando os dados do evento
 * Esta função implementa a lógica descrita no documento:
 * 1. Usa full_guests e half_guests do evento
 * 2. Usa price_per_guest do serviço
 * 3. Aplica a fórmula: fullGuests * pricePerGuest + halfGuests * (pricePerGuest / 2)
 */
export const calculateEventServicePrice = (
  eventData: { full_guests?: number; half_guests?: number },
  serviceData: { price_per_guest?: number; base_price?: number },
  fallbackPrice?: number
): number => {
  const fullGuests = eventData.full_guests || 0;
  const halfGuests = eventData.half_guests || 0;
  
  let calculatedPrice = 0;
  
  // Primeiro, tentar usar o preço por convidado
  if (serviceData.price_per_guest && serviceData.price_per_guest > 0) {
    calculatedPrice = calculateServiceTotalValue(fullGuests, halfGuests, serviceData.price_per_guest);
  }
  // Se não tem preço por convidado, usar preço base
  else if (serviceData.base_price && serviceData.base_price > 0) {
    calculatedPrice = serviceData.base_price;
  }
  // Último recurso: usar preço de fallback ou calcular baseado em estimativa
  else if (fallbackPrice && fallbackPrice > 0) {
    calculatedPrice = calculateServiceTotalValue(fullGuests, halfGuests, fallbackPrice);
  }
  // Preço mínimo de emergência
  else {
    const totalGuests = fullGuests + halfGuests;
    calculatedPrice = totalGuests > 0 ? Math.max(500, totalGuests * 30) : 500;
  }
  
  // Aplicar taxa de 5% para exibição no lado do cliente e arredondar para cima
  const taxRate = 0.05; // 5%
  const taxAmount = calculatedPrice * taxRate;
  return Math.ceil(calculatedPrice + taxAmount);
};

/**
 * Calcula o preço correto do serviço baseado na lógica especificada:
 * 1. Usar price_per_guest_at_booking se disponível (já calculado pelo sistema)
 * 2. Aplicar fórmula: fullGuests * pricePerGuest + halfGuests * (pricePerGuest / 2)
 * 3. Usar total_estimated_price se já calculado
 */
export const calculateCorrectServicePrice = (
  eventData: { full_guests?: number; half_guests?: number },
  eventServiceData: { 
    price_per_guest_at_booking?: number | null;
    total_estimated_price?: number | null;
  },
  serviceData?: { price_per_guest?: number; base_price?: number }
): number => {
  const fullGuests = eventData.full_guests || 0;
  const halfGuests = eventData.half_guests || 0;
  
  let calculatedPrice = 0;
  
  // Prioridade 1: Se já tem total_estimated_price calculado, usar ele
  if (eventServiceData.total_estimated_price && eventServiceData.total_estimated_price > 0) {
    calculatedPrice = eventServiceData.total_estimated_price;
  }
  // Prioridade 2: Se tem price_per_guest_at_booking, usar a fórmula correta
  else if (eventServiceData.price_per_guest_at_booking && eventServiceData.price_per_guest_at_booking > 0) {
    calculatedPrice = calculateServiceTotalValue(fullGuests, halfGuests, eventServiceData.price_per_guest_at_booking);
  }
  // Prioridade 3: Se tem dados do serviço original
  else if (serviceData) {
    if (serviceData.price_per_guest && serviceData.price_per_guest > 0) {
      calculatedPrice = calculateServiceTotalValue(fullGuests, halfGuests, serviceData.price_per_guest);
    } else if (serviceData.base_price && serviceData.base_price > 0) {
      calculatedPrice = serviceData.base_price;
    }
  }
  
  // Se não encontrou nenhum preço, usar fallback
  if (calculatedPrice === 0) {
    // Fallback: Preços estimados baseados na categoria
    const categoryPrices: Record<string, number> = {
      'buffet': 130,
      'bar': 25,
      'decoracao': 15,
      'som': 20,
      'fotografia': 80,
      'seguranca': 30,
      'limpeza': 12,
      'transporte': 35,
      'comida e bebida': 130,
      'decoração': 15,
      'entretenimento': 35,
      'espaço': 100,
      'outros': 30
    };
    
    // Preço base mínimo para qualquer serviço
    const totalGuests = fullGuests + halfGuests;
    calculatedPrice = totalGuests > 0 ? Math.max(500, totalGuests * 30) : 500;
  }
  
  // Aplicar taxa de 5% para exibição no lado do cliente
  const taxRate = 0.05; // 5%
  const taxAmount = calculatedPrice * taxRate;
  return Math.ceil(calculatedPrice + taxAmount);
};

// Função para calcular preços baseado na lógica de full_guests e half_guests
export const calculateAdvancedPrice = (
  service: any,
  fullGuests: number,
  halfGuests: number,
  freeGuests: number = 0
): number => {
  // Normalizar valores para garantir números válidos
  const normalizedFullGuests = fullGuests || 0;
  const normalizedHalfGuests = halfGuests || 0;
  
  let calculatedPrice = 0;
  
  // Prioridade 1: Se já tem preço total definido, usar ele
  if (service.total_estimated_price && service.total_estimated_price > 0) {
    calculatedPrice = service.total_estimated_price;
  }
  // Prioridade 2: Usar preço por convidado no booking (já calculado pelo sistema)
  else if (service.price_per_guest_at_booking && service.price_per_guest_at_booking > 0) {
    calculatedPrice = calculateServiceTotalValue(normalizedFullGuests, normalizedHalfGuests, service.price_per_guest_at_booking);
  }
  // Prioridade 3: Usar preço por convidado do serviço (services.price_per_guest)
  else if (service.service?.price_per_guest && service.service.price_per_guest > 0) {
    calculatedPrice = calculateServiceTotalValue(normalizedFullGuests, normalizedHalfGuests, service.service.price_per_guest);
  }
  // Prioridade 4: Se tem preço base definido
  else if (service.service?.base_price && service.service.base_price > 0) {
    calculatedPrice = service.service.base_price;
  }
  // Fallback: Preços estimados baseados na categoria
  else {
    const categoryPrices: Record<string, number> = {
      'buffet': 130,
      'bar': 25,
      'decoracao': 15,
      'som': 20,
      'fotografia': 80,
      'seguranca': 30,
      'limpeza': 12,
      'transporte': 35,
      'comida e bebida': 130,
      'decoração': 15,
      'entretenimento': 35,
      'espaço': 100,
      'outros': 30
    };
    
    const category = service.service?.category?.toLowerCase() || service.category?.toLowerCase();
    const categoryPrice = categoryPrices[category] || 30;
    
    if (categoryPrice > 0) {
      calculatedPrice = calculateServiceTotalValue(normalizedFullGuests, normalizedHalfGuests, categoryPrice);
    } else {
      // Último recurso: preço base mínimo
      const totalGuests = normalizedFullGuests + normalizedHalfGuests;
      calculatedPrice = totalGuests > 0 ? Math.max(500, totalGuests * 30) : 500;
    }
  }
  
  // Aplicar taxa de 5% para exibição no lado do cliente
  const taxRate = 0.05; // 5%
  const taxAmount = calculatedPrice * taxRate;
  return Math.ceil(calculatedPrice + taxAmount);
};

// Função para calcular preços considerando apenas guest_count total (para compatibilidade)
export const calculateEstimatedPrice = (
  service: any,
  guestCount: number
): number => {
  let calculatedPrice = 0;
  
  // Se já tem preço total definido, usar ele
  if (service.total_estimated_price && service.total_estimated_price > 0) {
    calculatedPrice = service.total_estimated_price;
  }
  // Prioridade 1: Usar preço por convidado do serviço (services.price_per_guest)
  else {
    let pricePerGuest = 0;
    if (service.service?.price_per_guest && service.service.price_per_guest > 0) {
      pricePerGuest = Number(service.service.price_per_guest);
    }
    // Prioridade 2: Usar preço por convidado no booking
    else if (service.price_per_guest_at_booking && service.price_per_guest_at_booking > 0) {
      pricePerGuest = Number(service.price_per_guest_at_booking);
    }
    
    // Se encontrou um preço por convidado, calcular (assumindo todos como full_guests para compatibilidade)
    if (pricePerGuest > 0 && guestCount > 0) {
      calculatedPrice = pricePerGuest * guestCount;
    }
    // Prioridade 3: Se tem preço base definido
    else if (service.service?.base_price && service.service.base_price > 0) {
      calculatedPrice = service.service.base_price;
    }
    // Fallback: Preços estimados baseados na categoria
    else {
      const categoryPrices: Record<string, number> = {
        'buffet': 45,
        'bar': 25,
        'decoracao': 15,
        'som': 20,
        'fotografia': 80,
        'seguranca': 30,
        'limpeza': 12,
        'transporte': 35,
        'comida e bebida': 45,
        'decoração': 15,
        'entretenimento': 35,
        'espaço': 100,
        'outros': 30
      };
      
      const category = service.service?.category?.toLowerCase() || service.category?.toLowerCase();
      const categoryPrice = categoryPrices[category] || 30;
      
      if (categoryPrice > 0 && guestCount > 0) {
        calculatedPrice = categoryPrice * guestCount;
      } else {
        // Preço base mínimo para qualquer serviço
        calculatedPrice = guestCount > 0 ? Math.max(500, guestCount * 30) : 500;
      }
    }
  }
  
  // Aplicar taxa de 5% para exibição no lado do cliente
  const taxRate = 0.05; // 5%
  const taxAmount = calculatedPrice * taxRate;
  return Math.ceil(calculatedPrice + taxAmount);
};

// Função para formatar informações de convidados
export const formatGuestsInfo = (
  fullGuests: number,
  halfGuests: number,
  freeGuests: number
): string => {
  const total = fullGuests + halfGuests + freeGuests;
  const parts = [];
  
  if (fullGuests > 0) {
    parts.push(`${fullGuests} integral${fullGuests > 1 ? 's' : ''}`);
  }
  
  if (halfGuests > 0) {
    parts.push(`${halfGuests} meia${halfGuests > 1 ? 's' : ''}`);
  }
  
  if (freeGuests > 0) {
    parts.push(`${freeGuests} gratuito${freeGuests > 1 ? 's' : ''}`);
  }
  
  const breakdown = parts.length > 0 ? ` (${parts.join(', ')})` : '';
  return `${total} convidado${total !== 1 ? 's' : ''}${breakdown}`;
};

/**
 * Calcula o preço mínimo de um serviço baseado nos tiers de preço
 * @param guestTiers - Array de tiers de preço do serviço
 * @returns Preço mínimo ou null se não houver tiers
 */
export const calculateMinimumPrice = (guestTiers: any[]): number | null => {
  if (!guestTiers || guestTiers.length === 0) {
    return null;
  }
  
  // Encontrar o tier com o menor preço base
  const minPriceTier = guestTiers.reduce((min, tier) => {
    return tier.base_price_per_adult < min.base_price_per_adult ? tier : min;
  });
  
  return minPriceTier.base_price_per_adult;
};

/**
 * Formata o preço mínimo para exibição
 * @param guestTiers - Array de tiers de preço do serviço
 * @param basePrice - Preço base do serviço (fallback)
 * @returns String formatada do preço mínimo
 */
export const formatMinimumPrice = (guestTiers: any[], basePrice?: number): string => {
  const minPrice = calculateMinimumPrice(guestTiers);
  
  if (minPrice && minPrice > 0) {
    // Aplicar taxa de 5% para exibição no lado do cliente e arredondar para cima
    const priceWithFee = Math.ceil(minPrice * 1.05);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(priceWithFee);
  }
  
  if (basePrice && basePrice > 0) {
    // Aplicar taxa de 5% para exibição no lado do cliente e arredondar para cima
    const priceWithFee = Math.ceil(basePrice * 1.05);
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(priceWithFee);
  }
  
  return 'Preço sob consulta';
};
