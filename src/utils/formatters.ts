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
