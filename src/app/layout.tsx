import type { Metadata } from "next";
import { Poppins, Roboto } from "next/font/google";
import { CartProvider } from "@/contexts/CartContext";
import { OffCanvasProvider } from "@/contexts/OffCanvasContext";
import { FloatingCart } from "@/components/FloatingCart";
import { CartWrapper } from "@/components/CartWrapper";
import "./globals.css";

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
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
        className={`${poppins.variable} ${roboto.variable} antialiased font-poppins`}
        cz-shortcut-listen="true"
      >
        <CartProvider>
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
