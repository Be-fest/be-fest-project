"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: "client" | "provider" | "admin";
  redirectTo?: string;
}

export function AuthGuard({
  children,
  requiredRole,
  redirectTo = "/auth/login",
}: AuthGuardProps) {
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        // Se não tem sessão, redireciona para login
        if (!session?.user) {
          router.push('/auth/login');
          setLoading(false);
          return;
        }

        if (session?.user) {
          setIsAuthorized(true);
          setLoading(false);
        }

        if (!requiredRole) {
          setIsAuthorized(true);
          setLoading(false);
          return;
        }

        // Verifica role se necessário
        const { data: userData } = await supabase
          .from("users")
          .select("role")
          .eq("id", session.user.id)
          .single();

        const userRole = userData?.role || "client";

        if (userRole !== requiredRole) {
          router.push("/dashboard");
          return;
        }

        setLoading(false);
        setIsAuthorized(true);
      } catch (error) {
        setLoading(false);
        router.push(redirectTo);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    // Escuta mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT" || !session) {
        setLoading(false);
        setIsAuthorized(false);
        router.push(redirectTo);
      } else if (event === "SIGNED_IN" && session) {
        checkAuth();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#FFF6FB] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#F71875] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return <>{children}</>;
}
