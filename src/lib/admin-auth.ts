import { NextRequest } from 'next/server';
import { getPostgresClient } from './postgres';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  department: string;
  isAdmin: boolean;
}

// Verificar si un usuario es administrador
export async function isUserAdmin(email: string): Promise<boolean> {
  return email === 'admin1@admin1.com' || email === 'admin@university.edu';
}

// Obtener información del usuario desde el token
export async function getUserFromRequest(request: NextRequest): Promise<AdminUser | null> {
  try {
    const token = request.cookies.get('auth-token')?.value || request.cookies.get('session_token')?.value;
    if (!token) return null;

    const decoded = jwt.verify(token, JWT_SECRET) as any;
    const professorId = decoded.professorId || decoded.userId; // Compatibilidad con ambos formatos
    const client = await getPostgresClient();
    
    try {
      const result = await client.query(
        'SELECT id, name, email, department FROM professors WHERE id = $1 AND is_active = true',
        [professorId]
      );

      if (result.rows.length === 0) return null;

      const user = result.rows[0];
      const isAdmin = await isUserAdmin(user.email);

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        department: user.department,
        isAdmin
      };
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error getting user from request:', error);
    return null;
  }
}

// Middleware para proteger rutas de admin
export async function requireAdmin(request: NextRequest) {
  const user = await getUserFromRequest(request);
  
  if (!user || !user.isAdmin) {
    throw new Error('Access denied: Admin privileges required');
  }
  
  return user;
}
