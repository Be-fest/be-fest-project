'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MdEdit, MdSave, MdCancel, MdCloudUpload, MdWarning } from 'react-icons/md';
import { createClient } from '@/lib/supabase/client';
import { User } from '@/types/database';

export function ProviderProfile() {
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    organization_name: '',
    full_name: '',
    email: '',
    whatsapp_number: '',
    area_of_operation: '',
    cnpj: '',
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const supabase = createClient();
        
        const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
        
        if (authError || !authUser) {
          setError('Usuário não autenticado');
          return;
        }

        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .single();

        if (userError) {
          setError('Erro ao carregar dados do usuário');
          return;
        }

        setUser(userData);
        setFormData({
          organization_name: userData.organization_name || '',
          full_name: userData.full_name || '',
          email: userData.email || '',
          whatsapp_number: userData.whatsapp_number || '',
          area_of_operation: userData.area_of_operation || '',
          cnpj: userData.cnpj || '',
        });
      } catch (err) {
        setError('Erro ao carregar perfil');
        console.error('Error loading user profile:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleSave = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      const supabase = createClient();
      
      const { error: updateError } = await supabase
        .from('users')
        .update({
          organization_name: formData.organization_name,
          full_name: formData.full_name,
          whatsapp_number: formData.whatsapp_number,
          area_of_operation: formData.area_of_operation,
          cnpj: formData.cnpj,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (updateError) {
        throw updateError;
      }

      // Update local state
      setUser(prev => prev ? {
        ...prev,
        ...formData,
        updated_at: new Date().toISOString()
      } : null);
      
      setIsEditing(false);
    } catch (err) {
      console.error('Error saving profile:', err);
      alert('Erro ao salvar perfil. Tente novamente.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        organization_name: user.organization_name || '',
        full_name: user.full_name || '',
        email: user.email || '',
        whatsapp_number: user.whatsapp_number || '',
        area_of_operation: user.area_of_operation || '',
        cnpj: user.cnpj || '',
      });
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF0080] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <MdWarning className="text-red-500 text-4xl mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#FF0080] text-white rounded-lg hover:bg-[#E6006F] transition-colors"
          >
            Tentar novamente
          </button>
        </div>
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
        <div className="grid md:grid-cols-2 gap-6">
          {/* Logo Upload */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-[#520029] mb-2">
              Logo da Empresa
            </label>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                {user?.logo_url ? (
                  <img
                    src={user.logo_url}
                    alt="Logo"
                    className="w-full h-full object-cover rounded-lg"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-[#FF0080] to-[#E6006F] rounded-lg flex items-center justify-center text-white font-bold text-xl">
                    {(formData.organization_name || formData.full_name || 'P').charAt(0)}
                  </div>
                )}
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
                placeholder="Nome da sua empresa"
              />
            ) : (
              <p className="text-gray-800 bg-gray-50 px-3 py-2 rounded-lg">
                {formData.organization_name || 'Não informado'}
              </p>
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
                placeholder="Seu nome completo"
              />
            ) : (
              <p className="text-gray-800 bg-gray-50 px-3 py-2 rounded-lg">
                {formData.full_name || 'Não informado'}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-[#520029] mb-2">
              Email
            </label>
            <p className="text-gray-800 bg-gray-50 px-3 py-2 rounded-lg">
              {formData.email || 'Não informado'}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              O email não pode ser alterado aqui
            </p>
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
                placeholder="(11) 99999-9999"
              />
            ) : (
              <p className="text-gray-800 bg-gray-50 px-3 py-2 rounded-lg">
                {formData.whatsapp_number || 'Não informado'}
              </p>
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
                placeholder="00.000.000/0000-00"
              />
            ) : (
              <p className="text-gray-800 bg-gray-50 px-3 py-2 rounded-lg">
                {formData.cnpj || 'Não informado'}
              </p>
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
                placeholder="Ex: Buffet, Decoração, Música"
              />
            ) : (
              <p className="text-gray-800 bg-gray-50 px-3 py-2 rounded-lg">
                {formData.area_of_operation || 'Não informado'}
              </p>
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
