import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getPostgresClient } from './postgres';

const JWT_SECRET = process.env.JWT_SECRET || 'tu-clave-secreta-muy-segura';
const JWT_EXPIRES_IN = '7d'; // 7 días

export interface Professor {
  id: string;
  name: string;
  email: string;
  department?: string;
  is_active: boolean;
}

export interface AuthResult {
  success: boolean;
  professor?: Professor;
  token?: string;
  error?: string;
}

// Hash de contraseña
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// Verificar contraseña
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Generar JWT token
export function generateToken(professorId: string): string {
  return jwt.sign(
    { professorId, type: 'professor' },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

// Verificar JWT token
export function verifyToken(token: string): { professorId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    if (decoded.type === 'professor' && decoded.professorId) {
      return { professorId: decoded.professorId };
    }
    return null;
  } catch (error) {
    return null;
  }
}

// Autenticar profesor por email y contraseña
export async function authenticateProfessor(email: string, password: string): Promise<AuthResult> {
  const client = await getPostgresClient();
  
  try {
    // Buscar profesor por email
    const professorResult = await client.query(
      'SELECT id, name, email, password_hash, department, is_active FROM professors WHERE email = $1 AND is_active = true',
      [email.toLowerCase().trim()]
    );

    if (professorResult.rows.length === 0) {
      return { success: false, error: 'Email o contraseña incorrectos' };
    }

    const professorData = professorResult.rows[0];

    // Verificar contraseña
    const isPasswordValid = await verifyPassword(password, professorData.password_hash);
    
    if (!isPasswordValid) {
      return { success: false, error: 'Email o contraseña incorrectos' };
    }

    // Crear profesor sin password_hash
    const professor: Professor = {
      id: professorData.id,
      name: professorData.name,
      email: professorData.email,
      department: professorData.department,
      is_active: professorData.is_active
    };

    // Generar token
    const token = generateToken(professor.id);

    // Guardar sesión en base de datos
    await saveSession(professor.id, token);

    return {
      success: true,
      professor,
      token
    };

  } catch (error) {
    console.error('Error en autenticación:', error);
    return { success: false, error: 'Error interno del servidor' };
  } finally {
    client.release();
  }
}

// Guardar sesión en la base de datos
export async function saveSession(professorId: string, token: string): Promise<void> {
  const client = await getPostgresClient();
  
  try {
    // Calcular fecha de expiración (7 días desde ahora)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await client.query(
      'INSERT INTO professor_sessions (professor_id, session_token, expires_at) VALUES ($1, $2, $3)',
      [professorId, token, expiresAt]
    );
  } finally {
    client.release();
  }
}

// Validar sesión por token
export async function validateSession(token: string): Promise<Professor | null> {
  const client = await getPostgresClient();
  
  try {
    // Verificar JWT
    const decoded = verifyToken(token);
    if (!decoded) {
      return null;
    }

    // Verificar que la sesión existe y no ha expirado
    const sessionResult = await client.query(
      `SELECT ps.*, p.name, p.email, p.department, p.is_active 
       FROM professor_sessions ps 
       JOIN professors p ON ps.professor_id = p.id 
       WHERE ps.session_token = $1 AND ps.expires_at > NOW() AND p.is_active = true`,
      [token]
    );

    if (sessionResult.rows.length === 0) {
      return null;
    }

    const sessionData = sessionResult.rows[0];
    
    return {
      id: sessionData.professor_id,
      name: sessionData.name,
      email: sessionData.email,
      department: sessionData.department,
      is_active: sessionData.is_active
    };

  } catch (error) {
    console.error('Error validando sesión:', error);
    return null;
  } finally {
    client.release();
  }
}

// Cerrar sesión
export async function logoutSession(token: string): Promise<boolean> {
  const client = await getPostgresClient();
  
  try {
    const result = await client.query(
      'DELETE FROM professor_sessions WHERE session_token = $1',
      [token]
    );
    
    return (result.rowCount || 0) > 0;
  } catch (error) {
    console.error('Error cerrando sesión:', error);
    return false;
  } finally {
    client.release();
  }
}

// Limpiar sesiones expiradas
export async function cleanExpiredSessions(): Promise<void> {
  const client = await getPostgresClient();
  
  try {
    await client.query('SELECT clean_expired_sessions()');
  } catch (error) {
    console.error('Error limpiando sesiones expiradas:', error);
  } finally {
    client.release();
  }
}

// Crear nuevo profesor (para registro)
export async function createProfessor(
  name: string, 
  email: string, 
  password: string, 
  department?: string
): Promise<AuthResult> {
  const client = await getPostgresClient();
  
  try {
    // Verificar si el email ya existe
    const existingResult = await client.query(
      'SELECT id FROM professors WHERE email = $1',
      [email.toLowerCase().trim()]
    );

    if (existingResult.rows.length > 0) {
      return { success: false, error: 'El email ya está registrado' };
    }

    // Hash de la contraseña
    const passwordHash = await hashPassword(password);

    // Crear el profesor
    const insertResult = await client.query(
      'INSERT INTO professors (name, email, password_hash, department) VALUES ($1, $2, $3, $4) RETURNING id, name, email, department, is_active',
      [name.trim(), email.toLowerCase().trim(), passwordHash, department?.trim()]
    );

    const professorData = insertResult.rows[0];
    
    const professor: Professor = {
      id: professorData.id,
      name: professorData.name,
      email: professorData.email,
      department: professorData.department,
      is_active: professorData.is_active
    };

    // Generar token
    const token = generateToken(professor.id);

    // Guardar sesión
    await saveSession(professor.id, token);

    return {
      success: true,
      professor,
      token
    };

  } catch (error) {
    console.error('Error creando profesor:', error);
    return { success: false, error: 'Error interno del servidor' };
  } finally {
    client.release();
  }
}
