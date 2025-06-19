'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MdEdit, MdSave, MdCancel, MdCloudUpload } from 'react-icons/md';
import { getMockProviderById } from '@/data/mockData';

export function ProviderProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [provider] = useState(getMockProviderById('1')); // Mock data
  
  const [formData, setFormData] = useState({
    organization_name: provider?.organization_name || '',
    full_name: provider?.full_name || '',
    email: provider?.email || '',
    whatsapp_number: provider?.whatsapp_number || '',
    area_of_operation: provider?.area_of_operation || '',
    cnpj: provider?.cnpj || '',
    description: 'Especialistas em buffet completo para festas e eventos. Comida de qualidade, serviço impecável e preços justos.'
  });

  const handleSave = () => {
    console.log('Saving profile:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset form data
    setFormData({
      organization_name: provider?.organization_name || '',
      full_name: provider?.full_name || '',
      email: provider?.email || '',
      whatsapp_number: provider?.whatsapp_number || '',
      area_of_operation: provider?.area_of_operation || '',
      cnpj: provider?.cnpj || '',
      description: 'Especialistas em buffet completo para festas e eventos. Comida de qualidade, serviço impecável e preços justos.'
    });
    setIsEditing(false);
  };

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
              className="border border-gray-300 text-gray-700 px-4 py-2 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
            >
              <MdCancel />
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="bg-[#A502CA] hover:bg-[#8B0A9E] text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <MdSave />
              Salvar
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
        <div className="grid md:grid-cols-2 gap-6">
          {/* Logo Upload */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#520029] mb-2">
              Logo da Empresa
            </label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                <img
                  src={provider?.logo_url || '/images/placeholder-logo.png'}
                  alt="Logo"
                  className="w-full h-full object-cover rounded-lg"
                />
              </div>
              {isEditing && (
                <button className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2">
                  <MdCloudUpload />
                  Alterar Logo
                </button>
              )}
            </div>
          </div>

          {/* Nome da Organização */}
          <div>
            <label className="block text-sm font-medium text-[#520029] mb-2">
              Nome da Empresa
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.organization_name}
                onChange={(e) => setFormData({...formData, organization_name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A502CA]"
              />
            ) : (
              <p className="text-gray-800 bg-gray-50 px-3 py-2 rounded-lg">{formData.organization_name}</p>
            )}
          </div>

          {/* Nome do Proprietário */}
          <div>
            <label className="block text-sm font-medium text-[#520029] mb-2">
              Nome do Proprietário
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A502CA]"
              />
            ) : (
              <p className="text-gray-800 bg-gray-50 px-3 py-2 rounded-lg">{formData.full_name}</p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-[#520029] mb-2">
              Email
            </label>
            {isEditing ? (
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A502CA]"
              />
            ) : (
              <p className="text-gray-800 bg-gray-50 px-3 py-2 rounded-lg">{formData.email}</p>
            )}
          </div>

          {/* WhatsApp */}
          <div>
            <label className="block text-sm font-medium text-[#520029] mb-2">
              WhatsApp
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.whatsapp_number}
                onChange={(e) => setFormData({...formData, whatsapp_number: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A502CA]"
              />
            ) : (
              <p className="text-gray-800 bg-gray-50 px-3 py-2 rounded-lg">{formData.whatsapp_number}</p>
            )}
          </div>

          {/* CNPJ */}
          <div>
            <label className="block text-sm font-medium text-[#520029] mb-2">
              CNPJ
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.cnpj}
                onChange={(e) => setFormData({...formData, cnpj: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A502CA]"
              />
            ) : (
              <p className="text-gray-800 bg-gray-50 px-3 py-2 rounded-lg">{formData.cnpj}</p>
            )}
          </div>

          {/* Área de Atuação */}
          <div>
            <label className="block text-sm font-medium text-[#520029] mb-2">
              Área de Atuação
            </label>
            {isEditing ? (
              <input
                type="text"
                value={formData.area_of_operation}
                onChange={(e) => setFormData({...formData, area_of_operation: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A502CA]"
              />
            ) : (
              <p className="text-gray-800 bg-gray-50 px-3 py-2 rounded-lg">{formData.area_of_operation}</p>
            )}
          </div>

          {/* Descrição */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#520029] mb-2">
              Descrição do Negócio
            </label>
            {isEditing ? (
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#A502CA]"
                placeholder="Descreva seu negócio, especialidades e diferenciais..."
              />
            ) : (
              <p className="text-gray-800 bg-gray-50 px-3 py-2 rounded-lg">{formData.description}</p>
            )}
          </div>
        </div>
      </motion.div>

      {/* Statistics Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white rounded-lg shadow-sm p-6"
      >
        <h3 className="text-lg font-semibold text-[#520029] mb-4">Estatísticas do Perfil</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-[#A502CA]">4.8</p>
            <p className="text-sm text-gray-600">Avaliação Média</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#A502CA]">156</p>
            <p className="text-sm text-gray-600">Total de Avaliações</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#A502CA]">243</p>
            <p className="text-sm text-gray-600">Eventos Realizados</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-[#A502CA]">7</p>
            <p className="text-sm text-gray-600">Serviços Ativos</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
