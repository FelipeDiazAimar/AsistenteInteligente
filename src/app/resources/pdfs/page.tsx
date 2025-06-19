
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { FileText, Download, Search } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import type { ReactNode } from "react";
import { fetchResourcesAction, type ClientResource as AppResource } from '@/app/admin/add-notes/actions'; 
import { Input } from "@/components/ui/input";

interface ResourceItem {
  id?: string;
  title: string;
  description: string;
  icon: ReactNode;
  imageUrl?: string;
  link: string; 
  aiHint?: string;
  createdAt?: string; 
}

function mapAppResourceToPdfItem(resource: AppResource): ResourceItem {
  return {
    id: resource.id,
    title: resource.title,
    description: resource.description,
    icon: <FileText className="h-8 w-8 text-primary" />,
    imageUrl: resource.coverImageUrl || "https://placehold.co/300x200.png", 
    link: resource.fileUrl || resource.link || "#", 
    aiHint: resource.aiHint,
    createdAt: resource.createdAt,
  };
}


export default async function PdfResourcesPage({ searchParams }: { searchParams?: { q?: string } }) {
  const searchQuery = searchParams?.q || '';
  let pdfResources: ResourceItem[] = [];
  let fetchError: string | null = null;

  try {
    const result = await fetchResourcesAction('pdf', searchQuery);
    if (result.success && result.data) {
      pdfResources = result.data.map(mapAppResourceToPdfItem);
    } else {
      fetchError = result.error || "Error desconocido al cargar PDFs.";
    }
  } catch (error) {
    console.error("Error fetching PDF resources:", error);
    fetchError = error instanceof Error ? error.message : "No se pudieron cargar los recursos PDF debido a un error inesperado.";
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4 text-center font-headline text-primary">Documentos PDF</h1>
      <p className="text-muted-foreground text-center mb-6">
        Consulta guías, protocolos y manuales esenciales para tu práctica clínica.
      </p>

      <form method="get" action="" className="mb-8 flex flex-col sm:flex-row gap-2 items-center max-w-xl mx-auto">
        <Input
          type="search"
          name="q"
          defaultValue={searchQuery}
          placeholder="Buscar PDFs por título o descripción..."
          className="flex-grow"
          aria-label="Buscar PDFs"
        />
        <Button type="submit" className="w-full sm:w-auto">
          <Search className="h-4 w-4 sm:mr-2" />
          <span className="sm:inline">Buscar</span>
        </Button>
      </form>

      {fetchError && (
        <Card className="mb-6 bg-destructive/10 border-destructive">
          <CardHeader>
            <CardTitle className="text-destructive">Error al Cargar Recursos</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{fetchError}</p>
          </CardContent>
        </Card>
      )}
      {!fetchError && pdfResources.length === 0 && (
         <Card className="mb-6 bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {searchQuery
                ? `No se encontraron PDFs para "${searchQuery}". Intenta con otra búsqueda.`
                : "No hay documentos PDF disponibles. Carga algunos desde la sección de administración."}
            </p>
          </CardContent>
        </Card>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pdfResources.map((resource) => (
          <Card 
            key={resource.id || resource.title} 
            className="flex flex-col overflow-hidden shadow-lg rounded-xl group transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-105"
          >
            {resource.imageUrl && (
              <div className="relative h-48 w-full">
                <Image
                  src={resource.imageUrl}
                  alt={resource.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  data-ai-hint={resource.aiHint || 'document study'}
                />
              </div>
            )}
            <CardHeader className="flex flex-row items-center gap-4 p-4">
              {resource.icon}
              <div>
                <CardTitle className="text-lg font-semibold font-headline">{resource.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-grow p-4 pt-0">
              <p className="text-sm text-muted-foreground line-clamp-3">{resource.description}</p>
              {resource.createdAt && (
                <p className="text-xs text-muted-foreground mt-2">
                  Subido: {new Date(resource.createdAt).toLocaleDateString()}
                </p>
              )}
            </CardContent>
            {resource.link && resource.link !== "#" && (
              <CardFooter 
                className="mt-auto p-0 max-h-0 opacity-0 border-t border-transparent overflow-hidden 
                           group-hover:max-h-24 group-hover:p-4 group-hover:opacity-100 group-hover:border-border 
                           transition-all duration-300 ease-in-out"
              >
                <Button asChild variant="default" className="w-full">
                  <a 
                    href={resource.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    download={resource.link.startsWith('/uploads/mock/') || resource.link.startsWith('/sample-docs/') ? resource.title.replace(/[^a-z0-9_.-]/gi, '_') + '.pdf' : undefined} 
                    aria-label={`Ver o Descargar ${resource.title}`}
                  >
                    Ver / Descargar PDF
                    <Download className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              </CardFooter>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}
