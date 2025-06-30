/**
 * PDF Service - Manejo ultra-robusto de pdf-parse
 * Evita completamente la carga durante el build de Next.js
 */

// Tipo para el resultado de pdf-parse
interface PdfParseResult {
  text: string;
  numpages: number;
  info: any;
}

// Estado del módulo
let pdfParseFunction: any = null;
let loadAttempted = false;

/**
 * Carga pdf-parse de manera completamente dinámica
 * Usa múltiples estrategias para evitar problemas de build
 */
async function loadPdfParseUltraSafe(): Promise<any> {
  // Solo en servidor
  if (typeof window !== 'undefined') {
    throw new Error('PDF parsing is only available on the server side');
  }

  // Durante build de Next.js, no cargar
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    console.log('🚫 Skipping pdf-parse during Next.js build phase');
    throw new Error('PDF parsing not available during build');
  }

  // Si ya se intentó y falló, no reintentar
  if (loadAttempted && !pdfParseFunction) {
    throw new Error('pdf-parse loading failed previously');
  }

  // Si ya está cargado, retornar
  if (pdfParseFunction) {
    return pdfParseFunction;
  }

  loadAttempted = true;

  try {
    // Estrategia 1: Require dinámico con eval para evitar static analysis
    const moduleName = 'pdf-parse';
    const requireFn = eval('require');
    pdfParseFunction = requireFn(moduleName);
    console.log('✅ pdf-parse loaded via eval require');
    return pdfParseFunction;
  } catch (error1) {
    console.warn('⚠️ Eval require failed:', error1);

    try {
      // Estrategia 2: Function constructor para máximo dinamismo
      const loadPdf = new Function('moduleName', `
        try {
          return require(moduleName);
        } catch (e) {
          return null;
        }
      `);
      pdfParseFunction = loadPdf('pdf-parse');
      if (pdfParseFunction) {
        console.log('✅ pdf-parse loaded via Function constructor');
        return pdfParseFunction;
      }
    } catch (error2) {
      console.warn('⚠️ Function constructor failed:', error2);
    }

    try {
      // Estrategia 3: Dynamic import como último recurso
      const module = await import('pdf-parse');
      pdfParseFunction = module.default || module;
      console.log('✅ pdf-parse loaded via dynamic import');
      return pdfParseFunction;
    } catch (error3) {
      console.error('❌ All loading strategies failed');
      pdfParseFunction = null;
      throw new Error('Could not load pdf-parse: ' + String(error3));
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
    const pdfParse = await loadPdfParseUltraSafe();
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
  return typeof window === 'undefined' && pdfParseFunction !== null;
}

/**
 * Limpia el cache de pdf-parse (útil para testing)
 */
export function clearPdfParseCache(): void {
  pdfParseFunction = null;
  loadAttempted = false;
}
