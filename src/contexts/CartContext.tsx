'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { syncCartWithDatabaseAction, saveCartEventAction, addServiceToCartAction, removeServiceFromCartAction } from '@/lib/actions/cart';
import { useToast } from '@/hooks/useToast';

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
  eventId: string | null;
  isLoading: boolean;
  addToCart: (item: Omit<CartItem, 'id'>) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  setPartyData: (data: PartyData) => void;
  clearPartyData: () => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
  syncWithDatabase: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [partyData, setPartyDataState] = useState<PartyData | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  // Carregar dados do localStorage quando o componente montar
  useEffect(() => {
    const savedCart = localStorage.getItem('befest-cart');
    const savedPartyData = localStorage.getItem('befest-party-data');
    const savedEventId = localStorage.getItem('befest-event-id');

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

    if (savedEventId) {
      setEventId(savedEventId);
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

  // Salvar eventId no localStorage sempre que mudar
  useEffect(() => {
    if (eventId) {
      localStorage.setItem('befest-event-id', eventId);
    }
  }, [eventId]);

  // Função para sincronizar com o banco de dados
  const syncWithDatabase = async () => {
    if (!partyData || cartItems.length === 0) return;

    setIsLoading(true);
    try {
      const result = await syncCartWithDatabaseAction({
        partyData,
        cartItems: cartItems.map(item => ({
          id: item.id,
          serviceName: item.serviceName,
          providerId: item.providerId,
          quantity: item.quantity
        })),
        eventId: eventId || undefined
      });

      if (result.success) {
        setEventId(result.data!.eventId);
        toast.success('Carrinho sincronizado com sucesso!');
      } else {
        toast.error('Erro ao sincronizar carrinho', result.error);
      }
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
      toast.error('Erro ao sincronizar carrinho');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-sincronizar quando partyData ou cartItems mudam (com debounce)
  useEffect(() => {
    if (!partyData || cartItems.length === 0) return;

    const timeoutId = setTimeout(() => {
      syncWithDatabase();
    }, 2000); // Aguardar 2 segundos após a última mudança

    return () => clearTimeout(timeoutId);
  }, [partyData, cartItems]);

  const addToCart = (item: Omit<CartItem, 'id'>) => {
    setCartItems(prev => {
      const existingItem = prev.find(cartItem => 
        cartItem.serviceName === item.serviceName && 
        cartItem.providerId === item.providerId
      );

      if (existingItem) {
        // Se já existe, não adicionar novamente (serviços não são contáveis)
        return prev;
      } else {
        // Adicionar novo item sempre com quantidade 1
        const newItem = { ...item, id: crypto.randomUUID(), quantity: 1 };
        return [...prev, newItem];
      }
    });
  };

  const removeFromCart = async (itemId: string) => {
    const itemToRemove = cartItems.find(item => item.id === itemId);
    
    setCartItems(prev => prev.filter(item => item.id !== itemId));

    // Se tiver eventId, tentar remover do banco também
    if (eventId && itemToRemove) {
      try {
        // Aqui você pode implementar a lógica para remover do banco
        // Por enquanto, vamos apenas remover localmente
        toast.info('Serviço removido do carrinho');
      } catch (error) {
        console.error('Erro ao remover do banco:', error);
      }
    }
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
    setEventId(null);
    localStorage.removeItem('befest-cart');
    localStorage.removeItem('befest-event-id');
  };

  const setPartyData = (data: PartyData) => {
    setPartyDataState(data);
  };

  const clearPartyData = () => {
    setPartyDataState(null);
    setEventId(null);
    localStorage.removeItem('befest-party-data');
    localStorage.removeItem('befest-event-id');
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + item.price, 0);
  };

  const getItemCount = () => {
    return cartItems.length;
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        partyData,
        eventId,
        isLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        setPartyData,
        clearPartyData,
        getTotalPrice,
        getItemCount,
        syncWithDatabase,
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
