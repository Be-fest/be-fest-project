'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Tipos para o carrinho e festa
export interface PartyData {
  eventName: string;
  eventDate: string;
  startTime: string;
  location: string;
  fullGuests: number;
  halfGuests: number;
  freeGuests: number; // Menores de 5 anos
}

export interface CartItem {
  id: string;
  name: string;
  serviceName: string;
  price: number;
  quantity: number;
  providerId: string;
  providerName: string;
  category: string;
  image: string;
}

interface CartContextType {
  cartItems: CartItem[];
  partyData: PartyData | null;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  setPartyData: (data: PartyData) => void;
  clearPartyData: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
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

  const addToCart = (item: Omit<CartItem, 'id'>) => {
    setCartItems(prev => {
      const newItem = { ...item, id: crypto.randomUUID() };
      return [...prev, newItem];
    });
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => prev.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    setCartItems(prev =>
      prev.map(item =>
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
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getItemCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        partyData,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        setPartyData,
        clearPartyData,
        getTotalPrice,
        getItemCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
