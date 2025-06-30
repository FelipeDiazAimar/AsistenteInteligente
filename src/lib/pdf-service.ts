/**
 * PDF Service - Manejo robusto de pdf-parse solo en servidor
 * Esta implementación evita cargar pdf-parse durante el build de Next.js
 */

// Tipo para el resultado de pdf-parse
interface PdfParseResult {
  text: string;
  numpages: number;
  info: any;
}

// Cache para el módulo pdf-parse
let pdfParseModule: any = null;
let pdfParseLoadAttempted = false;

/**
 * Carga pdf-parse de manera dinámica y segura
 * Solo se ejecuta en el servidor y solo cuando es necesario
 */
async function loadPdfParse(): Promise<any> {
  // Verificar que estamos en el servidor
  if (typeof window !== 'undefined') {
    throw new Error('PDF parsing is only available on the server side');
  }

  // Si ya intentamos cargar y falló, no intentar de nuevo
  if (pdfParseLoadAttempted && !pdfParseModule) {
    throw new Error('pdf-parse could not be loaded previously');
  }

  // Si ya está cargado, devolverlo
  if (pdfParseModule) {
    return pdfParseModule;
  }

  pdfParseLoadAttempted = true;

  // Durante el build de Next.js, no intentar cargar pdf-parse
  if (process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
    console.log('⚠️ Skipping pdf-parse loading during production build');
    throw new Error('PDF parsing not available during build phase');
  }

  try {
    // Método 1: Usar eval para evitar que Webpack procese la importación
    pdfParseModule = eval('require')('pdf-parse');
    console.log('✅ pdf-parse loaded successfully via eval require');
    return pdfParseModule;
  } catch (evalError) {
    console.error('⚠️ Failed to load pdf-parse via eval require:', evalError);
    
    try {
      // Método 2: Import dinámico como fallback
      const importedModule = await eval('import("pdf-parse")');
      pdfParseModule = importedModule.default || importedModule;
      console.log('✅ pdf-parse loaded successfully via dynamic import');
      return pdfParseModule;
    } catch (importError) {
      console.error('⚠️ Failed to load pdf-parse via dynamic import:', importError);
      
      try {
        // Método 3: Require directo (último recurso)
        const { createRequire } = eval('require')('module');
        const require = createRequire(import.meta.url || __filename);
        pdfParseModule = require('pdf-parse');
        console.log('✅ pdf-parse loaded successfully via createRequire');
        return pdfParseModule;
      } catch (requireError) {
        console.error('❌ All pdf-parse loading methods failed:', requireError);
        pdfParseModule = null;
        const errorMessage = requireError instanceof Error ? requireError.message : 'Unknown error';
        throw new Error('Could not load pdf-parse module: ' + errorMessage);
      }
    }
  }
}

/**
 * Extrae texto de un buffer PDF de manera segura
 */
export async function extractTextFromPdfBuffer(pdfBuffer: Buffer): Promise<string> {
  if (typeof window !== 'undefined') {
    throw new Error('PDF processing is only available on the server side');
  }

  try {
    const pdfParse = await loadPdfParse();
    const result: PdfParseResult = await pdfParse(pdfBuffer);
    return result.text || '';
  } catch (error) {
    console.error('❌ Error extracting text from PDF buffer:', error);
    throw new Error('Failed to extract text from PDF');
  }
}

/**
 * Extrae texto de un Data URI PDF
 */
export async function extractTextFromPdfDataUri(dataUri: string): Promise<string> {
  if (typeof window !== 'undefined') {
    throw new Error('PDF processing is only available on the server side');
  }

  console.log('🔍 Starting PDF text extraction from Data URI');

  // Validar formato del Data URI
  if (!dataUri.startsWith('data:application/pdf;base64,')) {
    throw new Error('Invalid PDF Data URI format');
  }

  // Extraer datos base64
  const base64Marker = ';base64,';
  const base64MarkerIndex = dataUri.indexOf(base64Marker);
  
  if (base64MarkerIndex === -1) {
    throw new Error('Invalid Data URI: Missing base64 marker');
  }

  const base64Data = dataUri.substring(base64MarkerIndex + base64Marker.length);
  
  if (!base64Data) {
    throw new Error('Empty PDF data in URI');
  }

  // Crear buffer desde base64
  let pdfBuffer: Buffer;
  try {
    pdfBuffer = Buffer.from(base64Data, 'base64');
    console.log('✅ PDF buffer created, size:', pdfBuffer.length, 'bytes');
  } catch (bufferError) {
    console.error('❌ Error creating buffer from base64:', bufferError);
    throw new Error('Failed to decode PDF from base64');
  }

  if (pdfBuffer.length === 0) {
    throw new Error('Empty PDF buffer after base64 decoding');
  }

  // Extraer texto usando el buffer
  return await extractTextFromPdfBuffer(pdfBuffer);
}

/**
 * Verifica si pdf-parse está disponible sin intentar cargarlo
 */
export function isPdfParseAvailable(): boolean {
  return typeof window === 'undefined' && pdfParseModule !== null;
}

/**
 * Limpia el cache de pdf-parse (útil para testing)
 */
export function clearPdfParseCache(): void {
  pdfParseModule = null;
  pdfParseLoadAttempted = false;
}
