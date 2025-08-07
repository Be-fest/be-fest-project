import type { Metadata } from "next";
import { Poppins, Roboto } from "next/font/google";
import { GlobalToastProvider } from "@/contexts/GlobalToastContext";
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
  title: "Be Fest - Sua festa num Clique!",
  description: "Encontre os melhores prestadores para sua festa",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // Script para limpar localStorage se necessário
              (function() {
                try {
                  // Verificar se há dados corrompidos no localStorage
                  const sessionData = localStorage.getItem('be-fest-session');
                  if (sessionData) {
                    const parsed = JSON.parse(sessionData);
                    const now = Date.now();
                    
                    // Se a sessão expirou, limpar
                    if (parsed.expiresAt && now > parsed.expiresAt) {
                      localStorage.removeItem('be-fest-session');
                      localStorage.removeItem('be-fest-user-data');
                      console.log('Sessão expirada removida do localStorage');
                    }
                  }
                } catch (error) {
                  console.error('Erro ao verificar localStorage:', error);
                  // Se há erro ao ler, limpar dados possivelmente corrompidos
                  localStorage.removeItem('be-fest-session');
                  localStorage.removeItem('be-fest-user-data');
                }
              })();
            `,
          }}
        />
      </head>
      <body
        className={`${poppins.variable} ${roboto.variable} antialiased font-poppins`}
        cz-shortcut-listen="true"
      >
        <GlobalToastProvider>
          {children}
        </GlobalToastProvider>
      </body>
    </html>
  );
}
