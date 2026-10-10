"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  FileText,
  Image as ImageIcon,
  Search,
  SearchX,
  Video,
  type LucideIcon,
} from "lucide-react";
import { DEMO_RESOURCES } from "@/lib/demo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface ResourceCategory {
  title: string;
  description: string;
  icon: LucideIcon;
  link: string;
  iconBgClass: string;
  iconTextClass: string;
}

const resourceCategories: ResourceCategory[] = [
  {
    title: "Documentos PDF",
    description: "Guías, protocolos y documentos esenciales en formato PDF.",
    icon: FileText,
    link: "/resources/pdfs",
    iconBgClass: "bg-red-100 group-hover:bg-red-200",
    iconTextClass: "text-red-600 group-hover:text-red-700",
  },
  {
    title: "Videos Educativos",
    description: "Tutoriales, conferencias y demostraciones prácticas en video.",
    icon: Video,
    link: "/resources/videos",
    iconBgClass: "bg-blue-100 group-hover:bg-blue-200",
    iconTextClass: "text-blue-600 group-hover:text-blue-700",
  },
  {
    title: "Imágenes Médicas",
    description: "Atlas, diagramas e imágenes de apoyo para el estudio.",
    icon: ImageIcon,
    link: "/resources/images",
    iconBgClass: "bg-green-100 group-hover:bg-green-200",
    iconTextClass: "text-green-600 group-hover:text-green-700",
  },
  {
    title: "Artículos y Publicaciones",
    description: "Artículos y revisiones de interés en atención primaria.",
    icon: BookOpen,
    link: "/resources/articles",
    iconBgClass: "bg-yellow-100 group-hover:bg-yellow-200",
    iconTextClass: "text-yellow-600 group-hover:text-yellow-700",
  },
];

type TipoFiltro = "todos" | "pdf" | "video" | "articulo" | "imagen";

const FILTROS: { value: TipoFiltro; label: string }[] = [
  { value: "todos", label: "Todos" },
  { value: "pdf", label: "PDF" },
  { value: "video", label: "Videos" },
  { value: "articulo", label: "Artículos" },
  { value: "imagen", label: "Imágenes" },
];

const ICONO_POR_TIPO: Record<string, LucideIcon> = {
  pdf: FileText,
  video: Video,
  articulo: BookOpen,
  imagen: ImageIcon,
};

const ETIQUETA_POR_TIPO: Record<string, string> = {
  pdf: "PDF",
  video: "Video",
  articulo: "Artículo",
  imagen: "Imagen",
};

const RUTA_POR_TIPO: Record<string, string> = {
  pdf: "/resources/pdfs",
  video: "/resources/videos",
  articulo: "/resources/articles",
  imagen: "/resources/images",
};

