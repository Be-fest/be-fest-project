'use client';

import { OrderStatus } from '@/types/admin';

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const statusStyles = {
    'solicitacao_enviada': {
      bg: 'bg-blue-50',
      text: 'text-blue-600',
      label: 'Solicitação enviada'
    },
    'aguardando_pagamento': {
      bg: 'bg-yellow-50',
      text: 'text-yellow-600',
      label: 'Aguardando pagamento'
    },
    'confirmado': {
      bg: 'bg-green-50',
      text: 'text-green-600',
      label: 'Confirmado'
    },
    'concluido': {
      bg: 'bg-emerald-50',
      text: 'text-emerald-600',
      label: 'Concluído'
    },
    'cancelado': {
      bg: 'bg-red-50',
      text: 'text-red-600',
      label: 'Cancelado'
    }
  };

  const style = statusStyles[status];
  
  return (
    <span className={`
      ${style.bg} ${style.text}
      ${size === 'sm' ? 'px-2 py-1 text-xs' : 'px-3 py-1.5 text-sm'}
      rounded-full font-medium inline-flex items-center
    `}>
      {style.label}
    </span>
  );
} 