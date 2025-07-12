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

// Função para calcular preços avançados considerando diferentes tipos de convidados
export const calculateAdvancedPrice = (
  service: any,
  fullGuests: number,
  halfGuests: number,
  freeGuests: number
): number => {
  // Se já tem preço total definido, usar ele
  if (service.total_estimated_price && service.total_estimated_price > 0) {
    return service.total_estimated_price;
  }
  
  // Se tem preço por convidado definido no serviço
  if (service.service?.price_per_guest && service.service.price_per_guest > 0) {
    const fullPrice = fullGuests * service.service.price_per_guest;
    const halfPrice = halfGuests * (service.service.price_per_guest * 0.5);
    const freePrice = 0; // Convidados gratuitos não pagam
    return fullPrice + halfPrice + freePrice;
  }
  
  // Se tem preço por convidado no booking
  if (service.price_per_guest_at_booking && service.price_per_guest_at_booking > 0) {
    const fullPrice = fullGuests * service.price_per_guest_at_booking;
    const halfPrice = halfGuests * (service.price_per_guest_at_booking * 0.5);
    const freePrice = 0;
    return fullPrice + halfPrice + freePrice;
  }
  
  // Se tem preço base definido
  if (service.service?.base_price && service.service.base_price > 0) {
    return service.service.base_price;
  }
  
  // Preços estimados baseados na categoria como fallback
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
    const fullPrice = fullGuests * categoryPrice;
    const halfPrice = halfGuests * (categoryPrice * 0.5);
    const freePrice = 0;
    return fullPrice + halfPrice + freePrice;
  }
  
  // Preço base mínimo como último recurso
  const totalGuests = fullGuests + halfGuests + freeGuests;
  return totalGuests > 0 ? Math.max(500, totalGuests * 30) : 500;
};

// Função para calcular preços considerando apenas guest_count total (para compatibilidade)
export const calculateEstimatedPrice = (
  service: any,
  guestCount: number
): number => {
  // Se já tem preço total definido, usar ele
  if (service.total_estimated_price && service.total_estimated_price > 0) {
    return service.total_estimated_price;
  }
  
  // Calcular preço baseado no serviço original
  if (service.service?.price_per_guest && guestCount > 0) {
    return service.service.price_per_guest * guestCount;
  }
  
  if (service.service?.base_price && service.service.base_price > 0) {
    return service.service.base_price;
  }
  
  // Fallback para campos de booking
  if (service.price_per_guest_at_booking && guestCount > 0) {
    return service.price_per_guest_at_booking * guestCount;
  }
  
  // Preços estimados baseados na categoria como fallback
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
  if (category && categoryPrices[category] && guestCount > 0) {
    return categoryPrices[category] * guestCount;
  }
  
  // Preço base mínimo para qualquer serviço
  return guestCount > 0 ? Math.max(500, guestCount * 30) : 500;
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
