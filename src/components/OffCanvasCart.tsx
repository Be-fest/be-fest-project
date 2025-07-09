"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdAdd, MdRemove, MdShoppingCart, MdLocationOn, MdCalendarToday, MdPerson, MdPersonOutline, MdFace } from 'react-icons/md';
import { useCart } from '../contexts/CartContext';
import { PartyConfigForm } from './PartyConfigForm';
import { updateEventStatusAction } from '@/lib/actions/events';
import { useToastGlobal } from '@/contexts/GlobalToastContext';
import { useRouter } from 'next/navigation';
import { calculateGuestCount } from '@/utils/formatters';

interface OffCanvasCartProps {
  isOpen: boolean;
  onClose: () => void;
  showPartyConfig?: boolean;
  pendingService?: {
    serviceId: string;
    serviceName: string;
    providerName: string;
    providerId: string;
    price: number;
    image: string;
  };
}

interface GuestBreakdown {
  fullGuests: number;
  halfGuests: number;
  freeGuests: number;
}

export function OffCanvasCart({ isOpen, onClose, showPartyConfig = false, pendingService }: OffCanvasCartProps) {
  const { 
    cartItems, 
    partyData, 
    eventId,
    isLoading,
    updateQuantity, 
    removeFromCart, 
    getTotalPrice,
    setPartyData,
    syncWithDatabase
  } = useCart();

  const [isConfiguring, setIsConfiguring] = useState(showPartyConfig);
  const [isFinalizingOrder, setIsFinalizingOrder] = useState(false);
  const [guestBreakdown, setGuestBreakdown] = useState<GuestBreakdown>({
    fullGuests: partyData?.fullGuests || 0,
    halfGuests: partyData?.halfGuests || 0,
    freeGuests: partyData?.freeGuests || 0
  });

  const toast = useToastGlobal();
  const router = useRouter();

  // Sincronizar guest breakdown com partyData quando mudar
  useEffect(() => {
    if (partyData) {
      setGuestBreakdown({
        fullGuests: partyData.fullGuests || 0,
        halfGuests: partyData.halfGuests || 0,
        freeGuests: partyData.freeGuests || 0
      });
    }
  }, [partyData]);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculateItemTotal = (item: any) => {
    if (!partyData) return item.price * item.quantity;
    
    // Calcular baseado nas regras de pricing por idade
    const fullPrice = item.price * guestBreakdown.fullGuests; // 100%
    const halfPrice = (item.price * 0.5) * guestBreakdown.halfGuests; // 50%
    const freePrice = 0; // Free guests don't pay
    
    return (fullPrice + halfPrice + freePrice) * item.quantity;
  };

  const handlePartyConfigComplete = () => {
    setIsConfiguring(false);
    // Sincronizar automaticamente após configurar a festa
    syncWithDatabase(true);
  };

  const handleGuestBreakdownChange = (type: keyof GuestBreakdown, value: number) => {
    const newBreakdown = { ...guestBreakdown, [type]: Math.max(0, value) };
    setGuestBreakdown(newBreakdown);
    
    // Atualizar os dados da festa no contexto
    if (partyData) {
      setPartyData({
        ...partyData,
        fullGuests: newBreakdown.fullGuests,
        halfGuests: newBreakdown.halfGuests,
        freeGuests: newBreakdown.freeGuests
      });
    }
  };

  const getTotalGuests = () => {
    return calculateGuestCount(guestBreakdown.fullGuests, guestBreakdown.halfGuests, guestBreakdown.freeGuests);
  };

  const getCalculatedTotal = () => {
    return cartItems.reduce((total, item) => total + calculateItemTotal(item), 0);
  };

  // Função para forçar sincronização manual
  const handleSyncNow = async () => {
    await syncWithDatabase(true); // Forçar sincronização imediata
  };

  // Função para finalizar pedido
  const handleFinalizarPedido = async () => {
    setIsFinalizingOrder(true);

    try {
      // Primeiro, sempre sincronizar com o banco de dados se há dados da festa e itens
      if (partyData && cartItems.length > 0) {
        console.log('Sincronizando carrinho antes de finalizar...');
        await syncWithDatabase(true); // Forçar sincronização imediata
        
        // Aguardar um pouco para garantir que o eventId foi atualizado
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      // Verificar se temos eventId após a sincronização
      if (!eventId) {
        console.error('EventId ainda é null após sincronização');
        toast.error(
          'Erro',
          'Não foi possível criar o evento. Verifique se você configurou sua festa e tente novamente.',
          5000
        );
        return;
      }

      console.log('Finalizando pedido com eventId:', eventId);

      // Atualizar status do evento para "planning" (em análise)
      const result = await updateEventStatusAction(eventId, 'planning');

      if (result.success) {
        toast.success(
          'Pedido finalizado!',
          'Seus serviços foram enviados para análise dos prestadores. Você será notificado quando eles responderem.',
          6000
        );

        // Fechar o offcanvas
        onClose();

        // Redirecionar para minhas festas após 2 segundos
        setTimeout(() => {
          router.push('/minhas-festas');
        }, 2000);
      } else {
        console.error('Erro ao atualizar status do evento:', result.error);
        toast.error(
          'Erro ao finalizar pedido',
          result.error || 'Não foi possível finalizar o pedido. Tente novamente.',
          5000
        );
      }
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
      toast.error(
        'Erro ao finalizar pedido',
        'Ocorreu um erro inesperado. Tente novamente.',
        5000
      );
    } finally {
      setIsFinalizingOrder(false);
    }
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            
            {/* Off-canvas Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-lg bg-white shadow-2xl z-[70] flex flex-col"
            >
              {/* Header minimalista */}
              <div className="bg-gradient-to-r from-[#F71875] to-[#A502CA] text-white px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                    <MdShoppingCart className="text-xl" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">
                      {isConfiguring ? 'Nova Festa' : 'Carrinho'}
                    </h2>
                    <p className="text-sm opacity-90">
                      {isConfiguring 
                        ? 'Configure sua festa' 
                        : (partyData?.eventName || 'Sem festa configurada')
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Indicador de sincronização */}
                  {isLoading && (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  )}
                  {eventId && !isLoading && (
                    <button
                      onClick={handleSyncNow}
                      className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                      title="Sincronizar manualmente com banco de dados"
                    >
                      <MdShoppingCart className="text-sm" />
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="w-8 h-8 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
                  >
                    <MdClose className="text-lg" />
                  </button>
                </div>
              </div>

              {/* Status de sincronização */}
              {eventId && (
                <div className="mx-6 mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-2 text-green-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm font-medium">Festa sincronizada</span>
                  </div>
                  <p className="text-xs text-green-600 mt-1">
                    Auto-sincronização: A cada 5 minutos ou quando modificada
                  </p>
                </div>
              )}
              
              {/* Status quando não sincronizado */}
              {!eventId && partyData && (
                <div className="mx-6 mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-700">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Aguardando sincronização</span>
                  </div>
                  <p className="text-xs text-yellow-600 mt-1">
                    A festa será sincronizada automaticamente em breve
                  </p>
                </div>
              )}

              {/* Event Info Card - Design minimalista */}
              {partyData && !isConfiguring && (
                <div className="mx-6 mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl border border-gray-200">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-[#F71875] rounded-lg flex items-center justify-center flex-shrink-0">
                      <MdLocationOn className="text-white text-sm" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-gray-900 truncate">{partyData.eventName}</h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <MdCalendarToday className="text-xs" />
                          <span>{new Date(partyData.eventDate).toLocaleDateString('pt-BR')}</span>
                        </div>
                        {partyData.startTime && (
                          <span>{partyData.startTime}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 mt-1 truncate">{partyData.location}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Guest Breakdown - Apenas se há festa configurada */}
              {partyData && !isConfiguring && (
                <div className="mx-6 mt-4 p-4 bg-white border border-gray-200 rounded-xl">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <MdPerson className="text-[#F71875]" />
                    Convidados ({getTotalGuests()})
                  </h3>
                  
                  <div className="space-y-1">
                     {/* Inteira */}
                     <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                           <MdPerson className="text-green-600 text-sm" />
                         </div>
                         <div>
                           <span className="text-sm font-medium text-gray-900">Inteira</span>
                           <p className="text-xs text-gray-500">13+ anos (100%)</p>
                         </div>
                       </div>
                       <div className="flex items-center gap-3">
                         <button
                           onClick={() => handleGuestBreakdownChange('fullGuests', guestBreakdown.fullGuests - 1)}
                           disabled={guestBreakdown.fullGuests === 0}
                           className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center transition-all hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-300"
                         >
                           <MdRemove className="text-sm text-gray-600" />
                         </button>
                         <span className="w-8 text-center text-sm font-medium text-gray-900">{guestBreakdown.fullGuests}</span>
                         <button
                           onClick={() => handleGuestBreakdownChange('fullGuests', guestBreakdown.fullGuests + 1)}
                           className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center transition-all hover:border-gray-400 hover:bg-gray-50"
                         >
                           <MdAdd className="text-sm text-gray-600" />
                         </button>
                       </div>
                     </div>

                     {/* Meia */}
                     <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                           <MdPersonOutline className="text-blue-600 text-sm" />
                         </div>
                         <div>
                           <span className="text-sm font-medium text-gray-900">Meia</span>
                           <p className="text-xs text-gray-500">6-12 anos (50%)</p>
                         </div>
                       </div>
                       <div className="flex items-center gap-3">
                         <button
                           onClick={() => handleGuestBreakdownChange('halfGuests', guestBreakdown.halfGuests - 1)}
                           disabled={guestBreakdown.halfGuests === 0}
                           className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center transition-all hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-300"
                         >
                           <MdRemove className="text-sm text-gray-600" />
                         </button>
                         <span className="w-8 text-center text-sm font-medium text-gray-900">{guestBreakdown.halfGuests}</span>
                         <button
                           onClick={() => handleGuestBreakdownChange('halfGuests', guestBreakdown.halfGuests + 1)}
                           className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center transition-all hover:border-gray-400 hover:bg-gray-50"
                         >
                           <MdAdd className="text-sm text-gray-600" />
                         </button>
                       </div>
                     </div>

                     {/* Free */}
                     <div className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                       <div className="flex items-center gap-3">
                         <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                           <MdFace className="text-orange-600 text-sm" />
                         </div>
                         <div>
                           <span className="text-sm font-medium text-gray-900">Gratuito</span>
                           <p className="text-xs text-gray-500">0-5 anos (0%)</p>
                         </div>
                       </div>
                       <div className="flex items-center gap-3">
                         <button
                           onClick={() => handleGuestBreakdownChange('freeGuests', guestBreakdown.freeGuests - 1)}
                           disabled={guestBreakdown.freeGuests === 0}
                           className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center transition-all hover:border-gray-400 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-gray-300"
                         >
                           <MdRemove className="text-sm text-gray-600" />
                         </button>
                         <span className="w-8 text-center text-sm font-medium text-gray-900">{guestBreakdown.freeGuests}</span>
                         <button
                           onClick={() => handleGuestBreakdownChange('freeGuests', guestBreakdown.freeGuests + 1)}
                           className="w-8 h-8 border border-gray-300 rounded-full flex items-center justify-center transition-all hover:border-gray-400 hover:bg-gray-50"
                         >
                           <MdAdd className="text-sm text-gray-600" />
                         </button>
                       </div>
                     </div>
                  </div>
                </div>
              )}

              {/* Main Content */}
              <div className="flex-1 overflow-y-auto">
                {isConfiguring ? (
                  <PartyConfigForm 
                    onComplete={handlePartyConfigComplete}
                    pendingService={pendingService}
                  />
                ) : cartItems.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <MdShoppingCart className="text-3xl text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Carrinho vazio
                    </h3>
                    <p className="text-gray-500 text-sm mb-6 max-w-sm">
                      Adicione serviços para começar a montar sua festa dos sonhos
                    </p>
                    {!partyData && (
                      <button
                        onClick={() => setIsConfiguring(true)}
                        className="bg-gradient-to-r from-[#F71875] to-[#A502CA] hover:from-[#E6006F] hover:to-[#8B0A9E] text-white px-6 py-3 rounded-xl font-medium transition-all transform hover:scale-105"
                      >
                        Configurar Nova Festa
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="p-6 space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                        <div className="flex gap-4">
                          <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-100 flex-shrink-0">
                            <img
                              src={item.image}
                              alt={item.serviceName}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-gray-900 text-sm truncate">
                              {item.serviceName}
                            </h4>
                            <p className="text-xs text-gray-500 mb-3 truncate">
                              {item.providerName}
                            </p>
                            
                            <div className="flex items-center justify-between mt-2">
                              <div className="text-sm text-gray-600">
                                Serviço contratado
                              </div>
                              
                              <div className="text-right">
                                <p className="font-bold text-[#F71875] text-sm">
                                  {formatPrice(calculateItemTotal(item))}
                                </p>
                                <button
                                  onClick={() => removeFromCart(item.id)}
                                  className="text-xs text-red-500 hover:text-red-700 transition-colors mt-1"
                                >
                                  Remover
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer com Total e Checkout - Design minimalista */}
              {cartItems.length > 0 && !isConfiguring && (
                <div className="border-t border-gray-200 bg-white p-6">
                  <div className="space-y-3 mb-4">
                    {/* Breakdown de preços */}
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Subtotal</span>
                      <span>{formatPrice(getCalculatedTotal())}</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Taxa de serviço</span>
                      <span className="text-emerald-600 font-medium">Grátis</span>
                    </div>
                    <div className="flex justify-between text-sm text-gray-600">
                      <span>Entrega</span>
                      <span className="text-emerald-600 font-medium">Grátis</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-gray-900">Total</span>
                        <span className="text-xl font-bold text-[#F71875]">
                          {formatPrice(getCalculatedTotal())}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Botão de sincronização manual caso não tenha eventId */}
                  {!eventId && partyData && (
                    <button 
                      onClick={handleSyncNow}
                      className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 rounded-lg mb-2 transition-colors"
                      disabled={isLoading}
                    >
                      {isLoading ? 'Sincronizando...' : 'Sincronizar Festa'}
                    </button>
                  )}
                  
                  <button 
                    onClick={handleFinalizarPedido}
                    className="w-full bg-gradient-to-r from-[#F71875] to-[#A502CA] hover:from-[#E6006F] hover:to-[#8B0A9E] text-white font-semibold py-4 rounded-xl transition-all transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                    disabled={isLoading || isFinalizingOrder}
                  >
                    {isFinalizingOrder ? 'Finalizando...' : isLoading ? 'Sincronizando...' : 'Finalizar Pedido'}
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
