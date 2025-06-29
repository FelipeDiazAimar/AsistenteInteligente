"use client";

import Link from 'next/link';
import { Menu, ArrowLeft, Home, BookOpen, FileText, Video, Image as ImageIcon, ClipboardCheck, FilePlus2, HeartPulse } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger, SheetTitle, SheetHeader } from '@/components/ui/sheet';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import React from 'react';
import { useRouter } from 'next/navigation';

function HeaderComponent() {
  const { isMobile } = useSidebar();
  const router = useRouter();

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
                  <Link href="/" className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
                    <Home className="h-5 w-5" />
                    <span className="font-medium">Inicio</span>
                  </Link>
                  <Link href="/resources/pdfs" className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
                    <FileText className="h-5 w-5" />
                    <span className="font-medium">PDFs</span>
                  </Link>
                  <Link href="/resources/videos" className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
                    <Video className="h-5 w-5" />
                    <span className="font-medium">Videos</span>
                  </Link>
                  <Link href="/resources/images" className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
                    <ImageIcon className="h-5 w-5" />
                    <span className="font-medium">Imágenes</span>
                  </Link>
                  <Link href="/resources/articles" className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
                    <BookOpen className="h-5 w-5" />
                    <span className="font-medium">Artículos</span>
                  </Link>
                  <Link href="/self-assessment" className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
                    <ClipboardCheck className="h-5 w-5" />
                    <span className="font-medium">Autoevaluación</span>
                  </Link>
                  <Link href="/admin/add-notes" className="flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors">
                    <FilePlus2 className="h-5 w-5" />
                    <span className="font-medium">Agregar Apuntes</span>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          ) : (
            <SidebarTrigger className="hidden group-data-[variant=inset]:md:flex" />
          )}
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 min-w-0 flex-1">
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
