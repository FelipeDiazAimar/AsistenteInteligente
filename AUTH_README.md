# Sistema de Autenticación para Profesores

Este sistema implementa autenticación completa para profesores con JWT, middleware de protección de rutas y gestión de sesiones.

## 🔧 Configuración

### 1. Variables de Entorno

Crea un archivo `.env.local` basado en `.env.example`:

```bash
cp .env.example .env.local
```

Configura las siguientes variables:

```bash
# Database
DATABASE_URL="your-postgres-connection-string"

# Supabase
SUPABASE_URL="your-supabase-url"
SUPABASE_ANON_KEY="your-supabase-anon-key"

# JWT Secret (usa una clave segura en producción)
JWT_SECRET="tu-clave-secreta-muy-segura-cambia-esto-en-produccion"
```

### 2. Base de Datos

Ejecuta la migración SQL en tu base de datos PostgreSQL:

```sql
-- Ejecuta el contenido de: supabase/migrations/001_create_professors_table.sql
```

Esto creará:
- Tabla `professors` con profesores de ejemplo
- Tabla `professor_sessions` para manejo de sesiones
- Funciones auxiliares para limpieza de sesiones

### 3. Credenciales de Prueba

Profesores predefinidos (contraseña: `profesor123`):
- `juan.perez@universidad.edu`
- `maria.garcia@universidad.edu`
- `carlos.lopez@universidad.edu`

## 🚀 Funcionalidades

### Autenticación
- ✅ Login con email y contraseña
- ✅ Hash seguro de contraseñas con bcrypt
- ✅ JWT tokens para sesiones
- ✅ Middleware automático de protección de rutas
- ✅ Gestión de sesiones en base de datos
- ✅ Logout con limpieza de sesiones

### Rutas Protegidas
- `/admin/*` - Requiere autenticación
- `/admin/login` - Página de login
- `/admin/add-notes` - Panel de administración

### Seguridad
- ✅ Contraseñas hasheadas con bcrypt (12 rounds)
- ✅ JWT con expiración (7 días)
- ✅ Cookies HttpOnly y seguras
- ✅ Validación de sesiones en base de datos
- ✅ Limpieza automática de sesiones expiradas

## 📁 Estructura de Archivos

```
src/
├── lib/
│   └── auth.ts                 # Utilidades de autenticación
├── hooks/
│   └── use-auth.tsx           # Hook React para autenticación
├── app/
│   ├── api/auth/
│   │   ├── login/route.ts     # API endpoint login
│   │   ├── logout/route.ts    # API endpoint logout
│   │   └── me/route.ts        # API endpoint verificación
│   └── admin/
│       ├── login/page.tsx     # Página de login
│       └── add-notes/page.tsx # Panel protegido
├── middleware.ts              # Middleware de protección
└── supabase/migrations/       # Migraciones SQL
```

## 🔒 Flujo de Autenticación

1. **Login**: Usuario ingresa credenciales en `/admin/login`
2. **Verificación**: Sistema valida email/contraseña contra base de datos
3. **Token**: Se genera JWT y se guarda en cookie HttpOnly
4. **Sesión**: Se registra sesión en tabla `professor_sessions`
5. **Middleware**: Rutas protegidas verifican automáticamente el token
6. **Autorización**: Usuario accede a contenido protegido

## 🛠 Uso en Componentes

### Hook de Autenticación

```tsx
import { useAuth } from '@/hooks/use-auth';

function MyComponent() {
  const { professor, isLoading, login, logout } = useAuth();
  
  if (isLoading) return <div>Cargando...</div>;
  if (!professor) return <div>No autenticado</div>;
  
  return (
    <div>
      <h1>Bienvenido, {professor.name}</h1>
      <button onClick={logout}>Cerrar Sesión</button>
    </div>
  );
}
```

### Server Components

```tsx
import { headers } from 'next/headers';

export default async function ProtectedPage() {
  const headersList = headers();
  const professorName = headersList.get('x-professor-name');
  
  return <h1>Hola, {professorName}</h1>;
}
```

## 🧪 Testing

### Probar Login
1. Ve a `/admin/login`
2. Usa: `juan.perez@universidad.edu` / `profesor123`
3. Deberías ser redirigido a `/admin/add-notes`

### Probar Protección de Rutas
1. Ve directamente a `/admin/add-notes` sin autenticarte
2. Deberías ser redirigido a `/admin/login`

### Probar Logout
1. Inicia sesión
2. Haz clic en "Cerrar Sesión"
3. Deberías ser redirigido al login

## 🔧 Comandos Útiles

```bash
# Generar nuevos hashes de contraseñas
npm run hash-passwords

# Verificar tipos TypeScript
npm run typecheck

# Desarrollo
npm run dev
```

## 🚨 Consideraciones de Seguridad

1. **JWT_SECRET**: Usa una clave fuerte y única en producción
2. **HTTPS**: Siempre usa HTTPS en producción para cookies seguras
3. **Rate Limiting**: Considera implementar rate limiting en login
4. **Sesiones**: Las sesiones expiran automáticamente después de 7 días
5. **CORS**: Configura CORS apropiadamente para tu dominio

## 🔄 Limpieza de Sesiones

El sistema incluye una función SQL para limpiar sesiones expiradas:

```sql
SELECT clean_expired_sessions();
```

Considera ejecutar esto periódicamente con un cron job.

## 📝 Notas Adicionales

- El middleware protege automáticamente todas las rutas `/admin/*`
- Las sesiones se validan tanto con JWT como con la base de datos
- El sistema es compatible con Server Components y Client Components
- Se incluye manejo de errores y estados de carga
