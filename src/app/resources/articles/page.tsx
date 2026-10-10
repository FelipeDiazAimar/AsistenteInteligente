import Link from "next/link";
import { ArrowLeft, BookOpen, Search, SearchX } from "lucide-react";
import { DEMO_RESOURCES } from "@/lib/demo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

export default async function ArticleResourcesPage({
  searchParams,
}: {
  searchParams?: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  const searchQuery = (params?.q ?? "").trim();
  const q = searchQuery.toLowerCase();

  const recursos = (Array.isArray(DEMO_RESOURCES) ? DEMO_RESOURCES : []).filter(
    (r) =>
      r.tipo === "articulo" &&
      (!q ||
        r.titulo.toLowerCase().includes(q) ||
        r.descripcion.toLowerCase().includes(q))
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link href="/resources">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a recursos
        </Link>
      </Button>

      <h1 className="mb-4 text-center font-headline text-3xl font-bold text-primary">
        Artículos y publicaciones
      </h1>
      <p className="mb-6 text-center text-muted-foreground">
        Lecturas recomendadas para profundizar en atención primaria (contenido
        demo).
      </p>

      <form
        method="get"
        action=""
        className="mx-auto mb-8 flex max-w-xl flex-col items-center gap-2 sm:flex-row"
      >
        <Input
          type="search"
          name="q"
          defaultValue={searchQuery}
          placeholder="Buscar artículos por título o descripción…"
          className="flex-grow"
          aria-label="Buscar artículos"
        />
        <Button type="submit" className="w-full sm:w-auto">
          <Search className="h-4 w-4 sm:mr-2" />
          <span>Buscar</span>
        </Button>
      </form>

      <p className="mb-4 text-center text-sm text-muted-foreground" aria-live="polite">
        Mostrando {recursos.length} artículo{recursos.length === 1 ? "" : "s"}
        {searchQuery ? ` para “${searchQuery}”` : ""}
      </p>

      {recursos.length === 0 ? (
        <Card className="mx-auto max-w-xl bg-muted/50">
          <CardContent className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <span className="rounded-full bg-primary/10 p-4">
              <SearchX className="h-8 w-8 text-primary" />
            </span>
            <p className="text-lg font-semibold">Sin artículos para mostrar</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? `No se encontraron artículos para “${searchQuery}”. Prueba con otra búsqueda.`
                : "Aún no hay artículos en el material demo."}
            </p>
            <Button asChild variant="outline" size="sm">
              <Link href="/resources">Ver todos los recursos</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {recursos.map((resource) => (
            <Card
              key={resource.id}
              className="flex h-full flex-col rounded-xl shadow-lg transition-all duration-300 hover:border-primary/50 hover:shadow-2xl"
            >
              <CardHeader className="flex flex-row items-center gap-4 p-4">
                <span className="rounded-full bg-primary/10 p-2.5">
                  <BookOpen className="h-6 w-6 text-primary" />
                </span>
                <div>
                  <CardTitle className="font-headline text-lg font-semibold leading-snug">
                    {resource.titulo}
                  </CardTitle>
                  <div className="mt-2 flex gap-2">
                    <Badge variant="secondary">Artículo</Badge>
                    <Badge variant="outline">Demo</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow p-4 pt-0">
                <p className="line-clamp-3 text-sm text-muted-foreground">
                  {resource.descripcion}
                </p>
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button type="button" variant="outline" className="w-full" disabled>
                  Recurso de muestra
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
