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

// Importar pdf-parse de manera segura para el entorno servidor/cliente
let pdfParseCore: any;

// Función para cargar pdf-parse dinámicamente - solo en servidor
async function getPdfParser() {
  // Verificar que estamos en el servidor
  if (typeof window !== 'undefined') {
    console.error('⚠️ PDF parsing is only available on the server side');
    return null;
  }

  if (!pdfParseCore) {
    try {
      // Primero intentar dynamic import
      const pdfParseModule = await import('pdf-parse');
      pdfParseCore = pdfParseModule.default || pdfParseModule;
      console.log('✅ pdf-parse loaded successfully via import');
    } catch (importError) {
      console.error('⚠️ Failed to import pdf-parse:', importError);
      // Fallback: intentar con require
      try {
        pdfParseCore = eval('require')('pdf-parse');
        console.log('✅ pdf-parse loaded successfully via require');
      } catch (requireError) {
        console.error('⚠️ Failed to require pdf-parse:', requireError);
        // Último intento: verificar si pdf-parse ya está disponible globalmente
        try {
          pdfParseCore = global.require ? global.require('pdf-parse') : null;
          if (pdfParseCore) {
            console.log('✅ pdf-parse loaded successfully via global.require');
          }
        } catch (globalError) {
          console.error('⚠️ All pdf-parse loading methods failed:', globalError);
          return null;
        }
      }
    }
  }
  
  // Verificar que el módulo tiene la función correcta
  if (pdfParseCore && typeof pdfParseCore === 'function') {
    return pdfParseCore;
  } else if (pdfParseCore && pdfParseCore.default && typeof pdfParseCore.default === 'function') {
    return pdfParseCore.default;
  } else {
    console.error('⚠️ pdf-parse module loaded but does not have the expected function');
    return null;
  }
}

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
  console.log('🔍 getPdfTextFromDataUri called with URI length:', dataUri.length);
  
  // Verificar que estamos en el servidor
  if (typeof window !== 'undefined') {
    console.error('❌ PDF processing is only available on the server side');
    return null;
  }
  
  if (!dataUri.startsWith('data:application/pdf;base64,')) {
    console.error('❌ Invalid Data URI: Does not start with "data:application/pdf;base64,". URI prefix:', dataUri.substring(0, 100));
    return null;
  }
  
  const base64Marker = ';base64,';
  const base64MarkerIndex = dataUri.indexOf(base64Marker);

  if (base64MarkerIndex === -1) {
    console.error('❌ Invalid Data URI: Missing ";base64," marker. URI prefix:', dataUri.substring(0, 100));
    return null;
  }

  const base64Data = dataUri.substring(base64MarkerIndex + base64Marker.length);
  console.log('📊 Base64 data length after extraction:', base64Data.length);

  if (!base64Data) {
    console.error('❌ PDF data URI is empty after marker.');
    return null;
  }

  let pdfBuffer: Buffer;
  try {
    console.log('🔄 Creating buffer from base64 data...');
    pdfBuffer = Buffer.from(base64Data, 'base64');
    console.log('✅ Buffer created successfully, size:', pdfBuffer.length, 'bytes');
  } catch (bufferError) {
    console.error('❌ Error creating buffer from base64 data. URI prefix:', dataUri.substring(0,100) , 'Error:', bufferError instanceof Error ? bufferError.message : String(bufferError));
    return null;
  }

  if (pdfBuffer.length === 0) {
    console.error('❌ PDF buffer is empty after base64 decoding. URI prefix:', dataUri.substring(0,100));
    return null;
  }

  try {
    console.log('🔄 Starting PDF parsing with pdf-parse...');
    const pdfParser = await getPdfParser();
    
    if (!pdfParser) {
      console.error('❌ Could not load PDF parser');
      return null;
    }
    
    const data = await pdfParser(pdfBuffer);
    console.log('✅ pdf-parse completed successfully');
    
    if (data && typeof data.text === 'string') {
        console.log('✅ PDF text extracted successfully. Text length:', data.text.length);
        console.log('📝 PDF text preview (first 200 chars):', data.text.substring(0, 200));
        console.log('📄 PDF metadata - Pages:', data.numpages, 'Info:', data.info);
        return data.text;
    } else {
        console.error('❌ PDF parsing failed: No text data returned');
        return null;
    }
  } catch (error) {
    console.error('❌ pdf-parse failed during PDF text extraction.');
    console.error('❌ Error type:', error instanceof Error ? error.constructor.name : typeof error);
    console.error('❌ Error message:', error instanceof Error ? error.message : String(error));
    
    // Intentar diferentes enfoques según el tipo de error
    if (error instanceof Error) {
      if (error.message.includes('bad XRef') || error.message.includes('FormatError')) {
        console.log('🔄 PDF format error detected, trying alternative parsing...');
        // Podríamos intentar con otro parser o devolver un error específico
        return null;
      } else if (error.message.includes('Invalid PDF') || error.message.includes('startxref')) {
        console.log('🔄 Invalid PDF structure detected');
        return null;
      }
    }
    
    console.error('❌ Full error object:', error);
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
    // Verificar que estamos en el servidor
    if (typeof window !== 'undefined') {
      console.error('❌ Primary Care Chat Flow can only run on the server');
      return { 
        answer: 'Error de configuración: Esta función solo puede ejecutarse en el servidor.' 
      };
    }

    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
      console.error('OPENROUTER_API_KEY is not set in environment variables.');
      return { 
        answer: 'Error de configuración: La clave API de OpenRouter no está definida. Por favor, configúrala para usar el chat.' 
      };
    }

    let pdfTextContext = '';
    if (payload.pdfContextDataUri) {
      console.log('📄 PDF Context Data URI received, starting extraction...');
      console.log('📊 PDF URI length:', payload.pdfContextDataUri.length);
      try {
        const extractedText = await getPdfTextFromDataUri(payload.pdfContextDataUri);
        if (extractedText) {
          console.log('✅ PDF text extracted successfully. Length:', extractedText.length, 'characters');
          console.log('📝 PDF text preview (first 200 chars):', extractedText.substring(0, 200));
          pdfTextContext = `El usuario ha proporcionado el siguiente contenido de un PDF como contexto adicional:\n---\n${extractedText}\n---\nConsidera esta información al responder.\n\n`;
          console.log('📤 PDF context prepared for AI, total context length:', pdfTextContext.length);
        } else {
          console.log('⚠️ PDF text extraction returned null or empty');
          pdfTextContext = "Se intentó leer un PDF proporcionado por el usuario, pero no se pudo extraer su contenido. Informa al usuario si es relevante.\n\n";
        }
      } catch (pdfProcessingError) {
        console.error('❌ Critical error during PDF context processing in primaryCareChatFlow:', pdfProcessingError instanceof Error ? pdfProcessingError.message : String(pdfProcessingError));
        pdfTextContext = "Ocurrió un error crítico al procesar el PDF proporcionado y no se pudo utilizar como contexto. Por favor, intenta con otro archivo o continúa sin adjuntar un PDF.\n\n";
      }
    } else {
      console.log('ℹ️ No PDF context provided');
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
  // Verificar que estamos en el servidor
  if (typeof window !== 'undefined') {
    throw new Error('PDF processing is only available on the server side');
  }
  
  const pdfParser = await getPdfParser();
  if (!pdfParser) {
    throw new Error('PDF parser could not be loaded');
  }
  
  const data = await pdfParser(pdfBuffer);
  return data.text;
}

