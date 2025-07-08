"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "./ui";
import { Header } from "./Header";
import { useOffCanvas } from "@/contexts/OffCanvasContext";
import { createClient } from "@/lib/supabase/client";

export function Hero() {
  const { openOffCanvas } = useOffCanvas();
  const [userType, setUserType] = useState<'client' | 'service_provider' | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Buscar o tipo do usuário da tabela users
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', user.id)
          .single();
        
        if (userData) {
          setUserType(userData.role === 'provider' ? 'service_provider' : 'client');
        }
      }
      setLoading(false);
    };

    getUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: any, session: any) => {
      if (session?.user) {
        // Buscar dados atualizados do usuário
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('id', session.user.id)
          .single();
        
        if (userData) {
          setUserType(userData.role === 'provider' ? 'service_provider' : 'client');
        }
      } else {
        setUserType(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <div className={`min-h-screen bg-[#FFF9F9] ${userType === 'service_provider' ? 'pt-32' : 'pt-20'} transition-all duration-300`}>
      <Header />
      <div className="container max-w-7xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <div className="grid lg:grid-cols-5 gap-8 lg:gap-12 items-center min-h-[70vh] md:min-h-[80vh]">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-4 md:space-y-6 flex justify-start items-start flex-col lg:col-span-2 text-center lg:text-left"
          >
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-medium text-[#520029] leading-tight font-poppins">
              Sua festa num clique!
              <span className="text-[#520029] block">Be fest, conectando </span>
              <span className="text-[#520029] block">você à felicidade.</span>
            </h1>
            <p className="text-base md:text-lg text-[#6E5963] leading-relaxed font-poppins max-w-lg mx-auto lg:mx-0">
              Encontre serviços de comida e bebida na sua região e monte sua
              festa de forma rápida, prática e segura.
            </p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="w-full lg:w-auto"
            >
              <Button
                onClick={openOffCanvas}
                style={{
                  background:
                    "linear-gradient(180deg, #FF0080 0%, #CD0067 100%)",
                }}
                className="w-full md:w-auto text-white px-8 md:px-12 py-3 md:py-4 text-base md:text-lg font-poppins rounded-lg hover:opacity-90 transition-all duration-300"
              >
                New Fest
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center items-center lg:col-span-3"
          >
            <div className="relative w-full">
              <video
                src="/hero-video.mp4"
                autoPlay
                loop
                muted
                playsInline
                className="w-full h-auto object-cover"
                style={{ maxHeight: '80vh' }}
              />
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
