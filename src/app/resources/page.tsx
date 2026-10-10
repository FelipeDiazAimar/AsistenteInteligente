"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BookOpen,
  FileText,
  Image as ImageIcon,
  NotebookPen,
  Search,
  SearchX,
  Video,
  type LucideIcon,
} from "lucide-react";
import { DEMO_NOTES, DEMO_RESOURCES } from "@/lib/demo";
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
  tipo: "pdf" | "video" | "imagen" | "articulo" | "apunte";
  iconBgClass: string;
  iconTextClass: string;
}

const resourceCategories: ResourceCategory[] = [
  {
    title: "Documentos PDF",
    description: "Guías, protocolos y documentos esenciales en formato PDF.",
    icon: FileText,
    link: "/resources/pdfs",
    tipo: "pdf",
    iconBgClass: "bg-red-100 group-hover:bg-red-200",
    iconTextClass: "text-red-600 group-hover:text-red-700",
  },
  {
    title: "Videos Educativos",
    description: "Tutoriales, conferencias y demostraciones prácticas en video.",
    icon: Video,
    link: "/resources/videos",
    tipo: "video",
    iconBgClass: "bg-blue-100 group-hover:bg-blue-200",
    iconTextClass: "text-blue-600 group-hover:text-blue-700",
  },
  {
    title: "Imágenes Médicas",
    description: "Atlas, diagramas e imágenes de apoyo para el estudio.",
    icon: ImageIcon,
    link: "/resources/images",
    tipo: "imagen",
    iconBgClass: "bg-green-100 group-hover:bg-green-200",
    iconTextClass: "text-green-600 group-hover:text-green-700",
  },
  {
    title: "Artículos y Publicaciones",
    description: "Artículos y revisiones de interés en atención primaria.",
    icon: BookOpen,
    link: "/resources/articles",
    tipo: "articulo",
    iconBgClass: "bg-yellow-100 group-hover:bg-yellow-200",
    iconTextClass: "text-yellow-600 group-hover:text-yellow-700",
  },
  {
    title: "Apuntes",
    description: "Apuntes de estudio en texto para repasar y agregar los tuyos.",
    icon: NotebookPen,
    link: "/resources/apuntes",
    tipo: "apunte",
    iconBgClass: "bg-purple-100 group-hover:bg-purple-200",
    iconTextClass: "text-purple-600 group-hover:text-purple-700",
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

const CLAVES_POR_TIPO: Record<string, string> = {
  pdf: "asistente-demo-pdfs-v1",
  video: "asistente-demo-videos-v1",
  articulo: "asistente-demo-articles-v1",
  imagen: "asistente-demo-images-v1",
};

const APUNTES_STORAGE_KEY = "asistente-demo-notes-v1";

function leerConteoApuntesMios(): number {
  try {
    if (typeof window === "undefined") return 0;
    const crudo = window.localStorage.getItem(APUNTES_STORAGE_KEY);
    if (!crudo) return 0;
    const parsed: unknown = JSON.parse(crudo);
    if (!Array.isArray(parsed)) return 0;
    // Mismo criterio que src/app/resources/apuntes/page.tsx: título y contenido no vacíos.
    return parsed.filter((item): item is Record<string, unknown> => {
      if (typeof item !== "object" || item === null) return false;
      const r = item as Record<string, unknown>;
      return (
        typeof r.titulo === "string" &&
        (r.titulo as string).trim().length > 0 &&
        typeof r.contenido === "string" &&
        (r.contenido as string).trim().length > 0
      );
    }).length;
  } catch {
    return 0;
  }
}

interface RecursoVista {
  id: string;
  tipo: string;
  titulo: string;
  descripcion: string;
  url: string;
  esMio: boolean;
}

function leerMiosPorTipo(tipo: string): RecursoVista[] {
  try {
    if (typeof window === "undefined") return [];
    const clave = CLAVES_POR_TIPO[tipo];
    if (!clave) return [];
    const crudo = window.localStorage.getItem(clave);
    if (!crudo) return [];
    const parsed: unknown = JSON.parse(crudo);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((item): item is Record<string, unknown> => {
        if (typeof item !== "object" || item === null) return false;
        const r = item as Record<string, unknown>;
        return (
          typeof r.id === "string" &&
          typeof r.titulo === "string" &&
          (r.titulo as string).trim().length > 0
        );
      })
      .map((r) => ({
        id: String(r.id),
        tipo,
        titulo: String(r.titulo ?? "Recurso sin título"),
        descripcion: typeof r.descripcion === "string" ? String(r.descripcion) : "",
        url: typeof r.url === "string" ? String(r.url) : "#",
        esMio: true,
      }));
  } catch {
    return [];
  }
}

export default function ResourcesOverviewPage() {
  const [tipo, setTipo] = useState<TipoFiltro>("todos");
  const [busqueda, setBusqueda] = useState("");
  const [mios, setMios] = useState<RecursoVista[]>([]);
  const [apuntesMios, setApuntesMios] = useState(0);

  useEffect(() => {
    const todos: RecursoVista[] = [
      ...leerMiosPorTipo("pdf"),
      ...leerMiosPorTipo("video"),
      ...leerMiosPorTipo("articulo"),
      ...leerMiosPorTipo("imagen"),
    ];
    setMios(todos);
    setApuntesMios(leerConteoApuntesMios());
  }, []);

  const conteoDemoApuntes = useMemo(
    () => (Array.isArray(DEMO_NOTES) ? DEMO_NOTES.length : 0),
    []
  );

  const recursosDemo = useMemo<RecursoVista[]>(() => {
    const base = Array.isArray(DEMO_RESOURCES) ? DEMO_RESOURCES : [];
    return base
      .filter((r) => {
        const t = (r as { tipo?: unknown })?.tipo;
        return (
          t === "pdf" || t === "video" || t === "articulo" || t === "imagen"
        );
      })
      .map((r) => {
        const rec = r as {
          id?: unknown;
          tipo?: unknown;
          titulo?: unknown;
          descripcion?: unknown;
          url?: unknown;
        };
        return {
          id: String(rec.id ?? crypto.randomUUID()),
          tipo: String(rec.tipo),
          titulo: String(rec.titulo ?? "Recurso sin título"),
          descripcion: String(rec.descripcion ?? ""),
          url: typeof rec.url === "string" ? rec.url : "#",
          esMio: false,
        };
      });
  }, []);

  const recursos = useMemo<RecursoVista[]>(() => [...mios, ...recursosDemo], [mios, recursosDemo]);

  const conteoDemoPorTipo = useMemo(() => {
    const acc: Record<string, number> = { pdf: 0, video: 0, articulo: 0, imagen: 0 };
    for (const r of recursosDemo) {
      if (r.tipo in acc) acc[r.tipo] += 1;
    }
    return acc;
  }, [recursosDemo]);

  const conteoMioPorTipo = useMemo(() => {
    const acc: Record<string, number> = { pdf: 0, video: 0, articulo: 0, imagen: 0 };
    for (const r of mios) {
      if (r.tipo in acc) acc[r.tipo] += 1;
    }
    return acc;
  }, [mios]);

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

  const totalMios = mios.length;

  return (
    <div className="container mx-auto w-full max-w-full overflow-x-hidden px-4 py-6 sm:py-8">
      <header className="mb-8 text-center sm:mb-10">
        <h1 className="break-words font-headline text-2xl font-bold tracking-tight text-primary sm:text-4xl md:text-5xl">
          Recursos educativos
        </h1>
        <p className="mx-auto mt-4 max-w-2xl break-words text-base text-muted-foreground sm:text-lg md:text-xl">
          Material de apoyo para tu aprendizaje en atención primaria. Explora
          por categoría o filtra la lista demo por tipo.
        </p>
        <p className="mx-auto mt-2 max-w-xl break-words px-2 text-xs text-muted-foreground sm:text-sm" aria-live="polite">
          {recursos.length} recurso{recursos.length === 1 ? "" : "s"} en total
          ({recursosDemo.length} demo + {totalMios} mío{totalMios === 1 ? "" : "s"} en este navegador)
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2">
        {resourceCategories.map((category) => {
          const Icon = category.icon;
          const esApuntes = category.tipo === "apunte";
          const demo = esApuntes
            ? conteoDemoApuntes
            : (conteoDemoPorTipo[category.tipo] ?? 0);
          const mio = esApuntes
            ? apuntesMios
            : (conteoMioPorTipo[category.tipo] ?? 0);
          const total = demo + mio;
          const etiquetaTotal = esApuntes
            ? `apunte${total === 1 ? "" : "s"}`
            : `recurso${total === 1 ? "" : "s"}`;
          return (
            <Link
              href={category.link}
              key={category.title}
              className="group block min-w-0 max-w-full overflow-hidden rounded-xl border border-transparent bg-card transition-all duration-300 hover:border-primary/50 hover:shadow-2xl"
            >
              <Card className="flex h-full min-w-0 max-w-full flex-col overflow-hidden border-0 shadow-none">
                <CardHeader className="pb-3">
                  <div
                    className={`mb-4 w-fit rounded-full p-3 transition-colors duration-300 ${category.iconBgClass}`}
                  >
                    <Icon className={`h-8 w-8 ${category.iconTextClass}`} />
                  </div>
                  <CardTitle className="break-words font-headline text-xl font-bold text-card-foreground transition-colors duration-300 group-hover:text-primary sm:text-2xl">
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow space-y-3">
                  <p className="break-words text-sm text-muted-foreground">
                    {category.description}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary">
                      {total} {etiquetaTotal}
                    </Badge>
                    {mio > 0 ? (
                      <Badge variant="default">{mio} mío{mio === 1 ? "" : "s"}</Badge>
                    ) : (
                      <Badge variant="outline">{demo} demo</Badge>
                    )}
                  </div>
                </CardContent>
                <CardFooter className="p-4 pt-2 sm:p-6 sm:pt-2">
                  <span className="flex min-w-0 flex-wrap items-center break-words text-sm font-semibold text-primary">
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
          <h2 className="break-words px-2 font-headline text-xl font-bold text-primary sm:text-2xl md:text-3xl">
            Recursos disponibles (demo + míos)
          </h2>
          <p className="mx-auto mt-2 max-w-xl break-words px-2 text-sm sm:text-base">
            Lista de demostración cargada desde el contrato demo, más tus
            aportes guardados en este navegador. Usa los filtros por tipo o
            busca por título.
          </p>
        </div>

        <div className="mx-auto mb-4 flex w-full max-w-xl flex-col items-stretch gap-2 sm:mb-6 sm:flex-row sm:items-center">
          <div className="relative w-full flex-grow">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              placeholder="Buscar por título o descripción…"
              aria-label="Buscar recursos demo"
              className="w-full pl-9"
            />
          </div>
        </div>

        <div
          className="mx-auto mb-6 flex w-full max-w-xl flex-col items-stretch gap-2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-center"
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
              className="w-full rounded-full sm:w-auto"
            >
              {f.label}
              {f.value !== "todos" && (
                <span className="ml-1.5 text-xs opacity-80">
                  {(conteoDemoPorTipo[f.value] ?? 0) + (conteoMioPorTipo[f.value] ?? 0)}
                </span>
              )}
            </Button>
          ))}
        </div>

        <p
          className="mb-4 break-words px-2 text-center text-xs text-muted-foreground sm:text-sm"
          aria-live="polite"
        >
          Mostrando {filtrados.length} de {recursos.length} recursos
          {tipo !== "todos" ? ` · filtro: ${ETIQUETA_POR_TIPO[tipo]}` : ""}
          {busqueda.trim() ? ` · búsqueda: “${busqueda.trim()}”` : ""}
          {totalMios > 0 ? ` · ${totalMios} mío${totalMios === 1 ? "" : "s"}` : ""}
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
          <div className="grid w-full grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
            {filtrados.map((r) => {
              const Icon = ICONO_POR_TIPO[r.tipo] ?? BookOpen;
              const esDemo = !r.esMio && (!r.url || r.url === "#");
              return (
                <Card
                  key={`${r.tipo}-${r.id}`}
                  className="flex min-w-0 max-w-full flex-col overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:border-primary/50 hover:shadow-2xl"
                >
                  <CardHeader className="flex min-w-0 flex-row items-start gap-4 p-4 pb-2">
                    <span className="rounded-full bg-primary/10 p-2.5">
                      <Icon className="h-6 w-6 text-primary" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <CardTitle className="break-words font-headline text-lg font-semibold leading-snug">
                        {r.titulo}
                      </CardTitle>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Badge variant="secondary">
                          {ETIQUETA_POR_TIPO[r.tipo] ?? r.tipo}
                        </Badge>
                        {r.esMio ? (
                          <Badge variant="default">Mío</Badge>
                        ) : (
                          esDemo && (
                            <Badge variant="outline">Contenido demo</Badge>
                          )
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow p-4 pt-2">
                    <p className="line-clamp-3 break-words text-sm text-muted-foreground">
                      {r.descripcion}
                    </p>
                  </CardContent>
                  <CardFooter className="flex min-w-0 flex-col items-stretch gap-2 p-4 pt-0 sm:flex-row sm:items-center">
                    {r.esMio ? (
                      <Button asChild variant="outline" className="w-full">
                        <Link href={RUTA_POR_TIPO[r.tipo] ?? "/resources"}>
                          Gestionar en {ETIQUETA_POR_TIPO[r.tipo] ?? r.tipo}
                          <ArrowRight className="ml-2 h-4 w-4" />
                        </Link>
                      </Button>
                    ) : esDemo ? (
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
                    {RUTA_POR_TIPO[r.tipo] && !r.esMio && (
                      <Button asChild variant="ghost" size="sm" className="w-full sm:w-auto">
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
