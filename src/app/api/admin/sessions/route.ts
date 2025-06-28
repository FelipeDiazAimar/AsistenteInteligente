import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getPostgresClient } from '@/lib/postgres';

export async function GET(request: NextRequest) {
  try {
    // Verificar que el usuario sea admin
    await requireAdmin(request);

    const client = await getPostgresClient();
    
    try {
      const result = await client.query(`
        SELECT 
          s.id,
          s.session_token,
          s.expires_at,
          s.created_at,
          p.name as professor_name,
          p.email as professor_email,
          p.department,
          CASE 
            WHEN s.expires_at > NOW() THEN true 
            ELSE false 
          END as is_active
        FROM professor_sessions s
        INNER JOIN professors p ON s.professor_id = p.id
        ORDER BY s.created_at DESC
        LIMIT 100
      `);

      return NextResponse.json({
        success: true,
        sessions: result.rows
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener sesiones' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verificar que el usuario sea admin
    await requireAdmin(request);

    const url = new URL(request.url);
    const sessionId = url.searchParams.get('id');

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'ID de sesión requerido' },
        { status: 400 }
      );
    }

    const client = await getPostgresClient();
    
    try {
      // Verificar si la sesión existe
      const sessionCheck = await client.query(
        'SELECT id FROM professor_sessions WHERE id = $1',
        [sessionId]
      );

      if (sessionCheck.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Sesión no encontrada' },
          { status: 404 }
        );
      }

      // Eliminar sesión (cerrar sesión forzadamente)
      await client.query('DELETE FROM professor_sessions WHERE id = $1', [sessionId]);

      return NextResponse.json({
        success: true,
        message: 'Sesión cerrada exitosamente'
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { success: false, error: 'Error al cerrar sesión' },
      { status: 500 }
    );
  }
}
