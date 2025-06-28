#!/usr/bin/env tsx

import { getPostgresClient } from '../src/lib/postgres';

async function cleanExpiredSessions() {
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
