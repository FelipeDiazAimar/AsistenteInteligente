import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { supabase } from './supabase';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
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

// Autenticar profesor por email y contraseña usando Supabase
export async function authenticateProfessor(email: string, password: string): Promise<AuthResult> {
  try {
    // Buscar profesor por email usando Supabase
    const { data: professorData, error } = await supabase
      .from('professors')
      .select('id, name, email, password_hash, department, is_active')
      .eq('email', email.toLowerCase().trim())
      .eq('is_active', true)
      .single();

    if (error || !professorData) {
      console.log('Professor not found:', error);
      return { success: false, error: 'Email o contraseña incorrectos' };
    }

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
  }
}

// Guardar sesión usando Supabase
export async function saveSession(professorId: string, token: string): Promise<void> {
  try {
    // Calcular fecha de expiración (7 días desde ahora)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const { error } = await supabase
      .from('professor_sessions')
      .insert({
        professor_id: professorId,
        session_token: token,
        expires_at: expiresAt.toISOString()
      });

    if (error) {
      console.error('Error guardando sesión:', error);
    }
  } catch (error) {
    console.error('Error guardando sesión:', error);
  }
}

// Validar sesión por token usando Supabase
export async function validateSession(token: string): Promise<Professor | null> {
  try {
    // Verificar JWT
    const decoded = verifyToken(token);
    if (!decoded) {
      return null;
    }

    // Verificar que la sesión existe y no ha expirado
    const { data: sessionData, error } = await supabase
      .from('professor_sessions')
      .select(`
        *,
        professors (
          id,
          name,
          email,
          department,
          is_active
        )
      `)
      .eq('session_token', token)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (error || !sessionData || !sessionData.professors) {
      return null;
    }

    const professor = sessionData.professors as any;
    
    if (!professor.is_active) {
      return null;
    }

    return {
      id: professor.id,
      name: professor.name,
      email: professor.email,
      department: professor.department,
      is_active: professor.is_active
    };

  } catch (error) {
    console.error('Error validando sesión:', error);
    return null;
  }
}

// Cerrar sesión usando Supabase
export async function logoutSession(token: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('professor_sessions')
      .delete()
      .eq('session_token', token);
    
    return !error;
  } catch (error) {
    console.error('Error cerrando sesión:', error);
    return false;
  }
}

// Limpiar sesiones expiradas usando Supabase
export async function cleanExpiredSessions(): Promise<void> {
  try {
    const { error } = await supabase
      .from('professor_sessions')
      .delete()
      .lt('expires_at', new Date().toISOString());
    
    if (error) {
      console.error('Error limpiando sesiones expiradas:', error);
    }
  } catch (error) {
    console.error('Error limpiando sesiones expiradas:', error);
  }
}

// Crear nuevo profesor usando Supabase
export async function createProfessor(
  name: string, 
  email: string, 
  password: string, 
  department?: string
): Promise<AuthResult> {
  try {
    // Verificar si el email ya existe
    const { data: existing } = await supabase
      .from('professors')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .single();

    if (existing) {
      return { success: false, error: 'El email ya está registrado' };
    }

    // Hash de la contraseña
    const passwordHash = await hashPassword(password);

    // Crear el profesor
    const { data: professorData, error } = await supabase
      .from('professors')
      .insert({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password_hash: passwordHash,
        department: department?.trim()
      })
      .select('id, name, email, department, is_active')
      .single();

    if (error || !professorData) {
      console.error('Error creando profesor:', error);
      return { success: false, error: 'Error interno del servidor' };
    }
    
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
  }
}
