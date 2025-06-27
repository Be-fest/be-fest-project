'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MdCheck, MdClose, MdVisibility, MdMessage } from 'react-icons/md';

interface OrderRequest {
  id: string;
  clientName: string;
  eventName: string;
  eventDate: string;
  guests: number;
  services: string[];
  totalValue: number;
  status: 'pending' | 'accepted' | 'rejected';
  requestDate: string;
  location: string;
  notes?: string;
}

export function OrderRequests() {
  const [filter, setFilter] = useState<'all' | 'pending' | 'accepted' | 'rejected'>('all');
  
  const [requests] = useState<OrderRequest[]>([
    {
      id: '1',
      clientName: 'Maria Silva',
      eventName: 'Aniversário 15 anos da Ana',
      eventDate: '2024-03-15',
      guests: 80,
      services: ['Churras Premium', 'Open Bar'],
      totalValue: 4800,
      status: 'pending',
      requestDate: '2024-02-10',
      location: 'Salão de Festas Vila Madalena',
      notes: 'Gostaria de confirmar se vocês trabalham com decoração também'
    },
    {
      id: '2',
      clientName: 'João Santos',
      eventName: 'Casamento João & Clara',
      eventDate: '2024-04-20',
      guests: 150,
      services: ['Buffet Completo', 'Open Bar Premium'],
      totalValue: 12000,
      status: 'accepted',
      requestDate: '2024-02-08',
      location: 'Espaço Eventos Jardins'
    },
    {
      id: '3',
      clientName: 'Ana Costa',
      eventName: 'Festa Corporativa',
      eventDate: '2024-03-25',
      guests: 60,
      services: ['Coffee Break', 'Almoço Executivo'],
      totalValue: 3200,
      status: 'pending',
      requestDate: '2024-02-12',
      location: 'Hotel Ibis Moema'
    }
  ]);

  const filteredRequests = requests.filter(request => 
    filter === 'all' || request.status === filter
  );

  const handleAcceptRequest = (requestId: string) => {
    console.log('Accepting request:', requestId);
  };

  const handleRejectRequest = (requestId: string) => {
    console.log('Rejecting request:', requestId);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente';
      case 'accepted': return 'Aceito';
      case 'rejected': return 'Rejeitado';
      default: return 'Desconhecido';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#520029]">Solicitações de Eventos</h2>
          <p className="text-gray-600">Gerencie as solicitações dos seus clientes</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-sm p-1 inline-flex">
        {[
          { key: 'all', label: 'Todas' },
          { key: 'pending', label: 'Pendentes' },
          { key: 'accepted', label: 'Aceitas' },
          { key: 'rejected', label: 'Rejeitadas' }
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-4 py-2 rounded-md font-medium text-sm transition-colors ${
              filter === tab.key
                ? 'bg-[#A502CA] text-white'
                : 'text-gray-600 hover:text-[#A502CA]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.map((request, index) => (
          <motion.div
            key={request.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm p-6"
          >
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-lg font-semibold text-[#520029] mb-1">
                  {request.eventName}
                </h3>
                <p className="text-gray-600">Cliente: {request.clientName}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(request.status)}`}>
                {getStatusText(request.status)}
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Data do evento:</span> {' '}
                  {new Date(request.eventDate).toLocaleDateString('pt-BR')}
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Local:</span> {request.location}
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Convidados:</span> {request.guests}
                </p>
              </div>
              <div className="space-y-2">
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Serviços:</span> {' '}
                  {request.services.join(', ')}
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Valor total:</span> {' '}
                  <span className="font-bold text-[#A502CA]">
                    R$ {request.totalValue.toLocaleString('pt-BR')}
                  </span>
                </p>
                <p className="text-sm">
                  <span className="font-medium text-gray-700">Solicitado em:</span> {' '}
                  {new Date(request.requestDate).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>

            {request.notes && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-blue-800">
                  <span className="font-medium">Observações do cliente:</span> {request.notes}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t">
              <button className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors">
                <MdVisibility />
                Ver Detalhes
              </button>
              <button className="flex items-center gap-2 bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg font-medium transition-colors">
                <MdMessage />
                Mensagem
              </button>
              
              {request.status === 'pending' && (
                <>
                  <button
                    onClick={() => handleAcceptRequest(request.id)}
                    className="flex items-center gap-2 bg-green-100 hover:bg-green-200 text-green-700 px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <MdCheck />
                    Aceitar
                  </button>
                  <button
                    onClick={() => handleRejectRequest(request.id)}
                    className="flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    <MdClose />
                    Rejeitar
                  </button>
                </>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {filteredRequests.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">
            Nenhuma solicitação encontrada para o filtro selecionado.
          </p>
        </div>
      )}
    </div>
  );
}
