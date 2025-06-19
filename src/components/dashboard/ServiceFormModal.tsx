'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MdClose, MdCloudUpload } from 'react-icons/md';

interface ServiceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  service?: any;
  onSubmit: (data: any) => void;
}

export function ServiceFormModal({ isOpen, onClose, service, onSubmit }: ServiceFormModalProps) {
  const [formData, setFormData] = useState({
    name: service?.name || '',
    description: service?.description || '',
    category: service?.category || 'Comida e Bebida',
    price_per_guest: service?.price_per_guest || '',
    is_active: service?.is_active ?? true,
    images: []
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const categories = [
    'Comida e Bebida',
    'Decoração',
    'Entretenimento',
    'Fotografia',
    'Música',
    'Transporte'
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Nome é obrigatório';
    if (!formData.description.trim()) newErrors.description = 'Descrição é obrigatória';
    if (!formData.price_per_guest) newErrors.price_per_guest = 'Preço é obrigatório';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    onSubmit(formData);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-[#520029]">
            {service ? 'Editar Serviço' : 'Adicionar Novo Serviço'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <MdClose className="text-xl" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A502CA]"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          {/* Descrição */}
          <div>
            <label className="block text-sm font-medium text-[#520029] mb-2">
              Descrição *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={4}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A502CA] ${
                errors.description ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Descreva seu serviço detalhadamente..."
            />
            {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
          </div>

          {/* Preço por Pessoa */}
          <div>
            <label className="block text-sm font-medium text-[#520029] mb-2">
              Preço por Pessoa (R$) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price_per_guest}
              onChange={(e) => handleInputChange('price_per_guest', parseFloat(e.target.value))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A502CA] ${
                errors.price_per_guest ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="0.00"
            />
            {errors.price_per_guest && <p className="text-red-500 text-xs mt-1">{errors.price_per_guest}</p>}
          </div>

          {/* Upload de Imagens */}
          <div>
            <label className="block text-sm font-medium text-[#520029] mb-2">
              Imagens do Serviço
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-[#A502CA] transition-colors">
              <MdCloudUpload className="text-4xl text-gray-400 mx-auto mb-2" />
              <p className="text-gray-600 mb-2">Clique para selecionar ou arraste imagens</p>
              <p className="text-sm text-gray-500">PNG, JPG até 5MB cada</p>
              <input
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  // Implementar upload de imagens
                  console.log('Files:', e.target.files);
                }}
              />
            </div>
          </div>

          {/* Status Ativo/Inativo */}
          <div className="flex items-center">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => handleInputChange('is_active', e.target.checked)}
              className="mr-2"
            />
            <label htmlFor="is_active" className="text-sm font-medium text-[#520029]">
              Serviço ativo (visível para clientes)
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-300 text-gray-700 py-2 px-4 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 bg-[#A502CA] hover:bg-[#8B0A9E] text-white py-2 px-4 rounded-lg font-medium transition-colors"
            >
              {service ? 'Atualizar' : 'Adicionar'} Serviço
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
