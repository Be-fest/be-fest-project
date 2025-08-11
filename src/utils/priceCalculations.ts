/**
 * Funções para cálculo correto de preços de serviços
 * Baseado na lógica: fullGuests * pricePerGuest + halfGuests * (pricePerGuest / 2)
 */

export interface GuestBreakdown {
  full_guests: number;
  half_guests: number;
  free_guests: number;
}

export interface ServicePrice {
  price_per_guest_at_booking: number;
  total_estimated_price?: number;
}

export interface PricingResult {
  subtotal: number;
  befest_fee: number;
  total: number;
  fee_percentage: number;
}

/**
 * Calcula o valor correto de um serviço baseado nos tipos de convidados
 */
export function calculateServiceValue(
  service: ServicePrice,
  guests: GuestBreakdown
): number {
  const { full_guests, half_guests, free_guests } = guests;
  const pricePerGuest = Number(service.price_per_guest_at_booking) || 0;
  
  // Cálculo correto:
  const fullGuestsValue = full_guests * pricePerGuest;
  const halfGuestsValue = half_guests * (pricePerGuest / 2);
  const freeGuestsValue = free_guests * 0; // free_guests não pagam
  
  return fullGuestsValue + halfGuestsValue + freeGuestsValue;
}

/**
 * Calcula o preço total de múltiplos serviços
 */
export function calculateTotalPricing(
  services: ServicePrice[],
  guests: GuestBreakdown
): PricingResult {
  let subtotal = 0;
  
  // Calcular subtotal de todos os serviços
  services.forEach(service => {
    subtotal += calculateServiceValue(service, guests);
  });
  
  // Calcular taxa BeFest (10%)
  const befest_fee = subtotal * 0.10;
  const total = subtotal + befest_fee;
  
  return {
    subtotal,
    befest_fee,
    total,
    fee_percentage: 10
  };
}

/**
 * Verifica se um preço está correto
 */
export function isPriceCorrect(
  service: ServicePrice,
  guests: GuestBreakdown
): boolean {
  const calculatedValue = calculateServiceValue(service, guests);
  const storedValue = Number(service.total_estimated_price) || 0;
  
  // Tolerância de 1 centavo para diferenças de arredondamento
  return Math.abs(calculatedValue - storedValue) <= 0.01;
}

/**
 * Formata o breakdown de convidados para exibição
 */
export function formatGuestBreakdown(guests: GuestBreakdown): string {
  const { full_guests, half_guests, free_guests } = guests;
  const parts = [];
  
  if (full_guests > 0) {
    parts.push(`${full_guests} inteira`);
  }
  
  if (half_guests > 0) {
    parts.push(`${half_guests} meias`);
  }
  
  if (free_guests > 0) {
    parts.push(`${free_guests} free`);
  }
  
  return parts.join(', ');
}

/**
 * Calcula o total de convidados
 */
export function getTotalGuests(guests: GuestBreakdown): number {
  return guests.full_guests + guests.half_guests + guests.free_guests;
}

/**
 * Exemplo de uso:
 * 
 * const guests = { full_guests: 100, half_guests: 20, free_guests: 5 };
 * const service = { price_per_guest_at_booking: 140 };
 * 
 * const serviceValue = calculateServiceValue(service, guests);
 * // Resultado: 15400 (100 * 140 + 20 * 70 + 5 * 0)
 * 
 * const pricing = calculateTotalPricing([service], guests);
 * // Resultado: { subtotal: 15400, befest_fee: 770, total: 16170, fee_percentage: 5 }
 */