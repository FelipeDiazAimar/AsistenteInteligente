
"use client";
import type { ReactNode } from 'react';
import React from 'react'; // Ensure React is imported
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  BookOpen,
  FileText,
  Video,
  Image as ImageIcon, // Renamed to avoid conflict
  ClipboardCheck,
  HeartPulse,
  FilePlus2,
  Pin,
  PinOff,
} from 'lucide-react';

import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  useSidebar,
} from '@/components/ui/sidebar';
import { Header } from './header';
import { Footer } from './footer';
import { cn } from '@/lib/utils';

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  tooltip?: string;
}

const sidebarNavItems: NavItem[] = [
  { href: '/', label: 'Inicio', icon: <Home className="h-5 w-5" />, tooltip: "Inicio" },
  { href: '/resources/pdfs', label: 'PDFs', icon: <FileText className="h-5 w-5" />, tooltip: "Documentos PDF" },
  { href: '/resources/videos', label: 'Videos', icon: <Video className="h-5 w-5" />, tooltip: "Videos Educativos" },
  { href: '/resources/images', label: 'Imágenes', icon: <ImageIcon className="h-5 w-5" />, tooltip: "Imágenes Médicas" },
  { href: '/resources/articles', label: 'Artículos', icon: <BookOpen className="h-5 w-5" />, tooltip: "Artículos y Publicaciones" },
  { href: '/self-assessment', label: 'Autoevaluación', icon: <ClipboardCheck className="h-5 w-5" />, tooltip: "Autoevaluación" },
  { href: '/admin/add-notes', label: 'Agregar Apuntes', icon: <FilePlus2 className="h-5 w-5" />, tooltip: "Agregar Apuntes (Profesores)" },
];

// Memoized component for the page content area
const PageContent = React.memo(({ children }: { children: React.ReactNode }) => {
  return (
    <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8 bg-background">
      {children}
    </main>
  );
});
PageContent.displayName = 'PageContent';


