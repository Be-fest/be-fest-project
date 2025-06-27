'use client';

import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Button } from './ui/Button';

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/'); // Redireciona para a home
    router.refresh(); // Garante que o estado do servidor seja atualizado
  };

  return (
    <Button onClick={handleLogout} customColor="#FF0080">
      Sair
    </Button>
  );
} 