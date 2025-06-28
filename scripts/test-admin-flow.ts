import dotenv from 'dotenv';
import path from 'path';

// Cargar variables de entorno explícitamente
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

async function testLogin() {
  try {
    console.log('🔑 Probando login de admin...');
    
    const response = await fetch('http://localhost:9002/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'admin1@admin1.com',
        password: 'admin1'
      })
    });
    
    const data = await response.json();
    console.log('📝 Respuesta de login:', data);
    
    if (response.ok && data.success) {
      console.log('✅ Login exitoso');
      
      // Obtener cookies de la respuesta
      const cookies = response.headers.get('set-cookie');
      console.log('🍪 Cookies de respuesta:', cookies);
      
      if (cookies) {
        // Extraer el token de la cookie
        const tokenMatch = cookies.match(/auth-token=([^;]+)/);
        if (tokenMatch) {
          const token = tokenMatch[1];
          console.log('🎫 Token obtenido:', token.substring(0, 20) + '...');
          
          // Probar endpoint de admin
          console.log('🛡️ Probando endpoint de admin...');
          const adminResponse = await fetch('http://localhost:9002/api/admin/professors', {
            headers: {
              'Cookie': `auth-token=${token}`
            }
          });
          
          const adminData = await adminResponse.json();
          console.log('👥 Respuesta de admin:', adminData);
          
          if (adminResponse.ok) {
            console.log('✅ Acceso de admin exitoso');
          } else {
            console.log('❌ Error en acceso de admin:', adminResponse.status);
          }
        }
      }
    } else {
      console.log('❌ Error en login:', data.error);
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testLogin();
