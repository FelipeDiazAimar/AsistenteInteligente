import { NextRequest, NextResponse } from 'next/server';
import { primaryCareChat, type PrimaryCareChatInput } from '@/ai/flows/primary-care-chat-flow';

interface ChatApiRequest {
  question: string;
  history?: { role: 'user' | 'assistant'; content: string; }[];
  pdfContextDataUri?: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ChatApiRequest = await request.json();
    
    // Validate the input
    const input: PrimaryCareChatInput = {
      question: body.question,
      history: body.history || [],
      pdfContextDataUri: body.pdfContextDataUri,
    };

    // Validate required fields
    if (!input.question || typeof input.question !== 'string') {
      return NextResponse.json(
        { error: 'Question is required and must be a string' },
        { status: 400 }
      );
    }

    // Call the chat flow (server-side only)
    const result = await primaryCareChat(input);

    return NextResponse.json(result);
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
