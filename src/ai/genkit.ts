// La IA es OPCIONAL: importar este módulo nunca debe fallar sin API keys.
// La inicialización real se difiere hasta el primer uso de `ai` (lazy init).
// Sin keys, el error aparece solo si alguien invoca un flow, no al arrancar ni buildear.
import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

type AiInstance = ReturnType<typeof genkit>;

function hasGoogleKey(): boolean {
  return Boolean(
    process.env.GEMINI_API_KEY ||
      process.env.GOOGLE_GENAI_API_KEY ||
      process.env.GOOGLE_API_KEY,
  );
}

/** True si hay alguna key de Google configurada (no garantiza que sea válida). */
export function isAiConfigured(): boolean {
  return hasGoogleKey();
}

let cached: AiInstance | undefined;

function getAi(): AiInstance {
  if (!cached) {
    if (!hasGoogleKey()) {
      throw new Error(
        '[genkit] IA no configurada: falta GEMINI_API_KEY ' +
          '(o GOOGLE_GENAI_API_KEY / GOOGLE_API_KEY). ' +
          'La app funciona en modo demo sin IA; define la key para usar los flows reales.',
      );
    }
    try {
      cached = genkit({
        plugins: [googleAI()],
        model: 'googleai/gemini-2.0-flash',
      });
    } catch (error) {
      throw new Error(
        `[genkit] No se pudo inicializar el cliente de IA: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  }
  return cached;
}

/**
 * Instancia perezosa de Genkit: mantiene la misma forma de uso
 * (`ai.defineFlow(...)`, `ai.generate(...)`, etc.) pero solo inicializa
 * el plugin de Google al primer acceso, cuando ya hay keys.
 */
export const ai: AiInstance = new Proxy({} as AiInstance, {
  get(_target, prop) {
    const real = getAi() as unknown as Record<PropertyKey, unknown>;
    const value = real[prop];
    return typeof value === 'function' ? value.bind(real) : value;
  },
});

export { getAi };
