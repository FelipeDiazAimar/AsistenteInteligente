import { NextRequest, NextResponse } from 'next/server';
import { authenticateProfessor } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: 'Email y contraseña son requeridos' },
        { status: 400 }
      );
    }

    const result = await authenticateProfessor(email, password);

    if (result.success && result.token) {
      // Crear respuesta con el token en cookies
      const response = NextResponse.json({
        success: true,
        professor: result.professor
      });

      // Configurar cookie segura con el token
      response.cookies.set('auth-token', result.token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 días
        path: '/'
      });

      return response;
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error en API login:', error);
    return NextResponse.json(
      { success: false, error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
