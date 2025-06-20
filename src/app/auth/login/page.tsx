'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { AuthLayout } from '@/components/AuthLayout'
import { LoginForm } from '@/components/auth/LoginForm'

export default function LoginPage() {
  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-[#520029] mb-2"
        >
          Bem-vindo de volta!
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-[#6E5963]"
        >
          Faça login para acessar sua conta
        </motion.p>
      </div>

      <LoginForm />

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        className="text-center mt-6 space-y-4"
      >
        <p className="text-[#6E5963]">
          Não tem uma conta?{' '}
          <Link href="/auth/register" className="text-[#FF0080] hover:text-[#E6006F] font-semibold transition-colors">
            Cadastre-se aqui
          </Link>
        </p>
        
        <p className="text-[#6E5963] text-sm">
          É um prestador de serviços?{' '}
          <Link href="/auth/register/provider" className="text-[#FF0080] hover:text-[#E6006F] font-semibold transition-colors">
            Cadastre sua empresa
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  )
}

  return (
    <AuthLayout>
      <motion.div
        key={userType}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <LoginForm 
          onSubmit={handleLogin} 
          userType={userType}
          onUserTypeChange={setUserType}
        />
      </motion.div>
    </AuthLayout>
  );
}
