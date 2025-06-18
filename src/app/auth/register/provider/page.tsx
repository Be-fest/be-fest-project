'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { AuthLayout } from '@/components/AuthLayout'
import { ProviderRegisterForm } from '@/components/auth/ProviderRegisterForm'

export default function ProviderRegisterPage() {
  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-[#520029] mb-2"
        >
          Cadastro de Prestador
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-[#6E5963]"
        >
          Registre sua empresa e comece a oferecer seus serviços
        </motion.p>
      </div>

      <ProviderRegisterForm />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-center mt-6 space-y-4"
      >
        <p className="text-[#6E5963]">
          Já tem uma conta?{' '}
          <Link href="/auth/login" className="text-[#FF0080] hover:text-[#E6006F] font-semibold transition-colors">
            Faça login
          </Link>
        </p>
        
        <p className="text-[#6E5963] text-sm">
          É um cliente?{' '}
          <Link href="/auth/register" className="text-[#FF0080] hover:text-[#E6006F] font-semibold transition-colors">
            Crie conta de cliente
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  )
}
