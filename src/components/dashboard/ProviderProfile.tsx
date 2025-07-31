'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MdEdit, MdSave, MdCancel, MdCloudUpload, MdWarning, MdRemove, MdImage } from 'react-icons/md';
import { getProviderStatsAction } from '@/lib/actions/services';
import { uploadProfileImageAction, deleteProfileImageAction, updateProviderProfileAction } from '@/lib/actions/auth';
import { User } from '@/types/database';
import { ProviderProfileSkeleton } from '@/components/ui';
import { useToastGlobal } from '@/contexts/GlobalToastContext';
import { invalidateServiceImagesCache } from '@/hooks/useImagePreloader';
import { LocationPicker } from '@/components/ui/LocationPicker';
import { useAuth } from '@/hooks/useAuth';

interface ProviderStats {
  totalRequests: number;
  pendingRequests: number;
  approvedRequests: number;
  activeServices: number;
  totalRevenue: number;
  completedEvents: number;
}

interface FormData {
  organization_name: string;
  organization_description: string;
  full_name: string;
  email: string;
  whatsapp_number: string;
  area_of_operation: string;
  coordenates: {
    latitude: number;
    longitude: number;
    raio_atuacao: number;
  };
  profile_image: string;
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
    coordenates: {
      latitude: userData?.coordenates?.latitude || 0,
      longitude: userData?.coordenates?.longitude || 0,
      raio_atuacao: userData?.coordenates?.raio_atuacao || 50,
    },
    profile_image: '',
  });

  // Atualizar formData quando userData mudar
  useEffect(() => {
    if (userData) {
      console.log('✅ [PROVIDER_PROFILE] Dados do usuário atualizados:', userData);
      setFormData({
        organization_name: userData.organization_name || '',
        organization_description: userData.organization_description || '',
        full_name: userData.full_name || '',
        email: userData.email || '',
        whatsapp_number: userData.whatsapp_number || '',
        area_of_operation: userData.area_of_operation || '',
        coordenates: {
          latitude: userData.coordenates?.latitude || 0,
          longitude: userData.coordenates?.longitude || 0,
          raio_atuacao: userData.coordenates?.raio_atuacao || 50,
        },
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
      if (formData.profile_image.includes('supabase')) {
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
      const formDataToSend = new FormData();
      
      // Validar campos obrigatórios antes de enviar
      const requiredFields = {
        organization_name: 'Nome da empresa é obrigatório',
        full_name: 'Nome do proprietário é obrigatório',
        whatsapp_number: 'WhatsApp é obrigatório',
        area_of_operation: 'Área de atuação é obrigatória',
      };

      const errors: string[] = [];
      
      Object.entries(requiredFields).forEach(([field, errorMessage]) => {
        const value = formData[field as keyof typeof formData];
        if (!value || (typeof value === 'string' && value.trim() === '')) {
          errors.push(errorMessage);
        }
      });

      if (errors.length > 0) {
        toast.error('Campos obrigatórios', errors.join(', '), 5000);
        return;
      }
      
      // Adicionar apenas campos preenchidos
      Object.entries(formData).forEach(([key, value]) => {
        if (key === 'coordenates') {
          // Handle coordenates object separately
          if (value && typeof value === 'object') {
            formDataToSend.append('latitude', value.latitude.toString());
            formDataToSend.append('longitude', value.longitude.toString());
            formDataToSend.append('raio_atuacao', value.raio_atuacao.toString());
          }
        } else if (value && typeof value === 'string' && value.trim() !== '' && key !== 'email') {
          formDataToSend.append(key, value.trim());
        }
      });
      
      console.log('Enviando dados:', Object.fromEntries(formDataToSend.entries()));
      
      const result = await updateProviderProfileAction(formDataToSend);
      
      if (result.success) {
        toast.success('Perfil atualizado!', 'Suas informações foram salvas com sucesso.', 4000);
        setIsEditing(false);
        
        // Atualizar dados do usuário local
        // const supabase = createClient(); // This line is removed as per the new_code
        // const { data: updatedUser } = await supabase // This line is removed as per the new_code
        //   .from('users') // This line is removed as per the new_code
        //   .select('*') // This line is removed as per the new_code
        //   .eq('id', user?.id) // This line is removed as per the new_code
        //   .single(); // This line is removed as per the new_code
          
        // if (updatedUser) { // This line is removed as per the new_code
        //   setUser(updatedUser); // This line is removed as per the new_code
        //   setFormData({ // This line is removed as per the new_code
        //     organization_name: updatedUser.organization_name || '', // This line is removed as per the new_code
        //     full_name: updatedUser.full_name || '', // This line is removed as per the new_code
        //     email: updatedUser.email || '', // This line is removed as per the new_code
        //     whatsapp_number: updatedUser.whatsapp_number || '', // This line is removed as per the new_code
        //     latitude: updatedUser.latitude || 0,
//     longitude: updatedUser.longitude || 0,
//     raio_atuacao: updatedUser.raio_atuacao || 50,
        //     cnpj: updatedUser.cnpj || '', // This line is removed as per the new_code
        //     profile_image: updatedUser.profile_image || '', // This line is removed as per the new_code
        //   }); // This line is removed as per the new_code
        // } // This line is removed as per the new_code
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
      setFormData({
        organization_name: userData.organization_name || '',
        organization_description: userData.organization_description || '',
        full_name: userData.full_name || '',
        email: userData.email || '',
        whatsapp_number: userData.whatsapp_number || '',
        area_of_operation: userData.area_of_operation || '',
        coordenates: {
          latitude: userData.coordenates?.latitude || 0,
          longitude: userData.coordenates?.longitude || 0,
          raio_atuacao: userData.coordenates?.raio_atuacao || 50,
        },
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

          {/* Quarta linha - Área de Atuação (largura completa para o mapa) */}
          <div>
            <label className="block text-sm font-medium text-[#520029] mb-2">
              Área de Atuação *
            </label>
            {isEditing ? (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <LocationPicker
                  onLocationChange={(lat, lng) => {
                    setFormData(prev => ({
                      ...prev,
                      coordenates: {
                        ...prev.coordenates,
                        latitude: lat,
                        longitude: lng
                      }
                    }));
                  }}
                  onRadiusChange={(radius) => {
                    setFormData(prev => ({
                      ...prev,
                      coordenates: {
                        ...prev.coordenates,
                        raio_atuacao: radius
                      }
                    }));
                  }}
                  initialLat={formData.coordenates.latitude}
                  initialLng={formData.coordenates.longitude}
                  initialRadius={formData.coordenates.raio_atuacao}
                />
              </div>
            ) : (
              <div className="px-4 py-3 bg-gray-50 rounded-lg border border-gray-200">
                <span className="text-gray-900">{formData.area_of_operation || 'Não informado'}</span>
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
