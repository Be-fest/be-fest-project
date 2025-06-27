import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ServiceProviderFormData } from '@/types/auth';
import { Input, Button, Select, Logo } from '@/components/ui';
import { useForm } from '@/hooks/useForm';
import { formatCNPJ, formatPhoneNumber, removeMask } from '@/utils/formatters';
import Link from 'next/link';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';

interface ServiceProviderFormProps {
  onSubmit: (data: ServiceProviderFormData) => Promise<void>;
  userType?: 'client' | 'service_provider';
  onUserTypeChange?: (type: 'client' | 'service_provider') => void;
}

export function ServiceProviderForm({ onSubmit, userType: initialUserType = 'service_provider', onUserTypeChange }: ServiceProviderFormProps) {
  const [userType, setUserType] = useState<'client' | 'service_provider'>(initialUserType);
  const [showPassword, setShowPassword] = useState(false);

  const handleUserTypeChange = (type: 'client' | 'service_provider') => {
    setUserType(type);
    onUserTypeChange?.(type);
  };  const serviceAreaOptions = [
    { value: '', label: 'Selecione sua área de atuação' },
    { value: 'comida-bebida', label: 'Comida e Bebida' },
    { value: 'entretenimento', label: 'Entretenimento' },
    { value: 'alugueis', label: 'Alugueis' },
    { value: 'profissionais', label: 'Profissionais' },
    { value: 'espaco', label: 'Espaço' },
    { value: 'organizacao', label: 'Organização' },
    { value: 'design', label: 'Design' },
    { value: 'mobilia', label: 'Mobília' },
    { value: 'equipamento', label: 'Equipamento' }
  ];

  const validateServiceProvider = (values: ServiceProviderFormData) => {
    const errors: Partial<Record<keyof ServiceProviderFormData, string>> = {};
    
    if (!values.businessName) {
      errors.businessName = 'Nome do proprietário é obrigatório';
    }
    
    if (!values.cnpj) {
      errors.cnpj = 'CNPJ é obrigatório';
    } else if (removeMask(values.cnpj).length !== 14) {
      errors.cnpj = 'CNPJ deve ter 14 dígitos';
    }
    
    if (!values.whatsapp) {
      errors.whatsapp = 'WhatsApp é obrigatório';
    } else if (removeMask(values.whatsapp).length < 10) {
      errors.whatsapp = 'Número de telefone inválido';
    }
    
    if (!values.businessType) {
      errors.businessType = 'Nome da organização é obrigatório';
    }
    
    if (!values.serviceArea) {
      errors.serviceArea = 'Área de atuação é obrigatória';
    }
    
    if (!values.password) {
      errors.password = 'Senha é obrigatória';
    } else if (values.password.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    return errors;
  };

  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm({
    initialValues: { 
      businessName: '', 
      cnpj: '', 
      whatsapp: '', 
      businessType: '', 
      serviceArea: '', 
      password: '' 
    },
    validate: validateServiceProvider,
    onSubmit
  });

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center mb-6">
        <Logo width={60} height={60} className="justify-center" />
      </div>
      
      <div className="text-left space-y-2">
        <motion.h1 
          className="text-4xl font-bold"
          style={{ color: userType === 'service_provider' ? '#A502CA' : '#FF0080' }}
          animate={{ 
            color: userType === 'service_provider' ? '#A502CA' : '#FF0080',
            scale: [1, 1.02, 1]
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          Bem-vindo à Be Fest 
        </motion.h1>
        <div className="flex justify-start gap-4 text-xl">
          <motion.button
            type="button"
            onClick={() => handleUserTypeChange('client')}
            className={`transition-colors cursor-pointer ${
              userType === 'client' 
                ? 'font-semibold' 
                : 'text-[#520029] hover:opacity-70'
            }`}
            style={{ color: userType === 'client' ? '#FF0080' : undefined }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{ 
              color: userType === 'client' ? '#FF0080' : '#520029',
              fontWeight: userType === 'client' ? 600 : 400
            }}
            transition={{ duration: 0.2 }}
          >
            Sou Cliente
          </motion.button>
          <span className="text-gray-400">|</span>
          <motion.button
            type="button"
            onClick={() => handleUserTypeChange('service_provider')}
            className={`transition-colors cursor-pointer ${
              userType === 'service_provider' 
                ? 'font-semibold' 
                : 'text-[#520029] hover:opacity-70'
            }`}
            style={{ color: userType === 'service_provider' ? '#A502CA' : undefined }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{ 
              color: userType === 'service_provider' ? '#A502CA' : '#520029',
              fontWeight: userType === 'service_provider' ? 600 : 400
            }}
            transition={{ duration: 0.2 }}
          >
            Sou Prestador
          </motion.button>
        </div>
        <AnimatePresence mode="wait">
          <motion.p 
            key={userType}
            className="text-gray-500 mt-4 text-lg"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            Cadastre seu negócio e comece a receber solicitações para eventos agora mesmo!
          </motion.p>
        </AnimatePresence>
      </div>      <motion.form 
        onSubmit={handleSubmit} 
        className="space-y-4 text-[#8D8D8D]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Input
          type="text"
          placeholder="Nome do proprietário"
          value={values.businessName}
          onChange={(e) => handleChange('businessName', e.target.value)}
          error={errors.businessName}
          focusColor="#A502CA"
        />
          <Input
          type="text"
          placeholder="CNPJ"
          value={values.cnpj}
          onChange={(e) => {
            const formatted = formatCNPJ(e.target.value);
            handleChange('cnpj', formatted);
          }}
          error={errors.cnpj}
          focusColor="#A502CA"
          maxLength={18}
        />
        
        <Input
          type="text"
          placeholder="WhatsApp"
          value={values.whatsapp}
          onChange={(e) => {
            const formatted = formatPhoneNumber(e.target.value);
            handleChange('whatsapp', formatted);
          }}
          error={errors.whatsapp}
          focusColor="#A502CA"
          maxLength={15}
        />
        
        <Input
          type="text"
          placeholder="Nome da organização"
          value={values.businessType}
          onChange={(e) => handleChange('businessType', e.target.value)}
          error={errors.businessType}
          focusColor="#A502CA"
        />
          <Select
          value={values.serviceArea}
          onChange={(e) => handleChange('serviceArea', e.target.value)}
          options={serviceAreaOptions}
          error={errors.serviceArea}
          focusColor="#A502CA"
        />
        
        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Senha"
            value={values.password}
            onChange={(e) => handleChange('password', e.target.value)}
            error={errors.password}
            focusColor="#A502CA"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showPassword ? (
              <MdVisibilityOff className="text-xl" />
            ) : (
              <MdVisibility className="text-xl" />
            )}
          </button>
        </div>

        <Button type="submit" isLoading={isSubmitting} customColor="#A502CA">
          Criar Conta
        </Button>
      </motion.form>

      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <span className="text-[#520029]">Já tem uma conta? </span>
        <Link href="/auth/login" style={{ color: '#A502CA' }} className="hover:underline">
          Fazer login
        </Link>
      </motion.div>
    </div>
  );
}
