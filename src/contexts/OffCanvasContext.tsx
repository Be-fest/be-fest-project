"use client";

import { createContext, useContext, useState } from 'react';

interface PendingService {
  serviceId: string;
  serviceName: string;
  providerName: string;
  providerId: string;
  price: number;
  image: string;
}

interface OffCanvasContextType {
  isCartOpen: boolean;
  showPartyConfig: boolean;
  pendingService: PendingService | null;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  openPartyConfig: (service?: PendingService) => void;
  closeConfig: () => void;
}

const OffCanvasContext = createContext<OffCanvasContextType | undefined>(undefined);

export function OffCanvasProvider({ children }: { children: React.ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showPartyConfig, setShowPartyConfig] = useState(false);
  const [pendingService, setPendingService] = useState<PendingService | null>(null);

  const openCart = () => {
    setIsCartOpen(true);
    setShowPartyConfig(false);
    setPendingService(null);
  };

  const closeCart = () => {
    setIsCartOpen(false);
    setShowPartyConfig(false);
    setPendingService(null);
  };

  const toggleCart = () => setIsCartOpen(!isCartOpen);

  const openPartyConfig = (service?: PendingService) => {
    setIsCartOpen(true);
    setShowPartyConfig(true);
    setPendingService(service || null);
  };

  const closeConfig = () => {
    setShowPartyConfig(false);
    setPendingService(null);
  };

  return (
    <OffCanvasContext.Provider value={{
      isCartOpen,
      showPartyConfig,
      pendingService,
      openCart,
      closeCart,
      toggleCart,
      openPartyConfig,
      closeConfig
    }}>
      {children}
    </OffCanvasContext.Provider>
  );
}

export function useOffCanvas() {
  const context = useContext(OffCanvasContext);
  if (context === undefined) {
    throw new Error('useOffCanvas deve ser usado dentro de um OffCanvasProvider');
  }
  return context;
}
