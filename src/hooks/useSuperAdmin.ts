'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export function useSuperAdmin() {
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const checkSuperAdmin = () => {
      try {
        const superAdminSession = localStorage.getItem('superAdminSession');
        
        if (!superAdminSession) {
          setIsSuperAdmin(false);
          setLoading(false);
          return;
        }

        const session = JSON.parse(superAdminSession);
        
        if (session.role === 'super_admin') {
          setIsSuperAdmin(true);
        } else {
          setIsSuperAdmin(false);
        }
      } catch (error) {
        console.error('Erro ao verificar super admin:', error);
        setIsSuperAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    checkSuperAdmin();
  }, []);

  const logout = () => {
    localStorage.removeItem('superAdminSession');
    setIsSuperAdmin(false);
    router.push('/auth/admin-login');
  };

  return {
    isSuperAdmin,
    loading,
    logout
  };
} 