// Script para probar el flujo completo en el navegador
// Ejecutar en la consola del navegador después de hacer login

console.log('🔍 Verificando cookies...');
console.log('Cookies del documento:', document.cookie);

// Verificar si las cookies están establecidas
const cookies = document.cookie.split(';').map(cookie => cookie.trim());
const authToken = cookies.find(cookie => cookie.startsWith('auth-token='));
const sessionToken = cookies.find(cookie => cookie.startsWith('session_token='));

console.log('🍪 Auth token:', authToken ? 'Presente' : 'Ausente');
console.log('🍪 Session token:', sessionToken ? 'Presente' : 'Ausente');

// Probar acceso a API de admin
async function testAdminAPI() {
  try {
    console.log('🧪 Probando API de admin...');
    
    const response = await fetch('/api/admin/professors', {
      credentials: 'include'
    });
    
    console.log('📡 Status:', response.status);
    const data = await response.json();
    console.log('📊 Data:', data);
    
    if (data.success) {
      console.log('✅ API funcionando correctamente');
    } else {
      console.log('❌ Error en API:', data.error);
    }
  } catch (error) {
    console.log('❌ Error de conexión:', error);
  }
}

// Ejecutar la prueba
testAdminAPI();
