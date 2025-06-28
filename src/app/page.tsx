
"use client";

import { useState, useRef, type ChangeEvent, useEffect, type FormEvent } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Upload, Send, MessageCircle, User, Bot, FileSearch, XCircle, FileCheck2 } from "lucide-react";
import { cn } from '@/lib/utils';
import { primaryCareChat, type PrimaryCareChatInput, type PrimaryCareChatOutput } from '@/ai/flows/primary-care-chat-flow';

interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
}

const exampleMessages: ChatMessage[] = [
    { id: 'initial-greeting', role: 'assistant', content: '¡Hola! ¿Cómo puedo ayudarte hoy con temas de atención primaria?' },
    { id: 'example-user-1', role: 'user', content: '¿Qué es la hipertensión arterial y cómo se previene?' },
    { id: 'example-assistant-1', role: 'assistant', content: 'La hipertensión arterial es la elevación persistente de la presión sanguínea. Se previene con dieta saludable, ejercicio, no fumar y controlando el estrés. ¿Quieres más detalles?' },
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

    // Clear any existing PDF context first
    clearPdfContext();

    if (file && file.type === "application/pdf") {
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPdfVisualUrl(objectUrl);

      // Read file as Data URI for Genkit flow
      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        if (loadEvent.target?.result) {
          setPdfDataUri(loadEvent.target.result as string);
        } else {
          console.error("Failed to read file as Data URI");
          alert("Error al leer el archivo PDF para el contexto del chat.");
          clearPdfContext(); // Clear if reading failed
        }
      };
      reader.onerror = () => {
        console.error("FileReader error");
        alert("Error al procesar el archivo PDF.");
        clearPdfContext();
      };
      reader.readAsDataURL(file);

    } else {
      if (file) {
        alert("Por favor, selecciona un archivo PDF.");
      }
      // Ensure file input is reset if no valid file or cancelled
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
    if (scrollAreaRef.current) {
      const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
      if (viewport) {
        viewport.scrollTop = viewport.scrollHeight;
      }
    }
  }, [messages]);

  const handleSendMessage = async (event?: FormEvent<HTMLFormElement>) => {
    if (event) event.preventDefault();
    const currentMessageContent = chatInput.trim();
    if (!currentMessageContent) return;

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
    setIsLoadingChat(true);

    try {
      const flowInput: PrimaryCareChatInput = {
        question: currentMessageContent,
        history: historyForFlow.length > 0 ? historyForFlow : undefined,
        pdfContextDataUri: pdfDataUri || undefined, // Pass data URI if available
      };
      
      const result: PrimaryCareChatOutput = await primaryCareChat(flowInput);
      
      const assistantMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: result.answer,
      };
      setMessages(prev => [...prev, assistantMessage]);

    } catch (error) {
      console.error("Error calling chat flow:", error);
      const errorMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Lo siento, ha ocurrido un error al procesar tu solicitud.',
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoadingChat(false);
    }
  };


  return (
    <div className="flex flex-col gap-6 sm:gap-8 p-4 sm:p-6 max-w-7xl mx-auto">
      <section className="text-center">
        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold tracking-tight font-headline text-primary">
          Bienvenido a Tu Compañero de Atención Primaria
        </h1>
        <p className="mt-4 text-base sm:text-lg md:text-xl text-muted-foreground px-4">
          Aprende, consulta y mejora tus conocimientos de atención primaria con asistencia de IA.
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* AI Chat Assistant Column */}
        <Card className="flex flex-col shadow-lg rounded-xl h-[500px] sm:h-[600px] lg:h-[700px]">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="flex items-center gap-2 font-headline text-lg sm:text-xl">
              <MessageCircle className="text-accent h-5 w-5 sm:h-6 sm:w-6" />
              Asistente de Chat IA
            </CardTitle>
            <CardDescription className="text-sm">Haz preguntas y obtén información instantánea sobre temas de atención primaria.</CardDescription>
             {pdfDataUri && selectedFile && (
              <div className="mt-2 p-2 text-xs sm:text-sm bg-green-100 text-green-700 rounded-md flex items-center gap-2">
                <FileCheck2 className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
                <span className="truncate">PDF: "{selectedFile.name}" cargado y se usará como contexto.</span>
              </div>
            )}
          </CardHeader>
          <CardContent className="flex-grow flex flex-col p-0">
            <ScrollArea className="flex-grow min-h-0 p-3 sm:p-4 lg:p-6" ref={scrollAreaRef}>
              <div className="space-y-3 sm:space-y-4">
                {messages.map((msg) => (
                  <div key={msg.id} className={cn("flex items-start gap-2 sm:gap-3", msg.role === 'user' && "justify-end")}>
                    {msg.role === 'assistant' && (
                      <div className="p-1.5 sm:p-2 bg-primary/20 rounded-full flex-shrink-0">
                        <Bot className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                      </div>
                    )}
                    <div className={cn(
                      "p-2 sm:p-3 rounded-lg shadow-sm max-w-[85%] break-words",
                      msg.role === 'user' ? "bg-accent/80 text-accent-foreground" : "bg-muted text-foreground"
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
                    <div className="bg-muted p-2 sm:p-3 rounded-lg shadow-sm max-w-[75%]">
                      <p className="text-xs sm:text-sm animate-pulse">Escribiendo...</p>
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </CardContent>
          <CardFooter className="border-t p-3 sm:p-4 flex-shrink-0">
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
    </div>
  );
}

    