'use client';

import { createClient as createSupabaseClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { MdExitToApp } from 'react-icons/md';
import { useAuth } from '@/hooks/useAuth';

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createSupabaseClient();
  const { userData } = useAuth();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      router.push('/auth/login'); // Redireciona para login
      router.refresh(); // Garante que o estado do servidor seja atualizado
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center space-x-4 p-3 text-red-600 hover:bg-red-50 transition-all duration-200 w-full rounded-xl group"
    >
      <div className="w-10 h-10 flex items-center justify-center rounded-lg bg-red-50 group-hover:bg-red-100 transition-colors">
        <MdExitToApp className="text-xl" />
      </div>
      <div className="flex-1 text-left">
        <div className="font-medium">Sair</div>
        <div className="text-xs text-red-400">
          {userData?.full_name ? `${userData.full_name}` : 'Fazer logout da conta'}
        </div>
      </div>
    </button>
  );
} 