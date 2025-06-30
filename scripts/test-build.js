#!/usr/bin/env node

/**
 * Script para testear el build localmente y verificar que no hay problemas con pdf-parse
 */

const { spawn } = require('child_process');
const path = require('path');

console.log('🚀 Starting local build test...');

// Configurar variables de entorno para simular el entorno de producción
process.env.NODE_ENV = 'production';
process.env.NEXT_PHASE = 'phase-production-build';

console.log('📦 Running npm install...');

const npmInstall = spawn('npm', ['install'], {
  stdio: 'inherit',
  shell: true,
  cwd: process.cwd()
});

npmInstall.on('close', (code) => {
  if (code !== 0) {
    console.error('❌ npm install failed with code', code);
    process.exit(1);
  }

  console.log('✅ npm install completed successfully');
  console.log('🏗️ Running build...');

  const build = spawn('npm', ['run', 'build'], {
    stdio: 'inherit',
    shell: true,
    cwd: process.cwd()
  });

  build.on('close', (buildCode) => {
    if (buildCode !== 0) {
      console.error('❌ Build failed with code', buildCode);
      process.exit(1);
    }

    console.log('✅ Build completed successfully!');
    console.log('🎉 All tests passed. The build should work on Render.');
  });

  build.on('error', (error) => {
    console.error('❌ Build process error:', error);
    process.exit(1);
  });
});

npmInstall.on('error', (error) => {
  console.error('❌ npm install process error:', error);
  process.exit(1);
});
