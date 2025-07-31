'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { MdClose, MdAttachMoney, MdGroup, MdAdd, MdEdit, MdRemove, MdCloudUpload, MdImage } from 'react-icons/md';
import { Input, Button, TipTapEditor } from '@/components/ui';
import { createServiceAction, updateServiceAction, uploadServiceImageAction, deleteServiceImageAction, getSubcategoriesAction } from '@/lib/actions/services';
import { invalidateServiceImagesCache } from '@/hooks/useImagePreloader';
import { Service, ServiceWithDetails, ServiceGuestTier, Subcategory } from '@/types/database';
import { useToastGlobal } from '@/contexts/GlobalToastContext';

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  service?: ServiceWithDetails | null;
  onSubmit: (formData: FormData) => void;
}

// Definição do tipo para faixa de convidados
export type GuestTier = {
  id?: string;
  min_total_guests: number;
  max_total_guests: number | null;
  base_price_per_adult: number;
  tier_description: string;
};

export function ServiceFormModal({ isOpen, onClose, service, onSubmit }: ServiceFormModalProps) {
  const toast = useToastGlobal();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Estados do formulário
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    category: service?.category || '',
    is_active: service?.is_active ?? true,
    images_urls: service?.images_urls || []
  });

  // Atualizar formData quando service mudar
  useEffect(() => {
    if (service) {
      setFormData({
        name: service.name || '',
        description: service.description || '',
        category: service.category || '',
        is_active: service.is_active ?? true,
        images_urls: service.images_urls || []
      });
    } else {
      setFormData({
        name: '',
        description: '',
        category: '',
        is_active: true,
        images_urls: []
      });
    }
  }, [service]);

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Estado para as faixas de preço
  const [guestTiers, setGuestTiers] = useState<GuestTier[]>([]);
  const [tiersError, setTiersError] = useState<string | null>(null);

  // Estado para subcategorias
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);

  // Carregar subcategorias quando o modal abrir
  useEffect(() => {
    if (isOpen) {
      loadSubcategories();
    }
  }, [isOpen]);

  // Função para carregar subcategorias
  const loadSubcategories = async () => {
    setLoadingSubcategories(true);
    try {
      const result = await getSubcategoriesAction();
      if (result.success && result.data) {
        setSubcategories(result.data);
      } else {
        console.error('Erro ao carregar subcategorias:', result.error);
        toast.error('Erro', 'Não foi possível carregar as categorias disponíveis.', 5000);
      }
    } catch (error) {
      console.error('Erro ao carregar subcategorias:', error);
      toast.error('Erro', 'Erro inesperado ao carregar categorias.', 5000);
    } finally {
      setLoadingSubcategories(false);
    }
  };

  // Carregar faixas existentes ao editar
  useEffect(() => {
    if (service && service.guest_tiers && service.guest_tiers.length > 0) {
      setGuestTiers(
        service.guest_tiers.map(tier => ({
          id: tier.id,
          min_total_guests: tier.min_total_guests,
          max_total_guests: tier.max_total_guests,
          base_price_per_adult: tier.base_price_per_adult,
          tier_description: tier.tier_description || `${tier.min_total_guests}-${tier.max_total_guests || '∞'} Convidados`
        })).sort((a, b) => a.min_total_guests - b.min_total_guests)
      );
    } else {
      // Faixa padrão para novos serviços
      setGuestTiers([{
        min_total_guests: 1,
        max_total_guests: 50,
        base_price_per_adult: 100,
        tier_description: '1-50 Convidados'
      }]);
    }
  }, [service]);

  // Validação das faixas
  useEffect(() => {
    if (guestTiers.length === 0) {
      setTiersError('Adicione pelo menos uma faixa de preço.');
      return;
    }

    // Ordenação automática
    const sorted = [...guestTiers].sort((a, b) => a.min_total_guests - b.min_total_guests);
    
    // Checar gaps e sobreposição
    for (let i = 0; i < sorted.length; i++) {
      const tier = sorted[i];
      
      // Validar min < max
      if (tier.max_total_guests && tier.min_total_guests >= tier.max_total_guests) {
        setTiersError(`Na faixa ${i + 1}, o mínimo deve ser menor que o máximo.`);
        return;
      }
      
      // Validar gaps e sobreposição (exceto para a última faixa que pode ter max_total_guests null)
      if (i > 0) {
        const prev = sorted[i - 1];
        const prevMax = prev.max_total_guests || 999;
        if (prevMax + 1 !== tier.min_total_guests) {
          setTiersError(`Gap ou sobreposição entre as faixas ${i} e ${i + 1}.`);
          return;
        }
      }
    }
    
    setTiersError(null);
  }, [guestTiers]);

  // Adicionar nova faixa
  const handleAddTier = () => {
    let min = 1;
    if (guestTiers.length > 0) {
      const last = guestTiers[guestTiers.length - 1];
      min = (last.max_total_guests || 999) + 1;
    }
    
    setGuestTiers([
      ...guestTiers,
      {
        min_total_guests: min,
        max_total_guests: min + 49,
        base_price_per_adult: 100,
        tier_description: `${min}-${min + 49} Convidados`,
      },
    ]);
  };

  // Remover faixa
  const handleRemoveTier = (index: number) => {
    if (guestTiers.length <= 1) {
      toast.error('Erro', 'Deve haver pelo menos uma faixa de preço.', 3000);
      return;
    }
    setGuestTiers(guestTiers.filter((_, i) => i !== index));
  };

  // Atualizar campo de uma faixa
  const handleTierChange = (index: number, field: keyof GuestTier, value: any) => {
    const newTiers = [...guestTiers];
    newTiers[index] = { ...newTiers[index], [field]: value };
    
    // Atualizar descrição automaticamente
    if (field === 'min_total_guests' || field === 'max_total_guests') {
      const min = newTiers[index].min_total_guests;
      const max = newTiers[index].max_total_guests;
      newTiers[index].tier_description = `${min}${max ? '-' + max : '+'} Convidados`;
    }
    
    setGuestTiers(newTiers);
  };

  // Submissão do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validações básicas
    const newErrors: Record<string, string> = {};
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.category) newErrors.category = 'Categoria é obrigatória';
    if (tiersError) {
      toast.error('Erro nas faixas de preço', tiersError, 5000);
      return;
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setLoading(true);
    
    try {
      const formDataToSend = new FormData();
      
      if (service) {
        formDataToSend.append('id', service.id);
      }
      
      // Dados básicos do serviço
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('category', formData.category);
      formDataToSend.append('is_active', formData.is_active.toString());
      
      // Adicionar faixas de preço
      formDataToSend.append('guest_tiers', JSON.stringify(guestTiers));
      
      // Adicionar imagens
      console.log('📸 [SERVICE_FORM] Enviando imagens:', formData.images_urls);
      if (formData.images_urls.length > 0) {
        formDataToSend.append('images_urls', JSON.stringify(formData.images_urls));
      } else {
        formDataToSend.append('images_urls', JSON.stringify([]));
      }
      
      const result = service 
        ? await updateServiceAction(formDataToSend)
        : await createServiceAction(formDataToSend);
      
      if (result.success) {
        // Toast de sucesso
        toast.success(
          service ? 'Serviço atualizado!' : 'Serviço criado!',
          service 
            ? `O serviço "${formData.name}" foi atualizado com sucesso.`
            : `O serviço "${formData.name}" foi criado com sucesso.`,
          4000
        );
        
        onSubmit(formDataToSend);
        onClose(); // Fechar modal após sucesso
      } else {
        const errorMessage = result.error || 'Erro ao salvar serviço';
        setErrors({ general: errorMessage });
        
        // Toast de erro
        toast.error(
          service ? 'Erro ao atualizar serviço' : 'Erro ao criar serviço',
          errorMessage,
          5000
        );
      }
    } catch (error) {
      const errorMessage = 'Erro inesperado ao salvar serviço';
      setErrors({ general: errorMessage });
      
      // Toast de erro
      toast.error(
        'Erro inesperado',
        errorMessage,
        5000
      );
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    console.log('📸 [SERVICE_FORM] Iniciando upload de imagem:', file.name);
    setUploadingImage(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const result = await uploadServiceImageAction(formData);
      
      if (result.success && result.data) {
        console.log('✅ [SERVICE_FORM] Upload bem-sucedido:', result.data);
        setFormData(prev => {
          const newImages = [...prev.images_urls, result.data as string];
          console.log('📸 [SERVICE_FORM] Novas imagens:', newImages);
          return {
            ...prev,
            images_urls: newImages
          };
        });
        
        // Invalidar cache para mostrar a nova imagem imediatamente
        invalidateServiceImagesCache();
        
        toast.success('Imagem adicionada!', 'Upload realizado com sucesso.', 3000);
      } else {
        console.error('❌ [SERVICE_FORM] Erro no upload:', result.error);
        toast.error('Erro no upload', result.error || 'Falha ao fazer upload da imagem', 5000);
      }
    } catch (error) {
      console.error('💥 [SERVICE_FORM] Erro inesperado no upload:', error);
      toast.error('Erro no upload', 'Erro inesperado ao fazer upload da imagem', 5000);
    } finally {
      setUploadingImage(false);
      // Limpar o input file
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleImageRemove = async (index: number) => {
    const imageUrl = formData.images_urls[index];
    
    try {
      // Tentar deletar a imagem do storage se ela for do nosso bucket
      if (imageUrl.includes('supabase')) {
        await deleteServiceImageAction(imageUrl);
      }
    } catch (error) {
      console.error('Erro ao deletar imagem do storage:', error);
    }
    
    // Remover da lista local
    setFormData(prev => ({
      ...prev,
      images_urls: prev.images_urls.filter((_, i) => i !== index)
    }));
    
    toast.success('Imagem removida!', 'A imagem foi removida com sucesso.', 3000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-md bg-white/20 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-[#520029]">
            {service ? 'Editar Serviço' : 'Adicionar Novo Serviço'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={loading}
          >
            <MdClose className="text-xl" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Error geral */}
          {errors.general && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {errors.general}
            </div>
          )}

          {/* Nome do Serviço */}
          <div>
            <label className="block text-sm font-medium text-[#520029] mb-2">
              Nome do Serviço *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A502CA] ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Ex: Churras Premium"
              disabled={loading}
            />
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Categoria */}
          <div>
            <label className="block text-sm font-medium text-[#520029] mb-2">
              Categoria *
            </label>
            <select
              value={formData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A502CA] ${
                errors.category ? 'border-red-500' : 'border-gray-300'
              }`}
              disabled={loading || loadingSubcategories}
            >
              <option value="">
                {loadingSubcategories ? 'Carregando categorias...' : 'Selecione uma categoria'}
              </option>
              {subcategories.map(subcategory => (
                <option key={subcategory.id} value={subcategory.name}>
                  {subcategory.name}
                </option>
              ))}
            </select>
            {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category}</p>}
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-semibold text-[#520029] mb-2">
              Descrição do Serviço
            </label>
            <TipTapEditor
              value={formData.description}
              onChange={(value: string) => handleInputChange('description', value)}
              placeholder="Descreva detalhadamente seu serviço, incluindo o que está incluso, diferenciais, etc."
              disabled={loading}
              minHeight="150px"
            />
          </div>

          {/* Nova seção de faixas de preço */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-[#520029] mb-4">
              Faixas de Preços por Número de Convidados
            </label>
            <div className="space-y-4">
              {guestTiers.map((tier, idx) => (
                <div key={idx} className="border rounded-lg p-4 flex flex-col md:flex-row md:items-end gap-2 md:gap-4 bg-gray-50">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Min. Convidados</label>
                    <input
                      type="number"
                      min={1}
                      value={tier.min_total_guests}
                      onChange={e => handleTierChange(idx, 'min_total_guests', parseInt(e.target.value) || 1)}
                      className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Max. Convidados</label>
                    <input
                      type="number"
                      min={tier.min_total_guests + 1}
                      value={tier.max_total_guests || ''}
                      onChange={e => handleTierChange(idx, 'max_total_guests', e.target.value ? parseInt(e.target.value) : null)}
                      className="w-24 px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="∞"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Preço por Adulto (R$)</label>
                    <input
                      type="number"
                      min={0}
                      step={0.01}
                      value={tier.base_price_per_adult}
                      onChange={e => handleTierChange(idx, 'base_price_per_adult', parseFloat(e.target.value) || 0)}
                      className="w-32 px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs font-medium text-gray-600 mb-1">Descrição</label>
                    <input
                      type="text"
                      value={tier.tier_description}
                      onChange={e => handleTierChange(idx, 'tier_description', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveTier(idx)}
                    className="text-red-600 hover:underline ml-2 mt-2 md:mt-0"
                    disabled={guestTiers.length <= 1}
                  >
                    Remover
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={handleAddTier}
              className="mt-4 px-4 py-2 bg-[#A502CA] text-white rounded-lg hover:bg-[#8B02A8] transition-colors flex items-center gap-2"
            >
              <MdAdd className="text-lg" />
              Adicionar Faixa de Preço
            </button>
            {tiersError && <p className="text-red-600 text-xs mt-2">{tiersError}</p>}
          </div>

          {/* Upload de Imagens */}
          <div>
            <label className="block text-sm font-medium text-[#520029] mb-2">
              Imagens do Serviço
            </label>
            
            {/* Preview das imagens existentes */}
            {formData.images_urls.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {formData.images_urls.map((url, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={url}
                      alt={`Imagem ${index + 1}`}
                      className="w-full h-32 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleImageRemove(index)}
                      className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                      disabled={loading || uploadingImage}
                    >
                      <MdRemove className="text-sm" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Botão de upload */}
            <div className="flex items-center gap-4">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleImageUpload}
                className="hidden"
                disabled={loading || uploadingImage}
              />
              
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-[#A502CA] text-[#A502CA] rounded-lg hover:bg-purple-50 transition-colors disabled:opacity-50"
                disabled={loading || uploadingImage}
              >
                {uploadingImage ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-[#A502CA] border-t-transparent rounded-full"></div>
                    Fazendo upload...
                  </>
                ) : (
                  <>
                    <MdCloudUpload className="text-lg" />
                    Adicionar Imagem
                  </>
                )}
              </button>
              
              <span className="text-xs text-gray-500">
                JPEG, PNG ou WebP • Máx. 5MB
              </span>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_active}
                onChange={(e) => handleInputChange('is_active', e.target.checked)}
                className="w-4 h-4 text-[#A502CA] border-gray-300 rounded focus:ring-[#A502CA]"
                disabled={loading}
              />
              <span className="text-sm font-medium text-[#520029]">
                Serviço ativo
              </span>
            </label>
          </div>

          {/* Botões */}
          <div className="flex justify-end gap-3 pt-6 border-t sticky bottom-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#A502CA] text-white rounded-lg hover:bg-[#8B02A8] transition-colors disabled:opacity-50"
              disabled={loading || uploadingImage || !!tiersError}
            >
              {loading ? 'Salvando...' : (service ? 'Atualizar' : 'Criar Serviço')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

