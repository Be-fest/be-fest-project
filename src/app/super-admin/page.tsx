'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MdAdminPanelSettings, MdPersonAdd, MdVisibility, MdVisibilityOff, MdLogout, MdCheckCircle, MdError } from 'react-icons/md';
import { useRouter } from 'next/navigation';
import { useToastGlobal } from '@/contexts/GlobalToastContext';
import { createClient } from '@/lib/supabase/client';

interface AdminFormData {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
}

export default function SuperAdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [showLoginForm, setShowLoginForm] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [adminFormData, setAdminFormData] = useState<AdminFormData>({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [showAdminConfirmPassword, setShowAdminConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const toast = useToastGlobal();

  // Lista de emails autorizados para super admin
  const SUPER_ADMIN_EMAILS = [
    'befestsuperadmin@superadm.com'
    // Adicione outros emails de super admin aqui se necessário
  ];

  useEffect(() => {
    // Verificar se já está logado como super-admin
    const checkSuperAdminAuth = async () => {
      try {
        const supabase = createClient();
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Erro ao verificar sessão:', error);
          return;
        }

        if (session?.user) {
          // Verificar se o email do usuário está na lista de super admins
          if (SUPER_ADMIN_EMAILS.includes(session.user.email || '')) {
            setIsLoggedIn(true);
            setShowLoginForm(false);
          }
        }
      } catch (error) {
        console.error('Erro ao verificar autenticação:', error);
      }
    };

    checkSuperAdminAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const supabase = createClient();

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

      // Verificar se o email está na lista de super admins
      if (!SUPER_ADMIN_EMAILS.includes(authData.user.email || '')) {
        setError('Acesso negado. Apenas super administradores podem acessar esta área.');
        toast.error('Acesso negado', 'Apenas super administradores podem acessar esta área.');
        // Fazer logout se não for super-admin
        await supabase.auth.signOut();
        return;
      }

      toast.success('Login realizado com sucesso!', 'Bem-vindo, Super Admin!');
      setIsLoggedIn(true);
      setShowLoginForm(false);
      setFormData({ email: '', password: '' });
    } catch (err: any) {
      setError(err.message || 'Erro ao fazer login');
      toast.error('Erro no login', err.message || 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      setIsLoggedIn(false);
      setShowLoginForm(true);
      toast.success('Logout realizado', 'Você saiu do sistema');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      toast.error('Erro no logout', 'Erro ao sair do sistema');
    }
  };

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validações básicas
    if (!adminFormData.fullName.trim()) {
      setError('Nome completo é obrigatório');
      return;
    }
    if (!adminFormData.email.trim()) {
      setError('Email é obrigatório');
      return;
    }
    if (adminFormData.password.length < 6) {
      setError('Senha deve ter pelo menos 6 caracteres');
      return;
    }
    if (adminFormData.password !== adminFormData.confirmPassword) {
      setError('Senhas não coincidem');
      return;
    }
    if (!adminFormData.phone.trim()) {
      setError('Telefone é obrigatório');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: adminFormData.email,
        password: adminFormData.password,
        options: {
          data: {
            full_name: adminFormData.fullName,
            whatsapp_number: adminFormData.phone
          }
        }
      });

      if (authError) {
        if (authError.message.includes('User already registered')) {
          setError('Este email já está em uso');
        } else {
          setError(`Erro ao criar usuário: ${authError.message}`);
        }
        return;
      }

      if (!authData.user) {
        setError('Erro ao criar usuário');
        return;
      }

      // Inserir na tabela users com role "admin"
      const { error: insertError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          role: 'admin',
          full_name: adminFormData.fullName,
          email: adminFormData.email,
          whatsapp_number: adminFormData.phone,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (insertError) {
        console.error('Erro ao criar perfil admin:', insertError);
        setError('Erro ao criar perfil do administrador');
        return;
      }

      setSuccess(true);
      toast.success('Admin cadastrado com sucesso!', 'Novo administrador adicionado');
      
      // Limpar formulário
      setAdminFormData({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
      });

      // Resetar sucesso após 3 segundos
      setTimeout(() => {
        setSuccess(false);
      }, 3000);

    } catch (err: any) {
      setError(err.message || 'Erro ao cadastrar admin');
      toast.error('Erro no cadastro', err.message || 'Erro ao cadastrar admin');
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

  const handleAdminFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAdminFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError('');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {!isLoggedIn ? (
          // Card de Login
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
          >
            <div className="text-center mb-8">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center">
                  <MdAdminPanelSettings className="text-white text-3xl" />
                </div>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Super Admin
              </h1>
              <p className="text-gray-600 text-sm">
                Acesso exclusivo para super administradores
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
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

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-3"
                >
                  <p className="text-red-600 text-sm">{error}</p>
                </motion.div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Entrando...
                  </div>
                ) : (
                  'Entrar como Super Admin'
                )}
              </Button>
            </form>
          </motion.div>
        ) : (
          // Card de Cadastro de Admin
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100"
          >
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <MdPersonAdd className="text-white text-2xl" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">
                    Cadastrar Admin
                  </h1>
                  <p className="text-gray-600 text-sm">
                    Criar novo administrador
                  </p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                title="Sair"
              >
                <MdLogout size={24} />
              </button>
            </div>

            {success ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-8"
              >
                <MdCheckCircle className="text-green-500 text-6xl mx-auto mb-4" />
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Admin Cadastrado!
                </h2>
                <p className="text-gray-600 mb-6">
                  O novo administrador foi adicionado com sucesso.
                </p>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <h3 className="font-medium text-green-900 mb-2">Dados do Admin:</h3>
                  <div className="text-sm text-green-700 space-y-1">
                    <p><strong>Nome:</strong> {adminFormData.fullName}</p>
                    <p><strong>Email:</strong> {adminFormData.email}</p>
                    <p><strong>Telefone:</strong> {adminFormData.phone}</p>
                  </div>
                </div>
              </motion.div>
            ) : (
              <form onSubmit={handleCreateAdmin} className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                    Nome Completo *
                  </label>
                  <Input
                    id="fullName"
                    name="fullName"
                    type="text"
                    value={adminFormData.fullName}
                    onChange={handleAdminFormChange}
                    placeholder="Digite o nome completo"
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="adminEmail" className="block text-sm font-medium text-gray-700 mb-2">
                    Email *
                  </label>
                  <Input
                    id="adminEmail"
                    name="email"
                    type="email"
                    value={adminFormData.email}
                    onChange={handleAdminFormChange}
                    placeholder="admin@exemplo.com"
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="adminPhone" className="block text-sm font-medium text-gray-700 mb-2">
                    Telefone *
                  </label>
                  <Input
                    id="adminPhone"
                    name="phone"
                    type="tel"
                    value={adminFormData.phone}
                    onChange={handleAdminFormChange}
                    placeholder="(11) 99999-9999"
                    required
                    className="w-full"
                  />
                </div>

                <div>
                  <label htmlFor="adminPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Senha *
                  </label>
                  <div className="relative">
                    <Input
                      id="adminPassword"
                      name="password"
                      type={showAdminPassword ? 'text' : 'password'}
                      value={adminFormData.password}
                      onChange={handleAdminFormChange}
                      placeholder="Mínimo 6 caracteres"
                      required
                      className="w-full pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPassword(!showAdminPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showAdminPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="adminConfirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                    Confirmar Senha *
                  </label>
                  <div className="relative">
                    <Input
                      id="adminConfirmPassword"
                      name="confirmPassword"
                      type={showAdminConfirmPassword ? 'text' : 'password'}
                      value={adminFormData.confirmPassword}
                      onChange={handleAdminFormChange}
                      placeholder="Digite a senha novamente"
                      required
                      className="w-full pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminConfirmPassword(!showAdminConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showAdminConfirmPassword ? <MdVisibilityOff size={20} /> : <MdVisibility size={20} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center"
                  >
                    <MdError className="text-red-500 mr-2" />
                    <p className="text-red-600 text-sm">{error}</p>
                  </motion.div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white py-3 rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Cadastrando...
                    </div>
                  ) : (
                    'Cadastrar Admin'
                  )}
                </Button>
              </form>
            )}
          </motion.div>
        )}

        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            Sistema de Super Administração Be Fest
          </p>
        </div>
      </div>
    </div>
  );
} 