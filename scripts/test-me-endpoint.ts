import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno explícitamente
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function testMeEndpoint() {
  try {
    console.log('🔑 Haciendo login...');
    
    const loginResponse = await fetch('http://localhost:9002/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin1@admin1.com',
        password: 'admin1'
      })
    });
    
    const loginData = await loginResponse.json();
    console.log('✅ Login response:', loginData.success);
    
    if (loginResponse.ok && loginData.success) {
      // Obtener cookies de la respuesta
      const cookies = loginResponse.headers.get('set-cookie');
      
      if (cookies) {
        // Extraer el token de la cookie
        const tokenMatch = cookies.match(/auth-token=([^;]+)/);
        if (tokenMatch) {
          const token = tokenMatch[1];
          
          // Probar endpoint /api/auth/me
          console.log('🔍 Probando endpoint /api/auth/me...');
          const meResponse = await fetch('http://localhost:9002/api/auth/me', {
            headers: {
              'Cookie': `auth-token=${token}`
            }
          });
          
          const meData = await meResponse.json();
          console.log('👤 Me response status:', meResponse.status);
          console.log('👤 Me response data:', meData);
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testMeEndpoint();
