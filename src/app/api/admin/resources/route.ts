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
          id,
          title,
          description,
          type,
          link,
          file_url,
          file_name,
          cover_image_url,
          cover_image_name,
          ai_hint,
          google_form_url,
          created_at
        FROM resources
        ORDER BY created_at DESC
      `);

      return NextResponse.json({
        success: true,
        resources: result.rows
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching resources:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener recursos' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verificar que el usuario sea admin
    await requireAdmin(request);

    const url = new URL(request.url);
    const resourceId = url.searchParams.get('id');

    if (!resourceId) {
      return NextResponse.json(
        { success: false, error: 'ID del recurso requerido' },
        { status: 400 }
      );
    }

    const client = await getPostgresClient();
    
    try {
      // Verificar si el recurso existe
      const resourceCheck = await client.query(
        'SELECT id FROM resources WHERE id = $1',
        [resourceId]
      );

      if (resourceCheck.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Recurso no encontrado' },
          { status: 404 }
        );
      }

      // Eliminar recurso
      await client.query('DELETE FROM resources WHERE id = $1', [resourceId]);

      return NextResponse.json({
        success: true,
        message: 'Recurso eliminado exitosamente'
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting resource:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar recurso' },
      { status: 500 }
    );
  }
}
