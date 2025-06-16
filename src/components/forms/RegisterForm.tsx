import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RegisterFormData } from '@/types/auth';
import { Input, Button, Logo } from '@/components/ui';
import { useForm } from '@/hooks/useForm';
import { formatCPF, formatPhoneNumber, removeMask } from '@/utils/formatters';
import Link from 'next/link';

interface RegisterFormProps {
  onSubmit: (data: RegisterFormData) => Promise<void>;
  userType?: 'client' | 'service_provider';
  onUserTypeChange?: (type: 'client' | 'service_provider') => void;
}

export function RegisterForm({ onSubmit, userType: initialUserType = 'client', onUserTypeChange }: RegisterFormProps) {
  const [userType, setUserType] = useState<'client' | 'service_provider'>(initialUserType);

  const handleUserTypeChange = (type: 'client' | 'service_provider') => {
    setUserType(type);
    onUserTypeChange?.(type);
  };
  const validateRegister = (values: RegisterFormData) => {
    const errors: Partial<Record<keyof RegisterFormData, string>> = {};
    
    if (!values.fullName) {
      errors.fullName = 'Nome completo é obrigatório';
    }
    
    if (!values.cpf) {
      errors.cpf = 'CPF é obrigatório';
    } else if (removeMask(values.cpf).length !== 11) {
      errors.cpf = 'CPF deve ter 11 dígitos';
    }
    
    if (!values.whatsapp) {
      errors.whatsapp = 'WhatsApp é obrigatório';
    } else if (removeMask(values.whatsapp).length < 10) {
      errors.whatsapp = 'Número de telefone inválido';
    }
    
    if (!values.email) {
      errors.email = 'E-mail é obrigatório';
    } else if (!/\S+@\S+\.\S+/.test(values.email)) {
      errors.email = 'E-mail inválido';
    }
    
    if (!values.password) {
      errors.password = 'Senha é obrigatória';
    } else if (values.password.length < 6) {
      errors.password = 'Senha deve ter pelo menos 6 caracteres';
    }
    
    if (!values.confirmPassword) {
      errors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (values.password !== values.confirmPassword) {
      errors.confirmPassword = 'Senhas não coincidem';
    }
    
    return errors;
  };

  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm({
    initialValues: { 
      fullName: '', 
      cpf: '',
      whatsapp: '',
      email: '', 
      password: '', 
      confirmPassword: '' 
    },
    validate: validateRegister,
    onSubmit
  });

  return (    <div className="w-full max-w-md space-y-6">
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
            {userType === 'client' 
              ? 'Crie sua conta e comece a organizar a festa perfeita!'
              : 'Cadastre seu negócio e comece a receber solicitações para eventos agora mesmo!'
            }
          </motion.p>
        </AnimatePresence>
      </div>

      <motion.form 
        onSubmit={handleSubmit} 
        className="space-y-4 text-[#8D8D8D]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >        <Input
          type="text"
          placeholder="Nome Completo"
          value={values.fullName}
          onChange={(e) => handleChange('fullName', e.target.value)}
          error={errors.fullName}
          focusColor={userType === 'service_provider' ? '#A502CA' : '#FF0080'}
        />
        
        <Input
          type="text"
          placeholder="CPF"
          value={values.cpf}
          onChange={(e) => {
            const formatted = formatCPF(e.target.value);
            handleChange('cpf', formatted);
          }}
          error={errors.cpf}
          focusColor={userType === 'service_provider' ? '#A502CA' : '#FF0080'}
          maxLength={14}
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
          focusColor={userType === 'service_provider' ? '#A502CA' : '#FF0080'}
          maxLength={15}
        />
        
        <Input
          type="email"
          placeholder="E-mail"
          value={values.email}
          onChange={(e) => handleChange('email', e.target.value)}
          error={errors.email}
          focusColor={userType === 'service_provider' ? '#A502CA' : '#FF0080'}
        />
        
        <Input
          type="password"
          placeholder="Senha"
          value={values.password}
          onChange={(e) => handleChange('password', e.target.value)}
          error={errors.password}
          focusColor={userType === 'service_provider' ? '#A502CA' : '#FF0080'}
        />
        
        <Input
          type="password"
          placeholder="Confirmar Senha"
          value={values.confirmPassword}
          onChange={(e) => handleChange('confirmPassword', e.target.value)}
          error={errors.confirmPassword}
          focusColor={userType === 'service_provider' ? '#A502CA' : '#FF0080'}
        />
        
        <Button 
          type="submit" 
          isLoading={isSubmitting}
          customColor={userType === 'service_provider' ? '#A502CA' : '#FF0080'}
        >
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
        <Link href="/auth/login" style={{ color: userType === 'service_provider' ? '#A502CA' : '#FF0080' }} className="hover:underline">
          Fazer login
        </Link>
      </motion.div>
    </div>
  );
}
