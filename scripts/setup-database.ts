// Cargar variables de entorno primero (.env + .env.local tiene prioridad)
import { config } from 'dotenv';
config();
config({ path: '.env.local', override: true });

// Modo demo: este script requiere Supabase. Si la app está en modo demo
// (NEXT_PUBLIC_DEMO_MODE distinto de 'false', por defecto true) o faltan las
// credenciales, se omite sin error para no romper la demo.
const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE !== 'false';
if (isDemoMode || !process.env.SUPABASE_URL || !process.env.SUPABASE_ANON_KEY) {
  console.log(
    'modo demo: omitido (setup-database sin SUPABASE_URL/SUPABASE_ANON_KEY). ' +
      'La app usa datos locales en modo demo. Para modo real: NEXT_PUBLIC_DEMO_MODE=false + credenciales en .env.local.'
  );
  process.exit(0);
}

import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

// Crear cliente de Supabase con las variables de entorno cargadas
const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Función para hashear contraseñas
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// Script para crear las tablas y datos iniciales usando Supabase
async function setupDatabase() {
  console.log('Configurando base de datos...');

  try {
    // Crear tabla professors si no existe
    const { error: professorTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS professors (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            department VARCHAR(255),
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_professors_email ON professors(email);
        CREATE INDEX IF NOT EXISTS idx_professors_is_active ON professors(is_active);
      `
    });

    if (professorTableError) {
      console.log('Error creando tabla professors (puede que ya exista):', professorTableError);
    }

    // Crear tabla professor_sessions si no existe
    const { error: sessionsTableError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE TABLE IF NOT EXISTS professor_sessions (
            id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
            professor_id UUID NOT NULL REFERENCES professors(id) ON DELETE CASCADE,
            session_token VARCHAR(255) UNIQUE NOT NULL,
            expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_professor_sessions_token ON professor_sessions(session_token);
        CREATE INDEX IF NOT EXISTS idx_professor_sessions_expires ON professor_sessions(expires_at);
      `
    });

    if (sessionsTableError) {
      console.log('Error creando tabla sessions (puede que ya exista):', sessionsTableError);
    }

    // Verificar si ya existen profesores
    const { data: existingProfessors } = await supabase
      .from('professors')
      .select('email')
      .limit(1);

    if (!existingProfessors || existingProfessors.length === 0) {
      console.log('Creando profesores de ejemplo...');
      
      // Hash de la contraseña "profesor123"
      const passwordHash = await hashPassword('profesor123');

      // Insertar profesores de ejemplo
      const professorsToInsert = [
        {
          name: 'Dr. Juan Pérez',
          email: 'juan.perez@universidad.edu',
          password_hash: passwordHash,
          department: 'Medicina Interna'
        },
        {
          name: 'Dra. María García',
          email: 'maria.garcia@universidad.edu',
          password_hash: passwordHash,
          department: 'Pediatría'
        },
        {
          name: 'Dr. Carlos López',
          email: 'carlos.lopez@universidad.edu',
          password_hash: passwordHash,
          department: 'Cardiología'
        }
      ];

      const { error: insertError } = await supabase
        .from('professors')
        .insert(professorsToInsert);

      if (insertError) {
        console.error('Error insertando profesores:', insertError);
      } else {
        console.log('Profesores creados exitosamente');
      }
    } else {
      console.log('Los profesores ya existen en la base de datos');
    }

    console.log('¡Base de datos configurada exitosamente!');
    console.log('\nCredenciales de prueba:');
    console.log('Email: juan.perez@universidad.edu');
    console.log('Contraseña: profesor123');

  } catch (error) {
    console.error('Error configurando base de datos:', error);
  }
}

// Ejecutar setup
setupDatabase();