export default function ResourcesOverviewPage() {
  const [tipo, setTipo] = useState<TipoFiltro>("todos");
  const [busqueda, setBusqueda] = useState("");

  const recursos = useMemo(
    () => (Array.isArray(DEMO_RESOURCES) ? DEMO_RESOURCES : []),
    []
  );

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    return recursos.filter((r) => {
      const coincideTipo = tipo === "todos" || r.tipo === tipo;
      if (!coincideTipo) return false;
      if (!q) return true;
      return (
        r.titulo.toLowerCase().includes(q) ||
        r.descripcion.toLowerCase().includes(q)
      );
    });
  }, [recursos, tipo, busqueda]);

  const limpiarFiltros = () => {
    setTipo("todos");
    setBusqueda("");
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-10 text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-primary md:text-5xl">
          Recursos educativos
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground md:text-xl">
          Material de apoyo para tu aprendizaje en atención primaria. Explora
          por categoría o filtra la lista demo por tipo.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {resourceCategories.map((category) => {
          const Icon = category.icon;
          return (
            <Link
              href={category.link}
              key={category.title}
              className="group block rounded-xl border border-transparent bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-2xl"
            >
              <Card className="flex h-full flex-col border-0 shadow-none">
                <CardHeader className="pb-3">
                  <div
                    className={`mb-4 w-fit rounded-full p-3 transition-colors duration-300 ${category.iconBgClass}`}
                  >
                    <Icon className={`h-8 w-8 ${category.iconTextClass}`} />
                  </div>
                  <CardTitle className="font-headline text-2xl font-bold text-card-foreground transition-colors duration-300 group-hover:text-primary">
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow">
                  <p className="text-sm text-muted-foreground">
                    {category.description}
                  </p>
                </CardContent>
                <CardFooter className="p-6 pt-2">
                  <span className="flex items-center text-sm font-semibold text-primary">
                    Explorar {category.title.toLowerCase()}
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                  </span>
                </CardFooter>
              </Card>
            </Link>
          );
        })}
      </div>

      <section aria-label="Recursos disponibles en modo demo" className="mt-14">
        <div className="mb-6 text-center">
          <h2 className="font-headline text-2xl font-bold text-primary md:text-3xl">
            Recursos disponibles (demo)
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-muted-foreground">
            Lista de demostración cargada desde el contrato demo. Usa los
            filtros por tipo o busca por título.
          </p>
        </div>

        <div className="mx-auto mb-6 flex max-w-xl flex-col gap-2 sm:flex-row sm:items-center">
          <div className="relative flex-grow">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por título o descripción…"
              aria-label="Buscar recursos demo"
              className="pl-9"
            />
          </div>
        </div>

        <div
          className="mb-6 flex flex-wrap justify-center gap-2"
          role="group"
          aria-label="Filtrar por tipo"
        >
          {FILTROS.map((f) => (
            <Button
              key={f.value}
              type="button"
              variant={tipo === f.value ? "default" : "outline"}
              size="sm"
              onClick={() => setTipo(f.value)}
              aria-pressed={tipo === f.value}
              className="rounded-full"
            >
              {f.label}
            </Button>
          ))}
        </div>

        <p
          className="mb-4 text-center text-sm text-muted-foreground"
          aria-live="polite"
        >
          Mostrando {filtrados.length} de {recursos.length} recursos
          {tipo !== "todos" ? ` · filtro: ${ETIQUETA_POR_TIPO[tipo]}` : ""}
          {busqueda.trim() ? ` · búsqueda: “${busqueda.trim()}”` : ""}
        </p>

        {recursos.length === 0 ? (
          <Card className="mx-auto max-w-xl bg-muted/50">
            <CardContent className="flex flex-col items-center gap-3 px-6 py-10 text-center">
              <span className="rounded-full bg-primary/10 p-4">
                <BookOpen className="h-8 w-8 text-primary" />
              </span>
              <p className="text-lg font-semibold">
                Sin recursos por el momento
              </p>
              <p className="text-sm text-muted-foreground">
                No se pudo cargar el material de demostración. Intenta recargar
                la página más tarde.
              </p>
            </CardContent>
          </Card>
        ) : filtrados.length === 0 ? (
          <Card className="mx-auto max-w-xl bg-muted/50">
            <CardContent className="flex flex-col items-center gap-3 px-6 py-10 text-center">
              <span className="rounded-full bg-primary/10 p-4">
                <SearchX className="h-8 w-8 text-primary" />
              </span>
              <p className="text-lg font-semibold">Sin resultados</p>
              <p className="text-sm text-muted-foreground">
                No hay recursos que coincidan con ese filtro o búsqueda. Prueba
                con otros términos.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={limpiarFiltros}
              >
                Limpiar filtros
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtrados.map((r) => {
              const Icon = ICONO_POR_TIPO[r.tipo] ?? BookOpen;
              const esDemo = !r.url || r.url === "#";
              return (
                <Card
                  key={r.id}
                  className="flex flex-col rounded-xl shadow-lg transition-all duration-300 hover:border-primary/50 hover:shadow-2xl"
                >
                  <CardHeader className="flex flex-row items-start gap-4 p-4 pb-2">
                    <span className="rounded-full bg-primary/10 p-2.5">
                      <Icon className="h-6 w-6 text-primary" />
                    </span>
                    <div className="min-w-0">
                      <CardTitle className="font-headline text-lg font-semibold leading-snug">
                        {r.titulo}
                      </CardTitle>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="secondary">
                          {ETIQUETA_POR_TIPO[r.tipo] ?? r.tipo}
                        </Badge>
                        {esDemo && (
                          <Badge variant="outline">Contenido demo</Badge>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow p-4 pt-2">
                    <p className="line-clamp-3 text-sm text-muted-foreground">
                      {r.descripcion}
                    </p>
                  </CardContent>
                  <CardFooter className="flex gap-2 p-4 pt-0">
                    {esDemo ? (
                      <Button type="button" variant="outline" className="w-full" disabled>
                        Recurso de muestra
                      </Button>
                    ) : (
                      <Button asChild className="w-full">
                        <a
                          href={r.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Abrir recurso
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {RUTA_POR_TIPO[r.tipo] && (
                      <Button asChild variant="ghost" size="sm">
                        <Link href={RUTA_POR_TIPO[r.tipo]} aria-label={`Ver más de tipo ${ETIQUETA_POR_TIPO[r.tipo] ?? r.tipo}`}>
                          Ver más
                        </Link>
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
