// Cargar variables de entorno primero
import { config } from 'dotenv';
config({ path: '.env.local' });

import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

// Crear cliente de PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL!,
  ssl: {
    rejectUnauthorized: false
  }
});

// Función para hashear contraseñas
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

// Script para crear las tablas y datos iniciales
async function setupDatabase() {
  console.log('Configurando base de datos...');
  
  try {
    // Crear tabla professors si no existe
    console.log('Creando tabla professors...');
    await pool.query(`
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
    `);

    // Crear índices
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_professors_email ON professors(email);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_professors_is_active ON professors(is_active);
    `);

    console.log('✅ Tabla professors creada');

    // Crear tabla professor_sessions si no existe
    console.log('Creando tabla professor_sessions...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS professor_sessions (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          professor_id UUID NOT NULL REFERENCES professors(id) ON DELETE CASCADE,
          session_token VARCHAR(255) UNIQUE NOT NULL,
          expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Crear índices para sessions
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_professor_sessions_token ON professor_sessions(session_token);
    `);
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_professor_sessions_expires ON professor_sessions(expires_at);
    `);

    console.log('✅ Tabla professor_sessions creada');

    // Crear tabla resources si no existe
    console.log('Creando tabla resources...');
    await pool.query(`
      CREATE TABLE IF NOT EXISTS resources (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          title VARCHAR(255) NOT NULL,
          description TEXT,
          type VARCHAR(50) NOT NULL,
          content TEXT,
          file_path VARCHAR(500),
          cover_image_path VARCHAR(500),
          ai_hint TEXT,
          professor_id UUID,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `);

    // Intentar agregar la foreign key si no existe
    try {
      await pool.query(`
        ALTER TABLE resources 
        ADD CONSTRAINT fk_resources_professor 
        FOREIGN KEY (professor_id) REFERENCES professors(id) ON DELETE SET NULL
      `);
    } catch (error) {
      // Si ya existe la constraint, continuar
      console.log('Foreign key constraint ya existe o no se pudo crear');
    }

    // Crear índices para resources (intentar crearlos individualmente)
    try {
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_resources_type ON resources(type);`);
    } catch (error) {
      console.log('Índice idx_resources_type ya existe');
    }
    
    try {
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_resources_professor ON resources(professor_id);`);
    } catch (error) {
      console.log('Índice idx_resources_professor ya existe o no se pudo crear');
    }

    console.log('✅ Tabla resources creada');

    // Verificar si ya existen profesores
    const { rows: existingProfessors } = await pool.query('SELECT COUNT(*) as count FROM professors');
    
    if (parseInt(existingProfessors[0].count) === 0) {
      console.log('Insertando profesores de ejemplo...');
      
      // Hashear contraseñas
      const adminPassword = await hashPassword('admin123');
      const admin1Password = await hashPassword('admin1');
      const drGarciaPassword = await hashPassword('garcia123');
      const drMartinezPassword = await hashPassword('martinez123');
      
      // Insertar profesores de ejemplo
      await pool.query(`
        INSERT INTO professors (name, email, password_hash, department) 
        VALUES ('Admin Principal', 'admin1@admin1.com', $1, 'Administración')
        ON CONFLICT (email) DO NOTHING
      `, [admin1Password]);

      console.log('✅ Profesores de ejemplo insertados');
      console.log('\n📋 Credenciales de ejemplo:');
      console.log('1. Email: admin@university.edu | Password: admin123');
      console.log('2. Email: admin1@admin1.com | Password: admin1 (ADMIN PRINCIPAL)');
      console.log('3. Email: garcia@university.edu | Password: garcia123');
      console.log('4. Email: martinez@university.edu | Password: martinez123');
    } else {
      console.log('✅ Profesores ya existen en la base de datos');
    }

    console.log('\n🎉 ¡Base de datos configurada exitosamente!');
    console.log('\nPuedes hacer login en: http://localhost:3000/admin/login');
    
  } catch (error) {
    console.error('❌ Error configurando la base de datos:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Ejecutar el script
setupDatabase().catch((error) => {
  console.error('Error ejecutando el script:', error);
  process.exit(1);
});
