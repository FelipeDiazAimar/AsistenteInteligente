"use client";

import Link from 'next/link';
import { Menu, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
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
      <div className="container flex h-16 items-center justify-between px-4 sm:px-2 lg:px-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight font-headline">Compañero de Atención Primaria</span>
        </Link>
        
        <div className="flex items-center gap-8 mr-2">
          <div className="ml-1">
            <ThemeToggleButton />
          </div>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleGoBack}
            className="h-8 w-8 rounded-full hover:bg-blue-100 hover:border-blue-300 hover:text-blue-700 transition-colors duration-200"
            title="Volver atrás"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Volver atrás</span>
          </Button>
          {isMobile ? (
             <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Alternar Menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="md:hidden" {...({} as any)}>
                <nav className="grid gap-6 text-lg font-medium mt-8">
                  <Link href="/" className="flex items-center gap-2 mb-4">
                    <span className="font-bold font-headline">Compañero de Atención Primaria</span>
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          ) : (
            <SidebarTrigger className="hidden group-data-[variant=inset]:md:flex" />
          )}
        </div>
      </div>
    </header>
  );
}

export const Header = React.memo(HeaderComponent);
