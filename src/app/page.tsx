
"use client";

import { useState, useRef, type ChangeEvent, useEffect, type FormEvent } from 'react';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, Send, MessageCircle, User, Bot, FileSearch, XCircle, FileCheck2, ArrowRight, BookOpen, ClipboardCheck, FilePlus2, Sparkles } from "lucide-react";
import { cn } from '@/lib/utils';
import { demoChatReply } from '@/lib/demo';

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

interface ChatApiRequest {
  question: string;
  history?: { role: 'user' | 'assistant'; content: string; }[];
  pdfContextDataUri?: string;
}

interface ChatApiResponse {
  answer: string;
  error?: string;
}

const exampleMessages: ChatMessage[] = [
    { id: 'initial-greeting', role: 'assistant', content: '¡Hola! ¿Cómo puedo ayudarte hoy con temas de atención primaria?' },
    { id: 'example-user-1', role: 'user', content: '¿Qué es la hipertensión arterial y cómo se previene?' },
    { id: 'example-assistant-1', role: 'assistant', content: 'La hipertensión arterial es la elevación persistente de la presión sanguínea. Se previene con dieta saludable, ejercicio, no fumar y controlando el estrés. ¿Quieres más detalles?' },
];


const SUGGESTED_QUESTIONS = [
  '¿Qué es la hipertensión arterial y cómo se previene?',
  '¿Qué es la diabetes tipo 2 y cuál es su tratamiento?',
  '¿Qué vacunas necesita un adulto?',
];


