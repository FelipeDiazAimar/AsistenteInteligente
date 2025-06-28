# Sistema de Gestión de Sesiones

Este documento explica el sistema mejorado de gestión de sesiones implementado en el Asistente Inteligente.

## Características Principales

### ⏰ Duración de Sesión
- **Nueva duración**: 20 minutos desde el inicio de sesión
- **Anterior duración**: 7 días (corregido)
- Las sesiones expiran automáticamente después de 20 minutos de inactividad

### 🔄 Limpieza Automática
- **Verificación cliente**: Cada 2 minutos se verifica si la sesión sigue siendo válida
- **Limpieza automática**: Cada 5 minutos se eliminan sesiones expiradas del servidor
- **Actualización dashboard**: El dashboard de sesiones se actualiza cada 5 segundos

### 🎛️ Panel de Administración
- **Tiempo restante**: Se muestra en tiempo real cuánto tiempo queda para cada sesión
- **Estados visuales**: 
  - 🟢 Verde: Más de 5 minutos restantes
  - 🟠 Naranja: Menos de 5 minutos restantes
  - 🔴 Rojo: Sesión expirada
- **Botón de limpieza**: Permite limpiar manualmente todas las sesiones expiradas

## Cómo Funciona

### 1. Inicio de Sesión
```
Usuario inicia sesión → Se crea sesión con expiración a 20 minutos → Token JWT almacenado en cookies
```

### 2. Verificación Automática
```
Cada 2 minutos → Verificar validez de sesión → Si expiró → Cerrar sesión automáticamente
```

### 3. Limpieza del Servidor
```
Cada 5 minutos → Eliminar sesiones expiradas de la base de datos → Actualizar estadísticas
```

### 4. Detección de Expiración
- Si el usuario intenta acceder con una sesión expirada, es redirigido automáticamente al login
- Se muestra un mensaje informativo explicando que la sesión expiró

## Scripts Disponibles

### Limpiar Sesiones Manualmente
```bash
npm run clean-sessions
```

Este script:
- Muestra todas las sesiones expiradas antes de eliminarlas
- Elimina las sesiones expiradas de la base de datos
- Muestra estadísticas de sesiones activas restantes

## Endpoints de API

### GET `/api/admin/sessions/cleanup`
Verifica cuántas sesiones expiradas hay sin eliminarlas.

**Respuesta:**
```json
{
  "success": true,
  "expiredSessionsCount": 5
}
```

### POST `/api/admin/sessions/cleanup`
Elimina todas las sesiones expiradas.

**Respuesta:**
```json
{
  "success": true,
  "message": "5 sesiones expiradas eliminadas",
  "deletedCount": 5
}
```

## Archivos Modificados

### Frontend
- `src/hooks/use-session-expiration.tsx` - Hook para manejo automático de expiración
- `src/app/admin/dashboard/page.tsx` - Integra verificación automática
- `src/app/admin/add-notes/page.tsx` - Integra verificación automática
- `src/app/admin/login/page.tsx` - Mensajes de sesión expirada
- `src/app/admin/dashboard/components/SessionsManagement.tsx` - Dashboard mejorado

### Backend
- `src/lib/auth.ts` - Duración de sesión cambiada a 20 minutos
- `src/lib/auth-supabase.ts` - Duración de sesión cambiada a 20 minutos
- `src/app/api/admin/sessions/cleanup/route.ts` - Nuevo endpoint de limpieza

### Scripts
- `scripts/clean-expired-sessions.ts` - Script manual de limpieza
- `package.json` - Nuevo comando `npm run clean-sessions`

## Beneficios

### ✅ Seguridad Mejorada
- Sesiones de duración apropiada (20 minutos vs 7 días)
- Limpieza automática de sesiones inactivas
- Cierre automático de sesiones expiradas

### ✅ Mejor Experiencia de Usuario
- Mensajes informativos cuando la sesión expira
- Tiempo restante visible en tiempo real
- Redirección automática sin errores confusos

### ✅ Administración Eficiente
- Dashboard en tiempo real del estado de sesiones
- Herramientas de limpieza manual y automática
- Estadísticas claras de uso del sistema

### ✅ Rendimiento Optimizado
- Eliminación automática de datos obsoletos
- Menos carga en la base de datos
- Actualizaciones eficientes del estado

## Troubleshooting

### Si las sesiones no expiran automáticamente:
1. Verificar que el hook `useSessionExpiration` esté importado en las páginas
2. Comprobar que la conexión a la base de datos funcione correctamente
3. Revisar los logs del navegador para errores de red

### Si el dashboard no se actualiza:
1. Verificar que el endpoint `/api/admin/sessions` funcione
2. Comprobar permisos de administrador
3. Revisar que no hay errores en la consola del navegador

### Para limpiar sesiones manualmente:
```bash
npm run clean-sessions
```

O usar el botón "Limpiar Expiradas" en el dashboard de administración.
