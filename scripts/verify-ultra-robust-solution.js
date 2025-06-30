#!/usr/bin/env node

/**
 * Script de verificación ultra-robusta para deploy
 * Verifica que la solución pdf-parse esté correctamente implementada
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verificando solución ultra-robusta para pdf-parse...\n');

// 1. Verificar que el flow original esté respaldado
const backupExists = fs.existsSync('src/ai/flows/primary-care-chat-flow.backup.ts');
console.log(`📋 Flow original respaldado: ${backupExists ? '✅' : '❌'}`);

// 2. Verificar que el stub esté en su lugar
const stubExists = fs.existsSync('src/ai/flows/primary-care-chat-flow.ts');
let isStub = false;
if (stubExists) {
  const stubContent = fs.readFileSync('src/ai/flows/primary-care-chat-flow.ts', 'utf8');
  isStub = stubContent.includes('This function should not be called');
}
console.log(`📋 Stub en lugar correcto: ${isStub ? '✅' : '❌'}`);

// 3. Verificar que el servicio PDF exista
const pdfServiceExists = fs.existsSync('src/lib/pdf-service.ts');
console.log(`📋 Servicio PDF ultra-dinámico: ${pdfServiceExists ? '✅' : '❌'}`);

// 4. Verificar API route independiente
const apiExists = fs.existsSync('src/app/api/chat/route.ts');
let hasNoFlowImport = false;
if (apiExists) {
  const apiContent = fs.readFileSync('src/app/api/chat/route.ts', 'utf8');
  hasNoFlowImport = !apiContent.includes('from \'@/ai/flows/primary-care-chat-flow\'');
}
console.log(`📋 API route independiente: ${hasNoFlowImport ? '✅' : '❌'}`);

// 5. Verificar configuración webpack
const configExists = fs.existsSync('next.config.ts');
let hasAggressiveConfig = false;
if (configExists) {
  const configContent = fs.readFileSync('next.config.ts', 'utf8');
  hasAggressiveConfig = configContent.includes('ultra-robusta') || configContent.includes('pdf-parse');
}
console.log(`📋 Configuración ultra-agresiva: ${hasAggressiveConfig ? '✅' : '❌'}`);

// 6. Verificar documentación
const docsExist = fs.existsSync('SOLUCION-PDF-PARSE.md');
console.log(`📋 Documentación actualizada: ${docsExist ? '✅' : '❌'}`);

// 7. Verificar que no hay imports directos problemáticos en src/app
let hasProblematicImports = false;
function checkDirectory(dir) {
  const files = fs.readdirSync(dir, { withFileTypes: true });
  for (const file of files) {
    if (file.isDirectory() && file.name !== 'node_modules') {
      checkDirectory(path.join(dir, file.name));
    } else if (file.name.endsWith('.ts') || file.name.endsWith('.tsx')) {
      const filePath = path.join(dir, file.name);
      const content = fs.readFileSync(filePath, 'utf8');
      if (content.includes('from \'pdf-parse\'') || content.includes('import("pdf-parse")')) {
        console.log(`⚠️  Import problemático encontrado en: ${filePath}`);
        hasProblematicImports = true;
      }
    }
  }
}

if (fs.existsSync('src/app')) {
  checkDirectory('src/app');
}
console.log(`📋 Sin imports problemáticos en app: ${!hasProblematicImports ? '✅' : '❌'}`);

// Resumen final
console.log('\n🎯 RESUMEN DE VERIFICACIÓN:');
const allChecks = [
  backupExists,
  isStub,
  pdfServiceExists,
  hasNoFlowImport,
  hasAggressiveConfig,
  docsExist,
  !hasProblematicImports
];

const passedChecks = allChecks.filter(Boolean).length;
const totalChecks = allChecks.length;

console.log(`✅ Verificaciones pasadas: ${passedChecks}/${totalChecks}`);

if (passedChecks === totalChecks) {
  console.log('\n🎉 ¡PERFECTO! La solución ultra-robusta está correctamente implementada.');
  console.log('🚀 El deploy en Render debería funcionar sin problemas.');
  console.log('\n📝 Próximos pasos:');
  console.log('   1. git add .');
  console.log('   2. git commit -m "feat: solución ultra-robusta pdf-parse"');
  console.log('   3. git push');
  console.log('   4. Deploy en Render');
} else {
  console.log('\n⚠️  Hay algunos problemas que necesitan atención antes del deploy.');
  process.exit(1);
}

console.log('\n📖 Para más detalles, consulta: SOLUCION-PDF-PARSE.md');
