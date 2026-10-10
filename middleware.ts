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

const ADMIN_PREFIX = '/admin';
const LOGIN_PATH = '/admin/login';
const ADD_NOTES_PATH = '/admin/add-notes';
const APUNTES_PATH = '/resources/apuntes';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Fast path: la gran mayoría de navegaciones son públicas.
  // Un solo startsWith, sin arrays ni asignaciones, para salir en nanosegundos.
  if (!pathname.startsWith(ADMIN_PREFIX)) {
    return NextResponse.next();
  }
  // Sin token: redirigir a login (único caso que asigna una URL).
  const token =
    request.cookies.get('auth-token')?.value || request.cookies.get('session_token')?.value;

  if (!token) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // MODO DEMO: sesión demo válida sin JWT ni Postgres. El usuario demo es
  // admin, así que se aplican las mismas reglas de redirección que el path real.
  // ADD_NOTES_PATH es ruta borrada (código muerto): se redirige a /resources/apuntes.
  if (isDemoMode() && token === DEMO_SESSION_TOKEN) {
    if (pathname === ADD_NOTES_PATH) {
      return NextResponse.redirect(new URL(APUNTES_PATH, request.url));
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
  // server components / API routes (runtime Node).
  // La verificación fina de /admin/dashboard la hace la página destino.
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - _vercel (Vercel internals)
     * - favicon.ico (favicon file)
     * - any path with a file extension (public assets: *.png, *.svg,
     *   robots.txt, manifest.webmanifest, etc. — 'public' como prefijo
     *   no existe en la URL, por eso se excluye por extensión)
     */
    '/((?!api|_next/static|_next/image|_vercel|favicon.ico|.*\\..*).*)',
  ],
};
