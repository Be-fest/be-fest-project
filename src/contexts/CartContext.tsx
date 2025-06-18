'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

// Tipos para o carrinho e festa
export interface CartItem {
  id: string;
  serviceId: string;
  serviceName: string;
  providerName: string;
  providerId: string;
  price: number;
  quantity: number;
  image: string;
}

export interface PartyData {
  eventName: string;
  eventDate: string;
  startTime: string;
  location: string;
  fullGuests: number;
  halfGuests: number;
  freeGuests: number; // Menores de 5 anos
}

interface CartContextType {
  cartItems: CartItem[];
  partyData: PartyData | null;
  isPartyConfigured: boolean;
  addToCart: (item: Omit<CartItem, 'id' | 'quantity'>) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  setPartyData: (data: PartyData) => void;
  clearPartyData: () => void;
  getTotalPrice: () => number;
  getTotalItems: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [partyData, setPartyDataState] = useState<PartyData | null>(null);

  // Carregar dados do localStorage quando o componente montar
  useEffect(() => {
    const savedCart = localStorage.getItem('befest-cart');
    const savedPartyData = localStorage.getItem('befest-party-data');

    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error('Erro ao carregar carrinho:', error);
      }
    }

    if (savedPartyData) {
      try {
        setPartyDataState(JSON.parse(savedPartyData));
      } catch (error) {
        console.error('Erro ao carregar dados da festa:', error);
      }
    }
  }, []);

  // Salvar carrinho no localStorage sempre que mudar
  useEffect(() => {
    localStorage.setItem('befest-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  // Salvar dados da festa no localStorage sempre que mudar
  useEffect(() => {
    if (partyData) {
      localStorage.setItem('befest-party-data', JSON.stringify(partyData));
    }
  }, [partyData]);

  const addToCart = (newItem: Omit<CartItem, 'id' | 'quantity'>) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(item => item.serviceId === newItem.serviceId);
      
      if (existingItem) {
        // Se o item já existe, aumenta a quantidade
        return prevItems.map(item =>
          item.serviceId === newItem.serviceId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Se é um novo item, adiciona com quantidade 1
        return [...prevItems, {
          ...newItem,
          id: `${newItem.serviceId}-${Date.now()}`,
          quantity: 1
        }];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }

    setCartItems(prevItems =>
      prevItems.map(item =>
        item.id === itemId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.removeItem('befest-cart');
  };

  const setPartyData = (data: PartyData) => {
    setPartyDataState(data);
  };

  const clearPartyData = () => {
    setPartyDataState(null);
    localStorage.removeItem('befest-party-data');
  };

  const getTotalPrice = () => {
    const subtotal = cartItems.reduce((total, item) => {
      const fullGuestPrice = item.price * (partyData?.fullGuests || 0);
      const halfGuestPrice = (item.price * 0.5) * (partyData?.halfGuests || 0);
      // Menores de 5 anos não pagam
      return total + ((fullGuestPrice + halfGuestPrice) * item.quantity);
    }, 0);
    
    return subtotal;
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const isPartyConfigured = partyData !== null;

  return (
    <CartContext.Provider value={{
      cartItems,
      partyData,
      isPartyConfigured,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      setPartyData,
      clearPartyData,
      getTotalPrice,
      getTotalItems
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart deve ser usado dentro de um CartProvider');
  }
  return context;
}
