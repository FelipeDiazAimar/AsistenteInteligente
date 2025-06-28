import dotenv from 'dotenv';
import path from 'path';
import { Pool } from 'pg';

// Cargar variables de entorno explícitamente
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function checkResourcesTable() {
  try {
    console.log('🔍 Verificando estructura de la tabla resources...');
    
    const pool = new Pool({
      connectionString: process.env.DATABASE_URL,
    });
    
    const client = await pool.connect();
    
    try {
      // Obtener estructura de la tabla
      const result = await client.query(`
        SELECT column_name, data_type, is_nullable 
        FROM information_schema.columns 
        WHERE table_name = 'resources'
        ORDER BY ordinal_position;
      `);
      
      console.log('📊 Columnas en la tabla resources:');
      result.rows.forEach(row => {
        console.log(`  - ${row.column_name}: ${row.data_type} (nullable: ${row.is_nullable})`);
      });
      
      // También obtener algunos datos de ejemplo
      const dataResult = await client.query('SELECT * FROM resources LIMIT 3');
      console.log('\n📝 Ejemplo de datos:');
      console.log(dataResult.rows);
      
    } finally {
      client.release();
      await pool.end();
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

checkResourcesTable();
