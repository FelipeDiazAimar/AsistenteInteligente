
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Image as ImageIconLucide, Download, Search } from "lucide-react";
import NextImage from "next/image";
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
  link?: string; 
  aiHint?: string;
  createdAt?: string; 
}

function mapAppResourceToImageItem(resource: AppResource): ResourceItem {
  return {
    id: resource.id,
    title: resource.title,
    description: resource.description,
    icon: <ImageIconLucide className="h-8 w-8 text-primary" />,
    imageUrl: resource.fileUrl || resource.coverImageUrl || "https://placehold.co/600x400.png",
    // Link is not typically used for direct navigation for images, imageUrl is primary
    link: resource.fileUrl || resource.link || "#", 
    aiHint: resource.aiHint,
    createdAt: resource.createdAt,
  };
}

export default async function ImageResourcesPage({ searchParams }: { searchParams?: { q?: string } }) {
  const searchQuery = searchParams?.q || '';
  let imageResources: ResourceItem[] = [];
  let fetchError: string | null = null;

  try {
    const result = await fetchResourcesAction('image', searchQuery);
    if (result.success && result.data) {
      imageResources = result.data.map(mapAppResourceToImageItem);
    } else {
      fetchError = result.error || "Error desconocido al cargar imágenes.";
    }
  } catch (error) {
    console.error("Error fetching image resources:", error);
    fetchError = error instanceof Error ? error.message : "No se pudieron cargar los recursos de imagen debido a un error inesperado.";
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4 text-center font-headline text-primary">Imágenes Médicas</h1>
      <p className="text-muted-foreground text-center mb-6">
        Explora nuestra galería de imágenes médicas, atlas y diagramas.
      </p>

      <form method="get" action="" className="mb-8 flex flex-col sm:flex-row gap-2 items-center max-w-xl mx-auto">
        <Input
          type="search"
          name="q"
          defaultValue={searchQuery}
          placeholder="Buscar imágenes por título o descripción..."
          className="flex-grow"
          aria-label="Buscar imágenes"
        />
        <Button type="submit" className="w-full sm:w-auto">
          <Search className="h-4 w-4 sm:mr-2" />
          <span className="sm:inline">Buscar</span>
        </Button>
      </form>

      {fetchError && (
        <Card className="mb-6 bg-destructive/10 border-destructive">
          <CardHeader><CardTitle className="text-destructive">Error al Cargar Recursos</CardTitle></CardHeader>
          <CardContent><p>{fetchError}</p></CardContent>
        </Card>
      )}
      {!fetchError && imageResources.length === 0 && (
        <Card className="mb-6 bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {searchQuery
                ? `No se encontraron imágenes para "${searchQuery}". Intenta con otra búsqueda.`
                : "No hay imágenes disponibles. Carga algunas desde la sección de administración."}
            </p>
          </CardContent>
        </Card>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {imageResources.map((resource) => (
          <Card 
            key={resource.id || resource.title} 
            className="flex flex-col overflow-hidden shadow-lg rounded-xl group transition-all duration-300 ease-in-out hover:shadow-2xl hover:scale-105"
          >
            {resource.imageUrl && (
              <div className="relative h-48 w-full">
                <NextImage 
                  src={resource.imageUrl}
                  alt={resource.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className="object-cover"
                  data-ai-hint={resource.aiHint || 'medical illustration'}
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
            {resource.imageUrl && resource.imageUrl !== "#" && !resource.imageUrl.startsWith("https://placehold.co") && (
              <CardFooter 
                className="mt-auto p-0 max-h-0 opacity-0 border-t border-transparent overflow-hidden 
                           group-hover:max-h-24 group-hover:p-4 group-hover:opacity-100 group-hover:border-border 
                           transition-all duration-300 ease-in-out"
              >
                <Button asChild variant="default" className="w-full">
                  <a 
                    href={resource.imageUrl} 
                    download={`${resource.title.replace(/[^a-z0-9_.-]/gi, '_')}.jpg`} // Assuming jpg or let browser decide based on Content-Type
                    aria-label={`Descargar ${resource.title}`}
                    target="_blank" // Good practice for downloads to open in new tab or trigger download directly
                    rel="noopener noreferrer"
                  >
                    Descargar
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
