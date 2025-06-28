import { NextRequest, NextResponse } from 'next/server';
import { getPostgresClient } from '@/lib/postgres';

// Esta función limpia las sesiones expiradas automáticamente
export async function POST(request: NextRequest) {
  try {
    const client = await getPostgresClient();
    
    try {
      // Eliminar todas las sesiones que han expirado
      const result = await client.query(`
        DELETE FROM professor_sessions 
        WHERE expires_at < NOW()
        RETURNING id
      `);

      const deletedCount = result.rowCount || 0;
      
      console.log(`Limpieza automática: ${deletedCount} sesiones expiradas eliminadas`);

      return NextResponse.json({
        success: true,
        message: `${deletedCount} sesiones expiradas eliminadas`,
        deletedCount
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error en limpieza de sesiones:', error);
    return NextResponse.json(
      { success: false, error: 'Error al limpiar sesiones expiradas' },
      { status: 500 }
    );
  }
}

// Permitir GET para verificación manual
export async function GET(request: NextRequest) {
  try {
    const client = await getPostgresClient();
    
    try {
      // Contar sesiones expiradas
      const result = await client.query(`
        SELECT COUNT(*) as expired_count 
        FROM professor_sessions 
        WHERE expires_at < NOW()
      `);

      const expiredCount = parseInt(result.rows[0].expired_count) || 0;

      return NextResponse.json({
        success: true,
        expiredSessionsCount: expiredCount
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error verificando sesiones expiradas:', error);
    return NextResponse.json(
      { success: false, error: 'Error al verificar sesiones expiradas' },
      { status: 500 }
    );
  }
}
