'use client';

import { motion } from 'framer-motion';
import { ActiveParty } from '@/types/admin';
import { StatusBadge } from './StatusBadge';

// Mock data para demonstração
const mockParties: ActiveParty[] = [
  {
    id: '1',
    name: 'Festa de Aniversário - João',
    client: 'João Silva',
    status: 'confirmacao',
    progress: 75,
    date: new Date('2024-02-15'),
    services: [
      { id: '1', name: 'Buffet', provider: 'Barreto\'s Buffet', status: 'confirmado', value: 3000 },
      { id: '2', name: 'DJ', provider: 'DJ Mix', status: 'aguardando_pagamento', value: 800 }
    ]
  },
  {
    id: '2',
    name: 'Casamento - Maria & Pedro',
    client: 'Maria Santos',
    status: 'em_andamento',
    progress: 90,
    date: new Date('2024-02-20'),
    services: [
      { id: '3', name: 'Decoração', provider: 'Flores & Cia', status: 'confirmado', value: 2500 },
      { id: '4', name: 'Fotografia', provider: 'Studio Click', status: 'confirmado', value: 1200 }
    ]
  }
];

export function ActivePartiesTracker() {
  const getProgressSteps = () => [
    'Contratação',
    'Pagamento', 
    'Confirmação',
    'Em Andamento',
    'Concluído'
  ];

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return 'from-green-500 to-green-600';
    if (progress >= 60) return 'from-yellow-500 to-yellow-600';
    return 'from-primary to-primary-dark';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.4 }}
      className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100"
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-2">
        <h2 className="text-lg sm:text-xl font-semibold text-title">
          Festas em Andamento
        </h2>
        <span className="text-xs sm:text-sm text-gray-500">
          {mockParties.length} festas ativas
        </span>
      </div>
      
      <div className="space-y-4 sm:space-y-6">
        {mockParties.map((party, index) => (
          <motion.div
            key={party.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 * index }}
            className="space-y-3 sm:space-y-4 p-3 sm:p-4 bg-gray-50 rounded-lg"
          >
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
              <div className="flex-1">
                <h3 className="font-medium text-gray-800 text-sm sm:text-base">{party.name}</h3>
                <p className="text-xs sm:text-sm text-gray-500">{party.client}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Data: {party.date.toLocaleDateString('pt-BR')}
                </p>
              </div>
              <div className="text-left sm:text-right">
                <div className="text-sm font-medium text-gray-700 mb-1">
                  {party.progress}% completo
                </div>
              </div>
            </div>
            
            {/* Barra de Progresso */}
            <div className="space-y-2">
              <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${party.progress}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className={`h-full bg-gradient-to-r ${getProgressColor(party.progress)}`}
                />
              </div>
              
              {/* Etapas */}
              <div className="hidden sm:flex justify-between text-xs text-gray-500">
                {getProgressSteps().map((step, stepIndex) => (
                  <span
                    key={step}
                    className={`${
                      stepIndex < (party.progress / 20) ? 'text-primary font-medium' : ''
                    }`}
                  >
                    {step}
                  </span>
                ))}
              </div>
              
              {/* Etapas Mobile - Layout simplificado */}
              <div className="sm:hidden grid grid-cols-2 gap-1 text-xs text-gray-500">
                {getProgressSteps().map((step, stepIndex) => (
                  <span
                    key={step}
                    className={`text-center ${
                      stepIndex < (party.progress / 20) ? 'text-primary font-medium' : ''
                    }`}
                  >
                    {step}
                  </span>
                ))}
              </div>
            </div>

            {/* Serviços */}
            <div className="space-y-2">
              <h4 className="text-xs sm:text-sm font-medium text-gray-700">Serviços:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {party.services.map((service) => (
                  <div key={service.id} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs p-2 bg-white rounded border">
                    <span className="text-gray-600 font-medium">{service.name}</span>
                    <StatusBadge status={service.status} size="sm" />
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
} 