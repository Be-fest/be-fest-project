'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MdEdit, MdSave, MdCancel, MdCloudUpload, MdWarning, MdRemove, MdImage } from 'react-icons/md';
import { getProviderStatsAction } from '@/lib/actions/services';
import { uploadProfileImageAction, deleteProfileImageAction, updateProviderProfileAction } from '@/lib/actions/auth';
import { User } from '@/types/database';
import { ProviderProfileSkeleton, AddressFields, ServiceRadiusPicker } from '@/components/ui';
import AreaOfOperationSelect from '@/components/ui/AreaOfOperationSelect';
import { useToastGlobal } from '@/contexts/GlobalToastContext';
import { invalidateServiceImagesCache } from '@/hooks/useImagePreloader';
import { useAuth } from '@/hooks/useAuth';
import { geocodingService } from '@/lib/services/geocoding';

interface ProviderStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  activeServices: number;
  totalRevenue: number;
  completedEvents: number;
}

interface AddressData {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipcode: string;
}

interface FormData {
  organization_name: string;
  organization_description: string;
  full_name: string;
  email: string;
  whatsapp_number: string;
  area_of_operation: string; // Subcategoria (buffet, churrasco, etc.)
  address: AddressData; // Endereço completo
  coordenates: {
    latitude: number;
    longitude: number;
    raio_atuacao: number;
  };
  profile_image: string | File;
}

