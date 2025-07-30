"use client";

import { useState, useActionState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input, Button, Logo, ForgotPasswordModal } from "@/components/ui";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";
import { loginAction } from '@/lib/actions/auth';
import { useToastGlobal } from '@/contexts/GlobalToastContext';

// Wrapper function for useActionState compatibility
async function wrappedLoginAction(
  prevState: { success: boolean; error?: string; data?: any; requiresConfirmation?: boolean }, 
  formData: FormData
): Promise<{ success: boolean; error?: string; data?: any; requiresConfirmation?: boolean }> {
  try {
    const result = await loginAction(formData);
    
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
      data: result.data,
      requiresConfirmation: (result as any).requiresConfirmation || false
    };
  } catch (error) {
    console.error('Login action failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Ocorreu um erro inesperado. Tente novamente.' 
    };
  }
}

// Hook personalizado para gerenciar o estado de autenticação
function useAuthHandler(
  state: { success: boolean; error?: string; data?: any; requiresConfirmation?: boolean }
) {
  const [hasShownSuccessToast, setHasShownSuccessToast] = useState(false);
  const [lastErrorMessage, setLastErrorMessage] = useState('');
  const [isRedirecting, setIsRedirecting] = useState(false);
  const toast = useToastGlobal();

  const handleSuccess = useCallback(() => {
    if (state.success && state.data?.redirectTo && !isRedirecting && !hasShownSuccessToast) {
      console.log('Login bem-sucedido, redirecionando para:', state.data.redirectTo);
      
      setIsRedirecting(true);
      setHasShownSuccessToast(true);
      
      toast.success('Login realizado com sucesso!', 'Redirecionando...', 1000);
      
      setTimeout(() => {
        console.log('Executando redirecionamento...');
        window.location.href = state.data.redirectTo;
      }, 1000);
    }
  }, [state.success, state.data?.redirectTo, isRedirecting, hasShownSuccessToast, toast]);

  const handleError = useCallback(() => {
    if (!state.success && state.error && state.error !== lastErrorMessage) {
      setLastErrorMessage(state.error);
      
      if (state.requiresConfirmation) {
        toast.warning('Confirmação necessária', state.error, 6000);
      } else {
        toast.error('Erro no login', state.error, 5000);
      }
    }
  }, [state.error, state.success, state.requiresConfirmation, lastErrorMessage, toast]);

  const resetFlags = useCallback(() => {
    setHasShownSuccessToast(false);
    setLastErrorMessage('');
    setIsRedirecting(false);
  }, []);

  useEffect(() => {
    handleSuccess();
  }, [handleSuccess]);

  useEffect(() => {
    handleError();
  }, [handleError]);

  return { isRedirecting, resetFlags };
}

export function LoginForm() {
  const [userType, setUserType] = useState<"client" | "service_provider">("client");
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [state, formAction, isPending] = useActionState(wrappedLoginAction, { success: false });
  const router = useRouter();
  const searchParams = useSearchParams();

  // Hook personalizado para gerenciar autenticação
  const { isRedirecting, resetFlags } = useAuthHandler(state);

  // Mensagem de query da URL
  const queryMessage = searchParams.get('message');
  
  // Pegar returnUrl da URL
  const returnUrl = searchParams.get('returnUrl');

  const handleUserTypeChange = useCallback((type: "client" | "service_provider") => {
    setUserType(type);
    resetFlags(); // Reset dos flags quando o tipo de usuário muda
  }, [resetFlags]);

  return (
    <div className="w-full max-w-md space-y-6">
      <Link
        href="/"
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
        {userType === "client" && (
          <Image
            src="/be-fest-client-logo.png"
            alt="Be Fest Logo"
            width={60}
            height={60}
            className="object-contain"
          />
        )}
        {userType === "service_provider" && (
          <Image
            src="/be-fest-provider-logo.png"
            alt="Be Fest Logo"
            width={60}
            height={60}
            className="object-contain"
          />
        )}
      </div>

      <div className="text-left space-y-2">
        <motion.h1
          className="text-4xl font-bold"
          style={{
            color: userType === "service_provider" ? "#A502CA" : "#F71875",
          }}
          animate={{
            color: userType === "service_provider" ? "#A502CA" : "#F71875",
            scale: [1, 1.02, 1],
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          Bem-vindo à Be Fest
        </motion.h1>
        <div className="flex justify-start gap-4 text-xl">
          <motion.button
            type="button"
            onClick={() => handleUserTypeChange("client")}
            className={`transition-colors cursor-pointer ${
              userType === "client"
                ? "font-semibold"
                : "text-[#520029] hover:opacity-70"
            }`}
            style={{ color: userType === "client" ? "#F71875" : undefined }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              color: userType === "client" ? "#F71875" : "#520029",
              fontWeight: userType === "client" ? 600 : 400,
            }}
            transition={{ duration: 0.2 }}
          >
            Sou Cliente
          </motion.button>
          <span className="text-gray-400">|</span>
          <motion.button
            type="button"
            onClick={() => handleUserTypeChange("service_provider")}
            className={`transition-colors cursor-pointer ${
              userType === "service_provider"
                ? "font-semibold"
                : "text-[#520029] hover:opacity-70"
            }`}
            style={{
              color: userType === "service_provider" ? "#A502CA" : undefined,
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              color: userType === "service_provider" ? "#A502CA" : "#520029",
              fontWeight: userType === "service_provider" ? 600 : 400,
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
            {userType === "client"
              ? "Faça login e organize a festa perfeita!"
              : "Acesse sua conta e gerencie seus eventos!"}
          </motion.p>
        </AnimatePresence>
      </div>

      <motion.form
        action={formAction}
        className="space-y-4 text-[#8D8D8D]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        {/* Campo hidden para returnUrl */}
        {returnUrl && (
          <input type="hidden" name="returnUrl" value={returnUrl} />
        )}
        
        {queryMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 rounded-md text-sm bg-green-50 text-green-600 border border-green-200"
          >
            {queryMessage}
          </motion.div>
        )}
        
        {!state.success && state.error && (
          <div className={`p-3 rounded-md text-sm ${ (state as any).requiresConfirmation ? 'bg-yellow-50 text-yellow-600' : 'bg-red-50 text-red-500' }`}>
            {state.error}
          </div>
        )}
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

        {/* Link Esqueci a senha */}
        <div className="text-right">
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-sm hover:underline"
            style={{ color: userType === "service_provider" ? "#A502CA" : "#F71875" }}
          >
            Esqueci a senha
          </button>
        </div>

        <Button
          type="submit"
          className="w-full"
          disabled={isPending || isRedirecting}
          style={{ backgroundColor: userType === "service_provider" ? "#A502CA" : "#F71875" }}
        >
          {isRedirecting ? 'Redirecionando...' : (isPending ? 'Entrando...' : 'Entrar')}
        </Button>
      </motion.form>

      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <span className="text-[#520029]">Não tem uma conta? </span>
        <Link
          href="/auth/register"
          style={{
            color: userType === "service_provider" ? "#A502CA" : "#F71875",
          }}
          className="hover:underline"
        >
          Criar conta
        </Link>
      </motion.div>

      {/* Modal Esqueci a senha */}
      <ForgotPasswordModal
        isOpen={showForgotPassword}
        onClose={() => setShowForgotPassword(false)}
        userType={userType}
      />
    </div>
  );
}
