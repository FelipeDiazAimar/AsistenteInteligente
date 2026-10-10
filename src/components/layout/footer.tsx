import Link from 'next/link';
import React from 'react';

const enlacesLegales = [
  { href: '#', label: 'Política de Privacidad' },
  { href: '#', label: 'Términos de Servicio' },
  { href: '#', label: 'Enlaces Útiles' },
];

function FooterComponent() {
  return (
    <footer className="w-full max-w-full overflow-x-clip border-t bg-background">
      <div className="container mx-auto w-full max-w-full px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 text-center md:flex-row md:text-left">
          <p className="max-w-full break-words text-xs leading-relaxed text-muted-foreground text-balance sm:text-sm">
            &copy; {new Date().getFullYear()} Compañero de Atención Primaria. Todos los derechos reservados.
          </p>
          <nav
            aria-label="Enlaces legales"
            className="flex w-full max-w-full flex-col items-center justify-center gap-1 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-x-2 sm:gap-y-2 md:justify-end"
          >
            {enlacesLegales.map((enlace) => (
              <Link
                key={enlace.label}
                href={enlace.href}
                className="inline-flex min-h-[44px] min-w-0 max-w-full items-center justify-center break-words rounded-md px-2 py-2 text-center text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {enlace.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </footer>
  );
}

export const Footer = React.memo(FooterComponent);
