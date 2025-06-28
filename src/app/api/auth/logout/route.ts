import { NextRequest, NextResponse } from 'next/server';
import { logoutSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (token) {
      // Eliminar sesión de la base de datos
      await logoutSession(token);
    }

    // Crear respuesta eliminando la cookie
    const response = NextResponse.json({ success: true });
    
    response.cookies.delete('auth-token');

    return response;
  } catch (error) {
    console.error('Error en logout:', error);
    
    // Aunque haya error, eliminamos la cookie del cliente
    const response = NextResponse.json({ success: true });
    response.cookies.delete('auth-token');
    
    return response;
  }
}
