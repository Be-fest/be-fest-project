import { redirect } from 'next/navigation';
import { getCurrentUser, getUserEvents, getUserStats } from '@/lib/dal';
import { ClientLayout } from '@/components/client/ClientLayout';
import ProfileClient from '@/components/profile/ProfileClient';

export default async function ProfilePage() {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/auth/login');
  }

  try {
    const [events, stats] = await Promise.all([
      getUserEvents(),
      getUserStats()
    ]);

    return (
      <ClientLayout user={user}>
        <ProfileClient 
          user={user}
          events={events}
          stats={stats}
        />
      </ClientLayout>
    );
  } catch (error) {
    console.error('Error loading profile:', error);
    return (
      <ClientLayout user={user}>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Erro ao carregar perfil</h1>
            <p className="text-gray-600">Tente novamente mais tarde.</p>
          </div>
        </div>
      </ClientLayout>
    );
  }
} 