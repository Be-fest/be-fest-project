'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  MdHistory,
  MdEvent,
  MdCalendarToday,
  MdLocationOn,
  MdPeople,
  MdCheckCircle,
  MdStar,
  MdVisibility,
  MdDownload
} from 'react-icons/md';
import { ClientLayout } from '@/components/client/ClientLayout';
import { ClientAuthGuard } from '@/components/ClientAuthGuard';
import { ClientOnlyGuard } from '@/components/guards/ClientOnlyGuard';

export default function HistoricoPage() {
  const pastEvents = [
    {
      id: 1,
      title: 'Festa de Formatura',
      date: '2024-05-15',
      location: 'Salão de Festas Central',
      guests: 150,
      status: 'completed',
      rating: 5,
      image: '/placeholder-event.jpg'
    },
    {
      id: 2,
      title: 'Aniversário de 30 anos',
      date: '2024-03-20',
      location: 'Chácara do Sol',
      guests: 80,
      status: 'completed',
      rating: 4,
      image: '/placeholder-event.jpg'
    },
    {
      id: 3,
      title: 'Casamento Civil',
      date: '2024-01-10',
      location: 'Cartório da Paz',
      guests: 30,
      status: 'completed',
      rating: 5,
      image: '/placeholder-event.jpg'
    },
    {
      id: 4,
      title: 'Festa de Confraternização',
      date: '2023-12-15',
      location: 'Restaurante Bella Vista',
      guests: 60,
      status: 'completed',
      rating: 4,
      image: '/placeholder-event.jpg'
    }
  ];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <MdStar
        key={i}
        className={`text-sm ${i < rating ? 'text-yellow-400' : 'text-gray-300'}`}
      />
    ));
  };

  return (
    <ClientOnlyGuard>
      <ClientAuthGuard requiredRole="client">
        <ClientLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Histórico de Eventos
            </h1>
            <p className="text-gray-600 text-lg">
              Reveja todos os seus eventos anteriores e suas avaliações
            </p>
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center">
                  <MdEvent className="text-xl text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{pastEvents.length}</p>
                  <p className="text-gray-600 text-sm font-medium">Eventos Realizados</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center">
                  <MdPeople className="text-xl text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {pastEvents.reduce((sum, event) => sum + event.guests, 0)}
                  </p>
                  <p className="text-gray-600 text-sm font-medium">Total de Convidados</p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-yellow-50 rounded-xl flex items-center justify-center">
                  <MdStar className="text-xl text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {pastEvents.length > 0 ? (pastEvents.reduce((sum, event) => sum + (event.rating || 0), 0) / pastEvents.length).toFixed(1) : '0.0'}
                  </p>
                  <p className="text-gray-600 text-sm font-medium">Avaliação Média</p>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Events History */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-900">
              Seus Eventos Anteriores
            </h2>
            
            <div className="space-y-4">
              {pastEvents.map((event, index) => (
                <motion.div
                  key={event.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-200"
                >
                  <div className="p-4 sm:p-5">
                    <div className="flex items-start gap-3 sm:gap-4">
                      {/* Event Image */}
                      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-[#F71875] to-[#A502CA] rounded-lg flex items-center justify-center flex-shrink-0">
                        <MdEvent className="text-white text-lg sm:text-xl" />
                      </div>
                      
                      {/* Event Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5 truncate">
                              {event.title}
                            </h3>
                            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-gray-600 text-xs sm:text-sm">
                              <div className="flex items-center gap-1">
                                <MdCalendarToday className="text-xs" />
                                <span className="truncate">{formatDate(event.date)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MdLocationOn className="text-xs" />
                                <span className="truncate">{event.location}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <MdPeople className="text-xs" />
                                <span>{event.guests} convidados</span>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium ml-2 flex-shrink-0">
                            <MdCheckCircle className="text-xs" />
                            <span className="hidden sm:inline">Realizado</span>
                          </div>
                        </div>
                        
                        {/* Rating and Actions */}
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs sm:text-sm font-medium text-gray-700">Avaliação:</span>
                            <div className="flex items-center gap-0.5">
                              {renderStars(event.rating)}
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-1.5 sm:gap-2">
                            <button className="px-3 py-1.5 text-xs sm:text-sm font-medium text-[#F71875] hover:bg-[#F71875] hover:text-white rounded-md transition-colors duration-200 border border-[#F71875] flex items-center gap-1">
                              <MdVisibility className="text-xs" />
                              <span className="hidden sm:inline">Ver Detalhes</span>
                              <span className="sm:hidden">Ver</span>
                            </button>
                            <button className="px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-md transition-colors duration-200 flex items-center gap-1">
                              <MdDownload className="text-xs" />
                              <span className="hidden sm:inline">Relatório</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Empty State (if no events) */}
          {pastEvents.length === 0 && (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm border border-gray-100">
              <div className="w-24 h-24 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <MdHistory className="text-gray-400 text-4xl" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Nenhum evento no histórico
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto text-lg">
                Você ainda não realizou nenhum evento. Quando concluir seus primeiros eventos, eles aparecerão aqui.
              </p>
            </div>
          )}
        </div>
        </ClientLayout>
      </ClientAuthGuard>
    </ClientOnlyGuard>
  );
}