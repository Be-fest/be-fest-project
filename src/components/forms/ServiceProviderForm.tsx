import { useState, useActionState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Input, Button } from '@/components/ui';
import { formatCNPJ, formatPhoneNumber } from '@/utils/formatters';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import Image from 'next/image';
import { registerProviderAction } from '@/lib/actions/auth';

interface ServiceProviderFormProps {
  userType: 'client' | 'service_provider';
  onUserTypeChange: (type: 'client' | 'service_provider') => void;
}

// Wrapper function for useActionState compatibility
async function wrappedRegisterProviderAction(prevState: { success: boolean; error?: string }, formData: FormData) {
  try {
    const result = await registerProviderAction(formData);
    return result;
  } catch (error) {
    console.error('Provider register action failed:', error);
    return { 
      success: false, 
      error: 'Ocorreu um erro inesperado. Tente novamente.' 
    };
  }
}

export function ServiceProviderForm({ userType, onUserTypeChange }: ServiceProviderFormProps) {
  const [state, formAction, isPending] = useActionState(wrappedRegisterProviderAction, { success: false });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (state.success && state.data?.message) {
      // Mostrar mensagem de sucesso por alguns segundos
      setTimeout(() => {
        router.push('/auth/login');
      }, 2000);
    }
  }, [state.success, state.data, router]);

  return (
    <div className="w-full max-w-md space-y-6">
      <Link
        href="/auth/login"
        className="inline-block mb-6"
      >
        <motion.div
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
          className="text-[#A502CA] text-4xl"
        >
          ←
        </motion.div>
      </Link>

      <div className="text-center mb-6">
        <Image
          src="/be-fest-provider-logo.png"
          alt="Be Fest Logo"
          width={60}
          height={60}
          className="object-contain"
        />
      </div>

      <div className="text-left space-y-2">
        <motion.h1
          className="text-4xl font-bold text-[#A502CA]"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          Criar Conta
        </motion.h1>
        <div className="flex justify-start gap-4 text-xl">
          <motion.button
            type="button"
            onClick={() => onUserTypeChange('client')}
            className="text-[#520029] hover:opacity-70"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sou Cliente
          </motion.button>
          <span className="text-gray-400">|</span>
          <motion.button
            type="button"
            onClick={() => onUserTypeChange('service_provider')}
            className="font-semibold text-[#A502CA]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Sou Prestador
          </motion.button>
        </div>
        <p className="text-gray-500 mt-4 text-xl">
          Cadastre seu negócio e comece a receber solicitações para eventos!
        </p>
      </div>

      <motion.form
        action={formAction}
        className="space-y-4 text-[#8D8D8D]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {!state.success && state.error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm">
            {state.error}
          </div>
        )}

        {state.success && state.data?.message && (
          <div className="bg-green-50 text-green-600 p-3 rounded-md text-sm">
            {state.data.message}
          </div>
        )}

        <Input
          type="text"
          name="companyName"
          placeholder="Nome da empresa"
          required
          disabled={isPending}
        />

        <Input
          type="email"
          name="email"
          placeholder="E-mail"
          required
          disabled={isPending}
        />

        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            name="password"
            placeholder="Senha"
            required
            disabled={isPending}
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
            required
            disabled={isPending}
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
          name="cnpj"
          placeholder="CNPJ"
          maxLength={18}
          required
          disabled={isPending}
          onChange={(e) => {
            e.target.value = formatCNPJ(e.target.value);
          }}
        />

        <Input
          type="text"
          name="phone"
          placeholder="WhatsApp"
          maxLength={15}
          required
          disabled={isPending}
          onChange={(e) => {
            e.target.value = formatPhoneNumber(e.target.value);
          }}
        />

        <Input
          type="text"
          name="areaOfOperation"
          placeholder="Área de atuação (ex: Buffet, Decoração, Som)"
          required
          disabled={isPending}
        />

        <Button
          type="submit"
          className="w-full"
          disabled={isPending}
          style={{ backgroundColor: '#A502CA' }}
        >
          {isPending ? 'Criando conta...' : 'Criar Conta'}
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
          className="text-[#A502CA] hover:underline"
        >
          Fazer login
        </Link>
      </motion.div>
    </div>
  );
}
