"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input, Button, Logo } from "@/components/ui";
import Link from "next/link";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { MdVisibility, MdVisibilityOff } from "react-icons/md";

export function LoginForm() {
  const [userType, setUserType] = useState<"client" | "service_provider">(
    "client"
  );
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");
  const supabase = createSupabaseBrowserClient();

  const handleUserTypeChange = (type: "client" | "service_provider") => {
    setUserType(type);
  };

  const handleLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error.message);
      } else if (data.user) {
        // Buscar o tipo do usuário
        const { data: userData } = await supabase
          .from("users")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (userData?.role === "provider") {
          router.push("/dashboard/prestador");
        } else {
          router.push(redirectTo || "/");
        }
      }
    } catch (error) {
      setError("Ocorreu um erro ao fazer login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6">
      <div className="text-center mb-6">
        {userType === "client" && (
          <Image
            src="/be-fest-client-logo.png"
            alt="Be Fest Logo"
            width={60}
            height={60}
            className="object-contain"
          />
        )}
        {userType === "service_provider" && (
          <Image
            src="/be-fest-provider-logo.png"
            alt="Be Fest Logo"
            width={60}
            height={60}
            className="object-contain"
          />
        )}
      </div>

      <div className="text-left space-y-2">
        <motion.h1
          className="text-4xl font-bold"
          style={{
            color: userType === "service_provider" ? "#A502CA" : "#F71875",
          }}
          animate={{
            color: userType === "service_provider" ? "#A502CA" : "#F71875",
            scale: [1, 1.02, 1],
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          Bem-vindo à Be Fest
        </motion.h1>
        <div className="flex justify-start gap-4 text-xl">
          <motion.button
            type="button"
            onClick={() => handleUserTypeChange("client")}
            className={`transition-colors cursor-pointer ${
              userType === "client"
                ? "font-semibold"
                : "text-[#520029] hover:opacity-70"
            }`}
            style={{ color: userType === "client" ? "#F71875" : undefined }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              color: userType === "client" ? "#F71875" : "#520029",
              fontWeight: userType === "client" ? 600 : 400,
            }}
            transition={{ duration: 0.2 }}
          >
            Sou Cliente
          </motion.button>
          <span className="text-gray-400">|</span>
          <motion.button
            type="button"
            onClick={() => handleUserTypeChange("service_provider")}
            className={`transition-colors cursor-pointer ${
              userType === "service_provider"
                ? "font-semibold"
                : "text-[#520029] hover:opacity-70"
            }`}
            style={{
              color: userType === "service_provider" ? "#A502CA" : undefined,
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              color: userType === "service_provider" ? "#A502CA" : "#520029",
              fontWeight: userType === "service_provider" ? 600 : 400,
            }}
            transition={{ duration: 0.2 }}
          >
            Sou Prestador
          </motion.button>
        </div>
        <AnimatePresence mode="wait">
          <motion.p
            key={userType}
            className="text-gray-500 mt-4 text-xl"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {userType === "client"
              ? "Faça login e organize a festa perfeita!"
              : "Acesse sua conta e gerencie seus eventos!"}
          </motion.p>
        </AnimatePresence>
      </div>

      <motion.form
        onSubmit={handleLogin}
        className="space-y-4 text-[#8D8D8D]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
        <Input
          type="email"
          placeholder="E-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          focusColor={userType === "service_provider" ? "#A502CA" : "#F71875"}
        />

        <div className="relative">
          <Input
            type={showPassword ? "text" : "password"}
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            focusColor={userType === "service_provider" ? "#A502CA" : "#F71875"}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            {showPassword ? (
              <MdVisibilityOff className="text-xl" />
            ) : (
              <MdVisibility className="text-xl" />
            )}
          </button>
        </div>

        <Button
          type="submit"
          isLoading={loading}
          customColor={userType === "service_provider" ? "#A502CA" : "#F71875"}
        >
          Entrar
        </Button>

        {error && <p className="text-center text-sm text-red-500">{error}</p>}
      </motion.form>

      <motion.div
        className="text-center"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.2 }}
      >
        <span className="text-[#520029]">Não tem uma conta? </span>
        <Link
          href="/auth/register"
          style={{
            color: userType === "service_provider" ? "#A502CA" : "#F71875",
          }}
          className="hover:underline"
        >
          Criar conta
        </Link>
      </motion.div>
    </div>
  );
}