function MainLayoutInternal({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { isMobile, setOpen, open } = useSidebar();

  const [isPinned, setIsPinned] = React.useState(true);
  const [isEdgeHoveredForUnpinned, setIsEdgeHoveredForUnpinned] = React.useState(false);

  let currentCollapsibleMode: "icon" | "offcanvas";
  if (isMobile) {
    currentCollapsibleMode = "offcanvas";
  } else if (isPinned) {
    currentCollapsibleMode = "icon";
  } else { // Desktop, Unpinned
    currentCollapsibleMode = isEdgeHoveredForUnpinned ? "icon" : "offcanvas";
  }

  React.useEffect(() => {
    // If sidebar is shown temporarily due to edge hover (when unpinned),
    // ensure it's in icon-only mode (not expanded with text).
    if (!isMobile && !isPinned && isEdgeHoveredForUnpinned) {
      setOpen(false);
    }
  }, [isMobile, isPinned, isEdgeHoveredForUnpinned, setOpen]);

  const handleTogglePin = () => {
    const newPinnedState = !isPinned;
    setIsPinned(newPinnedState);
    setOpen(false); // Always collapse/hide when toggling pin
    if (newPinnedState === false) { // If just unpinned
      setIsEdgeHoveredForUnpinned(false); // Reset edge hover state
    }
  };

  const handleSidebarMouseEnter = () => {
    if (isMobile) return;
    if (isPinned) {
      setOpen(true); // Expand text if pinned
    } else {
      // If unpinned and sidebar is shown due to edge hover,
      // keep edge hover true and ensure it stays icon-only
      setIsEdgeHoveredForUnpinned(true);
      setOpen(false);
    }
  };

  const handleSidebarMouseLeave = () => {
    if (isMobile) return;
    if (isPinned) {
      setOpen(false); // Collapse to icons if pinned
    } else {
      // If unpinned, leaving the sidebar area means it should hide
      setIsEdgeHoveredForUnpinned(false);
    }
  };

  return (
    <>
      {/* Edge Hover Detector (only for desktop & unpinned state) */}
      {!isMobile && !isPinned && (
        <div
          className="fixed inset-y-0 left-0 z-20 w-3 bg-transparent" // Small, transparent hover area
          onMouseEnter={() => setIsEdgeHoveredForUnpinned(true)}
          onMouseLeave={() => {
            // This onMouseLeave is tricky. If the mouse moves into the actual sidebar,
            // this will fire. The sidebar's onMouseLeave should take precedence.
            // For now, let the sidebar's onMouseLeave handle hiding.
          }}
        />
      )}

      {!isMobile && (
        <Sidebar
          collapsible={currentCollapsibleMode}
          variant="sidebar"
          className={cn("hidden md:flex flex-col")} // Base classes
          onMouseEnter={handleSidebarMouseEnter}
          onMouseLeave={handleSidebarMouseLeave}
        >
          <SidebarHeader className={cn(
            "flex items-center transition-all duration-300 ease-in-out",
            "group-data-[state=expanded]:p-4 group-data-[state=expanded]:gap-2",
            "group-data-[state=collapsed]:p-2 group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:h-[56px]"
          )}>
            <Link href="/" className="flex items-center gap-2">
              <HeartPulse
                className={cn(
                  "text-sidebar-primary",
                  "h-6 w-6"
                )}
              />
              <span className={cn(
                "text-lg font-semibold tracking-tight font-headline",
                "group-data-[state=collapsed]:opacity-0 group-data-[state=collapsed]:hidden group-data-[state=expanded]:opacity-100 group-data-[state=expanded]:block transition-opacity duration-300"
              )}>
                Atención Primaria
              </span>
            </Link>
          </SidebarHeader>
          <SidebarContent className="flex-1 overflow-y-auto p-2 flex flex-col justify-between">
            <SidebarMenu>
              {sidebarNavItems.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <Link href={item.href} legacyBehavior passHref>
                    <SidebarMenuButton
                      asChild
                      isActive={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href) && (pathname.split('/').length === item.href.split('/').length || pathname.startsWith(item.href + '/')))}
                      tooltip={item.tooltip}
                      className={cn(
                        (pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href) && (pathname.split('/').length === item.href.split('/').length || pathname.startsWith(item.href + '/'))))
                          ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/80"
                          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                      )}
                    >
                      <a>
                        {item.icon}
                        <span className={cn(
                          "transition-opacity duration-300",
                          "group-data-[state=collapsed]:opacity-0 group-data-[state=collapsed]:hidden group-data-[state=expanded]:opacity-100 group-data-[state=expanded]:block"
                        )}>{item.label}</span>
                      </a>
                    </SidebarMenuButton>
                  </Link>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleTogglePin}
                  tooltip={isPinned ? "Desfijar Barra Lateral" : "Fijar Barra Lateral"}
                  aria-label={isPinned ? "Desfijar barra lateral" : "Fijar barra lateral"}
                >
                  {isPinned ? <PinOff className="h-5 w-5" /> : <Pin className="h-5 w-5" />}
                  <span className={cn(
                    "transition-opacity duration-300",
                    "group-data-[state=collapsed]:opacity-0 group-data-[state=collapsed]:hidden",
                    "group-data-[state=expanded]:opacity-100 group-data-[state=expanded]:block"
                  )}>
                    {isPinned ? 'Desfijar' : 'Fijar'}
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter className={cn(
            "transition-opacity duration-300",
             "group-data-[state=collapsed]:opacity-0 group-data-[state=collapsed]:hidden",
             "group-data-[state=expanded]:opacity-100 group-data-[state=expanded]:block",
             "p-2"
          )}>
            <p className="text-xs text-muted-foreground text-center">© {new Date().getFullYear()} CAP</p>
          </SidebarFooter>
        </Sidebar>
      )}

      <SidebarInset className="flex-1 flex flex-col">
        <Header />
        <PageContent>{children}</PageContent>
        <Footer />
      </SidebarInset>
    </>
  );
}

export function MainLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider defaultOpen={false}>
      <MainLayoutInternal>{children}</MainLayoutInternal>
    </SidebarProvider>
  );
}
