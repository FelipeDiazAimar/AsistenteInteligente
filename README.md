# 🩺 Compañero de Atención Primaria

**Asistente de aprendizaje impulsado por IA para atención primaria de la salud**

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel)](https://asistente-inteligente.vercel.app)
[![Next.js](https://img.shields.io/badge/Next.js-15.2.3-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4.1-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)

## 🌟 Descripción

Una aplicación web moderna diseñada para asistir a profesionales de la salud en el aprendizaje y consulta de información sobre atención primaria. Combina inteligencia artificial avanzada con una interfaz intuitiva para proporcionar respuestas precisas y recursos educativos organizados.

### ✨ Características Principales

- **🤖 Chat IA Inteligente**: Consulta instantánea sobre temas de atención primaria
- **📄 Análisis de PDFs**: Carga documentos médicos para usarlos como contexto en las consultas
- **📚 Gestión de Recursos**: Biblioteca organizada de materiales educativos (PDFs, videos, imágenes, artículos)
- **👨‍⚕️ Sistema de Autenticación**: Portal seguro para profesores y administradores
- **📊 Dashboard Administrativo**: Gestión completa de usuarios, recursos y sesiones
- **🌙 Modo Oscuro/Claro**: Interface adaptable a las preferencias del usuario
- **📱 Responsive Design**: Optimizado para dispositivos móviles y de escritorio

## 🚀 Demo en Vivo

Visita la aplicación en funcionamiento: [https://asistente-inteligente.vercel.app/](https://asistente-inteligente.vercel.app/)

## 🛠️ Tecnologías Utilizadas

### Frontend
- **Next.js 15.2.3** - Framework React con App Router
- **TypeScript** - Tipado estático para JavaScript
- **Tailwind CSS** - Framework de CSS utilitario
- **Shadcn/ui** - Componentes UI modernos y accesibles
- **Radix UI** - Primitivos UI sin estilos
- **Lucide React** - Iconos modernos
- **React Hook Form** - Manejo eficiente de formularios
- **Zod** - Validación de esquemas

### Backend & IA
- **Genkit** - Framework para aplicaciones con IA
- **Google AI (Gemini)** - Modelo de lenguaje para el chat
- **PDF Parse** - Extracción de texto de documentos PDF
- **Next.js API Routes** - Endpoints del servidor

### Base de Datos & Autenticación
- **PostgreSQL** - Base de datos principal
- **Supabase** - Backend como servicio
- **JWT** - Autenticación basada en tokens
- **bcryptjs** - Hash seguro de contraseñas

### Herramientas de Desarrollo
- **TSX** - Ejecutor de TypeScript
- **ESLint** - Linter para código JavaScript/TypeScript
- **PostCSS** - Procesador de CSS

## 🏗️ Arquitectura del Proyecto

```
src/
├── app/                          # App Router de Next.js
│   ├── (auth)/                   # Rutas de autenticación
│   ├── admin/                    # Panel administrativo
│   │   ├── dashboard/            # Dashboard principal
│   │   ├── add-notes/           # Gestión de notas
│   │   └── login/               # Login de administradores
│   ├── api/                     # API Routes
│   │   ├── auth/                # Endpoints de autenticación
│   │   └── admin/               # Endpoints administrativos
│   ├── resources/               # Gestión de recursos
│   │   ├── articles/            # Artículos
│   │   ├── images/              # Imágenes
│   │   ├── pdfs/                # Documentos PDF
│   │   └── videos/              # Videos educativos
│   └── self-assessment/         # Autoevaluación
├── ai/                          # Integración con IA
│   └── flows/                   # Flujos de Genkit
├── components/                  # Componentes reutilizables
│   ├── ui/                      # Componentes base de UI
│   └── layout/                  # Componentes de layout
├── hooks/                       # Custom React Hooks
├── lib/                         # Utilidades y configuraciones
└── types/                       # Definiciones de TypeScript
```

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js 18+ 
- npm o yarn
- Base de datos PostgreSQL (Supabase recomendado)
- Cuenta de Google AI (para Gemini)

### 1. Clonar el repositorio

```bash
git clone https://github.com/tu-usuario/asistente-inteligente.git
cd asistente-inteligente
```

### 2. Instalar dependencias

```bash
npm install
# o
yarn install
```

### 3. Configurar variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Database
DATABASE_URL="postgresql://usuario:contraseña@host:puerto/database"

# Supabase
SUPABASE_URL="https://tu-proyecto.supabase.co"
SUPABASE_ANON_KEY="tu-anon-key"

# JWT Secret
JWT_SECRET="tu-secret-jwt-super-seguro"

# Google AI
GOOGLE_API_KEY="tu-google-ai-key"

# OpenRouter (opcional)
OPENROUTER_API_KEY="tu-openrouter-key"
```

### 4. Configurar la base de datos

```bash
# Ejecutar script de configuración de la base de datos
npm run setup-db

# Agregar usuario administrador
npm run add-admin
```

### 5. Ejecutar en desarrollo

```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:9002`

## 📋 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo con Turbopack

# Producción
npm run build           # Construye la aplicación para producción
npm run start           # Inicia servidor de producción

# Utilidades
npm run lint            # Ejecuta ESLint
npm run typecheck       # Verifica tipos de TypeScript
npm run hash-passwords  # Genera hashes de contraseñas
npm run setup-db        # Configura la base de datos
npm run clean-sessions  # Limpia sesiones expiradas
```

## 🏥 Funcionalidades Principales

### 1. Chat IA Inteligente
- Respuestas contextuales sobre atención primaria
- Soporte para cargar PDFs como contexto
- Historial de conversación persistente
- Interfaz de chat moderna y responsiva

### 2. Gestión de Recursos Educativos
- **PDFs**: Documentos médicos, guías y protocolos
- **Videos**: Tutoriales y conferencias educativas
- **Imágenes**: Material visual de apoyo
- **Artículos**: Contenido textual especializado

### 3. Sistema de Administración
- Dashboard completo para administradores
- Gestión de profesores y usuarios
- Control de recursos y contenido
- Monitoreo de sesiones activas
- Sistema de autenticación seguro

### 4. Autoevaluación
- Módulo para evaluación de conocimientos
- Seguimiento del progreso de aprendizaje

## 🔐 Seguridad y Autenticación

- **JWT Tokens**: Autenticación segura basada en tokens
- **Hash de Contraseñas**: Usando bcryptjs con salt rounds
- **Middleware de Protección**: Rutas protegidas para administradores
- **Validación de Esquemas**: Con Zod para entrada de datos
- **Limpieza Automática**: Sesiones expiradas se eliminan automáticamente

## 🎨 Diseño y UX

- **Design System**: Basado en Shadcn/ui con componentes consistentes
- **Temas**: Soporte completo para modo claro y oscuro
- **Responsive**: Optimizado para móviles, tablets y desktop
- **Accesibilidad**: Componentes accesibles con Radix UI
- **Animaciones**: Transiciones suaves con Tailwind CSS

## 📱 Características Responsive

- **Mobile First**: Diseño optimizado para móviles
- **Sidebar Adaptativo**: Se convierte en drawer en dispositivos móviles
- **Touch Friendly**: Interfaz optimizada para dispositivos táctiles
- **Viewport Flexible**: Adaptación automática a diferentes tamaños de pantalla

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request