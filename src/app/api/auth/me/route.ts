import { NextRequest, NextResponse } from 'next/server';
import { validateSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

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
      // Token inválido, eliminar cookie
      const response = NextResponse.json(
        { authenticated: false, professor: null },
        { status: 401 }
      );
      response.cookies.delete('auth-token');
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
