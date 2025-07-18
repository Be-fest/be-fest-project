'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MdClose, MdAttachMoney, MdGroup, MdAdd, MdEdit, MdRemove, MdCloudUpload, MdImage } from 'react-icons/md';
import { Input, Button, Select, TipTapEditor } from '@/components/ui';
import { createServiceAction, updateServiceAction, uploadServiceImageAction, deleteServiceImageAction } from '@/lib/actions/services';
import { invalidateServiceImagesCache } from '@/hooks/useImagePreloader';
import { Service } from '@/types/database';
import { useEffect, useRef } from 'react';
import { useToastGlobal } from '@/contexts/GlobalToastContext';

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  service?: (Service & { guest_tiers?: GuestTier[] }) | null;
  onSubmit: () => void;
}

interface PricingRule {
  rule_description: string;
  age_min_years: number;
  age_max_years: number | null;
  pricing_method: 'fixed' | 'percentage';
  value: number;
}

interface GuestTier {
  id?: string;
  min_total_guests: number;
  max_total_guests: number | null;
  base_price_per_adult: number;
  tier_description: string | null;
}

export function ServiceFormModal({ isOpen, onClose, service, onSubmit }: ServiceFormModalProps) {
  const toast = useToastGlobal();

  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    category: service?.category || '',
    min_guests: service?.min_guests?.toString() || '0',
    max_guests: service?.max_guests?.toString() || '',
    images_urls: service?.images_urls || [],
    is_active: service?.is_active ?? true,
    // Campos de pricing por idade
    pricing_rules: [
      {
        rule_description: 'Preço Inteira (13+ anos)',
        age_min_years: 13,
        age_max_years: null,
        pricing_method: 'percentage' as const,
        value: 100
      },
      {
        rule_description: 'Preço Meia (6-12 anos)',
        age_min_years: 6,
        age_max_years: 12,
        pricing_method: 'percentage' as const,
        value: 50
      },
      {
        rule_description: 'Gratuito (0-5 anos)',
        age_min_years: 0,
        age_max_years: 5,
        pricing_method: 'percentage' as const,
        value: 0
      }
    ] as PricingRule[],
    // Faixas de preços por número de convidados
    guest_tiers: [
      {
        min_total_guests: 30,
        max_total_guests: 70,
        base_price_per_adult: 0,
        tier_description: '30-70 Convidados'
      },
      {
        min_total_guests: 71,
        max_total_guests: 100,
        base_price_per_adult: 0,
        tier_description: '71-100 Convidados'
      },
      {
        min_total_guests: 101,
        max_total_guests: 120,
        base_price_per_adult: 0,
        tier_description: '101-120 Convidados'
      },
      {
        min_total_guests: 121,
        max_total_guests: 150,
        base_price_per_adult: 0,
        tier_description: '121-150 Convidados'
      }
    ] as GuestTier[]
  });

  const [categories, setCategories] = useState<string[]>([
    // Subcategorias de COMIDA E BEBIDA
    'Buffet', 'Buffet de Pizzas', 'Churrasco', 'Confeitaria', 'Estações de Festa', 'Open-Bar', 'Chopp',
    // Subcategorias de ENTRETENIMENTO  
    'Música', 'DJ', 'Animação',
    // Subcategorias de ESPAÇO
    'Salão de Festas', 'Espaço ao Ar Livre', 'Casa de Eventos',
    // Subcategorias de ORGANIZAÇÃO
    'Decoração', 'Fotografia', 'Segurança', 'Limpeza'
  ]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Carregar categorias do banco
  useEffect(() => {
    // Usando categorias hardcoded por enquanto
    const loadCategories = async () => {
      setCategories([
        // Subcategorias de COMIDA E BEBIDA
        'Buffet', 'Buffet de Pizzas', 'Churrasco', 'Confeitaria', 'Estações de Festa', 'Open-Bar', 'Chopp',
        // Subcategorias de ENTRETENIMENTO  
        'Música', 'DJ', 'Animação',
        // Subcategorias de ESPAÇO
        'Salão de Festas', 'Espaço ao Ar Livre', 'Casa de Eventos',
        // Subcategorias de ORGANIZAÇÃO
        'Decoração', 'Fotografia', 'Segurança', 'Limpeza'
      ]);
    };
    
    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  // Reset form when modal opens/closes or service changes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        name: service?.name || '',
        description: service?.description || '',
        category: service?.category || '',
        min_guests: service?.min_guests?.toString() || '0',
        max_guests: service?.max_guests?.toString() || '',
        images_urls: service?.images_urls || [],
        is_active: service?.is_active ?? true,
        pricing_rules: [
          {
            rule_description: 'Preço Inteira (13+ anos)',
            age_min_years: 13,
            age_max_years: null,
            pricing_method: 'percentage' as const,
            value: 100
          },
          {
            rule_description: 'Preço Meia (6-12 anos)',
            age_min_years: 6,
            age_max_years: 12,
            pricing_method: 'percentage' as const,
            value: 50
          },
          {
            rule_description: 'Gratuito (0-5 anos)',
            age_min_years: 0,
            age_max_years: 5,
            pricing_method: 'percentage' as const,
            value: 0
          }
        ],
        // Inicializar guest_tiers com dados do serviço ou valores padrão
        guest_tiers: service?.guest_tiers || [
          {
            min_total_guests: 30,
            max_total_guests: 70,
            base_price_per_adult: 0,
            tier_description: '30-70 Convidados'
          },
          {
            min_total_guests: 71,
            max_total_guests: 100,
            base_price_per_adult: 0,
            tier_description: '71-100 Convidados'
          },
          {
            min_total_guests: 101,
            max_total_guests: 120,
            base_price_per_adult: 0,
            tier_description: '101-120 Convidados'
          },
          {
            min_total_guests: 121,
            max_total_guests: 150,
            base_price_per_adult: 0,
            tier_description: '121-150 Convidados'
          }
        ]
      });
      setErrors({});
    }
  }, [isOpen, service]);

  // Função para adicionar uma nova faixa de preços
  const addGuestTier = () => {
    const lastTier = formData.guest_tiers[formData.guest_tiers.length - 1];
    const newMinGuests = lastTier ? (lastTier.max_total_guests || lastTier.min_total_guests) + 1 : 30;
    
    setFormData(prev => ({
      ...prev,
      guest_tiers: [
        ...prev.guest_tiers,
        {
          min_total_guests: newMinGuests,
          max_total_guests: newMinGuests + 30,
          base_price_per_adult: 0,
          tier_description: `${newMinGuests}-${newMinGuests + 30} Convidados`
        }
      ]
    }));
  };

  // Função para remover uma faixa de preços
  const removeGuestTier = (index: number) => {
    if (formData.guest_tiers.length > 1) {
      setFormData(prev => ({
        ...prev,
        guest_tiers: prev.guest_tiers.filter((_, i) => i !== index)
      }));
    }
  };

  // Função para atualizar uma faixa de preços
  const updateGuestTier = (index: number, field: keyof GuestTier, value: any) => {
    setFormData(prev => ({
      ...prev,
      guest_tiers: prev.guest_tiers.map((tier, i) => 
        i === index ? { ...tier, [field]: value } : tier
      )
    }));
  };

  // Função para calcular preço com taxa Be Fest
  const calculatePriceWithBeFestFee = (basePrice: number) => {
    return basePrice * 1.05; // 5% de taxa
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.category) newErrors.category = 'Categoria é obrigatória';
    
    // Validar guest_tiers
    if (!formData.guest_tiers || formData.guest_tiers.length === 0) {
      newErrors.guest_tiers = 'Pelo menos uma faixa de preços é obrigatória';
    } else {
      const hasValidTier = formData.guest_tiers.some(tier => tier.base_price_per_adult > 0);
      if (!hasValidTier) {
        newErrors.guest_tiers = 'Pelo menos uma faixa deve ter preço maior que zero';
      }
    }
    
    if (formData.min_guests && parseInt(formData.min_guests) < 0) {
      newErrors.min_guests = 'Número mínimo de convidados deve ser maior ou igual a 0';
    }
    if (formData.max_guests && parseInt(formData.max_guests) < 1) {
      newErrors.max_guests = 'Número máximo de convidados deve ser maior que 0';
    }
    if (formData.min_guests && formData.max_guests && 
        parseInt(formData.min_guests) > parseInt(formData.max_guests)) {
      newErrors.max_guests = 'Número máximo deve ser maior que o mínimo';
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
      
      formDataToSend.append('name', formData.name.trim());
      formDataToSend.append('description', formData.description.trim());
      formDataToSend.append('category', formData.category);
      
      // Calcular base_price a partir da primeira faixa de guest_tiers
      const firstTier = formData.guest_tiers.find(tier => tier.base_price_per_adult > 0);
      const basePrice = firstTier ? firstTier.base_price_per_adult.toString() : '0';
      formDataToSend.append('base_price', basePrice);
      
      // Não enviar price_per_guest pois agora usamos apenas guest_tiers
      formDataToSend.append('price_per_guest', '0');
      
      formDataToSend.append('min_guests', formData.min_guests || '0');
      
      if (formData.max_guests) {
        formDataToSend.append('max_guests', formData.max_guests);
      }
      
      formData.images_urls.forEach(url => {
        formDataToSend.append('images_urls', url);
      });
      
      formDataToSend.append('is_active', formData.is_active.toString());
      
      // Adicionar status apenas para atualização (serviços existentes)
      if (service) {
        formDataToSend.append('status', service.status || 'active');
      }
      
      // Adicionar regras de pricing por idade
      formDataToSend.append('pricing_rules', JSON.stringify(formData.pricing_rules));
      
      // Adicionar faixas de preços por convidados
      formDataToSend.append('guest_tiers', JSON.stringify(formData.guest_tiers));
      
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
        
        onSubmit();
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

  const handlePricingRuleChange = (index: number, field: string, value: any) => {
    const newRules = [...formData.pricing_rules];
    newRules[index] = { ...newRules[index], [field]: value };
    setFormData(prev => ({ ...prev, pricing_rules: newRules }));
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    
    try {
      const formData = new FormData();
      formData.append('image', file);
      
      const result = await uploadServiceImageAction(formData);
      
      if (result.success && result.data) {
        setFormData(prev => ({
          ...prev,
          images_urls: [...prev.images_urls, result.data as string]
        }));
        
        // Invalidar cache para mostrar a nova imagem imediatamente
        invalidateServiceImagesCache();
        
        toast.success('Imagem adicionada!', 'Upload realizado com sucesso.', 3000);
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
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
              disabled={loading}
            >
              <option value="">Selecione uma categoria</option>
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
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

          {/* Regras de Preços por Idade */}
          <div>
            <label className="block text-sm font-medium text-[#520029] mb-4">
              Regras de Preços por Idade
            </label>
            <div className="space-y-4">
              {formData.pricing_rules.map((rule, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Idade Mín. (anos)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={rule.age_min_years}
                        onChange={(e) => handlePricingRuleChange(index, 'age_min_years', parseInt(e.target.value))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Idade Máx. (anos)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={rule.age_max_years || ''}
                        onChange={(e) => handlePricingRuleChange(index, 'age_max_years', e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Sem limite"
                        disabled={loading}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Valor (%)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="100"
                        value={rule.value}
                        onChange={(e) => handlePricingRuleChange(index, 'value', parseFloat(e.target.value))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="100"
                        disabled={loading}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Faixas de Preços por Número de Convidados */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-[#520029]">
                Tabela de Preços por Faixas de Convidados *
              </label>
              <button
                type="button"
                onClick={addGuestTier}
                className="bg-[#A502CA] hover:bg-[#8B0A9E] text-white px-3 py-1 rounded text-sm flex items-center gap-1"
                disabled={loading}
              >
                <MdAdd className="text-sm" />
                Adicionar Faixa
              </button>
            </div>
            
            {errors.guest_tiers && <p className="text-red-500 text-xs mb-2">{errors.guest_tiers}</p>}
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>💡 Importante:</strong> Aos preços será automaticamente adicionada a taxa de 5% da Be Fest. 
                Por exemplo: se você definir R$ 130,00, o cliente verá R$ 136,50 (já com a taxa incluída).
                A taxa é oculta do cliente - ele só vê o preço final.
              </p>
            </div>

            {/* Exemplo de visualização da tabela para o cliente */}
            {formData.guest_tiers.some(tier => tier.base_price_per_adult > 0) && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                <h4 className="text-sm font-semibold text-blue-800 mb-3">
                  📋 Prévia - Como o cliente verá a tabela de preços:
                </h4>
                <div className="space-y-2">
                  {formData.guest_tiers
                    .filter(tier => tier.base_price_per_adult > 0)
                    .map((tier, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="text-blue-700">
                          • De {tier.min_total_guests} {tier.max_total_guests ? `a ${tier.max_total_guests}` : '+'} convidados:
                        </span>
                        <span className="font-semibold text-blue-800">
                          R$ {calculatePriceWithBeFestFee(tier.base_price_per_adult).toFixed(2)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

            <div className="space-y-4">
              {formData.guest_tiers.map((tier, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Mín. Convidados
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={tier.min_total_guests}
                        onChange={(e) => updateGuestTier(index, 'min_total_guests', parseInt(e.target.value))}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        disabled={loading}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Máx. Convidados
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={tier.max_total_guests || ''}
                        onChange={(e) => updateGuestTier(index, 'max_total_guests', e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        placeholder="Sem limite"
                        disabled={loading}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Preço/Convidado (R$)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        min="0"
                        value={tier.base_price_per_adult}
                        onChange={(e) => updateGuestTier(index, 'base_price_per_adult', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                        disabled={loading}
                      />
                      <p className="text-xs text-green-600 mt-1">
                        Cliente verá: R$ {calculatePriceWithBeFestFee(tier.base_price_per_adult).toFixed(2)}
                      </p>
                    </div>
                    
                    <div className="flex items-end">
                      {formData.guest_tiers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeGuestTier(index)}
                          className="bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1 rounded text-sm"
                          disabled={loading}
                        >
                          <MdRemove className="text-sm" />
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <input
                      type="text"
                      value={tier.tier_description || ''}
                      onChange={(e) => updateGuestTier(index, 'tier_description', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                      placeholder="Descrição da faixa (ex: Festa Pequena)"
                      disabled={loading}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Número de Convidados */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#520029] mb-2">
                Mín. Convidados
              </label>
              <input
                type="number"
                min="0"
                value={formData.min_guests}
                onChange={(e) => handleInputChange('min_guests', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A502CA] ${
                  errors.min_guests ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="0"
                disabled={loading}
              />
              {errors.min_guests && <p className="text-red-500 text-xs mt-1">{errors.min_guests}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-[#520029] mb-2">
                Máx. Convidados
              </label>
              <input
                type="number"
                min="1"
                value={formData.max_guests}
                onChange={(e) => handleInputChange('max_guests', e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A502CA] ${
                  errors.max_guests ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Sem limite"
                disabled={loading}
              />
              {errors.max_guests && <p className="text-red-500 text-xs mt-1">{errors.max_guests}</p>}
            </div>
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
          <div className="flex justify-end gap-3 pt-6 border-t">
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
              disabled={loading || uploadingImage}
            >
              {loading ? 'Salvando...' : (service ? 'Atualizar' : 'Criar Serviço')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
