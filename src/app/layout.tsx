import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { CartProvider } from "@/contexts/CartContext";
import { OffCanvasProvider } from "@/contexts/OffCanvasContext";
import { FloatingCart } from "@/components/FloatingCart";
import { CartWrapper } from "@/components/CartWrapper";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Be Fest - Sua festa dos sonhos",
  description: "Encontre os melhores prestadores para sua festa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        cz-shortcut-listen="true"
      >        <CartProvider>
          <OffCanvasProvider>
            {children}
            <FloatingCart />
            <CartWrapper />
          </OffCanvasProvider>
        </CartProvider>
      </body>
    </html>
  );
}
