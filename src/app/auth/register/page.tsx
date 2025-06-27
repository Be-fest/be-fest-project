'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { RegisterForm, ServiceProviderForm } from '@/components/forms';
import { AuthLayout } from '@/components/AuthLayout';
import { RegisterFormData, ServiceProviderFormData } from '@/types/auth';
import { useRouter } from 'next/navigation';
import { MdArrowBack } from 'react-icons/md';
import Link from 'next/link';
import { createSupabaseBrowserClient, checkEmailExists, checkDocumentExists } from '@/lib/supabase/client';
import { removeMask } from '@/utils/formatters';

export default function RegisterPage() {
  const [userType, setUserType] = useState<'client' | 'service_provider'>('client');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleRegister = async (data: RegisterFormData) => {
    try {
      setError('');
      console.log('Starting client registration process...');
      const supabase = createSupabaseBrowserClient();

      // Verificar email duplicado
      console.log('Checking email:', data.email);
      const emailExists = await checkEmailExists(data.email);
      if (emailExists) {
        setError('Este email já está em uso');
        return;
      }

      // Verificar CPF duplicado
      const cpf = removeMask(data.cpf);
      console.log('Checking CPF:', cpf);
      const documentExists = await checkDocumentExists(cpf);
      if (documentExists) {
        setError('Este CPF já está cadastrado');
        return;
      }

      // Criar usuário no Auth
      console.log('Creating auth user...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw new Error(`Erro ao criar usuário: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('Erro ao criar usuário: usuário não retornado');
      }

      // Criar perfil na tabela users
      console.log('Creating user profile...');
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          role: 'client',
          full_name: data.fullName,
          email: data.email,
          cpf: cpf,
          whatsapp_number: removeMask(data.phone),
        });

      if (profileError) {
        console.error('Profile error:', profileError);
        throw new Error(`Erro ao criar perfil: ${profileError.message}`);
      }

      console.log('Registration completed successfully');
      router.push('/auth/login');
    } catch (error) {
      console.error('Registration failed:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Ocorreu um erro ao criar sua conta. Por favor, tente novamente.');
      }
    }
  };

  const handleServiceProviderRegister = async (data: ServiceProviderFormData) => {
    try {
      setError('');
      console.log('Starting service provider registration process...');
      const supabase = createSupabaseBrowserClient();

      // Verificar email duplicado
      console.log('Checking email:', data.email);
      const emailExists = await checkEmailExists(data.email);
      if (emailExists) {
        setError('Este email já está em uso');
        return;
      }

      // Verificar CNPJ duplicado
      const cnpj = removeMask(data.cnpj);
      console.log('Checking CNPJ:', cnpj);
      const documentExists = await checkDocumentExists(cnpj);
      if (documentExists) {
        setError('Este CNPJ já está cadastrado');
        return;
      }

      // Criar usuário no Auth
      console.log('Creating auth user...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
      });

      if (authError) {
        console.error('Auth error:', authError);
        throw new Error(`Erro ao criar usuário: ${authError.message}`);
      }

      if (!authData.user) {
        throw new Error('Erro ao criar usuário: usuário não retornado');
      }

      // Criar perfil na tabela users
      console.log('Creating user profile...');
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          role: 'provider',
          organization_name: data.companyName,
          email: data.email,
          cnpj: cnpj,
          whatsapp_number: removeMask(data.phone),
          area_of_operation: data.areaOfOperation,
        });

      if (profileError) {
        console.error('Profile error:', profileError);
        throw new Error(`Erro ao criar perfil: ${profileError.message}`);
      }

      console.log('Registration completed successfully');
      router.push('/auth/login');
    } catch (error) {
      console.error('Service provider registration failed:', error);
      if (error instanceof Error) {
        setError(error.message);
      } else {
        setError('Ocorreu um erro ao criar sua conta. Por favor, tente novamente.');
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
