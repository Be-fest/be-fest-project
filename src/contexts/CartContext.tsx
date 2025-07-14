'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { syncCartWithDatabaseAction } from '@/lib/actions/cart';
import { useToast } from '@/hooks/useToast';
import { useAuth } from '@/hooks/useAuth';

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
  serviceId: string; // ID real do serviço no banco
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
  setEventId: (eventId: string) => void;
  getTotalPrice: () => number;
  getItemCount: () => number;
  syncWithDatabase: (forceSync?: boolean) => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [partyData, setPartyDataState] = useState<PartyData | null>(null);
  const [eventId, setEventId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { user, userData, loading: authLoading } = useAuth();
  
  // Refs para controlar sincronização
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastSyncTimeRef = useRef<number>(0);
  const needsSyncRef = useRef<boolean>(false);
  const syncInProgressRef = useRef<boolean>(false); // Nova flag para prevenir sincronização simultânea

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
  const syncWithDatabase = useCallback(async (forceSync = false) => {
    // Verificar se já está sincronizando
    if (syncInProgressRef.current) {
      console.log('Sincronização já em andamento, ignorando chamada');
      return;
    }
    
    // Verificar se o usuário está autenticado
    if (!user || authLoading) {
      console.log('Sincronização cancelada: usuário não autenticado', { user, authLoading });
      return;
    }

    // CORREÇÃO: Verificar se o usuário é um prestador - prestadores não devem sincronizar carrinhos
    if (userData?.role === 'provider') {
      console.log('Sincronização cancelada: usuário é prestador', { role: userData.role });
      return;
    }

    if (!partyData || cartItems.length === 0) {
      console.log('Sincronização cancelada: partyData ou cartItems vazios', { partyData, cartItems });
      return;
    }

    // Verificar se já foi sincronizado recentemente (exceto se for forçado)
    const now = Date.now();
    const timeSinceLastSync = now - lastSyncTimeRef.current;
    const minTimeBetweenSyncs = 30 * 1000; // 30 segundos mínimo entre sincronizações
    
    if (!forceSync && timeSinceLastSync < minTimeBetweenSyncs) {
      console.log('Sincronização muito recente, aguardando...', { timeSinceLastSync, minTimeBetweenSyncs });
      needsSyncRef.current = true; // Marcar que precisa sincronizar depois
      return;
    }

    console.log('Iniciando sincronização...', { partyData, cartItems, eventId, forceSync });
    
    // Marcar que está sincronizando
    syncInProgressRef.current = true;
    setIsLoading(true);
    
    try {
      // Filtrar duplicados antes de sincronizar
      const uniqueCartItems = cartItems.filter((item, index, array) => {
        return array.findIndex(
          i => i.serviceId === item.serviceId && i.providerId === item.providerId
        ) === index;
      });

      console.log('Filtrando duplicados antes da sincronização:', {
        original: cartItems.length,
        filtered: uniqueCartItems.length,
        removed: cartItems.length - uniqueCartItems.length
      });

      const result = await syncCartWithDatabaseAction({
        partyData,
        cartItems: uniqueCartItems.map(item => ({
          id: item.id,
          serviceId: item.serviceId,
          serviceName: item.serviceName,
          providerId: item.providerId,
          quantity: item.quantity
        })),
        eventId: eventId || undefined
      });

      console.log('Resultado da sincronização:', result);

      if (result.success) {
        console.log('EventId atualizado para:', result.data!.eventId);
        setEventId(result.data!.eventId);
        lastSyncTimeRef.current = now;
        needsSyncRef.current = false;
        
        // Só mostrar toast se for sincronização manual
        if (forceSync) {
          toast.success('Carrinho sincronizado com sucesso!');
        }
      } else {
        console.error('Erro na sincronização:', result.error);
        toast.error('Erro ao sincronizar carrinho', result.error);
      }
    } catch (error) {
      console.error('Erro ao sincronizar:', error);
      toast.error('Erro ao sincronizar carrinho');
    } finally {
      setIsLoading(false);
      syncInProgressRef.current = false; // Resetar flag
    }
  }, [user, userData, authLoading, partyData, cartItems, eventId, toast]);

  // Sistema de sincronização inteligente
  const scheduleSync = useCallback(() => {
    // Não agendar sincronização para prestadores
    if (userData?.role === 'provider') {
      return;
    }

    // Limpar timeout anterior
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // Marcar que precisa sincronizar
    needsSyncRef.current = true;

    // Agendar sincronização com debounce de 5 segundos
    debounceTimeoutRef.current = setTimeout(() => {
      if (needsSyncRef.current) {
        syncWithDatabase(false);
      }
    }, 5000);
  }, [syncWithDatabase, userData]);

  // Auto-sincronizar quando partyData ou cartItems mudam (com debounce)
  useEffect(() => {
    // Só sincronizar se o usuário estiver autenticado e for cliente
    if (!user || authLoading) return;
    if (userData?.role === 'provider') return; // Não sincronizar para prestadores
    if (!partyData || cartItems.length === 0) return;

    scheduleSync();
  }, [partyData, cartItems, user, userData, authLoading, scheduleSync]);

  // Sincronização por intervalo (10 minutos) - apenas para clientes
  useEffect(() => {
    if (!user || authLoading) return;
    if (userData?.role === 'provider') return; // Não sincronizar para prestadores

    // Limpar intervalo anterior
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    // Só configurar sincronização se houver dados e não estiver sincronizando
    if (partyData && cartItems.length > 0 && !syncInProgressRef.current) {
      // Configurar sincronização por intervalo (menos frequente)
      intervalRef.current = setInterval(() => {
        if (partyData && cartItems.length > 0 && !syncInProgressRef.current) {
          console.log('🕐 Sincronização automática por intervalo (10 min)');
          syncWithDatabase(false);
        }
      }, 10 * 60 * 1000); // 10 minutos (aumentado para reduzir duplicações)
    }

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [user, userData, authLoading, partyData, cartItems, syncWithDatabase]);

  // Cleanup dos timeouts quando o componente for desmontado
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  const addToCart = useCallback((item: Omit<CartItem, 'id'>) => {
    setCartItems(prev => {
      const existingItem = prev.find(cartItem => 
        cartItem.serviceId === item.serviceId && 
        cartItem.providerId === item.providerId
      );

      if (existingItem) {
        // Se já existe, mostrar mensagem e não adicionar novamente
        toast.info(
          'Serviço já adicionado',
          `${item.serviceName} já está no seu carrinho.`,
          3000
        );
        return prev;
      } else {
        // Adicionar novo item sempre com quantidade 1
        const newItem = { ...item, id: crypto.randomUUID(), quantity: 1 };
        
        toast.success(
          'Serviço adicionado',
          `${item.serviceName} foi adicionado ao carrinho.`,
          3000
        );
        
        return [...prev, newItem];
      }
    });
  }, [toast]);

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

  const setEventIdFunction = (eventId: string) => {
    setEventId(eventId);
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
        setEventId: setEventIdFunction,
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
