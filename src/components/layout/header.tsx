"use client";

import Link from 'next/link';
import { Menu, ArrowLeft, Home, BookOpen, FileText, Video, Image as ImageIcon, ClipboardCheck, HeartPulse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { ThemeToggleIcon } from '@/components/theme-toggle-button';
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

// Prefetch agresivo: todas las rutas del nav se precargan al entrar en viewport.
// Sin fetch manual en hover (no bloquea la navegación; lo hace el router).
const mobileNavItems = [
  { href: '/', label: 'Inicio', icon: Home },
  { href: '/resources/pdfs', label: 'PDFs', icon: FileText },
  { href: '/resources/videos', label: 'Videos', icon: Video },
  { href: '/resources/images', label: 'Imágenes', icon: ImageIcon },
  { href: '/resources/articles', label: 'Artículos', icon: BookOpen },
  { href: '/resources/apuntes', label: 'Apuntes', icon: FileText },
  { href: '/self-assessment', label: 'Autoevaluación', icon: ClipboardCheck },
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || (href !== '/' && pathname.startsWith(href + '/'));
}

function HeaderComponent() {
  const router = useRouter();
  const pathname = usePathname();
  // Drawer controlado: permite cerrar al navegar, al tocar un enlace,
  // al tocar fuera (overlay de Radix) y con Escape (Radix).
  const [menuAbierto, setMenuAbierto] = React.useState(false);

  // Cierra el drawer automáticamente al cambiar de ruta.
  React.useEffect(() => {
    setMenuAbierto(false);
  }, [pathname]);

  const handleGoBack = () => {
    router.back();
  };

  return (
    <header className="sticky top-0 z-40 w-full max-w-full overflow-x-clip border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-14 w-full max-w-full items-center justify-between gap-2 overflow-x-clip px-3 sm:h-16 sm:gap-3 sm:px-4 lg:px-6">
        {/* Sección izquierda: Menú móvil + trigger escritorio + logo */}
        <div className="flex min-w-0 flex-1 items-center gap-1.5 sm:gap-2">
          {/* Drawer móvil: se muestra solo con CSS en <md, sin depender de JS para no parpadear */}
          <Sheet open={menuAbierto} onOpenChange={setMenuAbierto}>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                aria-expanded={menuAbierto}
                aria-controls="menu-movil"
                aria-label={menuAbierto ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
                className="h-10 w-10 shrink-0 rounded-full touch-manipulation focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background md:hidden"
              >
                <Menu className="h-5 w-5" aria-hidden="true" />
                <span className="sr-only">Alternar menú</span>
              </Button>
            </SheetTrigger>
            <SheetContent
              side="left"
              id="menu-movil"
              aria-label="Menú de navegación"
              className="flex w-[85vw] min-w-0 max-w-[300px] flex-col overflow-y-auto p-4 sm:p-6 md:hidden"
            >
              <SheetHeader className="text-left">
                <SheetTitle className="flex min-w-0 items-center gap-2">
                  <HeartPulse className="h-5 w-5 shrink-0 text-sky-500" aria-hidden="true" />
                  <span className="truncate">Menú de navegación</span>
                </SheetTitle>
              </SheetHeader>
              <nav aria-label="Navegación principal" className="mt-6 flex min-w-0 flex-1 flex-col gap-1">
                {mobileNavItems.map((item) => {
                  const active = isActivePath(pathname ?? '/', item.href);
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      prefetch={true}
                      onClick={() => setMenuAbierto(false)}
                      aria-current={active ? 'page' : undefined}
                      className={cn(
                        'flex min-h-[44px] min-w-0 items-center gap-3 truncate rounded-lg px-3 py-3 text-[15px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                        active
                          ? 'bg-primary font-medium text-primary-foreground'
                          : 'hover:bg-accent hover:text-accent-foreground'
                      )}
                    >
                      <Icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                      <span className="min-w-0 flex-1 truncate font-medium">{item.label}</span>
                    </Link>
                  );
                })}
              </nav>
              {/* Toggle de tema al pie del drawer (en móvil no hay sidebar) */}
              <div className="mt-auto flex items-center justify-between border-t pt-4">
                <span className="text-sm font-medium">Tema</span>
                <ThemeToggleIcon />
              </div>
            </SheetContent>
          </Sheet>

          {/* Trigger de sidebar solo en escritorio (CSS lo oculta en móvil) */}
          <SidebarTrigger
            aria-label="Alternar barra lateral"
            className="hidden h-10 w-10 shrink-0 rounded-full focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 md:flex"
          />

          {/* Logo con título truncado para 360px */}
          <Link
            href="/"
            prefetch={true}
            title="Compañero de Atención Primaria — Inicio"
            aria-label="Compañero de Atención Primaria — Inicio"
            className="flex min-w-0 flex-1 items-center gap-2 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <span className="block min-w-0 max-w-full truncate text-[15px] font-bold tracking-tight font-headline sm:text-lg md:text-xl">
              <span className="hidden sm:inline">Compañero de </span>
              <span>Atención Primaria</span>
            </span>
          </Link>
        </div>

        {/* Sección derecha: Botones de acción */}
        <div className="flex shrink-0 items-center gap-1.5 sm:gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={handleGoBack}
            aria-label="Volver atrás"
            title="Volver atrás"
            className="h-10 w-10 shrink-0 touch-manipulation rounded-full transition-colors duration-200 hover:bg-blue-100 hover:border-blue-300 hover:text-blue-700 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Volver atrás</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

export const Header = React.memo(HeaderComponent);
