#!/bin/bash
# Script de deploy seguro para Render
# Este script verifica que todo esté listo antes del deploy

echo "🚀 Preparando deploy seguro..."

# 1. Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encontró package.json. Ejecuta este script desde la raíz del proyecto."
    exit 1
fi

# 2. Verificar que los archivos críticos existen
echo "📋 Verificando archivos críticos..."

FILES=(
    "src/lib/pdf-service.ts"
    "src/app/api/chat/route.ts"
    "next.config.ts"
    "SOLUCION-PDF-PARSE.md"
)

for file in "${FILES[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Error: Archivo crítico no encontrado: $file"
        exit 1
    fi
done

echo "✅ Todos los archivos críticos encontrados"

# 3. Ejecutar build local para verificar
echo "🏗️ Ejecutando build local..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Error: El build local falló. No deployes hasta que se arregle."
    exit 1
fi

echo "✅ Build local exitoso"

# 4. Verificar que no hay imports directos problemáticos
echo "🔍 Verificando imports problemáticos..."

if grep -r "from.*pdf-parse" src/app/ 2>/dev/null; then
    echo "❌ Error: Se encontraron imports directos de pdf-parse en src/app/"
    echo "   Usa el servicio /src/lib/pdf-service.ts en su lugar"
    exit 1
fi

echo "✅ No se encontraron imports problemáticos"

# 5. Mostrar resumen
echo ""
echo "🎉 ¡Deploy listo!"
echo ""
echo "📋 Resumen de la solución:"
echo "   ✅ pdf-parse carga dinámicamente solo en servidor"
echo "   ✅ API routes separadas para chat"
echo "   ✅ Webpack configurado para producción"
echo "   ✅ Build local exitoso"
echo ""
echo "🚀 Ahora puedes hacer push a tu repositorio y deployar en Render."
echo ""
echo "📖 Para más detalles, consulta: SOLUCION-PDF-PARSE.md"
