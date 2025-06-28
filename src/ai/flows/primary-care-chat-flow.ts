'use server';
/**
 * @fileOverview A Genkit flow to interact with the OpenRouter API for the Primary Care Companion chat.
 *
 * - primaryCareChat - A function that sends a question and chat history to OpenRouter and returns the answer.
 * - PrimaryCareChatInput - The input type for the primaryCareChat function.
 * - PrimaryCareChatOutput - The return type for the primaryCareChat function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit'; 
// import pdfParse from 'pdf-parse'; // Temporalmente comentado para evitar errores

// Define the schema for individual messages in the chat history
const ChatMessageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string(),
});

// Define the input schema for the flow
const PrimaryCareChatInputSchema = z.object({
  question: z.string().describe('The user_s current question.'),
  history: z.array(ChatMessageSchema).optional().describe('The conversation history.'),
  pdfContextDataUri: z.string().optional().describe('Optional PDF content as a data URI to use as context.'),
});
export type PrimaryCareChatInput = z.infer<typeof PrimaryCareChatInputSchema>;

// Define the output schema for the flow
const PrimaryCareChatOutputSchema = z.object({
  answer: z.string().describe('The AI_s answer to the question.'),
});
export type PrimaryCareChatOutput = z.infer<typeof PrimaryCareChatOutputSchema>;

async function getPdfTextFromDataUri(dataUri: string): Promise<string | null> {
  if (!dataUri.startsWith('data:application/pdf;base64,')) {
    console.error('Invalid Data URI: Does not start with "data:application/pdf;base64,". URI prefix:', dataUri.substring(0, 100));
    return null;
  }
  
  const base64Marker = ';base64,';
  const base64MarkerIndex = dataUri.indexOf(base64Marker);

  if (base64MarkerIndex === -1) {
    console.error('Invalid Data URI: Missing ";base64," marker. URI prefix:', dataUri.substring(0, 100));
    return null;
  }

  const base64Data = dataUri.substring(base64MarkerIndex + base64Marker.length);

  if (!base64Data) {
    console.error('PDF data URI is empty after marker.');
    return null;
  }

  let pdfBuffer: Buffer;
  try {
    pdfBuffer = Buffer.from(base64Data, 'base64');
  } catch (bufferError) {
    console.error('Error creating buffer from base64 data. URI prefix:', dataUri.substring(0,100) , 'Error:', bufferError instanceof Error ? bufferError.message : String(bufferError));
    return null;
  }

  if (pdfBuffer.length === 0) {
    console.error('PDF buffer is empty after base64 decoding. URI prefix:', dataUri.substring(0,100));
    return null;
  }

  try {
    // const data = await pdfParse(pdfBuffer); // Temporalmente comentado
    // if (data && typeof data.text === 'string') {
    //     return data.text;
    // }
    console.error('PDF parsing temporarily disabled');
    return null;
  } catch (error) {
    console.error('pdf-parse failed during PDF text extraction. URI prefix:', dataUri.substring(0, 50), 'Error message:', error instanceof Error ? error.message : String(error));
    return null;
  }
}

// The Genkit flow definition
const primaryCareChatFlow = ai.defineFlow(
  {
    name: 'primaryCareChatFlow',
    inputSchema: PrimaryCareChatInputSchema,
    outputSchema: PrimaryCareChatOutputSchema,
  },
  async (payload): Promise<PrimaryCareChatOutput> => {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      console.error('OPENROUTER_API_KEY is not set in environment variables.');
      return { 
        answer: 'Error de configuración: La clave API de OpenRouter no está definida. Por favor, configúrala para usar el chat.' 
      };
    }

    let pdfTextContext = '';
    if (payload.pdfContextDataUri) {
      try {
        const extractedText = await getPdfTextFromDataUri(payload.pdfContextDataUri);
        if (extractedText) {
          pdfTextContext = `El usuario ha proporcionado el siguiente contenido de un PDF como contexto adicional:\n---\n${extractedText}\n---\nConsidera esta información al responder.\n\n`;
        } else {
          pdfTextContext = "Se intentó leer un PDF proporcionado por el usuario, pero no se pudo extraer su contenido. Informa al usuario si es relevante.\n\n";
        }
      } catch (pdfProcessingError) {
        console.error('Critical error during PDF context processing in primaryCareChatFlow:', pdfProcessingError instanceof Error ? pdfProcessingError.message : String(pdfProcessingError));
        pdfTextContext = "Ocurrió un error crítico al procesar el PDF proporcionado y no se pudo utilizar como contexto. Por favor, intenta con otro archivo o continúa sin adjuntar un PDF.\n\n";
      }
    }
    
    const systemMessageContent = `${pdfTextContext}Eres un tutor inteligente/asistente de IA útil para "Primary Care Companion", una pagina diseñada para ayudar a los estudiantes a aprender y consultar sobre temas de atención primaria. Responde siempre en español. Contesta las preguntas de manera precisa y concisa, y organizada, basándote en tu conocimiento sobre atención primaria.`;

    const systemMessage = {
      role: 'system',
      content: systemMessageContent,
    };

    const messagesToOpenRouter = [
      systemMessage,
      ...(payload.history || []),
      { role: 'user', content: payload.question },
    ];

    try {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'mistralai/mistral-7b-instruct', // Cambiado a modelo de Mistral
          messages: messagesToOpenRouter,
          max_tokens: 256,
        }),
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(`OpenRouter API error: ${response.status} ${response.statusText}`, errorBody);
        return { 
          answer: `Lo siento, no se pudo obtener una respuesta del asistente IA (Error: ${response.statusText}). Inténtalo de nuevo más tarde.` 
        };
      }

      const data = await response.json();
      const answer = data.choices?.[0]?.message?.content?.trim() || 'Lo siento, no pude obtener una respuesta clara en este momento.';
      
      return { answer };

    } catch (error) {
      console.error('Error calling OpenRouter API:', error);
      let errorMessage = 'Lo siento, ha ocurrido un error inesperado al contactar al asistente de IA.';
      if (error instanceof Error) {
        errorMessage = `Lo siento, ha ocurrido un error al contactar al asistente de IA: ${error.message}`;
      }
      return { 
        answer: errorMessage
      };
    }
  }
);

// Exported wrapper function to be called from the frontend
export async function primaryCareChat(input: PrimaryCareChatInput): Promise<PrimaryCareChatOutput> {
  return primaryCareChatFlow(input);
}

export async function extractTextFromPdfBuffer(pdfBuffer: Buffer): Promise<string> {
  // const data = await pdfParse(pdfBuffer); // Temporalmente comentado
  // return data.text;
  return 'PDF parsing temporarily disabled';
}

