"use client";

import { motion } from "framer-motion";
import { Button } from "./ui";
import { Header } from "./Header";

export function Hero() {
  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <Header />      <div className="container max-w-7xl mx-auto px-6 py-12">
        {" "}
        <div className="grid lg:grid-cols-5 gap-12 items-center min-h-[80vh]">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-6 flex justify-start items-start flex-col lg:col-span-2"
          >
            <h1 className="text-4xl lg:text-5xl font-medium text-[#520029] leading-tight">
              Sua festa num clique!
              <span className="text-[#520029] block">Be fest, conectando </span>
              <span className="text-[#520029] block">você à felicidade.</span>
            </h1>
            <p className="text-lg text-[#6E5963] leading-relaxed">
              Encontre serviços de comida e bebida na sua região e monte sua
              festa de forma rápida, prática e segura.
            </p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
            >
              <Button
                style={{
                  background:
                    "linear-gradient(180deg, #FF0080 0%, #CD0067 100%)",
                }}
                className="text-white px-12 py-4 text-lg font-sans rounded-lg hover:opacity-90 transition-all duration-300"
              >
                New Fest
              </Button>
            </motion.div>
          </motion.div>{" "}          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex justify-center items-center lg:col-span-3"
          >            <div className="relative w-full">
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
