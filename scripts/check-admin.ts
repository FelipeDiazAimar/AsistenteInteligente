import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno explícitamente
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

import { getPostgresClient } from '../src/lib/postgres';

async function checkAdmin() {
  try {
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set');
    console.log('Verificando usuario admin...');
    
    const client = await getPostgresClient();
    
    try {
      const result = await client.query(
        'SELECT id, name, email, is_active FROM professors WHERE email = $1',
        ['admin1@admin1.com']
      );
      
      console.log('Admin user in database:', result.rows);
      
      if (result.rows.length === 0) {
        console.log('❌ Usuario admin no encontrado');
      } else {
        console.log('✅ Usuario admin encontrado:', result.rows[0]);
      }
      
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAdmin();
