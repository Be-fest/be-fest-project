import { GuestTier } from '@/types/database';

// Função para calcular o preço baseado na faixa mínima de convidados
export function calculateMinPrice(service: any): { 
  price: number; 
  minGuests: number; 
  maxGuests?: number;
  hasTiers: boolean;
} {
  // Se não há faixas de preço, usar o preço antigo
  if (!service.guest_tiers || service.guest_tiers.length === 0) {
    return {
      price: service.base_price || 0,
      minGuests: service.min_guests || 0,
      maxGuests: service.max_guests || undefined,
      hasTiers: false
    };
  }

  // Ordenar faixas por min_total_guests e pegar a primeira (menor quantidade)
  const sortedTiers = [...service.guest_tiers].sort((a, b) => a.min_total_guests - b.min_total_guests);
  const minTier = sortedTiers[0];

  if (!minTier) {
    return { price: 0, minGuests: 0, hasTiers: false };
  }

  return {
    price: minTier.base_price_per_adult,
    minGuests: minTier.min_total_guests,
    maxGuests: minTier.max_total_guests || undefined,
    hasTiers: true
  };
}

// Função para formatar o preço
export function formatPrice(price: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2
  }).format(price);
}

// Função para calcular o preço total para um número específico de convidados
export function calculateTotalPrice(service: any, guestCount: number): number {
  if (!service.guest_tiers || service.guest_tiers.length === 0) {
    // Usar lógica antiga se não há faixas
    const basePrice = service.base_price || 0;
    const pricePerGuest = service.price_per_guest || 0;
    return basePrice + (pricePerGuest * guestCount);
  }

  // Encontrar a faixa apropriada para o número de convidados
  const sortedTiers = [...service.guest_tiers].sort((a, b) => a.min_total_guests - b.min_total_guests);
  
  let applicableTier = null;
  for (const tier of sortedTiers) {
    if (guestCount >= tier.min_total_guests && 
        (tier.max_total_guests === null || guestCount <= tier.max_total_guests)) {
      applicableTier = tier;
      break;
    }
  }

  // Se não encontrou faixa, usar a última (maior quantidade)
  if (!applicableTier && sortedTiers.length > 0) {
    applicableTier = sortedTiers[sortedTiers.length - 1];
  }

  if (!applicableTier) {
    return 0;
  }

  return applicableTier.base_price_per_adult * guestCount;
}

// Função para obter todas as faixas de preço formatadas
export function getFormattedTiers(service: any): string[] {
  if (!service.guest_tiers || service.guest_tiers.length === 0) {
    return [];
  }

  const sortedTiers = [...service.guest_tiers].sort((a, b) => a.min_total_guests - b.min_total_guests);
  
  return sortedTiers.map(tier => {
    const range = tier.max_total_guests 
      ? `${tier.min_total_guests}-${tier.max_total_guests}`
      : `${tier.min_total_guests}+`;
    
    return `${range} convidados: ${formatPrice(tier.base_price_per_adult)}/adulto`;
  });
}

// Função para calcular preço com taxa de 5% (para exibição no lado do cliente)
export function calculatePriceWithFee(price: number): number {
  const taxRate = 0.05; // 5%
  const taxAmount = price * taxRate;
  return Math.ceil(price + taxAmount);
}

// Função para formatar preço mínimo com taxa de 5% (para exibição no lado do cliente)
export function formatMinimumPriceWithFee(guestTiers: GuestTier[]): string {
  if (!guestTiers || guestTiers.length === 0) {
    return 'Preço sob consulta';
  }

  // Ordenar faixas por min_total_guests e pegar a primeira (menor quantidade)
  const sortedTiers = [...guestTiers].sort((a, b) => a.min_total_guests - b.min_total_guests);
  const minTier = sortedTiers[0];

  if (!minTier) {
    return 'Preço sob consulta';
  }

  const basePrice = minTier.base_price_per_adult;
  const priceWithFee = Math.ceil(calculatePriceWithFee(basePrice));
  
  return formatPrice(priceWithFee);
}

// Nova função para calcular preço com lógica de convidados mínimos
export function calculatePriceWithMinimumGuests(
  service: any, 
  clientGuests: number
): { 
  totalPrice: number; 
  pricePerGuest: number; 
  minimumGuests: number; 
  appliedGuests: number;
  explanation: string;
} {
  if (!service.guest_tiers || service.guest_tiers.length === 0) {
    // Lógica antiga se não há faixas
    const pricePerGuest = service.price_per_guest || 0;
    const totalPrice = pricePerGuest * clientGuests;
    
    return {
      totalPrice,
      pricePerGuest,
      minimumGuests: clientGuests,
      appliedGuests: clientGuests,
      explanation: `${clientGuests} convidados × ${formatPrice(pricePerGuest)}`
    };
  }

  // Encontrar a faixa apropriada para o número de convidados do cliente
  const sortedTiers = [...service.guest_tiers].sort((a, b) => a.min_total_guests - b.min_total_guests);
  
  let applicableTier = null;
  for (const tier of sortedTiers) {
    if (clientGuests >= tier.min_total_guests && 
        (tier.max_total_guests === null || clientGuests <= tier.max_total_guests)) {
      applicableTier = tier;
      break;
    }
  }

  // Se o cliente tem menos convidados que o mínimo, usar a primeira faixa (menor)
  if (!applicableTier && sortedTiers.length > 0) {
    applicableTier = sortedTiers[0];
  }

  if (!applicableTier) {
    return {
      totalPrice: 0,
      pricePerGuest: 0,
      minimumGuests: 0,
      appliedGuests: 0,
      explanation: 'Preço não disponível'
    };
  }

  const minimumGuests = applicableTier.min_total_guests;
  const pricePerGuest = applicableTier.base_price_per_adult;

  // Se o cliente tem menos convidados que o mínimo:
  // Preço = (mínimo de convidados × preço por convidado) ÷ número de convidados do cliente
  if (clientGuests < minimumGuests) {
    const totalPrice = (minimumGuests * pricePerGuest) / clientGuests;
    
    return {
      totalPrice: totalPrice * clientGuests, // Preço total real
      pricePerGuest: totalPrice, // Preço por convidado ajustado
      minimumGuests,
      appliedGuests: minimumGuests,
      explanation: `Mínimo ${minimumGuests} convidados: (${minimumGuests} × ${formatPrice(pricePerGuest)}) ÷ ${clientGuests} = ${formatPrice(totalPrice)}/convidado`
    };
  }

  // Se o cliente tem convidados >= mínimo, usar preço normal
  const totalPrice = clientGuests * pricePerGuest;
  
  return {
    totalPrice,
    pricePerGuest,
    minimumGuests,
    appliedGuests: clientGuests,
    explanation: `${clientGuests} convidados × ${formatPrice(pricePerGuest)}`
  };
}