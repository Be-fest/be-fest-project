import type { Metadata } from "next";
import { Poppins, Roboto } from "next/font/google";
import { SessionProvider } from "@/components/SessionProvider";
import { GlobalToastProvider } from "@/contexts/GlobalToastContext";
import { RoutesModal } from "@/components/ui";
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
        <GlobalToastProvider>
          <SessionProvider>
            {children}
            <RoutesModal />
          </SessionProvider>
        </GlobalToastProvider>
      </body>
    </html>
  );
}
