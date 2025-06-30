// Stub vacío para primary-care-chat-flow
// Este archivo evita que Next.js procese el flow original durante el build

export type PrimaryCareChatInput = {
  question: string;
  history?: Array<{ role: 'user' | 'assistant'; content: string; }>;
  pdfContextDataUri?: string;
};

export type PrimaryCareChatOutput = {
  answer: string;
};

export async function primaryCareChat(input: PrimaryCareChatInput): Promise<PrimaryCareChatOutput> {
  throw new Error('This function should not be called. Use the API route /api/chat instead.');
}

export async function extractTextFromPdfBuffer(pdfBuffer: Buffer): Promise<string> {
  throw new Error('This function should not be called. Use the PDF service instead.');
}