export function ProviderProfile() {
  const { user, userData, loading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [stats, setStats] = useState<ProviderStats>({
    totalRequests: 0,
    pendingRequests: 0,
    approvedRequests: 0,
    activeServices: 0,
    totalRevenue: 0,
    completedEvents: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const toast = useToastGlobal();
  
  const [formData, setFormData] = useState<FormData>({
    organization_name: '',
    organization_description: '',
    full_name: '',
    email: '',
    whatsapp_number: '',
    area_of_operation: '',
    address: {
      street: '',
      number: '',
      neighborhood: '',
      city: '',
      state: '',
      zipcode: ''
    },
    coordenates: {
      latitude: 0,
      longitude: 0,
      raio_atuacao: 50,
    },
    profile_image: '',
  });

  // Função para analisar endereço completo em componentes
  const parseAddress = (fullAddress: string): AddressData => {
    // Esta é uma implementação básica - pode ser melhorada
    const parts = fullAddress.split(',').map(part => part.trim());
    
    return {
      street: parts[0] || '',
      number: parts[1] || '',
      neighborhood: parts[2] || '',
      city: parts[3] || '',
      state: parts[4] || '',
      zipcode: ''
    };
  };

  // Função para gerar endereço completo a partir dos campos
  const generateFullAddress = (addressData: AddressData): string => {
    const parts = [];
    
    // Formato: "Rua, Número, Bairro, Cidade, Estado"
    if (addressData.street && addressData.street.trim()) {
      parts.push(addressData.street.trim());
    }
    
    if (addressData.number && addressData.number.trim()) {
      parts.push(addressData.number.trim());
    }
    
    if (addressData.neighborhood && addressData.neighborhood.trim()) {
      parts.push(addressData.neighborhood.trim());
    }
    
    if (addressData.city && addressData.city.trim()) {
      parts.push(addressData.city.trim());
    }
    
    if (addressData.state && addressData.state.trim()) {
      parts.push(addressData.state.trim());
    }
    
    return parts.join(', ');
  };

  // Atualizar formData quando userData mudar
  useEffect(() => {
    if (userData) {
      console.log('✅ [PROVIDER_PROFILE] Dados do usuário atualizados:', userData);
      
      // Analisar endereço existente se houver
      const addressData = userData.address 
        ? parseAddress(userData.address)
        : {
            street: '',
            number: '',
            neighborhood: '',
            city: '',
            state: '',
            zipcode: ''
          };
      
      // Extrair coordenadas do userData
      let coordinates = {
        latitude: 0,
        longitude: 0,
        raio_atuacao: 50
      };
      
      if (userData.coordenates) {
        coordinates = {
          latitude: userData.coordenates.latitude || 0,
          longitude: userData.coordenates.longitude || 0,
          raio_atuacao: userData.coordenates.raio_atuacao || 50
        };
      } else if (userData.latitude && userData.longitude) {
        // Fallback para propriedades diretas se existirem
        coordinates = {
          latitude: userData.latitude,
          longitude: userData.longitude,
          raio_atuacao: userData.raio_atuacao || 50
        };
      }
      
      setFormData({
        organization_name: userData.organization_name || '',
        organization_description: userData.organization_description || '',
        full_name: userData.full_name || '',
        email: userData.email || '',
        whatsapp_number: userData.whatsapp_number || '',
        area_of_operation: userData.area_of_operation || '', // Subcategoria
        address: addressData, // Endereço
        coordenates: coordinates,
        profile_image: userData.profile_image || '',
      });
    }
  }, [userData]);

  useEffect(() => {
    const fetchStats = async () => {
      console.log('🔍 [PROVIDER_PROFILE] Iniciando busca de estatísticas');
      try {
        const result = await getProviderStatsAction();
        console.log('📊 [PROVIDER_PROFILE] Resultado das estatísticas:', result);
        if (result.success && result.data) {
          setStats(result.data);
        } else {
          console.error('❌ [PROVIDER_PROFILE] Erro ao buscar estatísticas:', result.error);
        }
      } catch (err) {
        console.error('💥 [PROVIDER_PROFILE] Erro inesperado ao buscar estatísticas:', err);
      } finally {
        console.log('✅ [PROVIDER_PROFILE] Finalizando busca de estatísticas');
        setStatsLoading(false);
      }
    };

    // Só buscar estatísticas se o usuário estiver carregado e não houver erro
    if (userData && !authLoading) {
      console.log('👤 [PROVIDER_PROFILE] Usuário encontrado, buscando estatísticas');
      fetchStats();
    } else {
      console.log('⏳ [PROVIDER_PROFILE] Aguardando carregamento do usuário - userData:', !!userData, 'authLoading:', authLoading);
    }
  }, [userData, authLoading]);

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const result = await uploadProfileImageAction(formData);
      
      if (result.success && result.data) {
        setFormData(prev => ({
          ...prev,
          profile_image: result.data as string
        }));
        
        // Invalidar cache para mostrar a nova imagem imediatamente
        invalidateServiceImagesCache();
        
        toast.success('Imagem atualizada!', 'Foto de perfil atualizada com sucesso.', 3000);
      } else {
        toast.error('Erro no upload', result.error || 'Falha ao fazer upload da imagem', 5000);
      }
    } catch (error) {
      toast.error('Erro no upload', 'Erro inesperado ao fazer upload da imagem', 5000);
    } finally {
      setUploadingImage(false);
      // Limpar o input file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImageRemove = async () => {
    if (!formData.profile_image) return;
    
    try {
      // Tentar deletar a imagem do storage se ela for do nosso bucket
      if (typeof formData.profile_image === 'string' && formData.profile_image.includes('supabase')) {
        await deleteProfileImageAction(formData.profile_image);
      }
    } catch (error) {
      console.error('Erro ao deletar imagem do storage:', error);
    }
    
    // Remover da lista local
    setFormData(prev => ({
      ...prev,
      profile_image: ''
    }));
    
    toast.success('Imagem removida!', 'A imagem foi removida com sucesso.', 3000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const fullAddress = generateFullAddress(formData.address);
      
      // Validar campos obrigatórios antes de enviar
      const requiredFields = {
        organization_name: 'Nome da empresa é obrigatório',
        full_name: 'Nome do proprietário é obrigatório',
        whatsapp_number: 'WhatsApp é obrigatório',
      };

      const errors: string[] = [];
      
      Object.entries(requiredFields).forEach(([field, errorMessage]) => {
        const value = formData[field as keyof typeof formData];
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          errors.push(errorMessage);
        }
      });

      // Validar se pelo menos alguns campos de endereço foram preenchidos
      if (!formData.address.street || !formData.address.city || !formData.address.state) {
        errors.push('Endereço é obrigatório (pelo menos rua, cidade e estado)');
      }

      if (errors.length > 0) {
        toast.error('Campos obrigatórios', errors.join(', '), 5000);
        return;
      }

      // Tentar geocodificar o endereço
      let coordinates = formData.coordenates;
      if (fullAddress) {
        toast.info('Processando endereço...', 'Obtendo coordenadas do endereço', 3000);
        
        const geocodingResult = await geocodingService.geocodeAddress(fullAddress);
        if (geocodingResult) {
          coordinates = {
            latitude: geocodingResult.latitude,
            longitude: geocodingResult.longitude,
            raio_atuacao: formData.coordenates.raio_atuacao
          };
          console.log('✅ Coordenadas obtidas:', coordinates);
        } else {
          console.warn('⚠️ Não foi possível obter coordenadas para o endereço');
          toast.warning('Aviso', 'Não foi possível obter coordenadas precisas do endereço', 4000);
        }
      }
      
      const formDataToSend = new FormData();
      
      // Adicionar campos básicos
      formDataToSend.append('organization_name', formData.organization_name.trim());
      formDataToSend.append('organization_description', formData.organization_description.trim());
      formDataToSend.append('full_name', formData.full_name.trim());
      formDataToSend.append('whatsapp_number', formData.whatsapp_number.trim());
      formDataToSend.append('area_of_operation', formData.area_of_operation.trim()); // Subcategoria
      formDataToSend.append('address', fullAddress); // Endereço completo
      
      // Adicionar coordenadas
      formDataToSend.append('latitude', coordinates.latitude.toString());
      formDataToSend.append('longitude', coordinates.longitude.toString());
      formDataToSend.append('raio_atuacao', coordinates.raio_atuacao.toString());
      
      // Adicionar imagem se houver
      if (formData.profile_image) {
        formDataToSend.append('profile_image', formData.profile_image);
      }
      
      console.log('Enviando dados:', Object.fromEntries(formDataToSend.entries()));
      
      const result = await updateProviderProfileAction(formDataToSend);
      
      if (result.success) {
        // Atualizar o formData local com as novas coordenadas
        setFormData(prev => ({
          ...prev,
          area_of_operation: formData.area_of_operation, // Subcategoria
          address: formData.address, // Endereço
          coordenates: coordinates
        }));
        
        toast.success('Perfil atualizado!', 'Suas informações foram salvas com sucesso.', 4000);
        setIsEditing(false);
      } else {
        toast.error('Erro ao salvar', result.error || 'Não foi possível salvar as alterações', 5000);
      }
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast.error('Erro inesperado', 'Ocorreu um erro ao salvar o perfil', 5000);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (userData) {
      // Analisar endereço existente se houver
      const addressData = userData.address 
        ? parseAddress(userData.address)
        : {
            street: '',
            number: '',
            neighborhood: '',
            city: '',
            state: '',
            zipcode: ''
          };
      
      // Extrair coordenadas do userData
      let coordinates = {
        latitude: 0,
        longitude: 0,
        raio_atuacao: 50
      };
      
      if (userData.coordenates) {
        coordinates = {
          latitude: userData.coordenates.latitude || 0,
          longitude: userData.coordenates.longitude || 0,
          raio_atuacao: userData.coordenates.raio_atuacao || 50
        };
      } else if (userData.latitude && userData.longitude) {
        // Fallback para propriedades diretas se existirem
        coordinates = {
          latitude: userData.latitude,
          longitude: userData.longitude,
          raio_atuacao: userData.raio_atuacao || 50
        };
      }
      
      setFormData({
        organization_name: userData.organization_name || '',
        organization_description: userData.organization_description || '',
        full_name: userData.full_name || '',
        email: userData.email || '',
        whatsapp_number: userData.whatsapp_number || '',
        area_of_operation: userData.area_of_operation || '', // Subcategoria
        address: addressData, // Endereço
        coordenates: coordinates,
        profile_image: userData.profile_image || '',
      });
    }
    setIsEditing(false);
  };

  if (authLoading) {
    console.log('⏳ [PROVIDER_PROFILE] Mostrando skeleton - authLoading:', authLoading);
    return <ProviderProfileSkeleton />;
  }

  if (!userData) {
    console.log('❌ [PROVIDER_PROFILE] Mostrando erro - userData:', !!userData);
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <MdWarning className="text-red-500 text-4xl mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Erro ao carregar perfil</h3>
        <p className="text-gray-600">{'Não foi possível carregar as informações do perfil'}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#520029]">Meu Perfil</h2>
          <p className="text-gray-600">Gerencie as informações do seu negócio</p>
        </div>
        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-[#A502CA] hover:bg-[#8B0A9E] text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            <MdEdit />
            Editar Perfil
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleCancel}
              disabled={saving}
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <MdCancel />
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-[#A502CA] hover:bg-[#8B0A9E] text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              <MdSave />
              {saving ? 'Salvando...' : 'Salvar'}
            </button>
          </div>
        )}
      </div>

      {/* Profile Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-lg shadow-sm p-6"
      >
        {/* Logo da Empresa */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-[#520029] mb-3">
            Logo da Empresa
          </label>
          
          <div className="flex items-center gap-4">
            {/* Preview da imagem */}
            <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center bg-gray-50 overflow-hidden">
              {formData.profile_image ? (
                <img
                  src={formData.profile_image}
                  alt="Logo da empresa"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-center">
                  <MdImage className="text-gray-400 text-2xl mx-auto mb-1" />
                  <span className="text-xs text-gray-500">Logo</span>
                </div>
              )}
            </div>

            {/* Botões de ação */}
            <div className="flex gap-2">
              {isEditing && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploadingImage}
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                    className="flex items-center gap-2 px-4 py-2 bg-[#A502CA] text-white rounded-lg font-medium hover:bg-[#8B0A9E] transition-colors disabled:opacity-50"
                  >
                    <MdCloudUpload className="text-lg" />
                    {uploadingImage ? 'Enviando...' : 'Alterar Logo'}
                  </button>
                  {formData.profile_image && (
                    <button
                      type="button"
                      onClick={handleImageRemove}
                      disabled={uploadingImage}
                      className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50"
                    >
                      <MdRemove className="text-lg" />
                      Remover
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
          
          {isEditing && (
            <p className="text-xs text-gray-500 mt-2">
              Formatos aceitos: JPEG, PNG, WebP. Tamanho máximo: 5MB.
            </p>
          )}
        </div>

        {/* Campos do formulário */}
        <div className="space-y-6">
          {/* Primeira linha - Nome da Empresa e Nome do Proprietário */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nome da Empresa */}
            <div>
              <label className="block text-sm font-medium text-[#520029] mb-2">
                Nome da Empresa *
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.organization_name}
                  onChange={(e) => handleInputChange('organization_name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A502CA] focus:border-transparent"
                  placeholder="Nome da sua empresa"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-gray-900">{formData.organization_name || 'Não informado'}</span>
                </div>
              )}
            </div>

            {/* Nome do Proprietário */}
            <div>
              <label className="block text-sm font-medium text-[#520029] mb-2">
                Nome do Proprietário *
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A502CA] focus:border-transparent"
                  placeholder="Seu nome completo"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-gray-900">{formData.full_name || 'Não informado'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Segunda linha - Email e WhatsApp */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-[#520029] mb-2">
                Email
              </label>
              <div className="px-4 py-3 bg-gray-100 rounded-lg border border-gray-200">
                <span className="text-gray-500">{formData.email}</span>
                <p className="text-xs text-gray-400 mt-1">O email não pode ser alterado aqui</p>
              </div>
            </div>

            {/* WhatsApp */}
            <div>
              <label className="block text-sm font-medium text-[#520029] mb-2">
                WhatsApp *
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  value={formData.whatsapp_number}
                  onChange={(e) => handleInputChange('whatsapp_number', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A502CA] focus:border-transparent"
                  placeholder="(11) 99999-9999"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-gray-900">{formData.whatsapp_number || 'Não informado'}</span>
                </div>
              )}
            </div>
          </div>

          {/* Terceira linha - Descrição da Empresa (largura completa) */}
          <div>
            <label className="block text-sm font-medium text-[#520029] mb-2">
              Descrição da Empresa
            </label>
            {isEditing ? (
              <textarea
                value={formData.organization_description}
                onChange={(e) => handleInputChange('organization_description', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A502CA] focus:border-transparent"
                rows={3}
                placeholder="Descreva sua empresa e seus serviços"
              />
            ) : (
              <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-gray-900">{formData.organization_description || 'Não informado'}</span>
              </div>
            )}
          </div>

          {/* Quarta linha - Subcategoria e Endereço */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Subcategoria */}
            <div>
              <label className="block text-sm font-medium text-[#520029] mb-2">
                Subcategoria *
              </label>
              {isEditing ? (
                <AreaOfOperationSelect
                  value={formData.area_of_operation}
                  onChange={(value) => handleInputChange('area_of_operation', value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A502CA] focus:border-transparent"
                  placeholder="Selecione a subcategoria (ex: Buffet, Churrasco)"
                />
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-gray-900">{formData.area_of_operation || 'Não informado'}</span>
                </div>
              )}
            </div>

            {/* Endereço */}
            <div>
              <label className="block text-sm font-medium text-[#520029] mb-2">
                Endereço *
              </label>
              {isEditing ? (
                <div className="space-y-4">
                  {/* Campos de Endereço */}
                  <AddressFields
                    value={formData.address}
                    onChange={(addressData) => {
                      setFormData(prev => ({
                        ...prev,
                        address: addressData
                      }));
                    }}
                  />
                  
                  {/* Seletor de Raio de Atuação */}
                  <ServiceRadiusPicker
                    value={formData.coordenates.raio_atuacao}
                    onChange={(radius) => {
                      setFormData(prev => ({
                        ...prev,
                        coordenates: {
                          ...prev.coordenates,
                          raio_atuacao: radius
                        }
                      }));
                    }}
                  />
                </div>
              ) : (
                <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                  <span className="text-gray-900">{generateFullAddress(formData.address) || 'Não informado'}</span>
                  {formData.coordenates.latitude && formData.coordenates.longitude && (
                    <div className="mt-2 text-sm text-gray-600">
                      <p>Coordenadas: {formData.coordenates.latitude.toFixed(6)}, {formData.coordenates.longitude.toFixed(6)}</p>
                      <p>Raio de atuação: {formData.coordenates.raio_atuacao} km</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Estatísticas do Perfil */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow-sm p-6"
      >
        <h3 className="text-lg font-semibold text-[#520029] mb-4">Estatísticas do Perfil</h3>
        {statsLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#A502CA]"></div>
            <span className="ml-3 text-gray-600">Carregando estatísticas...</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-[#A502CA]">
                {stats.totalRequests}
              </p>
              <p className="text-sm text-gray-600">Total de Pedidos</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#A502CA]">{stats.pendingRequests}</p>
              <p className="text-sm text-gray-600">Pedidos Pendentes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#A502CA]">{stats.completedEvents}</p>
              <p className="text-sm text-gray-600">Eventos Realizados</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-[#A502CA]">{stats.activeServices}</p>
              <p className="text-sm text-gray-600">Serviços Ativos</p>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}
