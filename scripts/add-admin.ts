// Cargar variables de entorno primero (.env + .env.local tiene prioridad)
import { config } from 'dotenv';
config();
config({ path: '.env.local', override: true });

// Modo demo: este script requiere Postgres. Si la app está en modo demo
// (NEXT_PUBLIC_DEMO_MODE distinto de 'false', por defecto true) o falta
// DATABASE_URL, se omite sin error para no romper la demo.
const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE !== 'false';
if (isDemoMode || !process.env.DATABASE_URL) {
  console.log(
    'modo demo: omitido (add-admin sin DATABASE_URL). ' +
      'La app usa datos locales en modo demo. Para modo real: NEXT_PUBLIC_DEMO_MODE=false + DATABASE_URL en .env.local.'
  );
  process.exit(0);
}

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
