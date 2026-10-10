"use client";

import Link from 'next/link';
import { Menu, ArrowLeft, Home, BookOpen, FileText, Video, Image as ImageIcon, ClipboardCheck, HeartPulse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
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
  { href: '/self-assessment', label: 'Autoevaluación', icon: ClipboardCheck },
  { href: '/resources/apuntes', label: 'Apuntes', icon: FileText },
];

function isActivePath(pathname: string, href: string) {
  return pathname === href || (href !== '/' && pathname.startsWith(href + '/'));
}

function HeaderComponent() {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const pathname = usePathname();

  const handleGoBack = () => {
    router.back();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-2 sm:px-4 lg:px-6">
        {/* Sección izquierda: Menú móvil + Logo */}
        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
          {/* Botón del menú móvil en la izquierda */}
          {isMobile ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden h-8 w-8 sm:h-9 sm:w-9 flex-shrink-0">
                  <Menu className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="sr-only">Alternar Menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="md:hidden w-[280px] sm:w-[300px]" {...({} as any)}>
                <SheetHeader>
                  <SheetTitle className="flex items-center gap-2">
                    <HeartPulse className="h-5 w-5 text-sky-500" />
                    <span>Menú de Navegación</span>
                  </SheetTitle>                
                  </SheetHeader>
                <nav className="flex flex-col gap-4 mt-6">
                  {mobileNavItems.map((item) => {
                    const active = isActivePath(pathname, item.href);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        prefetch={true}
                        aria-current={active ? 'page' : undefined}
                        className={cn(
                          'flex items-center gap-3 p-3 rounded-lg transition-colors',
                          active
                            ? 'bg-primary text-primary-foreground font-medium'
                            : 'hover:bg-accent'
                        )}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="font-medium">{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
          ) : (
            <SidebarTrigger className="hidden group-data-[variant=inset]:md:flex" />
          )}
          
          {/* Logo */}
          <Link href="/" prefetch={true} className="flex items-center gap-2 min-w-0 flex-1">
            <span className="text-sm sm:text-lg md:text-xl font-bold tracking-tight font-headline truncate">
              <span className="hidden sm:inline">Compañero de </span>
              <span>Atención Primaria</span>
            </span>
          </Link>
        </div>
        
        {/* Sección derecha: Botones de acción */}
        <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
          <div className="ml-1">
            <ThemeToggleButton />
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleGoBack}
            className="h-8 w-8 sm:h-9 sm:w-9 rounded-full hover:bg-blue-100 hover:border-blue-300 hover:text-blue-700 transition-colors duration-200"
            title="Volver atrás"
          >
            <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="sr-only">Volver atrás</span>
          </Button>
        </div>
      </div>
    </header>
  );
}

export const Header = React.memo(HeaderComponent);
