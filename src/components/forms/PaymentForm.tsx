import { useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

interface PaymentFormProps {
  services: Array<{
    name: string;
    provider: string;
  }>;
  totalValue: number;
  onSubmit: () => void;
}

export function PaymentForm({ services, totalValue, onSubmit }: PaymentFormProps) {
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full space-y-6 md:space-y-8">
      <Link
        href="/perfil?tab=minhas-festas"
        className="inline-block mb-4 md:mb-6"
      >
        <motion.div
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
          className="text-[#F71875] text-3xl md:text-4xl"
        >
          ←
        </motion.div>
      </Link>

      <div className="space-y-6">
        <motion.h1
          className="text-2xl md:text-3xl lg:text-4xl font-bold text-[#520029]"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          Finalizar Pagamento
        </motion.h1>
        
        <motion.p
          className="text-gray-500 mt-2 text-base md:text-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          Confirme os detalhes da sua festa e finalize o pagamento.
          <br className="hidden md:block" />
          Você está a um passo de realizar o evento dos seus sonhos!
        </motion.p>
      </div>

      <motion.div
        className="bg-gradient-to-r from-[#F71875] to-[#FF6B9D] rounded-2xl p-6 text-white"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <h2 className="font-medium text-[#520029] text-sm md:text-base">Ver resumo da festa:</h2>
        <div className="mt-2">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="bg-gray-50 py-2 px-3 md:px-4 rounded-lg text-xs md:text-sm text-gray-600"
          >
            {showDetails ? 'Ocultar detalhes' : 'Ver detalhes'}
          </button>
        </div>
      </motion.div>

      <motion.div
        className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <div className="mb-6 md:mb-8">
          <div className="flex justify-between items-center mb-4">
            <span className="font-medium text-[#520029] text-sm md:text-base">Valor:</span>
            <span className="font-bold text-[#520029] text-lg md:text-xl">
              R${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <motion.form onSubmit={handleSubmit}>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F71875] hover:bg-[#E6006F] text-white font-medium py-3 md:py-4 px-6 md:px-8 rounded-xl transition-colors relative overflow-hidden group text-sm md:text-base"
          >
            <span className="relative z-10">
              {loading ? 'Processando...' : 'Pagar'}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#FF6B9D] to-[#F71875] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          </button>
        </motion.form>
      </motion.div>
    </div>
  );
} 