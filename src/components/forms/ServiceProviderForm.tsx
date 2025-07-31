import { useState, useActionState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Input, Button } from '@/components/ui';
import { formatCNPJ, formatPhoneNumber } from '@/utils/formatters';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MdVisibility, MdVisibilityOff } from 'react-icons/md';
import Image from 'next/image';
import { registerProviderAction } from '@/lib/actions/auth';
import { useToastGlobal } from '@/contexts/GlobalToastContext';
import AreaOfOperationSelect from '@/components/ui/AreaOfOperationSelect';
import { AddressFields } from '@/components/ui/AddressFields';
import { geocodingService } from '@/lib/services/geocoding';

interface ServiceProviderFormProps {
  userType: 'client' | 'service_provider';
  onUserTypeChange: (type: 'client' | 'service_provider') => void;
}

// Wrapper function for useActionState compatibility
async function wrappedRegisterProviderAction(
  prevState: { success: boolean; error?: string; data?: any }, 
  formData: FormData
): Promise<{ success: boolean; error?: string; data?: any }> {
  try {
    // Obter endereço e fazer geocoding
    const address = formData.get('address') as string;
    if (address && address.trim()) {
      const geocodingResult = await geocodingService.geocodeAddress(address);
      if (geocodingResult) {
        formData.append('latitude', geocodingResult.latitude.toString());
        formData.append('longitude', geocodingResult.longitude.toString());
      }
    }
    
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
  const initialState = { success: false, error: undefined, data: undefined };
  const [state, formAction, isPending] = useActionState(wrappedRegisterProviderAction, initialState);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const router = useRouter();
  const toast = useToastGlobal();
  
  // Estado para campos de endereço
  const [addressData, setAddressData] = useState({
    street: '',
    number: '',
    neighborhood: '',
    city: '',
    state: '',
    zipcode: ''
  });
  
  // Estado para subcategoria
  const [areaOfOperation, setAreaOfOperation] = useState('');
  
  // Flags para controlar toasts
  const [hasShownSuccessToast, setHasShownSuccessToast] = useState(false);
  const [hasShownErrorToast, setHasShownErrorToast] = useState(false);
  const [lastError, setLastError] = useState('');

  // Função para gerar endereço completo
  const generateFullAddress = (address: typeof addressData): string => {
    const parts = [];
    
    // Formato: "Rua, Número, Bairro, Cidade, Estado"
    if (address.street && address.street.trim()) {
      parts.push(address.street.trim());
    }
    
    if (address.number && address.number.trim()) {
      parts.push(address.number.trim());
    }
    
    if (address.neighborhood && address.neighborhood.trim()) {
      parts.push(address.neighborhood.trim());
    }
    
    if (address.city && address.city.trim()) {
      parts.push(address.city.trim());
    }
    
    if (address.state && address.state.trim()) {
      parts.push(address.state.trim());
    }
    
    return parts.join(', ');
  };

  useEffect(() => {
    if (state?.success && state?.data?.message && !hasShownSuccessToast) {
      // Toast de sucesso
      setHasShownSuccessToast(true);
      setHasShownErrorToast(false); // Reset error flag
      
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
  }, [state?.success, state?.data?.message, router, toast, hasShownSuccessToast]);

  useEffect(() => {
    // Mostrar toast de erro se houver e não foi mostrado ainda
    if (!state?.success && state?.error && state.error !== lastError && !hasShownErrorToast) {
      setLastError(state.error);
      setHasShownErrorToast(true);
      setHasShownSuccessToast(false); // Reset success flag
      
      toast.error(
        'Erro no cadastro',
        state.error,
        5000
      );
    }
  }, [state?.error, state?.success, toast, hasShownErrorToast, lastError]);

  // Reset flags quando o estado muda completamente
  useEffect(() => {
    if (!state || (state.success === false && !state.error)) {
      setHasShownSuccessToast(false);
      setHasShownErrorToast(false);
      setLastError('');
    }
  }, [state]);

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
          style={{ height: "auto" }}
          className="object-contain mx-auto"
          priority
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
          Cadastre seu negócio e comece a receber solicitações para eventos!
        </p>
      </div>

      <form action={formAction} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
            Nome da Empresa
          </label>
          <Input
            id="companyName"
            name="companyName"
            type="text"
            required
            placeholder="Digite o nome da empresa"
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            required
            placeholder="Digite o email da empresa"
            className="w-full"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="cnpj" className="block text-sm font-medium text-gray-700">
            CNPJ
          </label>
          <Input
            id="cnpj"
            name="cnpj"
            type="text"
            required
            placeholder="00.000.000/0000-00"
            className="w-full"
            onChange={(e) => {
              e.target.value = formatCNPJ(e.target.value);
            }}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            WhatsApp
          </label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            required
            placeholder="(11) 99999-9999"
            className="w-full"
            onChange={(e) => {
              e.target.value = formatPhoneNumber(e.target.value);
            }}
          />
        </div>

        {/* Campos de Endereço */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-700">Endereço</h3>
          <AddressFields
            value={addressData}
            onChange={setAddressData}
            className="space-y-4"
          />
          {/* Campo oculto para enviar o endereço completo */}
          <input
            type="hidden"
            name="address"
            value={generateFullAddress(addressData)}
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="areaOfOperation" className="block text-sm font-medium text-gray-700">
            Subcategoria
          </label>
          <AreaOfOperationSelect
            value={areaOfOperation}
            onChange={setAreaOfOperation}
            name="areaOfOperation"
            required
            placeholder="Selecione uma subcategoria"
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-[#A502CA] focus:border-[#A502CA]"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Senha
          </label>
          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              required
              placeholder="Digite sua senha"
              className="w-full pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showPassword ? (
                <MdVisibilityOff className="h-5 w-5 text-gray-400" />
              ) : (
                <MdVisibility className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
            Confirmar Senha
          </label>
          <div className="relative">
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              required
              placeholder="Confirme sua senha"
              className="w-full pr-10"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              {showConfirmPassword ? (
                <MdVisibilityOff className="h-5 w-5 text-gray-400" />
              ) : (
                <MdVisibility className="h-5 w-5 text-gray-400" />
              )}
            </button>
          </div>
        </div>

        <Button
          type="submit"
          disabled={isPending}
          className={`w-full py-3 text-white font-semibold rounded-lg transition-all duration-200 bg-[#A502CA] hover:bg-[#8A02A8] disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {isPending ? "Criando conta..." : "Criar Conta"}
        </Button>
      </form>

      <div className="text-center">
        <p className="text-sm text-gray-600">
          Já tem uma conta?{" "}
          <Link
            href="/auth/login"
            className="font-semibold hover:underline text-[#A502CA]"
          >
            Fazer login
          </Link>
        </p>
      </div>
    </div>
  );
}
