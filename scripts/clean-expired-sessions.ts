#!/usr/bin/env tsx

import { config } from 'dotenv';
config();
config({ path: '.env.local', override: true });

import { getPostgresClient } from '../src/lib/postgres';

// Modo demo: este script requiere Postgres. Si la app está en modo demo
// (NEXT_PUBLIC_DEMO_MODE distinto de 'false', por defecto true) o falta
// DATABASE_URL, se omite sin error para no romper la demo.
function isDemoSkip(): boolean {
  return process.env.NEXT_PUBLIC_DEMO_MODE !== 'false' || !process.env.DATABASE_URL;
}

async function cleanExpiredSessions() {
  if (isDemoSkip()) {
    console.log(
      'modo demo: omitido (clean-sessions sin DATABASE_URL). ' +
        'La app usa datos locales en modo demo. Para modo real: NEXT_PUBLIC_DEMO_MODE=false + DATABASE_URL en .env.local.'
    );
    process.exit(0);
  }

  console.log('Iniciando limpieza de sesiones expiradas...');
  
  const client = await getPostgresClient();
  
  try {
    // Obtener sesiones expiradas antes de eliminarlas
    const expiredResult = await client.query(`
      SELECT 
        s.id,
        s.expires_at,
        p.name,
        p.email
      FROM professor_sessions s
      INNER JOIN professors p ON s.professor_id = p.id
      WHERE s.expires_at < NOW()
      ORDER BY s.expires_at
    `);

    console.log(`\nEncontradas ${expiredResult.rows.length} sesiones expiradas:`);
    
    if (expiredResult.rows.length > 0) {
      console.log('--------------------------------');
      expiredResult.rows.forEach((session, index) => {
        console.log(`${index + 1}. ${session.name} (${session.email})`);
        console.log(`   Expiró: ${new Date(session.expires_at).toLocaleString('es-ES')}`);
      });
      console.log('--------------------------------');
    }

    // Eliminar sesiones expiradas
    const deleteResult = await client.query(`
      DELETE FROM professor_sessions 
      WHERE expires_at < NOW()
      RETURNING id
    `);

    const deletedCount = deleteResult.rowCount || 0;
    
    console.log(`\n✅ Limpieza completada: ${deletedCount} sesiones eliminadas`);
    
    // Mostrar sesiones activas restantes
    const activeResult = await client.query(`
      SELECT 
        COUNT(*) as active_count
      FROM professor_sessions s
      WHERE s.expires_at > NOW()
    `);

    const activeCount = parseInt(activeResult.rows[0].active_count) || 0;
    console.log(`📊 Sesiones activas restantes: ${activeCount}`);

  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    process.exit(1);
  } finally {
    client.release();
    console.log('\n🏁 Proceso finalizado.');
    process.exit(0);
  }
}

// Ejecutar si este script se llama directamente
if (require.main === module) {
  cleanExpiredSessions();
}

export { cleanExpiredSessions };
