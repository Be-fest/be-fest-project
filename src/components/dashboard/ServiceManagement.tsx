'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MdEdit, MdDelete, MdVisibility, MdVisibilityOff } from 'react-icons/md';
import { ServiceFormModal } from './ServiceFormModal';
import { getProviderServicesAction, toggleServiceStatusAction, deleteServiceAction } from '@/lib/actions/services';
import { Service } from '@/types/database';
import { useToastGlobal } from '@/contexts/GlobalToastContext';

export function ServiceManagement() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const toast = useToastGlobal();

  // Carregar serviços do prestador
  const loadServices = async () => {
    setLoading(true);
    const result = await getProviderServicesAction();
    if (result.success && result.data) {
      setServices(result.data);
    } else {
      console.error('Erro ao carregar serviços:', result.error);
      toast.error(
        'Erro ao carregar serviços',
        result.error || 'Não foi possível carregar seus serviços.',
        5000
      );
    }
    setLoading(false);
  };

  useEffect(() => {
    loadServices();
  }, []);

  const handleAddService = () => {
    setEditingService(null);
    setIsModalOpen(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setIsModalOpen(true);
  };

  const handleDeleteService = async (serviceId: string) => {
    const serviceToDelete = services.find(s => s.id === serviceId);
    
    if (confirm('Tem certeza que deseja excluir este serviço?')) {
      const result = await deleteServiceAction(serviceId);
      if (result.success) {
        setServices(services.filter(s => s.id !== serviceId));
        
        // Toast de sucesso
        toast.success(
          'Serviço excluído!',
          `O serviço "${serviceToDelete?.name}" foi excluído com sucesso.`,
          4000
        );
      } else {
        const errorMessage = result.error || 'Erro ao excluir serviço';
        
        // Toast de erro
        toast.error(
          'Erro ao excluir serviço',
          errorMessage,
          5000
        );
      }
    }
  };

  const toggleServiceStatus = async (serviceId: string) => {
    const serviceToToggle = services.find(s => s.id === serviceId);
    const newStatus = !serviceToToggle?.is_active;
    
    const result = await toggleServiceStatusAction(serviceId);
    if (result.success && result.data) {
      setServices(services.map(s => 
        s.id === serviceId ? result.data! : s
      ));
      
      // Toast de sucesso
      toast.success(
        `Serviço ${newStatus ? 'ativado' : 'desativado'}!`,
        `O serviço "${serviceToToggle?.name}" foi ${newStatus ? 'ativado' : 'desativado'} com sucesso.`,
        3000
      );
    } else {
      const errorMessage = result.error || 'Erro ao alterar status do serviço';
      
      // Toast de erro
      toast.error(
        'Erro ao alterar status',
        errorMessage,
        5000
      );
    }
  };

  const handleServiceSubmit = () => {
    setIsModalOpen(false);
    loadServices(); // Recarregar lista após criar/editar
    
    // Toast será mostrado pelo modal
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-[#520029] mb-2">Meus Serviços</h2>
          <p className="text-gray-600">Gerencie seus serviços e preços</p>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="h-48 bg-gray-200 animate-pulse"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse"></div>
                <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header - Removido botão */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-[#520029] mb-2">Meus Serviços</h2>
        <p className="text-gray-600">Gerencie seus serviços e preços</p>
      </div>

      {/* Empty State */}
      {services.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="w-20 h-20 bg-gradient-to-br from-[#A502CA] to-[#8B0A9E] rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-white text-2xl">📋</span>
          </div>
          <h3 className="text-xl font-semibold text-[#520029] mb-3">
            Nenhum serviço cadastrado
          </h3>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Comece adicionando seu primeiro serviço para aparecer na plataforma e começar a receber solicitações.
          </p>
          <button
            onClick={handleAddService}
            className="bg-[#A502CA] hover:bg-[#8B0A9E] text-white px-8 py-3 rounded-lg font-medium transition-colors shadow-sm hover:shadow-md"
          >
            Adicionar Primeiro Serviço
          </button>
        </div>
      )}

      {/* Services Grid - Removido card de adicionar serviço */}
      {services.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
            >
              {/* Service Image */}
              <div className="h-48 bg-gray-200 relative">
                <img
                  src={service.images_urls?.[0] || '/images/placeholder-service.png'}
                  alt={service.name}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/images/placeholder-service.png';
                  }}
                />
                <div className="absolute top-3 right-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                      service.is_active
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {service.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div className="absolute top-3 left-3">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium shadow-sm ${
                      service.status === 'active'
                        ? 'bg-blue-100 text-blue-800'
                        : service.status === 'pending_approval'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {service.status === 'active' ? 'Aprovado' : 
                     service.status === 'pending_approval' ? 'Pendente' : 'Inativo'}
                  </span>
                </div>
              </div>

              {/* Service Info */}
              <div className="p-5">
                <h3 className="font-semibold text-lg text-[#520029] mb-2 line-clamp-1">
                  {service.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {service.description || 'Sem descrição'}
                </p>
                
                <div className="space-y-2 mb-5">
                  <div className="flex items-center justify-between">
                    <span className="text-[#A502CA] font-bold text-lg">
                      R$ {service.base_price.toFixed(2)}
                    </span>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {service.category}
                    </span>
                  </div>
                  
                  {service.price_per_guest && (
                    <div className="text-sm text-gray-600">
                      + R$ {service.price_per_guest.toFixed(2)}/convidado
                    </div>
                  )}
                  
                  {(service.min_guests > 0 || service.max_guests) && (
                    <div className="text-xs text-gray-500">
                      {service.min_guests > 0 && `Mín: ${service.min_guests}`}
                      {service.min_guests > 0 && service.max_guests && ' • '}
                      {service.max_guests && `Máx: ${service.max_guests}`}
                      {' convidados'}
                    </div>
                  )}
                </div>

                {/* Action Buttons - Reorganizados */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEditService(service)}
                    className="flex-1 bg-blue-50 hover:bg-blue-100 text-blue-600 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    <MdEdit className="text-base" />
                    Editar
                  </button>
                  <button
                    onClick={() => toggleServiceStatus(service.id)}
                    className="bg-gray-50 hover:bg-gray-100 text-gray-600 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-1"
                  >
                    {service.is_active ? <MdVisibilityOff className="text-base" /> : <MdVisibility className="text-base" />}
                  </button>
                  <button
                    onClick={() => handleDeleteService(service.id)}
                    className="bg-red-50 hover:bg-red-100 text-red-600 py-2 px-3 rounded-lg text-sm font-medium transition-colors flex items-center justify-center"
                  >
                    <MdDelete className="text-base" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Service Form Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <ServiceFormModal
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            service={editingService}
            onSubmit={handleServiceSubmit}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
