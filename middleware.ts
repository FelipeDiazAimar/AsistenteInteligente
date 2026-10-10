import { NextRequest, NextResponse } from 'next/server';

// MODO DEMO (contrato: src/lib/demo.ts) — constantes inline a propósito.
// El middleware corre en Edge runtime y NO puede importar módulos Node
// (pg, bcryptjs, jsonwebtoken) vía @/lib/auth o @/lib/admin-auth.
// Por eso no se importa nada de @/lib/* aquí.
const DEMO_SESSION_TOKEN = 'demo-admin-session-v1';
const DEMO_ADMIN_EMAIL = 'admin@demo.local';
const DEMO_ADMIN_NAME = 'Admin Demo';

function isDemoMode(): boolean {
  // NEXT_PUBLIC_* se inlina en Edge; todo valor distinto de 'false' = demo.
  return process.env.NEXT_PUBLIC_DEMO_MODE !== 'false';
}

export function middleware(request: NextRequest) {
  // Rutas que requieren autenticación
  const protectedPaths = ['/admin'];
  const adminPaths = ['/admin/dashboard'];

  const { pathname } = request.nextUrl;

  // Verificar si la ruta requiere autenticación
  const requiresAuth = protectedPaths.some((path) => pathname.startsWith(path));
  const requiresAdmin = adminPaths.some((path) => pathname.startsWith(path));

  if (requiresAuth) {
    // Obtener token de las cookies - verificar ambos nombres
    const token =
      request.cookies.get('auth-token')?.value || request.cookies.get('session_token')?.value;

    if (!token) {
      // Redirigir a login si no hay token
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // MODO DEMO: sesión demo válida sin JWT ni Postgres. El usuario demo es
    // admin, así que se aplican las mismas reglas de redirección que el path real.
    if (isDemoMode() && token === DEMO_SESSION_TOKEN) {
      if (pathname === '/admin/add-notes') {
        return NextResponse.redirect(new URL('/admin/dashboard', request.url));
      }
      const response = NextResponse.next();
      response.headers.set('x-professor-id', 'demo-admin');
      response.headers.set('x-professor-name', DEMO_ADMIN_NAME);
      response.headers.set('x-professor-email', DEMO_ADMIN_EMAIL);
      response.headers.set('x-professor-is-admin', 'true');
      return response;
    }

    // Path real (no-demo): en Edge no se puede validar JWT ni consultar
    // Postgres. Se deja pasar y la validación definitiva ocurre en
    // server components / API routes (runtime Node). Solo se aplica la
    // regla conocida: si no hay token ya se redirigió arriba.
    // Para rutas admin, la verificación fina la hace la página destino.
    if (requiresAdmin) {
      return NextResponse.next();
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};
