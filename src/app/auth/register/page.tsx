'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RegisterForm, ServiceProviderForm } from '@/components/forms';
import { AuthLayout } from '@/components/AuthLayout';
import { RegisterFormData, ServiceProviderFormData } from '@/types/auth';
import { useRouter } from 'next/navigation';
import { MdArrowBack } from 'react-icons/md';
import Link from 'next/link';
import { createClient as createSupabaseClient, checkEmailExists, checkDocumentExists } from '@/lib/supabase/client';
import { removeMask } from '@/utils/formatters';

export default function RegisterPage() {
  const [userType, setUserType] = useState<'client' | 'service_provider'>('client');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (data: RegisterFormData) => {
    try {
      setError('');
      console.log('Starting registration process...');
      const supabase = createSupabaseClient();

      // Check for duplicate email
      console.log('Checking email:', data.email);
      const emailExists = await checkEmailExists(data.email);
      if (emailExists) {
        setError('This email is already in use');
        return;
      }

      // Check for duplicate CPF
      const cpf = removeMask(data.cpf);
      console.log('Checking CPF:', cpf);
      const documentExists = await checkDocumentExists(cpf);
      if (documentExists) {
        setError('This CPF is already registered');
        return;
      }

      // Create auth user
      console.log('Creating auth user...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.fullName,
            role: 'client'
          }
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw new Error(`Error creating user: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('Error creating user: user not returned');
      }

      // Create profile
      console.log('Creating user profile...');
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          full_name: data.fullName,
          phone: removeMask(data.phone),
          cpf: cpf,
          role: 'client'
        });

      if (profileError) {
        console.error('Profile error:', profileError);
        throw new Error(`Error creating profile: ${profileError.message}`);
      }

      console.log('Registration completed successfully');
      router.push('/dashboard');
    } catch (error) {
      console.error('Registration failed:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred while creating your account. Please try again.');
      }
    }
  };

  const handleServiceProviderRegister = async (data: ServiceProviderFormData) => {
    try {
      setError('');
      console.log('Starting service provider registration process...');
      const supabase = createSupabaseClient();

      // Check for duplicate email
      console.log('Checking email:', data.email);
      const emailExists = await checkEmailExists(data.email);
      if (emailExists) {
        setError('This email is already in use');
        return;
      }

      // Check for duplicate CNPJ
      const cnpj = removeMask(data.cnpj);
      console.log('Checking CNPJ:', cnpj);
      const documentExists = await checkDocumentExists(cnpj);
      if (documentExists) {
        setError('This CNPJ is already registered');
        return;
      }

      // Create auth user
      console.log('Creating auth user...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            full_name: data.companyName,
            role: 'provider'
          }
        }
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw new Error(`Error creating user: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('Error creating user: user not returned');
      }

      // Create profile and provider profile
      console.log('Creating provider profile...');
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          full_name: data.companyName,
          phone: removeMask(data.phone),
          role: 'provider'
        });

      if (profileError) {
        console.error('Profile error:', profileError);
        throw new Error(`Error creating profile: ${profileError.message}`);
      }

      const { error: providerProfileError } = await supabase
        .from('provider_profiles')
        .insert({
          id: authData.user.id,
          business_name: data.companyName,
          category: data.areaOfOperation,
          cnpj: cnpj
        });

      if (providerProfileError) {
        console.error('Provider profile error:', providerProfileError);
        throw new Error(`Error creating provider profile: ${providerProfileError.message}`);
      }

      console.log('Registration completed successfully');
      router.push('/dashboard');
    } catch (error) {
      console.error('Service provider registration failed:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('An error occurred while creating your account. Please try again.');
      }
    }
  };

  return (
    <AuthLayout>
      <div className="relative w-full">
        <div className="absolute top-4 left-4">
          <Link
            href="/auth/login"
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <MdArrowBack className="text-2xl text-[#F71875]" />
          </Link>
        </div>
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
                error={error}
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
                error={error}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuthLayout>
  );
}
