
import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { MainLayout } from '@/components/layout/main-layout';
import { ThemeProvider } from '@/components/theme-provider';
import { AuthProvider } from '@/hooks/use-auth';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Compañero de Atención Primaria',
  description: 'Asistente de aprendizaje impulsado por IA para atención primaria.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${inter.variable} antialiased`} suppressHydrationWarning>
      <head>
        {/* Google Font links removed, handled by next/font */}
      </head>
      <body className="font-body"> {/* font-body will now use var(--font-inter) */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AuthProvider>
            <div
              role="status"
              aria-live="polite"
              className="w-full border-b border-amber-200 bg-amber-100 px-3 py-2 text-center text-xs font-medium text-amber-950 sm:px-4 sm:text-sm dark:border-amber-800 dark:bg-amber-950 dark:text-amber-100"
            >
              MODO DEMO — funciona sin base de datos ni API keys
              <span className="mt-0.5 block text-[11px] font-normal opacity-80 sm:mt-0 sm:inline sm:before:mx-2 sm:before:content-['·'] sm:text-xs">
                Explora el chat, los apuntes, la autoevaluación y los recursos sin configuración
              </span>
            </div>
            <MainLayout>
              {children}
            </MainLayout>
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
