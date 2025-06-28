import dotenv from 'dotenv';
import path from 'path';
import { Pool } from 'pg';

// Cargar variables de entorno explícitamente
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function checkAdmin() {
  try {
    console.log('DATABASE_URL encontrada:', process.env.DATABASE_URL?.substring(0, 50) + '...');
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    const client = await pool.connect();
    
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
      await pool.end();
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkAdmin();
