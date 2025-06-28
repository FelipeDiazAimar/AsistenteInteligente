
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Video as VideoIconLucide, Search } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { fetchResourcesAction, type ClientResource as AppResource } from '@/app/admin/add-notes/actions'; 
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

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

function mapAppResourceToVideoItem(resource: AppResource): ResourceItem {
  return {
    id: resource.id,
    title: resource.title,
    description: resource.description,
    icon: <VideoIconLucide className="h-8 w-8 text-primary" />,
    imageUrl: resource.coverImageUrl || "https://placehold.co/300x200.png",
    link: resource.link || resource.fileUrl || "#", 
    aiHint: resource.aiHint,
    createdAt: resource.createdAt,
  };
}

export default async function VideoResourcesPage({ searchParams }: { searchParams?: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const searchQuery = params?.q || '';
  let videoResources: ResourceItem[] = [];
  let fetchError: string | null = null;

  try {
    const result = await fetchResourcesAction('video', searchQuery);
     if (result.success && result.data) {
      videoResources = result.data.map(mapAppResourceToVideoItem);
    } else {
      fetchError = result.error || "Error desconocido al cargar videos.";
    }
  } catch (error) {
    console.error("Error fetching video resources:", error);
    fetchError = error instanceof Error ? error.message : "No se pudieron cargar los recursos de video debido a un error inesperado.";
  }

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4 text-center font-headline text-primary">Videos Educativos</h1>
      <p className="text-muted-foreground text-center mb-6">
        Aprende con demostraciones visuales, tutoriales y conferencias grabadas.
      </p>

      <form method="get" action="" className="mb-8 flex flex-col sm:flex-row gap-2 items-center max-w-xl mx-auto">
        <Input
          type="search"
          name="q"
          defaultValue={searchQuery}
          placeholder="Buscar videos por título o descripción..."
          className="flex-grow"
          aria-label="Buscar videos"
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
      {!fetchError && videoResources.length === 0 && (
         <Card className="mb-6 bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {searchQuery
                ? `No se encontraron videos para "${searchQuery}". Intenta con otra búsqueda.`
                : "No hay videos disponibles. Carga algunos desde la sección de administración."}
            </p>
          </CardContent>
        </Card>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {videoResources.map((resource) => (
          <Link href={resource.link} key={resource.id || resource.title} legacyBehavior>
            <a className="block hover:shadow-xl transition-shadow duration-300 rounded-xl" target={resource.link !== "#" ? "_blank": undefined} rel="noopener noreferrer">
              <Card className="h-full flex flex-col overflow-hidden shadow-lg rounded-xl">
                {resource.imageUrl && (
                  <div className="relative h-48 w-full">
                    <Image
                      src={resource.imageUrl}
                      alt={resource.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover"
                      data-ai-hint={resource.aiHint || 'education video'}
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
              </Card>
            </a>
          </Link>
        ))}
      </div>
    </div>
  );
}
