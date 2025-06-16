'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RegisterForm, ServiceProviderForm } from '@/components/forms';
import { AuthLayout } from '@/components/AuthLayout';
import { RegisterFormData, ServiceProviderFormData } from '@/types/auth';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const [userType, setUserType] = useState<'client' | 'service_provider'>('client');
  const router = useRouter();

  const handleRegister = async (data: RegisterFormData) => {
    try {
      console.log('Register data:', data);
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/auth/login');
    } catch (error) {
      console.error('Registration failed:', error);
    }
  };

  const handleServiceProviderRegister = async (data: ServiceProviderFormData) => {
    try {
      console.log('Service provider register data:', data);
      await new Promise(resolve => setTimeout(resolve, 1000));
      router.push('/auth/login');
    } catch (error) {
      console.error('Service provider registration failed:', error);
    }
  };  return (
    <AuthLayout>
      <AnimatePresence mode="wait">
        {userType === 'client' ? (
          <motion.div
            key="client-form"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            <RegisterForm 
              onSubmit={handleRegister} 
              userType={userType}
              onUserTypeChange={setUserType}
            />
          </motion.div>
        ) : (
          <motion.div
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
