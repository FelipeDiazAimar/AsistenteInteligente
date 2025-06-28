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

// Script para agregar admin1@admin1.com
async function addAdmin() {
  console.log('Agregando admin principal...');
  
  try {
    const admin1Password = await bcrypt.hash('admin1', 12);
    
    // Insertar admin principal si no existe
    await pool.query(`
      INSERT INTO professors (name, email, password_hash, department) 
      VALUES ('Admin Principal', 'admin1@admin1.com', $1, 'Administración')
      ON CONFLICT (email) DO UPDATE SET
        password_hash = EXCLUDED.password_hash,
        updated_at = NOW()
    `, [admin1Password]);

    console.log('✅ Admin principal agregado/actualizado');
    console.log('\n📋 Credenciales de admin:');
    console.log('Email: admin1@admin1.com');
    console.log('Password: admin1');
    
  } catch (error) {
    console.error('❌ Error agregando admin:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Ejecutar el script
addAdmin().catch((error) => {
  console.error('Error ejecutando el script:', error);
  process.exit(1);
});
