import { config } from 'dotenv';
config();
config({ path: '.env.local', override: true });

import bcrypt from 'bcryptjs';

// Modo demo: este script solo se usa en modo real (con DB). Si la app está en
// modo demo (NEXT_PUBLIC_DEMO_MODE distinto de 'false', por defecto true) o
// falta DATABASE_URL, se omite sin error para no romper la demo.
const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE !== 'false';
if (isDemoMode || !process.env.DATABASE_URL) {
  console.log(
    'modo demo: omitido (hash-passwords sin DATABASE_URL). ' +
      'La app usa datos locales en modo demo. Para modo real: NEXT_PUBLIC_DEMO_MODE=false + DATABASE_URL en .env.local.'
  );
  process.exit(0);
}

async function hashPassword(password: string) {
  const saltRounds = 12;
  const hash = await bcrypt.hash(password, saltRounds);
  console.log(`Password: ${password}`);
  console.log(`Hash: ${hash}`);
  console.log('---');
}

// Hashear las contraseñas de ejemplo
async function main() {
  console.log('Generando hashes para contraseñas:');
  
  await hashPassword('profesor123');
  await hashPassword('admin123');
  await hashPassword('docente456');
}

main().catch(console.error);
