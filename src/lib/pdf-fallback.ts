/**
 * Fallback seguro para pdf-parse en entornos donde no está disponible
 * Este archivo se usa cuando pdf-parse no puede ser cargado durante el build
 */

export function createPdfFallback() {
  return {
    async extractTextFromPdfBuffer(buffer: Buffer): Promise<string> {
      throw new Error('PDF processing is not available in this environment. Please ensure pdf-parse is installed and the application is running on the server.');
    },
    
    async extractTextFromPdfDataUri(dataUri: string): Promise<string> {
      throw new Error('PDF processing is not available in this environment. Please ensure pdf-parse is installed and the application is running on the server.');
    },
    
    isPdfParseAvailable(): boolean {
      return false;
    }
  };
}

// Exportar como default para facilitar el uso
export default createPdfFallback;
