"use client";

import { Suspense } from "react";

function ResetPasswordForm() {
  const { useEffect, useState } = require("react");
  const { useRouter, useSearchParams } = require("next/navigation");
  const { Input, Button } = require("@/components/ui");
  const { createClient } = require("@supabase/supabase-js");
  const { Database } = require("@/types/database");
  const { motion } = require("framer-motion");
  const { MdVisibility, MdVisibilityOff, MdCheckCircle } = require("react-icons/md");
  
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [countdown, setCountdown] = useState(3);

  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  // On mount: if hash tokens present, set session
  useEffect(() => {
    const hash = window.location.hash.substring(1); // remove '#'
    const params = new URLSearchParams(hash);
    const type = params.get("type");
    const access_token = params.get("access_token");
    const refresh_token = params.get("refresh_token");

    async function handleRecovery() {
      if (type === "recovery" && access_token && refresh_token) {
        await supabase.auth.setSession({ access_token, refresh_token });
      }
      setLoading(false);
    }

    handleRecovery();
  }, [supabase]);

  // Countdown effect
  useEffect(() => {
    if (success && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (success && countdown === 0) {
      router.push("/auth/login?message=Senha redefinida com sucesso! Faça login com sua nova senha.");
    }
  }, [success, countdown, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("A senha deve ter pelo menos 8 caracteres");
      return;
    }
    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      return;
    }
    setError(null);
    setLoading(true);
    const { error } = await supabase.auth.updateUser({ password });
    setLoading(false);
    if (error) {
      setError("Erro ao redefinir senha. Tente novamente.");
    } else {
      setSuccess(true);
    }
  };

  const handleRedirectNow = () => {
    router.push("/auth/login?message=Senha redefinida com sucesso! Faça login com sua nova senha.");
  };

  if (loading && !success) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F71875] mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
      <motion.div
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl font-bold text-center mb-6 text-[#F71875]">Redefinir Senha</h1>
        {error && (
          <div className="bg-red-50 text-red-500 p-3 rounded-md text-sm mb-4">{error}</div>
        )}
        {success ? (
          <motion.div 
            className="text-center"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
          >
            <div className="flex justify-center mb-4">
              <MdCheckCircle className="text-green-500 text-5xl" />
            </div>
            <h2 className="text-xl font-semibold text-green-600 mb-2">Senha Redefinida!</h2>
            <p className="text-gray-600 mb-4">
              Sua senha foi alterada com sucesso.
            </p>
            <p className="text-sm text-gray-500 mb-4">
              Redirecionando em {countdown} segundo{countdown !== 1 ? 's' : ''}...
            </p>
            <Button 
              onClick={handleRedirectNow}
              className="w-full"
              style={{ backgroundColor: "#F71875" }}
            >
              Ir para Login Agora
            </Button>
          </motion.div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Nova senha"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirmar senha"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showConfirm ? <MdVisibilityOff /> : <MdVisibility />}
              </button>
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              style={{ backgroundColor: "#F71875" }}
              disabled={loading}
            >
              {loading ? "Salvando..." : "Salvar nova senha"}
            </Button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#F71875] mx-auto mb-4"></div>
        <p className="text-gray-600">Carregando...</p>
      </div>
    </div>
  );
}

export default function ResetPassword() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <ResetPasswordForm />
    </Suspense>
  );
} 