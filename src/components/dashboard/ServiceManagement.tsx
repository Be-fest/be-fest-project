'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdAdd, MdEdit, MdDelete, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { getMockServicesByProviderId } from '@/data/mockData';
import { ServiceFormModal } from './ServiceFormModal';

export function ServiceManagement() {
  const [services] = useState(getMockServicesByProviderId('1')); // Mock data
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<any>(null);

  const handleAddService = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  const handleEditService = (service: any) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleDeleteService = (serviceId: string) => {
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      console.log('Deleting service:', serviceId);
    }
  };

  const toggleServiceStatus = (serviceId: string) => {
    console.log('Toggling service status:', serviceId);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#520029]">Meus Serviços</h2>
          <p className="text-gray-600">Gerencie seus serviços e preços</p>
        </div>
        <button
          onClick={handleAddService}
          className="bg-[#A502CA] hover:bg-[#8B0A9E] text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
        >
          <MdAdd />
          Adicionar Serviço
        </button>
      </div>

      {/* Services Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {services.map((service, index) => (
          <motion.div
            key={service.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
          >
            {/* Service Image */}
            <div className="h-48 bg-gray-200 relative">
              <img
                src={service.images_urls?.[0] || '/images/placeholder-service.png'}
                alt={service.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    service.is_active
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  {service.is_active ? 'Ativo' : 'Inativo'}
                </span>
              </div>
            </div>

            {/* Service Info */}
            <div className="p-4">
              <h3 className="font-semibold text-lg text-[#520029] mb-2">
                {service.name}
              </h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                {service.description}
              </p>
              <div className="flex items-center justify-between mb-4">
                <span className="text-[#A502CA] font-bold text-lg">
                  R$ {service.price_per_guest?.toFixed(2)}/pessoa
                </span>
                <span className="text-sm text-gray-500 bg-gray-100 px-2 py-1 rounded">
                  {service.category}
                </span>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2">
                <button
                  onClick={() => handleEditService(service)}
                  className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                >
                  <MdEdit />
                  Editar
                </button>
                <button
                  onClick={() => toggleServiceStatus(service.id)}
                  className="flex-1 bg-gray-50 hover:bg-gray-100 text-gray-600 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                >
                  {service.is_active ? <MdVisibilityOff /> : <MdVisibility />}
                  {service.is_active ? 'Ocultar' : 'Mostrar'}
                </button>
                <button
                  onClick={() => handleDeleteService(service.id)}
                  className="bg-red-50 hover:bg-red-100 text-red-600 py-2 px-3 rounded-lg text-sm font-medium transition-colors"
                >
                  <MdDelete />
                </button>
              </div>
            </div>
          </motion.div>
        ))}

        {/* Add Service Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: services.length * 0.1 }}
          onClick={handleAddService}
          className="bg-white rounded-lg shadow-sm border-2 border-dashed border-gray-300 hover:border-[#A502CA] transition-colors cursor-pointer min-h-[320px] flex flex-col items-center justify-center text-gray-500 hover:text-[#A502CA]"
        >
          <MdAdd className="text-4xl mb-3" />
          <h3 className="font-medium text-lg mb-1">Adicionar Serviço</h3>
          <p className="text-sm text-center">
            Clique para adicionar um novo serviço
          </p>
        </motion.div>
      </div>

      {/* Service Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <ServiceFormModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            service={editingService}
            onSubmit={(data) => {
              console.log('Service data:', data);
              setIsModalOpen(false);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
