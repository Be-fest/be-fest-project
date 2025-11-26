'use client'

import Image from 'next/image';
import { useState } from 'react';

interface ProviderLogoProps {
  width?: number;
  height?: number;
  className?: string;
  providerImage?: string | null | undefined;
  providerName?: string;
  showFallback?: boolean;
}

export function ProviderLogo({ 
  width = 50, 
  height = 50, 
  className = '', 
  providerImage, 
  providerName = 'Prestador',
  showFallback = true 
}: ProviderLogoProps) {
  const [imageError, setImageError] = useState(false);

  // Se há imagem do prestador e não houve erro, usar ela
  if (providerImage && providerImage !== null && !imageError) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Image
          src={providerImage}
          alt={`Logo ${providerName}`}
          width={width}
          height={height}
          className="object-contain rounded-lg"
          onError={() => setImageError(true)}
        />
      </div>
    );
  }

  // Fallback para logo de prestador padrão se showFallback for true
  if (showFallback) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Image
          src="/be-fest-provider-logo.png"
          alt="Be Fest Prestador Logo"
          width={width}
          height={height}
          className="object-contain"
        />
      </div>
    );
  }

  // Fallback para iniciais se não mostrar logo padrão
  return (
    <div className={`flex items-center justify-center bg-[#A502CA] text-white font-bold rounded-lg ${className}`} 
         style={{ width, height }}>
      <span className="text-sm">
        {(providerName || 'P').split(' ').map(word => word.charAt(0)).join('').slice(0, 2).toUpperCase()}
      </span>
    </div>
  );
} 