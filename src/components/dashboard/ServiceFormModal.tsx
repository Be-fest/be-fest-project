'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MdClose, MdAttachMoney, MdGroup, MdAdd, MdEdit, MdRemove } from 'react-icons/md';
import { Input, Button, Select, TipTapEditor } from '@/components/ui';
import { createServiceAction, updateServiceAction } from '@/lib/actions/services';
import { Service } from '@/types/database';
import { useEffect } from 'react';
import { useToastGlobal } from '@/contexts/GlobalToastContext';

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  service?: Service | null;
  onSubmit: () => void;
}

interface PricingRule {
  rule_description: string;
  age_min_years: number;
  age_max_years: number | null;
  pricing_method: 'fixed' | 'percentage';
  value: number;
}

export function ServiceFormModal({ isOpen, onClose, service, onSubmit }: ServiceFormModalProps) {
  const toast = useToastGlobal();

  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    category: service?.category || '',
    price_per_guest: service?.price_per_guest?.toString() || '',
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
    ] as PricingRule[]
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
        price_per_guest: service?.price_per_guest?.toString() || '',
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
        ]
      });
      setErrors({});
    }
  }, [isOpen, service]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.category) newErrors.category = 'Categoria é obrigatória';
    if (!formData.price_per_guest) newErrors.price_per_guest = 'Preço por convidado é obrigatório';
    if (parseFloat(formData.price_per_guest) < 0) newErrors.price_per_guest = 'Preço por convidado deve ser maior ou igual a 0';
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
      // Usar price_per_guest como base_price para compatibilidade com o backend
      formDataToSend.append('base_price', formData.price_per_guest || '0');
      
      if (formData.price_per_guest) {
        formDataToSend.append('price_per_guest', formData.price_per_guest);
      }
      
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

  const handleImageUrlAdd = () => {
    const url = prompt('Digite a URL da imagem:');
    if (url && url.trim()) {
      setFormData(prev => ({
        ...prev,
        images_urls: [...prev.images_urls, url.trim()]
      }));
    }
  };

  const handleImageUrlRemove = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images_urls: prev.images_urls.filter((_, i) => i !== index)
    }));
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

          {/* Preço */}
          <div>
            <label className="block text-sm font-medium text-[#520029] mb-2">
              Preço por Convidado (R$) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price_per_guest}
              onChange={(e) => handleInputChange('price_per_guest', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A502CA] ${
                errors.price_per_guest ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
              disabled={loading}
            />
            {errors.price_per_guest && <p className="text-red-500 text-xs mt-1">{errors.price_per_guest}</p>}
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

          {/* URLs de Imagens */}
          <div>
            <label className="block text-sm font-medium text-[#520029] mb-2">
              Imagens do Serviço
            </label>
            <div className="space-y-2">
              {formData.images_urls.map((url, index) => (
                <div key={index} className="flex items-center gap-2">
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => {
                      const newUrls = [...formData.images_urls];
                      newUrls[index] = e.target.value;
                      handleInputChange('images_urls', newUrls);
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A502CA]"
                    placeholder="https://exemplo.com/imagem.jpg"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => handleImageUrlRemove(index)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    disabled={loading}
                  >
                    <MdRemove className="text-lg" />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={handleImageUrlAdd}
                className="flex items-center gap-2 px-3 py-2 text-[#A502CA] hover:bg-purple-50 rounded-lg transition-colors"
                disabled={loading}
              >
                <MdAdd className="text-lg" />
                Adicionar Imagem
              </button>
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
              disabled={loading}
            >
              {loading ? 'Salvando...' : (service ? 'Atualizar' : 'Criar Serviço')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
