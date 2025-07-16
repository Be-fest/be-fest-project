import { useState, useActionState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Input, Button } from '@/components/ui';
import { formatCPF, formatPhoneNumber, formatCNPJ } from '@/utils/formatters';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import Image from 'next/image';
import { registerClientAction, registerProviderAction } from '@/lib/actions/auth';
import { useToastGlobal } from '@/contexts/GlobalToastContext';
import AreaOfOperationSelect from '@/components/ui/AreaOfOperationSelect';

interface RegisterFormProps {
  userType: 'client' | 'service_provider';
  onUserTypeChange: (type: 'client' | 'service_provider') => void;
}

// Wrapper function for useActionState compatibility
async function wrappedRegisterClientAction(
  prevState: { success: boolean; error?: string; data?: any }, 
  formData: FormData
): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    const result = await registerClientAction(formData);
    
    // Garantir que sempre retornamos um objeto válido
    if (!result || typeof result !== 'object') {
      return { 
        success: false, 
        error: 'Resposta inválida do servidor' 
      };
    }
    
    return {
      success: result.success || false,
      error: result.error,
      data: result.data
    };
  } catch (error) {
    console.error('Register action failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Ocorreu um erro inesperado. Tente novamente.' 
    };
  }
}

// Wrapper function for provider registration
async function wrappedRegisterProviderAction(
  prevState: { success: boolean; error?: string; data?: any }, 
  formData: FormData
): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    const result = await registerProviderAction(formData);
    
    // Garantir que sempre retornamos um objeto válido
    if (!result || typeof result !== 'object') {
      return { 
        success: false, 
        error: 'Resposta inválida do servidor' 
      };
    }
    
    return {
      success: result.success || false,
      error: result.error,
      data: result.data
    };
  } catch (error) {
    console.error('Register action failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Ocorreu um erro inesperado. Tente novamente.' 
    };
  }
}

export const RegisterForm = ({ userType, onUserTypeChange }: RegisterFormProps) => {
  const initialState = { success: false, error: undefined, data: undefined };
  const actionToUse = userType === 'client' ? wrappedRegisterClientAction : wrappedRegisterProviderAction;
  const [state, formAction, isPending] = useActionState(actionToUse, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const toast = useToastGlobal();

  useEffect(() => {
    if (state?.success && state?.data?.message) {
      // Toast de sucesso
      toast.success(
        'Conta criada com sucesso!',
        state.data.message,
        6000
      );
      
      // Redirecionar após mostrar o toast
      const timer = setTimeout(() => {
        try {
          router.push('/auth/login');
        } catch (error) {
          console.error('Navigation error:', error);
        }
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [state?.success, state?.data?.message, router, toast]);

  useEffect(() => {
    // Mostrar toast de erro se houver
    if (!state?.success && state?.error) {
      toast.error(
        'Erro no cadastro',
        state.error,
        5000
      );
    }
  }, [state?.error, state?.success, toast]);

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
          style={{ height: "auto" }}
          className="object-contain mx-auto"
          priority
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
        action={formAction}
        className="space-y-4 text-[#8D8D8D]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Input
          type="text"
          name={userType === 'service_provider' ? 'companyName' : 'fullName'}
          placeholder={userType === 'service_provider' ? 'Nome da Empresa' : 'Nome Completo'}
          required
          disabled={isPending}
        />

        <Input
          type="email"
          name="email"
          placeholder="Email"
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
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? (
              <MdVisibilityOff className="h-5 w-5 text-gray-400" />
            ) : (
              <MdVisibility className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>

        <div className="relative">
          <Input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            placeholder="Confirmar Senha"
            required
            disabled={isPending}
          />
          <button
            type="button"
            className="absolute inset-y-0 right-0 pr-3 flex items-center"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? (
              <MdVisibilityOff className="h-5 w-5 text-gray-400" />
            ) : (
              <MdVisibility className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>

        {userType === 'service_provider' ? (
          <>
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
            
            <AreaOfOperationSelect
              value=""
              onChange={() => {}} // FormData handles the value
              name="areaOfOperation"
              required
              placeholder="Selecione a área de atuação"
              className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${isPending ? 'opacity-50 cursor-not-allowed' : ''}`}
            />
          </>
        ) : (
          <Input
            type="text"
            name="cpf"
            placeholder="CPF"
            maxLength={14}
            required
            disabled={isPending}
            onChange={(e) => {
              e.target.value = formatCPF(e.target.value);
            }}
          />
        )}

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

        <Button
          type="submit"
          className="w-full"
          disabled={isPending}
        >
          {isPending ? 'Criando conta...' : 'Criar conta'}
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
