import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

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

// Datos de profesores en memoria (para desarrollo)
const DEMO_PROFESSORS = [
  {
    id: 'prof-1',
    name: 'Dr. Juan Pérez',
    email: 'juan.perez@universidad.edu',
    password_hash: '$2b$12$hNm6UkLr687HodVeT3NqYukDAbB0FKJwCYWowYq6UzGpa.8AhDx6q', // profesor123
    department: 'Medicina Interna',
    is_active: true
  },
  {
    id: 'prof-2',
    name: 'Dra. María García',
    email: 'maria.garcia@universidad.edu',
    password_hash: '$2b$12$hNm6UkLr687HodVeT3NqYukDAbB0FKJwCYWowYq6UzGpa.8AhDx6q', // profesor123
    department: 'Pediatría',
    is_active: true
  },
  {
    id: 'prof-3',
    name: 'Dr. Carlos López',
    email: 'carlos.lopez@universidad.edu',
    password_hash: '$2b$12$hNm6UkLr687HodVeT3NqYukDAbB0FKJwCYWowYq6UzGpa.8AhDx6q', // profesor123
    department: 'Cardiología',
    is_active: true
  }
];

// Sesiones en memoria (para desarrollo)
const sessions = new Map<string, { professorId: string; expiresAt: Date }>();

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

// Autenticar profesor
export async function authenticateProfessor(email: string, password: string): Promise<AuthResult> {
  try {
    console.log('Intentando autenticar:', email);
    
    // Buscar profesor en datos demo
    const professorData = DEMO_PROFESSORS.find(
      p => p.email.toLowerCase() === email.toLowerCase().trim() && p.is_active
    );

    if (!professorData) {
      console.log('Profesor no encontrado');
      return { success: false, error: 'Email o contraseña incorrectos' };
    }

    console.log('Profesor encontrado, verificando contraseña...');
    
    // Verificar contraseña
    const isPasswordValid = await verifyPassword(password, professorData.password_hash);
    
    if (!isPasswordValid) {
      console.log('Contraseña incorrecta');
      return { success: false, error: 'Email o contraseña incorrectos' };
    }

    console.log('Contraseña correcta, generando token...');

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

    // Guardar sesión en memoria
    await saveSession(professor.id, token);

    console.log('Autenticación exitosa para:', professor.name);

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

// Guardar sesión en memoria
export async function saveSession(professorId: string, token: string): Promise<void> {
  try {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    
    sessions.set(token, { professorId, expiresAt });
    console.log('Sesión guardada para profesor:', professorId);
  } catch (error) {
    console.error('Error guardando sesión:', error);
  }
}

// Validar sesión
export async function validateSession(token: string): Promise<Professor | null> {
  try {
    // Verificar JWT
    const decoded = verifyToken(token);
    if (!decoded) {
      return null;
    }

    // Verificar sesión en memoria
    const session = sessions.get(token);
    if (!session || session.expiresAt < new Date()) {
      sessions.delete(token);
      return null;
    }

    // Buscar profesor
    const professorData = DEMO_PROFESSORS.find(
      p => p.id === session.professorId && p.is_active
    );

    if (!professorData) {
      return null;
    }

    return {
      id: professorData.id,
      name: professorData.name,
      email: professorData.email,
      department: professorData.department,
      is_active: professorData.is_active
    };

  } catch (error) {
    console.error('Error validando sesión:', error);
    return null;
  }
}

// Cerrar sesión
export async function logoutSession(token: string): Promise<boolean> {
  try {
    const deleted = sessions.delete(token);
    return deleted;
  } catch (error) {
    console.error('Error cerrando sesión:', error);
    return false;
  }
}

// Limpiar sesiones expiradas
export async function cleanExpiredSessions(): Promise<void> {
  try {
    const now = new Date();
    for (const [token, session] of sessions.entries()) {
      if (session.expiresAt < now) {
        sessions.delete(token);
      }
    }
  } catch (error) {
    console.error('Error limpiando sesiones expiradas:', error);
  }
}

// Crear nuevo profesor (para desarrollo)
export async function createProfessor(
  name: string, 
  email: string, 
  password: string, 
  department?: string
): Promise<AuthResult> {
  try {
    // Verificar si el email ya existe
    const existing = DEMO_PROFESSORS.find(p => p.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return { success: false, error: 'El email ya está registrado' };
    }

    // Hash de la contraseña
    const passwordHash = await hashPassword(password);

    // Crear nuevo profesor
    const newProfessor = {
      id: `prof-${Date.now()}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password_hash: passwordHash,
      department: department?.trim() || 'General',
      is_active: true
    };

    // Agregar a la lista (en memoria)
    DEMO_PROFESSORS.push(newProfessor);
    
    const professor: Professor = {
      id: newProfessor.id,
      name: newProfessor.name,
      email: newProfessor.email,
      department: newProfessor.department,
      is_active: newProfessor.is_active
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
