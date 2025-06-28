import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { getPostgresClient } from '@/lib/postgres';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar que el usuario sea admin
    await requireAdmin(request);

    const { name, email, department, is_active } = await request.json();
    const { id: professorId } = await params;

    if (!name || !email || !department) {
      return NextResponse.json(
        { success: false, error: 'Nombre, email y departamento son requeridos' },
        { status: 400 }
      );
    }

    const client = await getPostgresClient();
    
    try {
      // Verificar si el email ya existe (excluyendo el profesor actual)
      const existingUser = await client.query(
        'SELECT id FROM professors WHERE email = $1 AND id != $2',
        [email, professorId]
      );

      if (existingUser.rows.length > 0) {
        return NextResponse.json(
          { success: false, error: 'El email ya está en uso por otro profesor' },
          { status: 400 }
        );
      }

      // Actualizar profesor
      const result = await client.query(`
        UPDATE professors 
        SET name = $1, email = $2, department = $3, is_active = $4, updated_at = NOW()
        WHERE id = $5
        RETURNING id, name, email, department, is_active, created_at, updated_at
      `, [name, email, department, is_active, professorId]);

      if (result.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Profesor no encontrado' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        professor: result.rows[0]
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error updating professor:', error);
    return NextResponse.json(
      { success: false, error: 'Error al actualizar profesor' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verificar que el usuario sea admin
    const adminUser = await requireAdmin(request);

    const { id: professorId } = await params;

    // No permitir que se elimine a sí mismo
    if (adminUser.id === professorId) {
      return NextResponse.json(
        { success: false, error: 'No puedes eliminarte a ti mismo' },
        { status: 400 }
      );
    }

    const client = await getPostgresClient();
    
    try {
      // Verificar si el profesor existe
      const professorCheck = await client.query(
        'SELECT email FROM professors WHERE id = $1',
        [professorId]
      );

      if (professorCheck.rows.length === 0) {
        return NextResponse.json(
          { success: false, error: 'Profesor no encontrado' },
          { status: 404 }
        );
      }

      // No permitir eliminar otros admins
      const isTargetAdmin = professorCheck.rows[0].email === 'admin1@admin1.com' || 
                           professorCheck.rows[0].email === 'admin@university.edu';
      
      if (isTargetAdmin && adminUser.email !== professorCheck.rows[0].email) {
        return NextResponse.json(
          { success: false, error: 'No puedes eliminar otros administradores' },
          { status: 403 }
        );
      }

      // Eliminar profesor (esto también eliminará sus sesiones por CASCADE)
      await client.query('DELETE FROM professors WHERE id = $1', [professorId]);

      return NextResponse.json({
        success: true,
        message: 'Profesor eliminado exitosamente'
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error deleting professor:', error);
    return NextResponse.json(
      { success: false, error: 'Error al eliminar profesor' },
      { status: 500 }
    );
  }
}
