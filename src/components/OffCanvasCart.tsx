"use client";

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdClose, MdAdd, MdRemove, MdShoppingCart, MdLocationOn } from 'react-icons/md';
import { useCart } from '../contexts/CartContext';
import { PartyConfigForm } from './PartyConfigForm';

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

export function OffCanvasCart({ isOpen, onClose, showPartyConfig = false, pendingService }: OffCanvasCartProps) {
  const { 
    cartItems, 
    partyData, 
    updateQuantity, 
    removeFromCart, 
    getTotalPrice
  } = useCart();

  const [isConfiguring, setIsConfiguring] = useState(showPartyConfig);

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const calculateItemTotal = (item: any) => {
    if (!partyData) return item.price * item.quantity;
    
    const fullGuestPrice = item.price * partyData.fullGuests;
    const halfGuestPrice = (item.price * 0.5) * partyData.halfGuests;
    return (fullGuestPrice + halfGuestPrice) * item.quantity;
  };

  const handlePartyConfigComplete = () => {
    setIsConfiguring(false);
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
              className="fixed inset-0 bg-black bg-opacity-90 z-[60]"
            />
            
            {/* Off-canvas Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed right-0 top-0 h-full w-full max-w-md bg-white shadow-xl z-[70] flex flex-col"
            >              {/* Header */}
              <div className="bg-[#F71875] text-white px-4 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <MdShoppingCart className="text-2xl" />
                  <div>
                    <h2 className="text-lg font-bold">
                      {isConfiguring ? 'Nova Festa' : 'Seu pedido em'}
                    </h2>
                    <p className="text-sm opacity-90">
                      {isConfiguring 
                        ? 'Configure sua festa dos sonhos' 
                        : (partyData?.eventName || 'Configure sua festa')
                      }
                    </p>
                  </div>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white hover:bg-opacity-20 rounded-full transition-colors"
                >
                  <MdClose className="text-xl" />
                </button>
              </div>              {/* Event Info */}
              {partyData && !isConfiguring && (
                <div className="px-4 py-3 bg-gray-50 border-b">
                  <div className="flex items-start gap-2">
                    <MdLocationOn className="text-[#F71875] mt-1 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-gray-800">{partyData.eventName}</p>
                      <p className="text-gray-600">{partyData.location}</p>
                      <p className="text-gray-600">
                        {new Date(partyData.eventDate).toLocaleDateString('pt-BR')} às {partyData.startTime}
                      </p>
                      <p className="text-gray-600 text-xs mt-1">
                        {partyData.fullGuests} adultos, {partyData.halfGuests} crianças
                        {partyData.freeGuests > 0 && `, ${partyData.freeGuests} grátis`}
                      </p>
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
                    <MdShoppingCart className="text-6xl text-gray-300 mb-4" />
                    <h3 className="text-lg font-medium text-gray-600 mb-2">
                      Sua sacola está vazia
                    </h3>
                    <p className="text-gray-500 text-sm mb-4">
                      Adicione itens para começar a montar sua festa
                    </p>
                    {!partyData && (
                      <button
                        onClick={() => setIsConfiguring(true)}
                        className="bg-[#F71875] hover:bg-[#E6006F] text-white px-6 py-2 rounded-lg font-medium transition-colors"
                      >
                        Configurar Nova Festa
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="p-4 space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="bg-white border border-gray-200 rounded-lg p-4">
                        <div className="flex gap-3">
                          <img
                            src={item.image}
                            alt={item.serviceName}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-800 text-sm">
                              {item.serviceName}
                            </h4>
                            <p className="text-xs text-gray-500 mb-2">
                              {item.providerName}
                            </p>
                            
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                                >
                                  <MdRemove className="text-sm" />
                                </button>
                                <span className="w-8 text-center font-medium">
                                  {item.quantity}
                                </span>
                                <button
                                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  className="w-8 h-8 rounded-full bg-[#F71875] hover:bg-[#E6006F] text-white flex items-center justify-center transition-colors"
                                >
                                  <MdAdd className="text-sm" />
                                </button>
                              </div>
                              
                              <div className="text-right">
                                <p className="font-bold text-[#F71875]">
                                  {formatPrice(calculateItemTotal(item))}
                                </p>
                                <button
                                  onClick={() => removeFromCart(item.id)}
                                  className="text-xs text-red-500 hover:text-red-700 transition-colors"
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
              </div>              {/* Footer com Total e Checkout */}
              {cartItems.length > 0 && !isConfiguring && (
                <div className="border-t bg-white p-4 space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subtotal</span>
                      <span>{formatPrice(getTotalPrice())}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Taxa de serviço</span>
                      <span className="text-green-600">Grátis</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Taxa de entrega</span>
                      <span className="text-green-600">Grátis</span>
                    </div>
                    <hr />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span className="text-[#F71875]">{formatPrice(getTotalPrice())}</span>
                    </div>
                  </div>
                  
                  <button className="w-full bg-[#F71875] hover:bg-[#E6006F] text-white font-bold py-4 rounded-lg transition-colors">
                    Escolher forma de pagamento
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
