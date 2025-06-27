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
    <div className="w-full max-w-md space-y-8">
      <Link
        href="/minhas-festas"
        className="inline-block mb-6"
      >
        <motion.div
          whileHover={{ x: -5 }}
          whileTap={{ scale: 0.95 }}
          className="text-[#F71875] text-4xl"
        >
          ←
        </motion.div>
      </Link>

      <div className="text-left">
        <motion.h1
          className="text-4xl font-bold text-[#520029]"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          Pagamento
        </motion.h1>
        <motion.p
          className="text-gray-500 mt-2 text-lg"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Você está a poucos cliques da sua festa perfeita!
          <br />
          Finalize agora seu pedido e garanta os melhores serviços para o seu evento.
        </motion.p>
      </div>

      <motion.div
        className="space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <h2 className="font-medium text-[#520029]">Ver resumo da festa:</h2>
        {services.map((service, index) => (
          <div
            key={index}
            className="bg-gray-50 py-2 px-4 rounded-lg text-sm text-gray-600"
          >
            {service.name} - {service.provider}
          </div>
        ))}
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <span className="font-medium text-[#520029]">Valor:</span>
            <span className="font-bold text-[#520029] text-xl">
              R${totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        <motion.form onSubmit={handleSubmit}>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#F71875] hover:bg-[#E6006F] text-white font-medium py-4 px-8 rounded-xl transition-colors relative overflow-hidden group"
          >
            <span className="relative z-10">
              {loading ? 'Processando...' : 'Pagar'}
            </span>
            <div className="absolute inset-0 bg-gradient-to-r from-[#F71875] to-[#E6006F] transform translate-y-full group-hover:translate-y-0 transition-transform" />
          </button>
        </motion.form>
      </motion.div>
    </div>
  );
} 