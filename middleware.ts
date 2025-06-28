import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';
import { isUserAdmin } from '@/lib/admin-auth';

export async function middleware(request: NextRequest) {
  // Rutas que requieren autenticación
  const protectedPaths = ['/admin'];
  const adminPaths = ['/admin/dashboard'];
  
  const { pathname } = request.nextUrl;
  
  // Verificar si la ruta requiere autenticación
  const requiresAuth = protectedPaths.some(path => pathname.startsWith(path));
  const requiresAdmin = adminPaths.some(path => pathname.startsWith(path));
  
  if (requiresAuth) {
    // Obtener token de las cookies - verificar ambos nombres
    const token = request.cookies.get('auth-token')?.value || request.cookies.get('session_token')?.value;
    
    if (!token) {
      // Redirigir a login si no hay token
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
    
    try {
      // Validar sesión
      const professor = await validateSession(token);
      
      if (!professor) {
        // Token inválido o expirado, redirigir a login
        const response = NextResponse.redirect(new URL('/admin/login', request.url));
        response.cookies.delete('auth-token');
        response.cookies.delete('session_token');
        return response;
      }

      // Verificar si es ruta de admin y si el usuario es admin
      if (requiresAdmin) {
        const userIsAdmin = await isUserAdmin(professor.email);
        if (!userIsAdmin) {
          // No es admin, redirigir al panel normal
          return NextResponse.redirect(new URL('/admin/add-notes', request.url));
        }
      }

      // Si el usuario es admin y está accediendo a /admin/add-notes, redirigir al dashboard
      if (pathname === '/admin/add-notes') {
        const userIsAdmin = await isUserAdmin(professor.email);
        if (userIsAdmin) {
          return NextResponse.redirect(new URL('/admin/dashboard', request.url));
        }
      }
      
      // Usuario autenticado, continuar
      const response = NextResponse.next();
      
      // Agregar información del profesor a los headers para uso en server components
      response.headers.set('x-professor-id', professor.id);
      response.headers.set('x-professor-name', professor.name);
      response.headers.set('x-professor-email', professor.email);
      response.headers.set('x-professor-is-admin', (await isUserAdmin(professor.email)).toString());
      
      return response;
      
    } catch (error) {
      console.error('Error en middleware:', error);
      const response = NextResponse.redirect(new URL('/admin/login', request.url));
      response.cookies.delete('auth-token');
      response.cookies.delete('session_token');
      return response;
    }
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
