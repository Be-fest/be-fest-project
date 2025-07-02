'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);
  const [countdown, setCountdown] = useState(3);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    // Buscar dados do usuário de forma mais robusta
    const fetchUser = async () => {
      try {
        setLoading(true);
        setError(null);

        // Primeiro, verificar se há uma sessão ativa
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('Session error:', sessionError);
          setError('Erro ao verificar sessão');
          router.push('/auth/login');
          return;
        }

        if (!session || !session.user) {
          console.log('No active session found');
          router.push('/auth/login');
          return;
        }

        setUser(session.user);

        // Buscar perfil do usuário
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('full_name, role')
          .eq('id', session.user.id)
          .single();

        if (profileError) {
          console.error('Error fetching profile:', profileError);
          // Mesmo sem o perfil, podemos continuar com os dados básicos do usuário
        } else {
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Error in fetchUser:', error);
        setError('Erro ao carregar dados do usuário');
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();

    // Listener para mudanças na autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      
      if (event === 'SIGNED_OUT' || !session) {
        router.push('/auth/login');
      } else if (event === 'SIGNED_IN' && session.user) {
        setUser(session.user);
        
        // Buscar perfil atualizado
        const { data: profile } = await supabase
          .from('users')
          .select('full_name, role')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setUserProfile(profile);
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  // Countdown para redirecionamento
  useEffect(() => {
    if (!loading && !error && user && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (!loading && !error && user && countdown === 0) {
      // Redirecionar para a home
      router.push('/');
    }
  }, [countdown, router, loading, error, user]);

  const handleRedirectNow = () => {
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFF9F9' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F71875] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FFF9F9' }}>
        <div className="text-center bg-white rounded-lg shadow-lg p-8 max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.081 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Oops! Algo deu errado</h2>
          <p className="text-gray-600 mb-4">
            {error || 'Sessão não encontrada. Redirecionando para o login...'}
          </p>
          <button
            onClick={() => router.push('/auth/login')}
            className="bg-[#F71875] hover:bg-[#E6006F] text-white px-6 py-2 rounded-lg transition-colors"
          >
            Ir para Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8" style={{ backgroundColor: '#FFF9F9' }}>
      <motion.div 
        className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 sm:p-8 text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="w-16 h-16 mx-auto mb-6"
        >
          <div className="w-full h-full bg-gradient-to-r from-pink-500 to-purple-600 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </motion.div>

        <motion.h1 
          className="text-3xl font-bold text-[#F71875] mb-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          Bem-vindo, {userProfile?.full_name || user?.email?.split('@')[0] || 'Usuário'}! 🎉
        </motion.h1>

        <motion.p 
          className="text-gray-600 mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          Login realizado com sucesso! Você já pode começar a planejar suas festas incríveis.
        </motion.p>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="space-y-4"
        >
          <p className="text-sm text-gray-500">
            Redirecionando em {countdown} segundo{countdown !== 1 ? 's' : ''}...
          </p>

          <button
            onClick={handleRedirectNow}
            className="w-full bg-[#F71875] hover:bg-[#E6006F] text-white font-medium py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Ir para a Home Agora
          </button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-6 pt-6 border-t border-gray-200"
        >
          <p className="text-xs text-gray-400">
            🎊 Que a festa comece! 🎊
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
}
