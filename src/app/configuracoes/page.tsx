'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  MdSettings,
  MdNotifications,
  MdSecurity,
  MdPalette,
  MdLanguage,
  MdPrivacyTip,
  MdAccountCircle,
  MdEmail,
  MdPhone,
  MdLocationOn
} from 'react-icons/md';
import { ClientLayout } from '@/components/client/ClientLayout';
import { ClientAuthGuard } from '@/components/ClientAuthGuard';

export default function ConfiguracoesPage() {
  const settingsGroups = [
    {
      title: 'Conta',
      icon: MdAccountCircle,
      items: [
        { label: 'Informações Pessoais', description: 'Nome, email, telefone' },
        { label: 'Endereço', description: 'Local padrão para eventos' },
        { label: 'Senha', description: 'Alterar senha de acesso' }
      ]
    },
    {
      title: 'Notificações',
      icon: MdNotifications,
      items: [
        { label: 'Email', description: 'Notificações por email' },
        { label: 'Push', description: 'Notificações no navegador' },
        { label: 'SMS', description: 'Notificações por SMS' }
      ]
    },
    {
      title: 'Privacidade',
      icon: MdPrivacyTip,
      items: [
        { label: 'Perfil Público', description: 'Visibilidade do seu perfil' },
        { label: 'Dados Pessoais', description: 'Controle de dados' },
        { label: 'Histórico', description: 'Gerenciar histórico de eventos' }
      ]
    },
    {
      title: 'Preferências',
      icon: MdPalette,
      items: [
        { label: 'Tema', description: 'Aparência da interface' },
        { label: 'Idioma', description: 'Idioma da plataforma' },
        { label: 'Região', description: 'Localização e moeda' }
      ]
    }
  ];

  return (
    <ClientAuthGuard requiredRole="client">
      <ClientLayout>
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Configurações
            </h1>
            <p className="text-gray-600 text-lg">
              Personalize sua experiência e gerencie suas preferências
            </p>
          </div>

          {/* Settings Groups */}
          <div className="space-y-6">
            {settingsGroups.map((group, groupIndex) => (
              <motion.div
                key={group.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: groupIndex * 0.1 }}
                className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
              >
                <div className="p-6 bg-gray-50 border-b border-gray-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#F71875] rounded-xl flex items-center justify-center">
                      <group.icon className="text-white text-xl" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">{group.title}</h2>
                  </div>
                </div>
                
                <div className="divide-y divide-gray-100">
                  {group.items.map((item, itemIndex) => (
                    <div
                      key={item.label}
                      className="p-6 hover:bg-gray-50 transition-colors duration-200 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900 mb-1">
                            {item.label}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {item.description}
                          </p>
                        </div>
                        <div className="text-gray-400">
                          →
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Account Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              Ações da Conta
            </h3>
            <div className="space-y-4">
              <button className="w-full text-left p-4 rounded-xl hover:bg-gray-50 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">Exportar Dados</p>
                    <p className="text-sm text-gray-600">Baixar uma cópia dos seus dados</p>
                  </div>
                  <div className="text-blue-600">
                    ↓
                  </div>
                </div>
              </button>
              
              <button className="w-full text-left p-4 rounded-xl hover:bg-red-50 transition-colors duration-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-red-600">Excluir Conta</p>
                    <p className="text-sm text-gray-600">Remover permanentemente sua conta</p>
                  </div>
                  <div className="text-red-600">
                    ⚠️
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </ClientLayout>
    </ClientAuthGuard>
  );
} 