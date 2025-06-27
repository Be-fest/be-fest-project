'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LoginForm } from '@/components/forms';
import { AuthLayout } from '@/components/AuthLayout';
import { LoginFormData } from '@/types/auth';
import { useRouter } from 'next/navigation';
import { MdArrowBack } from 'react-icons/md';
import Link from 'next/link';

export default function LoginPage() {
  const [userType, setUserType] = useState<'client' | 'service_provider'>('client');
  const router = useRouter();

  const handleLogin = async (data: LoginFormData) => {
    try {
      console.log('Login data:', data, 'User type:', userType);
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <AuthLayout>
      <div className="relative w-full">
        <div className="absolute top-4 left-4">
          <Link
            href="/"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <MdArrowBack className="text-2xl text-[#F71875]" />
          </Link>
        </div>
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
      </div>
    </AuthLayout>
  );
}
