import { useState } from 'react';
import { motion } from 'framer-motion';
import { RegisterFormData, RegisterFormProps } from '@/types/auth';
import { Input, Button } from '@/components/ui';
import { useForm } from '@/hooks/useForm';
import { formatCPF, formatPhoneNumber } from '@/utils/formatters';
import Link from 'next/link';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useServices } from '@/hooks/useServices';
import { Select } from '@/components/ui/Select';

export const RegisterForm = ({ onSubmit, userType, onUserTypeChange, error: propError }: RegisterFormProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { values, handleChange } = useForm<RegisterFormData>({
    initialValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      cpf: '',
      phone: ''
    }
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    if (values.password !== values.confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      await onSubmit(values);
    } catch (error) {
      setError('Error creating account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <Link
        href="/auth/login"
        className="inline-block mb-6"
      >
        <motion.div
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
          className={`text-4xl ${
            userType === "service_provider" ? "text-[#A502CA]" : "text-[#F71875]"
          }`}
          animate={{
            color: userType === "service_provider" ? "#A502CA" : "#F71875"
          }}
          transition={{ duration: 0.3 }}
        >
          ←
        </motion.div>
      </Link>

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
            className={`transition-colors cursor-pointer ${
              userType === "client"
                ? "font-semibold text-[#F71875]"
                : "text-[#520029] hover:opacity-70"
            }`}
            onClick={() => onUserTypeChange('client')}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sou Cliente
          </motion.button>
          <span className="text-gray-400">|</span>
          <motion.button
            type="button"
            className={`transition-colors cursor-pointer ${
              userType === "service_provider"
                ? "font-semibold text-[#A502CA]"
                : "text-[#520029] hover:opacity-70"
            }`}
            onClick={() => onUserTypeChange('service_provider')}
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
        {(error || propError) && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
            {error || propError}
          </div>
        )}
        <Input
          type="text"
          name="fullName"
          placeholder="Full Name"
          value={values.fullName}
          onChange={handleChange}
          required
          disabled={isLoading}
        />

        <Input
          type="email"
          name="email"
          placeholder="Email"
          value={values.email}
          onChange={handleChange}
          required
          disabled={isLoading}
        />

        <div>
          <Input
            type="password"
            name="password"
            placeholder="Password"
            value={values.password}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        <div>
          <Input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={values.confirmPassword}
            onChange={handleChange}
            required
            disabled={isLoading}
          />
        </div>

        <Input
          type="text"
          name="cpf"
          placeholder="CPF"
          value={formatCPF(values.cpf)}
          onChange={handleChange}
          focusColor="#F71875"
          required
          disabled={isLoading}
        />

        <Input
          type="text"
          name="phone"
          placeholder="WhatsApp"
          value={formatPhoneNumber(values.phone)}
          onChange={handleChange}
          focusColor="#F71875"
          required
          disabled={isLoading}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? 'Creating account...' : 'Create account'}
        </Button>
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
};
