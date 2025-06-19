import Link from 'next/link';
import React from 'react';

function FooterComponent() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} Compañero de Atención Primaria. Todos los derechos reservados.
          </p>
          <div className="flex gap-4">
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Política de Privacidad
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Términos de Servicio
            </Link>
            <Link href="#" className="text-sm text-muted-foreground hover:text-foreground">
              Enlaces Útiles
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

export const Footer = React.memo(FooterComponent);
