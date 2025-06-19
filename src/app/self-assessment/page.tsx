
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight, ClipboardCheck, Search } from 'lucide-react';
import Link from "next/link";
import type { ReactNode } from "react";
import { fetchResourcesAction, type ClientResource as AppResource } from '@/app/admin/add-notes/actions'; 
import { Input } from "@/components/ui/input";


interface AssessmentItem {
  id: string; 
  title: string;
  description: string;
  googleFormUrl: string;
  icon: ReactNode;
  createdAt?: string; 
}

function mapAppResourceToAssessmentItem(resource: AppResource): AssessmentItem {
  return {
    id: resource.id,
    title: resource.title,
    description: resource.description,
    googleFormUrl: resource.googleFormUrl || resource.link || "#", 
    icon: <ClipboardCheck className="h-8 w-8 text-primary" />,
    createdAt: resource.createdAt,
  };
}


export default async function SelfAssessmentPage({ searchParams }: { searchParams?: { q?: string } }) {
  const searchQuery = searchParams?.q || '';
  let assessmentItems: AssessmentItem[] = [];
  let fetchError: string | null = null;

  try {
    const result = await fetchResourcesAction('assessment', searchQuery);
    if (result.success && result.data) {
      assessmentItems = result.data.map(mapAppResourceToAssessmentItem);
    } else {
      fetchError = result.error || "Error desconocido al cargar autoevaluaciones.";
    }
  } catch (error) {
    console.error("Error fetching assessment resources:", error);
    fetchError = error instanceof Error ? error.message : "No se pudieron cargar las autoevaluaciones debido a un error inesperado.";
  }

  return (
    <div className="container mx-auto py-8">
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold tracking-tight font-headline text-primary md:text-5xl">
          Autoevaluaciones Interactivas
        </h1>
        <p className="mt-4 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
          Complete las siguientes evaluaciones para consolidar su aprendizaje y prepararse para futuras instancias. Cada cuestionario se abrirá en una nueva pestaña.
        </p>
      </header>

      <form method="get" action="" className="mb-12 flex flex-col sm:flex-row gap-2 items-center max-w-xl mx-auto">
        <Input
          type="search"
          name="q"
          defaultValue={searchQuery}
          placeholder="Buscar autoevaluaciones..."
          className="flex-grow"
          aria-label="Buscar autoevaluaciones"
        />
        <Button type="submit" className="w-full sm:w-auto">
          <Search className="h-4 w-4 sm:mr-2" />
          <span className="sm:inline">Buscar</span>
        </Button>
      </form>
      
      {fetchError && (
        <Card className="mb-6 bg-destructive/10 border-destructive">
          <CardHeader><CardTitle className="text-destructive">Error al Cargar Evaluaciones</CardTitle></CardHeader>
          <CardContent><p>{fetchError}</p></CardContent>
        </Card>
      )}
      {!fetchError && assessmentItems.length === 0 && (
         <Card className="mb-6 bg-muted/50">
          <CardContent className="pt-6">
            <p className="text-center text-muted-foreground">
              {searchQuery
                ? `No se encontraron autoevaluaciones para "${searchQuery}". Intenta con otra búsqueda.`
                : "No hay autoevaluaciones disponibles. Carga algunas desde la sección de administración."}
            </p>
          </CardContent>
        </Card>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {assessmentItems.map((item) => (
          <Card key={item.id} className="shadow-lg rounded-xl flex flex-col hover:shadow-2xl transition-all duration-300 hover:border-primary/50 border-transparent border group">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-4 mb-3">
                <div className="p-3 bg-primary/10 rounded-full w-fit transition-colors duration-300 group-hover:bg-primary/20">
                   {item.icon}
                </div>
                <CardTitle className="text-xl font-bold font-headline text-card-foreground group-hover:text-primary transition-colors duration-300">
                  {item.title}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex-grow">
              <CardDescription className="text-sm text-muted-foreground line-clamp-3">
                {item.description}
              </CardDescription>
              {item.createdAt && (
                <p className="text-xs text-muted-foreground mt-2">
                  Subido: {new Date(item.createdAt).toLocaleDateString()}
                </p>
              )}
            </CardContent>
            <CardFooter className="pt-4">
              <Button asChild className="w-full group-hover:bg-primary/90 transition-colors duration-300" disabled={item.googleFormUrl === "#"}>
                <Link href={item.googleFormUrl} target="_blank" rel="noopener noreferrer">
                  Iniciar Evaluación
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
