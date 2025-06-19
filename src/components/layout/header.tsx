import Link from 'next/link';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { ThemeToggleButton } from '@/components/theme-toggle-button';
import React from 'react';

function HeaderComponent() {
  const { isMobile } = useSidebar();

  return (
    <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight font-headline">Compañero de Atención Primaria</span>
        </Link>
        
        <div className="flex items-center gap-2">
          <ThemeToggleButton />
          {isMobile ? (
             <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Alternar Menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="md:hidden">
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
