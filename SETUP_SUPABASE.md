# 🔧 Configuración Rápida de Supabase

## Paso 1: Crear Proyecto en Supabase

1. Ve a [supabase.com](https://supabase.com) y crea una cuenta gratuita
2. Haz clic en "New Project"
3. Escoge un nombre para tu proyecto
4. Crea una contraseña para la base de datos (guárdala)
5. Espera a que el proyecto se configure (2-3 minutos)

## Paso 2: Obtener Credenciales

1. En tu dashboard de Supabase, ve a **Settings > API**
2. Copia estos valores:
   - **Project URL** (ejemplo: `https://abcdefgh.supabase.co`)
   - **Project API Key** (anon public) (ejemplo: `eyJhbGciOiJIUzI1...`)

## Paso 3: Obtener Database URL

1. Ve a **Settings > Database**
2. Busca la sección **Connection String**
3. Copia la URI de conexión que dice **postgresql://postgres:[YOUR-PASSWORD]@...**
4. Reemplaza `[YOUR-PASSWORD]` con la contraseña que creaste en el paso 1

## Paso 4: Configurar .env.local

Reemplaza en tu archivo `.env.local`:

```bash
# Database
DATABASE_URL="postgresql://postgres:TU_PASSWORD@db.TU_PROJECT_ID.supabase.co:5432/postgres"

# Supabase
SUPABASE_URL="https://TU_PROJECT_ID.supabase.co"
SUPABASE_ANON_KEY="TU_ANON_KEY"

# JWT Secret (déjalo así para desarrollo)
JWT_SECRET="dev-secret-key-change-in-production"
```

## Paso 5: Configurar Base de Datos

Ejecuta este comando para crear las tablas y usuarios de prueba:

```bash
npm run setup-db
```

## Paso 6: Probar el Login

1. Reinicia el servidor: `npm run dev`
2. Ve a `http://localhost:9002/admin/login`
3. Usa estas credenciales:
   - **Email:** `juan.perez@universidad.edu`
   - **Contraseña:** `profesor123`

---

**💡 Tip:** Si no quieres usar Supabase, puedes usar una base de datos PostgreSQL local. Solo cambia la `DATABASE_URL` por tu conexión local.
