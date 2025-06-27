import { useState } from 'react';
import { motion } from 'framer-motion';
import { RegisterFormData, RegisterFormProps } from '@/types/auth';
import { Input, Button } from '@/components/ui';
import { useForm } from '@/hooks/useForm';
import { formatCPF, formatPhoneNumber } from '@/utils/formatters';
import Link from 'next/link';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import Image from 'next/image';

export function RegisterForm({ onSubmit, userType, onUserTypeChange, error }: RegisterFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');

  const { values, handleChange } = useForm<RegisterFormData>({
    initialValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      cpf: '',
      phone: '',
    }
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setFormError('');

    // Validações
    if (!values.fullName || !values.email || !values.password || !values.confirmPassword || !values.cpf || !values.phone) {
      setFormError('Por favor, preencha todos os campos');
      return;
    }

    if (values.password !== values.confirmPassword) {
      setFormError('As senhas não coincidem');
      return;
    }

    if (values.password.length < 6) {
      setFormError('A senha deve ter pelo menos 6 caracteres');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center mb-6">
        <Image
          src="/be-fest-client-logo.png"
          alt="Be Fest Logo"
          width={60}
          height={60}
          className="object-contain"
        />
      </div>

      <div className="text-left space-y-2">
        <motion.h1
          className="text-4xl font-bold text-[#F71875]"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          Criar Conta
        </motion.h1>
        <div className="flex justify-start gap-4 text-xl">
          <motion.button
            type="button"
            onClick={() => onUserTypeChange('client')}
            className="font-semibold text-[#F71875]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sou Cliente
          </motion.button>
          <span className="text-gray-400">|</span>
          <motion.button
            type="button"
            onClick={() => onUserTypeChange('service_provider')}
            className="text-[#520029] hover:opacity-70"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sou Prestador
          </motion.button>
        </div>
        <p className="text-gray-500 mt-4 text-xl">
          Crie sua conta e comece a planejar a festa perfeita!
        </p>
      </div>

      <motion.form
        onSubmit={handleSubmit}
        className="space-y-4 text-[#8D8D8D]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Input
          type="text"
          name="fullName"
          placeholder="Nome completo"
          value={values.fullName}
          onChange={handleChange}
          focusColor="#F71875"
        />

        <Input
          type="email"
          name="email"
          placeholder="E-mail"
          value={values.email}
          onChange={handleChange}
          focusColor="#F71875"
        />

        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Senha"
            value={values.password}
            onChange={handleChange}
            focusColor="#F71875"
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

        <div className="relative">
          <Input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirmar senha"
            value={values.confirmPassword}
            onChange={handleChange}
            focusColor="#F71875"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showConfirmPassword ? (
              <MdVisibilityOff className="text-xl" />
            ) : (
              <MdVisibility className="text-xl" />
            )}
          </button>
        </div>

        <Input
          type="text"
          name="cpf"
          placeholder="CPF"
          value={formatCPF(values.cpf)}
          onChange={handleChange}
          focusColor="#F71875"
        />

        <Input
          type="text"
          name="phone"
          placeholder="WhatsApp"
          value={formatPhoneNumber(values.phone)}
          onChange={handleChange}
          focusColor="#F71875"
        />

        <Button
          type="submit"
          isLoading={loading}
          customColor="#F71875"
        >
          Criar Conta
        </Button>

        {(error || formError) && (
          <p className="text-center text-sm text-red-500">
            {error || formError}
          </p>
        )}
      </motion.form>

      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <span className="text-[#520029]">Já tem uma conta? </span>
        <Link
          href="/auth/login"
          className="text-[#F71875] hover:underline"
        >
          Fazer login
        </Link>
      </motion.div>
    </div>
  );
}
