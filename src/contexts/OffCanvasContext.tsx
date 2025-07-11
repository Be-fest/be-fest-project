"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

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
  isOpen: boolean;
  openOffCanvas: () => void;
  closeOffCanvas: () => void;
  toggleOffCanvas: () => void;
}

const OffCanvasContext = createContext<OffCanvasContextType | undefined>(undefined);

export function OffCanvasProvider({ children }: { children: ReactNode }) {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [showPartyConfig, setShowPartyConfig] = useState(false);
  const [pendingService, setPendingService] = useState<PendingService | null>(null);
  const [isOpen, setIsOpen] = useState(false);

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

  const openOffCanvas = () => setIsOpen(true);
  const closeOffCanvas = () => setIsOpen(false);
  const toggleOffCanvas = () => setIsOpen(prev => !prev);

  return (
    <OffCanvasContext.Provider
      value={{
        isCartOpen,
        showPartyConfig,
        pendingService,
        openCart,
        closeCart,
        toggleCart,
        openPartyConfig,
        closeConfig,
        isOpen,
        openOffCanvas,
        closeOffCanvas,
        toggleOffCanvas,
      }}
    >
      {children}
    </OffCanvasContext.Provider>
  );
}

export function useOffCanvas() {
  const context = useContext(OffCanvasContext);
  if (context === undefined) {
    throw new Error('useOffCanvas must be used within an OffCanvasProvider');
  }
  return context;
}
