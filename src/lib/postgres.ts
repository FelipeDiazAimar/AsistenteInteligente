import 'dotenv/config';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Timeouts cortos: ninguna navegación puede quedar colgada esperando la DB.
  connectionTimeoutMillis: 3000,
  query_timeout: 4000,
  idleTimeoutMillis: 10000,
});

export async function getPostgresClient() {
  return pool.connect();
}