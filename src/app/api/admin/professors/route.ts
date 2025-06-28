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
          name, 
          email, 
          department, 
          is_active, 
          created_at,
          updated_at
        FROM professors 
        ORDER BY created_at DESC
      `);

      return NextResponse.json({
        success: true,
        professors: result.rows
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error fetching professors:', error);
    return NextResponse.json(
      { success: false, error: 'Error al obtener profesores' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verificar que el usuario sea admin
    await requireAdmin(request);

    const { name, email, password, department } = await request.json();

    if (!name || !email || !password || !department) {
      return NextResponse.json(
        { success: false, error: 'Todos los campos son requeridos' },
        { status: 400 }
      );
    }

    const client = await getPostgresClient();
    
    try {
      // Verificar si el email ya existe
      const existingUser = await client.query(
        'SELECT id FROM professors WHERE email = $1',
        [email]
      );

      if (existingUser.rows.length > 0) {
        return NextResponse.json(
          { success: false, error: 'El email ya está en uso' },
          { status: 400 }
        );
      }

      // Hash de la contraseña
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 12);

      // Insertar nuevo profesor
      const result = await client.query(`
        INSERT INTO professors (name, email, password_hash, department, is_active) 
        VALUES ($1, $2, $3, $4, true) 
        RETURNING id, name, email, department, is_active, created_at, updated_at
      `, [name, email, hashedPassword, department]);

      return NextResponse.json({
        success: true,
        professor: result.rows[0]
      });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error creating professor:', error);
    return NextResponse.json(
      { success: false, error: 'Error al crear profesor' },
      { status: 500 }
    );
  }
}
