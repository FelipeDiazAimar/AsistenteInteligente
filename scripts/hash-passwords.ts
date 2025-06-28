import bcrypt from 'bcryptjs';

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
