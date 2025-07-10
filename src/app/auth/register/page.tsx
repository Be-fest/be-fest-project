'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RegisterForm, ServiceProviderForm } from '@/components/forms';
import { AuthLayout } from '@/components/AuthLayout';

export default function RegisterPage() {
  const [userType, setUserType] = useState<'client' | 'service_provider'>('client');

  return (
    <AuthLayout>
      <div className="relative w-full px-4 sm:px-0">
        <div className="w-full max-w-sm mx-auto sm:max-w-md">
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
                  userType={userType}
                  onUserTypeChange={setUserType}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AuthLayout>
  );
} 