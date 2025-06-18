'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { AuthLayout } from '@/components/AuthLayout'
import { RegisterForm } from '@/components/auth/RegisterForm'

export default function RegisterPage() {
  return (
    <AuthLayout>
      <div className="text-center mb-8">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-bold text-[#520029] mb-2"
        >
          Crie sua conta
        </motion.h1>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-[#6E5963]"
        >
          Junte-se à BeFest e organize sua festa perfeita
        </motion.p>
      </div>

      <RegisterForm />

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
          É um prestador de serviços?{' '}
          <Link href="/auth/register/provider" className="text-[#FF0080] hover:text-[#E6006F] font-semibold transition-colors">
            Cadastre sua empresa
          </Link>
        </p>
      </motion.div>
    </AuthLayout>
  )
}
            key="service-provider-form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <ServiceProviderForm 
              onSubmit={handleServiceProviderRegister}
              userType={userType}
              onUserTypeChange={setUserType}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </AuthLayout>
  );
}
