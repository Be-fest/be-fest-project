'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Logo } from '@/components/ui/Logo';
import { MdVisibility, MdVisibilityOff, MdAdminPanelSettings } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import { useToastGlobal } from '@/contexts/GlobalToastContext';
import { createClient } from '@/lib/supabase/client';

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const toast = useToastGlobal();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Fazer login usando Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        console.error('Erro de autenticação:', authError);
        setError('Credenciais inválidas');
        toast.error('Erro no login', 'Email ou senha incorretos');
        return;
      }

      if (!authData.user) {
        setError('Usuário não encontrado');
        toast.error('Erro no login', 'Usuário não encontrado');
        return;
      }

      // Verificar se o usuário é admin na tabela users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      if (userError || !userData) {
        setError('Erro ao verificar perfil do usuário');
        toast.error('Erro no login', 'Erro ao verificar perfil do usuário');
        return;
      }

      // Verificar se o usuário é admin ou super_admin
      if (userData.role !== 'admin' && userData.role !== 'super_admin') {
        setError('Acesso negado. Apenas administradores podem acessar esta área.');
        toast.error('Acesso negado', 'Apenas administradores podem acessar esta área.');
        // Fazer logout se não for admin
        await supabase.auth.signOut();
        return;
      }

      toast.success('Login realizado com sucesso!', 'Bem-vindo, Administrador!');
      
      // Redirecionar para o dashboard de admin
      router.push('/admin');
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
      toast.error('Erro no login', err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        {/* Card de Login */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#FF4DA6] to-[#A502CA] rounded-2xl flex items-center justify-center">
                <MdAdminPanelSettings className="text-white text-3xl" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Admin Login
            </h1>
            <p className="text-gray-600 text-sm">
              Acesso exclusivo para administradores
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Digite seu email"
                required
                className="w-full"
              />
            </div>

            {/* Senha */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Digite sua senha"
                  required
                  className="w-full pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                </button>
              </div>
            </div>

            {/* Erro */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-3"
              >
                <p className="text-red-600 text-sm">{error}</p>
              </motion.div>
            )}

            {/* Botão de Login */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-[#FF4DA6] to-[#A502CA] hover:from-[#e64495] hover:to-[#9400B8] text-white py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Entrando...
                </div>
              ) : (
                'Entrar como Admin'
              )}
            </Button>
          </form>

          {/* Link para voltar */}
          <div className="mt-6 text-center">
            <a
              href="/auth/login"
              className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              ← Voltar para login normal
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            Sistema de Administração Be Fest
          </p>
        </div>
      </motion.div>
    </div>
  );
} 