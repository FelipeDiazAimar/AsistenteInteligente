import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno explícitamente
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function testResourcesEndpoint() {
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
          
          // Probar endpoint /api/admin/resources
          console.log('📚 Probando endpoint /api/admin/resources...');
          const resourcesResponse = await fetch('http://localhost:9002/api/admin/resources', {
            headers: {
              'Cookie': `auth-token=${token}`
            }
          });
          
          const resourcesData = await resourcesResponse.json();
          console.log('📚 Resources response status:', resourcesResponse.status);
          console.log('📚 Resources response data:', JSON.stringify(resourcesData, null, 2));
        }
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testResourcesEndpoint();
