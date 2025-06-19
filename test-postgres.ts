// test-postgres.ts
import { getPostgresClient } from './src/lib/postgres';

async function testConnection() {
  try {
    const client = await getPostgresClient();
    const res = await client.query('SELECT NOW()');
    console.log('Conexión exitosa:', res.rows[0]);
    client.release();
  } catch (err) {
    console.error('Error de conexión:', err);
  }
}

testConnection();