export default function HomePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [pdfVisualUrl, setPdfVisualUrl] = useState<string | null>(null); // For iframe src
  const [pdfDataUri, setPdfDataUri] = useState<string | null>(null); // For sending to Genkit flow
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const [messages, setMessages] = useState<ChatMessage[]>(exampleMessages);
  const [chatInput, setChatInput] = useState('');
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [hasUserSentFirstMessage, setHasUserSentFirstMessage] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const [lastFailedQuestion, setLastFailedQuestion] = useState<string | null>(null);

  // Función para hacer scroll al final
  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        // Usar requestAnimationFrame para asegurar que el DOM se haya actualizado
        requestAnimationFrame(() => {
          viewport.scrollTop = viewport.scrollHeight;
        });
      }
    }
  };

  const clearPdfContext = () => {
    if (pdfVisualUrl) {
      URL.revokeObjectURL(pdfVisualUrl);
    }
    setPdfVisualUrl(null);
    setSelectedFile(null);
    setPdfDataUri(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Reset file input
    }
  };
  
  const handleUploadClick = () => {
    // If a PDF is already loaded for context, clicking again implies changing/clearing it.
    if (pdfDataUri || pdfVisualUrl) {
      clearPdfContext();
    }
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    console.log('=== FILE UPLOAD DEBUG ===');
    console.log('File selected:', file ? file.name : 'None');
    console.log('File type:', file ? file.type : 'N/A');
    console.log('File size:', file ? file.size : 'N/A');

    // Clear any existing PDF context first
    clearPdfContext();

    if (file && file.type === "application/pdf") {
      console.log('✅ Valid PDF file detected, processing...');
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPdfVisualUrl(objectUrl);
      console.log('📄 Object URL created for preview:', objectUrl.substring(0, 50) + '...');

      // Read file as Data URI for Genkit flow
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        if (loadEvent.target?.result) {
          const dataUri = loadEvent.target.result as string;
          console.log('✅ FileReader completed successfully');
          console.log('📊 Data URI length:', dataUri.length);
          console.log('📝 Data URI prefix:', dataUri.substring(0, 100));
          setPdfDataUri(dataUri);
          console.log('=== END FILE UPLOAD DEBUG ===');
        } else {
          console.error("❌ Failed to read file as Data URI");
          alert("Error al leer el archivo PDF para el contexto del chat.");
          clearPdfContext(); // Clear if reading failed
          console.log('=== END FILE UPLOAD DEBUG ===');
        }
      };
      reader.onerror = () => {
        console.error("❌ FileReader error");
        alert("Error al procesar el archivo PDF.");
        clearPdfContext();
        console.log('=== END FILE UPLOAD DEBUG ===');
      };
      reader.readAsDataURL(file);

    } else {
      if (file) {
        console.log('❌ Invalid file type:', file.type);
        alert("Por favor, selecciona un archivo PDF.");
      } else {
        console.log('ℹ️ No file selected or file selection cancelled');
      }
      // Ensure file input is reset if no valid file or cancelled
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      console.log('=== END FILE UPLOAD DEBUG ===');
    }
  };

  useEffect(() => {
    // Cleanup object URL when component unmounts or pdfVisualUrl changes
    return () => {
      if (pdfVisualUrl) {
        URL.revokeObjectURL(pdfVisualUrl);
      }
    };
  }, [pdfVisualUrl]);

  useEffect(() => {
    // Scroll al final automáticamente cuando cambien los mensajes o el estado de carga
    scrollToBottom();
  }, [messages, isLoadingChat]); // Incluir isLoadingChat en las dependencias

  const sendQuestion = async (rawQuestion: string) => {
    const currentMessageContent = rawQuestion.trim();
    if (!currentMessageContent || isLoadingChat) return;

    const userMessageForState: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: currentMessageContent,
    };

    let historyForFlow: { role: 'user' | 'assistant'; content: string }[];
    
    if (!hasUserSentFirstMessage) {
      setMessages([userMessageForState]);
      historyForFlow = []; 
      setHasUserSentFirstMessage(true);
    } else {
      historyForFlow = messages
        .filter(msg => (msg.role === 'user' || msg.role === 'assistant'))
        .map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));
      setMessages(prev => [...prev, userMessageForState]);
    }

    setChatInput('');
    setChatError(null);
    setIsLoadingChat(true);

    // Hacer scroll después de agregar el mensaje del usuario
    setTimeout(scrollToBottom, 100);

    try {
      const apiRequest: ChatApiRequest = {
        question: currentMessageContent,
        history: historyForFlow.length > 0 ? historyForFlow : undefined,
        pdfContextDataUri: pdfDataUri || undefined, // Pass data URI if available
      };
      
      console.log('=== CHAT API DEBUG ===');
      console.log('📤 Sending to chat API:');
      console.log('- Question:', currentMessageContent);
      console.log('- History length:', historyForFlow.length);
      console.log('- Has PDF context:', !!pdfDataUri);
      if (pdfDataUri) {
        console.log('- PDF Data URI length:', pdfDataUri.length);
        console.log('- PDF Data URI prefix:', pdfDataUri.substring(0, 100));
      }
      
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiRequest),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const result: ChatApiResponse = await response.json();
      
      if (result.error) {
        throw new Error(result.error);
      }
      
      console.log('📥 Received from chat API:');
      console.log('- Answer length:', result.answer.length);
      console.log('- Answer preview:', result.answer.substring(0, 100) + (result.answer.length > 100 ? '...' : ''));
      console.log('=== END CHAT API DEBUG ===');
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.answer,
      };
      setMessages(prev => [...prev, assistantMessage]);
      setLastFailedQuestion(null);

      // Hacer scroll después de agregar la respuesta del asistente
      setTimeout(scrollToBottom, 100);

    } catch (error) {
      console.error("Error calling chat flow:", error);
      // Fallback genérico: aunque el servidor falle, el chat siempre responde
      // con una respuesta demo en vez de un mensaje de error.
      let fallback: string;
      try {
        fallback = demoChatReply(currentMessageContent);
      } catch {
        fallback = 'Estoy en modo demo: puedo ayudarte con los apuntes de hipertensión, diabetes tipo 2 y vacunación del adulto. Probá con una de las preguntas sugeridas.';
      }
      const demoMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: fallback,
      };
      setMessages(prev => [...prev, demoMessage]);
      setChatError('Sin conexión con el servidor: te muestro una respuesta demo. Podés reintentar.');
      setLastFailedQuestion(currentMessageContent);
      // Hacer scroll después de agregar mensaje de error
      setTimeout(scrollToBottom, 100);
    } finally {
      setIsLoadingChat(false);
      // Hacer scroll final cuando termine el loading
      setTimeout(scrollToBottom, 150);
    }
  };

  const handleSendMessage = async (event?: FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault();
    await sendQuestion(chatInput);
  };

  const handleSuggestedQuestion = async (question: string) => {
    await sendQuestion(question);
  };

  const handleRetry = async () => {
    if (!lastFailedQuestion) return;
    await sendQuestion(lastFailedQuestion);
  };


  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 p-4 sm:gap-10 sm:p-6">
      {/* Hero */}
      <section aria-labelledby="titulo-inicio" className="mx-auto w-full max-w-3xl text-center">
        <p className="inline-flex items-center gap-1.5 rounded-full border bg-muted/60 px-3 py-1 text-xs font-medium text-muted-foreground sm:text-sm">
          <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden="true" />
          Sin cuenta · Sin configuración · Funciona en modo demo
        </p>
        <h1 id="titulo-inicio" className="mt-4 text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl md:text-5xl">
          Tu Compañero de <span className="underline decoration-primary decoration-4 underline-offset-4">Atención Primaria</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-sm text-muted-foreground sm:text-base md:text-lg">
          Aprende, consulta y mejora tus conocimientos de atención primaria con asistencia de IA.
          Sube un apunte en PDF, practica con autoevaluaciones o explora los recursos.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row sm:gap-3">
          <Button asChild size="lg" className="w-full sm:w-auto">
            <Link href="#asistente">
              <MessageCircle className="mr-2 h-4 w-4" aria-hidden="true" />
              Probar el chat
            </Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="w-full sm:w-auto">
            <Link href="/resources">
              <BookOpen className="mr-2 h-4 w-4" aria-hidden="true" />
              Explorar recursos
            </Link>
          </Button>
        </div>
      </section>

      {/* Accesos directos */}
      <nav aria-label="Secciones principales" className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 xl:grid-cols-4">
        <Link href="#asistente" className="group block rounded-xl focus-visible:outline-none">
          <Card className="flex h-full flex-col shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg group-hover:border-primary/50">
            <CardHeader className="pb-2">
              <div className="mb-3 w-fit rounded-full bg-primary/15 p-3">
                <MessageCircle className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <CardTitle className="text-base sm:text-lg">Chat de IA</CardTitle>
              <CardDescription>Pregunta y obtén respuestas instantáneas. Adjunta un PDF como contexto.</CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto pt-2">
              <span className="inline-flex items-center text-sm font-semibold text-primary">
                Ir al chat
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </CardFooter>
          </Card>
        </Link>

        <Link href="/admin/add-notes" className="group block rounded-xl focus-visible:outline-none">
          <Card className="flex h-full flex-col shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg group-hover:border-primary/50">
            <CardHeader className="pb-2">
              <div className="mb-3 w-fit rounded-full bg-primary/15 p-3">
                <FilePlus2 className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <CardTitle className="text-base sm:text-lg">Apuntes</CardTitle>
              <CardDescription>Sube y organiza tus apuntes en PDF para estudiar y consultar.</CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto pt-2">
              <span className="inline-flex items-center text-sm font-semibold text-primary">
                Agregar apuntes
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </CardFooter>
          </Card>
        </Link>

        <Link href="/self-assessment" className="group block rounded-xl focus-visible:outline-none">
          <Card className="flex h-full flex-col shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg group-hover:border-primary/50">
            <CardHeader className="pb-2">
              <div className="mb-3 w-fit rounded-full bg-primary/15 p-3">
                <ClipboardCheck className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <CardTitle className="text-base sm:text-lg">Autoevaluación</CardTitle>
              <CardDescription>Pon a prueba lo aprendido con cuestionarios interactivos.</CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto pt-2">
              <span className="inline-flex items-center text-sm font-semibold text-primary">
                Evaluarme
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </CardFooter>
          </Card>
        </Link>

        <Link href="/resources" className="group block rounded-xl focus-visible:outline-none">
          <Card className="flex h-full flex-col shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg group-hover:border-primary/50">
            <CardHeader className="pb-2">
              <div className="mb-3 w-fit rounded-full bg-primary/15 p-3">
                <BookOpen className="h-5 w-5 text-primary" aria-hidden="true" />
              </div>
              <CardTitle className="text-base sm:text-lg">Recursos</CardTitle>
              <CardDescription>Guías, videos, imágenes y artículos seleccionados.</CardDescription>
            </CardHeader>
            <CardFooter className="mt-auto pt-2">
              <span className="inline-flex items-center text-sm font-semibold text-primary">
                Ver recursos
                <ArrowRight className="ml-1.5 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </CardFooter>
          </Card>
        </Link>
      </nav>

      <section id="asistente" aria-labelledby="titulo-asistente" className="scroll-mt-24">
        <div className="mb-4 text-center sm:mb-6">
          <h2 id="titulo-asistente" className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
            Asistente y visor de apuntes
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
            Escribe tu pregunta abajo o carga un PDF para usarlo como contexto del chat.
          </p>
        </div>
      <div className="grid grid-cols-1 gap-4 sm:gap-6 lg:grid-cols-2">
        {/* AI Chat Assistant Column */}
        <Card className="flex flex-col shadow-lg rounded-xl h-[500px] sm:h-[600px] lg:h-[700px]">
          <CardHeader className="flex-shrink-0 border-b">
            <CardTitle className="flex items-center gap-2 font-headline text-lg sm:text-xl">
              <MessageCircle className="text-accent h-5 w-5 sm:h-6 sm:w-6" />
              Asistente de Chat IA
              <span className="ml-auto rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-100">
                Modo demo
              </span>
            </CardTitle>
            <CardDescription className="text-sm">Haz preguntas y obtén información instantánea sobre temas de atención primaria. Respuestas de demostración con fines educativos.</CardDescription>
            <div className="mt-2 flex flex-wrap gap-2" aria-label="Preguntas sugeridas">
              {SUGGESTED_QUESTIONS.map((q) => (
                <Button
                  key={q}
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  disabled={isLoadingChat}
                  onClick={() => handleSuggestedQuestion(q)}
                >
                  {q}
                </Button>
              ))}
            </div>
             {pdfDataUri && selectedFile && (
              <div className="mt-2 flex items-center gap-2 rounded-md border border-green-200 bg-green-100 p-2 text-xs text-green-800 sm:text-sm dark:border-green-800 dark:bg-green-950 dark:text-green-200">
                <FileCheck2 className="h-4 w-4 flex-shrink-0 sm:h-5 sm:w-5" aria-hidden="true" />
                <span className="truncate">PDF: &ldquo;{selectedFile.name}&rdquo; cargado y se usará como contexto.</span>
              </div>
            )}
          </CardHeader>
          <CardContent className="flex-grow flex flex-col p-0 overflow-hidden">
            <ScrollArea className="flex-grow h-full p-3 sm:p-4 lg:p-6" ref={scrollAreaRef}>
              <div className="space-y-3 sm:space-y-4 pb-4">{/* Agregar padding bottom */}
                {messages.map((msg) => (
                  <div key={msg.id} className={cn("flex items-start gap-2 sm:gap-3", msg.role === 'user' && "justify-end")}>
                    {msg.role === 'assistant' && (
                      <div className="p-1.5 sm:p-2 bg-primary/20 rounded-full flex-shrink-0">
                        <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      </div>
                    )}
                    <div className={cn(
                      "max-w-[85%] break-words rounded-lg p-2 shadow-sm sm:p-3",
                      msg.role === 'user' ? "bg-primary text-primary-foreground" : "border bg-muted text-foreground"
                    )}>
                      <p className="text-xs sm:text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    {msg.role === 'user' && (
                      <div className="p-1.5 sm:p-2 bg-muted rounded-full flex-shrink-0">
                        <User className="h-4 w-4 sm:h-5 sm:w-5 text-foreground" />
                      </div>
                    )}
                  </div>
                ))}
                {isLoadingChat && (
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="p-1.5 sm:p-2 bg-primary/20 rounded-full flex-shrink-0">
                      <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                    </div>
                    <div className="bg-muted max-w-[75%] rounded-lg border p-2 shadow-sm sm:p-3">
                      <p className="text-xs sm:text-sm animate-pulse">Escribiendo...</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="border-t p-3 sm:p-4 flex-shrink-0">
            <div className="flex w-full flex-col gap-2">
              {chatError && (
                <div className="flex items-center justify-between gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-2 text-xs sm:text-sm">
                  <span className="text-destructive">{chatError}</span>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={isLoadingChat || !lastFailedQuestion}
                    onClick={handleRetry}
                  >
                    Reintentar
                  </Button>
                </div>
              )}
              <form onSubmit={handleSendMessage} className="flex w-full items-center gap-2">
              <Input 
                type="text" 
                placeholder="Escribe tu pregunta..." 
                className="flex-grow text-sm"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                disabled={isLoadingChat} 
              />
              <Button type="submit" variant="default" size="icon" aria-label="Enviar pregunta" disabled={isLoadingChat || !chatInput.trim()} className="h-9 w-9 sm:h-10 sm:w-10">
                <Send className="h-4 w-4" />
              </Button>
            </form>
            </div>
          </CardFooter>
        </Card>

        {/* Resource Viewer and Actions Column */}
        <div className="flex flex-col gap-4 sm:gap-6">
          <Card className="shadow-lg rounded-xl">
            {!pdfVisualUrl && (
              <CardHeader>
                <CardTitle className="font-headline text-lg sm:text-xl">Visor de Recursos</CardTitle>
                <CardDescription className="text-sm">Visualiza aquí los materiales educativos cargados.</CardDescription>
              </CardHeader>
            )}
            <CardContent className={cn(
              "rounded-b-xl overflow-hidden",
              pdfVisualUrl && selectedFile ? "p-0" : "p-4 sm:p-6 bg-muted/50"
            )}>
              {pdfVisualUrl && selectedFile ? (
                <iframe
                  src={pdfVisualUrl}
                  className="w-full h-[300px] sm:h-[400px] lg:h-[500px] border-0"
                  title={selectedFile.name}
                  aria-label={`Visor de PDF: ${selectedFile.name}`}
                />
              ) : (
                <div className="relative flex flex-col items-center justify-center h-[150px] sm:h-[200px] text-center">
                  <FileSearch className="h-8 w-8 sm:h-10 sm:w-10 lg:h-12 lg:w-12 text-muted-foreground mb-3 sm:mb-4" />
                  <p className="text-muted-foreground text-sm sm:text-base px-4">
                    Carga un apunte para verlo aquí o para usarlo como contexto en el chat.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-lg rounded-xl">
            {!pdfVisualUrl && (
              <CardHeader>
                <CardTitle className="font-headline text-lg sm:text-xl">Carga</CardTitle>
              </CardHeader>
            )}
            <CardContent className={cn(
              "flex flex-col",
              pdfVisualUrl ? "p-3 sm:p-4" : "gap-3 sm:gap-4 p-4 sm:p-6 pt-0" 
            )}>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".pdf"
                className="hidden"
                aria-hidden="true"
              />
              <Button variant="outline" size="lg" className="w-full text-sm sm:text-base" onClick={handleUploadClick}>
                <Upload className="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
                <span className="truncate">
                  {(pdfVisualUrl || pdfDataUri) ? "Cargar Otro PDF" : "Subir Archivo PDF"}
                </span>
              </Button>

              {!(pdfVisualUrl || pdfDataUri) && !selectedFile && (
                <p className="text-xs text-muted-foreground text-center px-2">
                  Sube archivos PDF para previsualización y/o para dar contexto al chat IA.
                </p>
              )}
              {selectedFile && !pdfVisualUrl && !pdfDataUri && (
                <p className="text-xs text-destructive text-center px-2">
                  El archivo seleccionado no es un PDF válido o no se pudo cargar.
                </p>
              )}
              {(pdfVisualUrl || pdfDataUri) && selectedFile && (
                <Button variant="destructive" size="sm" className="w-full mt-2 text-sm" onClick={clearPdfContext}>
                  <XCircle className="mr-2 h-4 w-4" />
                  <span className="truncate">Quitar PDF</span>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      </section>
    </div>
  );
}

    