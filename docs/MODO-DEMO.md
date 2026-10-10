# Modo demo

La app funciona sin base de datos ni API keys. Todo el contenido demo vive en
`src/lib/demo.ts` (hardcodeado, sin red ni persistencia). El modo demo está
**activado por defecto**; solo se desactiva con `NEXT_PUBLIC_DEMO_MODE=false`.

## Qué anda sin keys/DB

| Funcionalidad | Fuente de datos | Dónde se usa |
|---|---|---|
| Chat con 3 apuntes (HTA, diabetes tipo 2, vacunación) | `DEMO_NOTES` + `demoChatReply()` (respuesta por palabras clave) | `POST /api/chat` (`src/app/api/chat/route.ts`): si `isDemoMode()` o no hay `OPENROUTER_API_KEY`, responde `{ answer, demo: true }` |
| Recursos (pdf, video, artículo, imagen) | `DEMO_RESOURCES` (4 ítems) | `/resources`, `/resources/pdfs`, `/resources/videos` |
| Quiz de 5 preguntas | `DEMO_QUIZ` | Contadores del dashboard admin en modo demo |
| Login admin `admin@demo.local` / `demo1234` | `DEMO_ADMIN` | `src/lib/auth.ts` (`authenticateProfessor`/`validateSession` aceptan sesión demo opaca, sin JWT ni Postgres); `/admin/login` muestra las credenciales |
| Banner "MODO DEMO" | — | `src/app/layout.tsx` |

## Limitaciones

- El chat **no usa IA**: responde solo por palabras clave sobre los 3 apuntes; cualquier otro tema devuelve un mensaje genérico. Cada respuesta lleva un disclaimer educativo (no reemplaza criterio médico).
- Sin persistencia: no se guardan usuarios, sesiones, recursos ni historial (la sesión demo es un token opaco en memoria/cookie, no un JWT).
- Análisis de PDF con IA y dashboard completo (gestión de profesores/recursos/sesiones) requieren modo real.
- La página `/self-assessment` aún lee recursos de la base de datos (`fetchResourcesAction`); el quiz interactivo contra `DEMO_QUIZ` está pendiente de cablear.
- La credencial demo solo es válida con el modo demo activo; en modo real se rechaza.

## Cómo correr el demo

```bash
npm install
npm run dev
```

Abrir `http://localhost:9002`. No crear `.env.local`: con `NEXT_PUBLIC_DEMO_MODE` sin definir, `isDemoMode()` devuelve `true`.

## Cómo reactivar el modo real (Render / DB / keys)

1. En `.env.local` (local) o en las variables de entorno del servicio (Render):
   `NEXT_PUBLIC_DEMO_MODE=false` más `DATABASE_URL`, `SUPABASE_URL`,
   `SUPABASE_ANON_KEY`, `JWT_SECRET` y la key de IA que corresponda:
   `OPENROUTER_API_KEY` (el chat actual usa OpenRouter, modelo
   `mistralai/mistral-7b-instruct`) y/o `GOOGLE_API_KEY` (flujo Genkit/Gemini).
2. Inicializar la base de datos y crear el admin real:
   `npm run setup-db` y `npm run add-admin` (ver `scripts/`).
3. En Render: definir esas variables, comando de build `npm install && npm run build`
   y comando de inicio `npm start` (usa `server.js`, Express + `PORT`).
4. Verificar: el banner "MODO DEMO" sigue visible en el layout pero el chat debe
   responder vía OpenRouter, y el login demo (`admin@demo.local`) debe fallar;
   el acceso admin pasa a validar contra Postgres con JWT.

Sin secretos en este repo: nunca commitear `.env.local` (ya está en `.gitignore`).
