import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginFormData } from '@/types/auth';
import { Input, Button, Logo } from '@/components/ui';
import { useForm } from '@/hooks/useForm';
import Link from 'next/link';

interface LoginFormProps {
  onSubmit: (data: LoginFormData) => Promise<void>;
  userType?: 'client' | 'service_provider';
  onUserTypeChange?: (type: 'client' | 'service_provider') => void;
}

export function LoginForm({ onSubmit, userType: initialUserType = 'client', onUserTypeChange }: LoginFormProps) {
  const [userType, setUserType] = useState<'client' | 'service_provider'>(initialUserType);

  const handleUserTypeChange = (type: 'client' | 'service_provider') => {
    setUserType(type);
    onUserTypeChange?.(type);
  };
  const validateLogin = (values: LoginFormData) => {
    const errors: Partial<Record<keyof LoginFormData, string>> = {};
    
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
    
    return errors;
  };

  const { values, errors, isSubmitting, handleChange, handleSubmit } = useForm({
    initialValues: { email: '', password: '' },
    validate: validateLogin,
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
            className="text-gray-500 mt-4 text-xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {userType === 'client' 
              ? 'Faça login e organize a festa perfeita!'
              : 'Acesse sua conta e gerencie seus eventos!'
            }
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
        
        <Button 
          type="submit" 
          isLoading={isSubmitting}
          customColor={userType === 'service_provider' ? '#A502CA' : '#FF0080'}
        >
          Fazer login
        </Button>
      </motion.form>

      <motion.div 
        className="text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <span className="text-[#520029]">Não tem uma conta? </span>
        <Link href="/auth/register" style={{ color: userType === 'service_provider' ? '#A502CA' : '#FF0080' }} className="hover:underline">
          Criar conta
        </Link>
      </motion.div>
    </div>
  );
}
