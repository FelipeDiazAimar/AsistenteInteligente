import { NextRequest, NextResponse } from 'next/server';
import { extractTextFromPdfDataUri } from '@/lib/pdf-service';

interface ChatApiRequest {
  question: string;
  history?: { role: 'user' | 'assistant'; content: string; }[];
  pdfContextDataUri?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Verificar que estamos en el servidor
    if (typeof window !== 'undefined') {
      return NextResponse.json(
        { error: 'This endpoint only works on the server' },
        { status: 500 }
      );
    }

    const body: ChatApiRequest = await request.json();
    
    // Validar input
    if (!body.question || typeof body.question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required and must be a string' },
        { status: 400 }
      );
    }

    // Procesar PDF si está presente
    let pdfTextContext = '';
    if (body.pdfContextDataUri) {
      console.log('📄 Processing PDF context...');
      try {
        const extractedText = await extractTextFromPdfDataUri(body.pdfContextDataUri);
        if (extractedText) {
          pdfTextContext = `El usuario ha proporcionado el siguiente contenido de un PDF como contexto adicional:\n---\n${extractedText}\n---\nConsidera esta información al responder.\n\n`;
          console.log('✅ PDF context processed, length:', pdfTextContext.length);
        }
      } catch (pdfError) {
        console.error('❌ Error processing PDF:', pdfError);
        pdfTextContext = "Se intentó leer un PDF proporcionado por el usuario, pero no se pudo extraer su contenido.\n\n";
      }
    }

    // Preparar mensajes para OpenRouter
    const systemMessageContent = `${pdfTextContext}Eres un tutor inteligente/asistente de IA útil para "Primary Care Companion", una pagina diseñada para ayudar a los estudiantes a aprender y consultar sobre temas de atención primaria. Responde siempre en español. Contesta las preguntas de manera precisa y concisa, y organizada, basándote en tu conocimiento sobre atención primaria.`;

    const messages = [
      { role: 'system', content: systemMessageContent },
      ...(body.history || []),
      { role: 'user', content: body.question },
    ];

    // Llamar a OpenRouter directamente (sin usar el flow)
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      );
    }

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct',
        messages: messages,
        max_tokens: 256,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`OpenRouter API error: ${response.status} ${response.statusText}`, errorBody);
      return NextResponse.json(
        { 
          error: 'OpenRouter API error',
          answer: `Lo siento, no se pudo obtener una respuesta del asistente IA (Error: ${response.statusText}). Inténtalo de nuevo más tarde.` 
        },
        { status: 500 }
      );
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content?.trim() || 'Lo siento, no pude obtener una respuesta clara en este momento.';
    
    return NextResponse.json({ answer });

  } catch (error) {
    console.error('Chat API error:', error);
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        answer: 'Lo siento, ha ocurrido un error interno del servidor. Inténtalo de nuevo más tarde.'
      },
      { status: 500 }
    );
  }
}
