// Registro de flows para Genkit dev UI.
// Los flows de IA son opcionales: si no hay API keys (modo demo) la app debe
// arrancar y buildear igual, por eso la carga es dinámica y tolerante a fallos.
async function loadFlows(): Promise<void> {
  try {
    await import('./flows/primary-care-chat-flow');
  } catch (error) {
    console.warn(
      '[genkit:dev] Flows de IA no cargados (funcionando sin keys, modo demo). Detalle:',
      error instanceof Error ? error.message : error,
    );
  }
}

void loadFlows();
