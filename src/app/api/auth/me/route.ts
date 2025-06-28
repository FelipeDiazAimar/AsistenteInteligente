import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Verificar ambos nombres de cookie para compatibilidad
    const token = request.cookies.get('auth-token')?.value || request.cookies.get('session_token')?.value;

    if (!token) {
      return NextResponse.json(
        { authenticated: false, professor: null },
        { status: 401 }
      );
    }

    const professor = await validateSession(token);

    if (professor) {
      return NextResponse.json({
        authenticated: true,
        professor
      });
    } else {
      // Token inválido, eliminar ambas cookies
      const response = NextResponse.json(
        { authenticated: false, professor: null },
        { status: 401 }
      );
      response.cookies.delete('auth-token');
      response.cookies.delete('session_token');
      return response;
    }
  } catch (error) {
    console.error('Error verificando sesión:', error);
    return NextResponse.json(
      { authenticated: false, professor: null },
      { status: 500 }
    );
  }
}
