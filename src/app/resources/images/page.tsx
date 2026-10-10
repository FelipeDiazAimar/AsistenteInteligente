"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Image as ImageIcon,
  Plus,
  Search,
  SearchX,
  Trash2,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const STORAGE_KEY = "asistente-demo-images-v1";
const TIPO = "imagen";

interface ImagenMia {
  id: string;
  titulo: string;
  descripcion: string;
  url: string;
  alt: string;
}

interface RecursoVista extends ImagenMia {
  esMia: boolean;
}

function cargarImagenesMias(): ImagenMia[] {
  try {
    if (typeof window === "undefined") return [];
    const crudo = window.localStorage.getItem(STORAGE_KEY);
    if (!crudo) return [];
    const parsed: unknown = JSON.parse(crudo);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is ImagenMia => {
      if (typeof item !== "object" || item === null) return false;
      const r = item as Record<string, unknown>;
      return (
        typeof r.id === "string" &&
        typeof r.titulo === "string" &&
        r.titulo.trim().length > 0 &&
        typeof r.url === "string" &&
        r.url.trim().length > 0
      );
    }).map((r) => ({
      id: String(r.id),
      titulo: String(r.titulo ?? ""),
      descripcion: typeof r.descripcion === "string" ? r.descripcion : "",
      url: String(r.url ?? ""),
      alt:
        typeof r.alt === "string" && r.alt.trim()
          ? r.alt
          : String(r.titulo ?? "Imagen médica"),
    }));
  } catch {
    return [];
  }
}

function guardarImagenesMias(items: ImagenMia[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // se ignora: almacenamiento no disponible
  }
}

function esUrlImagenValida(url: string): boolean {
  const v = url.trim();
  if (!v || v === "#") return false;
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

export default function ImageResourcesPage() {
  const [busqueda, setBusqueda] = useState("");
  const [mias, setMias] = useState<ImagenMia[]>([]);
  const [cargado, setCargado] = useState(false);
  const [dialogAbierto, setDialogAbierto] = useState(false);

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  const [errores, setErrores] = useState<{ titulo?: string; url?: string }>({});

  useEffect(() => {
    setMias(cargarImagenesMias());
    setCargado(true);
  }, []);

  const mocks = useMemo<RecursoVista[]>(() => {
    const base = Array.isArray(DEMO_RESOURCES) ? DEMO_RESOURCES : [];
    return base
      .filter((r) => (r as { tipo?: unknown })?.tipo === TIPO)
      .map((r) => {
        const rec = r as { id?: unknown; titulo?: unknown; descripcion?: unknown; url?: unknown };
        const t = String(rec.titulo ?? "Imagen sin título");
        return {
          id: String(rec.id ?? crypto.randomUUID()),
          titulo: t,
          descripcion: String(rec.descripcion ?? ""),
          url: typeof rec.url === "string" ? rec.url : "#",
          alt: t,
          esMia: false,
        };
      });
  }, []);

  const combinadas = useMemo<RecursoVista[]>(() => {
    const propias: RecursoVista[] = mias.map((m) => ({ ...m, esMia: true }));
    return [...propias, ...mocks];
  }, [mias, mocks]);

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return combinadas;
    return combinadas.filter(
      (r) =>
        r.titulo.toLowerCase().includes(q) ||
        r.descripcion.toLowerCase().includes(q) ||
        r.alt.toLowerCase().includes(q)
    );
  }, [combinadas, busqueda]);

  const cerrarDialog = () => {
    setDialogAbierto(false);
    setTitulo("");
    setDescripcion("");
    setUrl("");
    setAlt("");
    setErrores({});
  };

  const handleGuardar = () => {
    const nuevosErrores: { titulo?: string; url?: string } = {};
    if (!titulo.trim()) nuevosErrores.titulo = "El título es obligatorio.";
    if (!url.trim()) {
      nuevosErrores.url = "La URL de la imagen es obligatoria.";
    } else if (!esUrlImagenValida(url)) {
      nuevosErrores.url = "Ingresa una URL válida que empiece con http:// o https://";
    }
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    const nuevo: ImagenMia = {
      id: `imagen-mia-${Date.now()}`,
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      url: url.trim(),
      alt: alt.trim() || titulo.trim(),
    };
    const actualizadas = [nuevo, ...mias];
    setMias(actualizadas);
    guardarImagenesMias(actualizadas);
    cerrarDialog();
  };

  const handleEliminar = (id: string) => {
    const actualizadas = mias.filter((m) => m.id !== id);
    setMias(actualizadas);
    guardarImagenesMias(actualizadas);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link href="/resources">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a recursos
        </Link>
      </Button>

      <h1 className="mb-4 text-center font-headline text-3xl font-bold text-primary">
        Imágenes médicas
      </h1>
      <p className="mb-6 text-center text-muted-foreground">
        Diagramas y material visual de apoyo para el estudio (contenido demo +
        tus aportes locales).
      </p>

      <div className="mx-auto mb-6 flex max-w-2xl flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-grow">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar imágenes por título, descripción o texto alternativo…"
            aria-label="Buscar imágenes"
            className="pl-9"
          />
        </div>
        <Button
          type="button"
          onClick={() => setDialogAbierto(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar imagen
        </Button>
      </div>

      <p className="mb-4 text-center text-sm text-muted-foreground" aria-live="polite">
        {cargado
          ? `Mostrando ${filtradas.length} de ${combinadas.length} imágenes (${mias.length} mía${mias.length === 1 ? "" : "s"} + ${mocks.length} demo)`
          : "Cargando imágenes…"}
        {busqueda.trim() ? ` · búsqueda: “${busqueda.trim()}”` : ""}
      </p>

      {busqueda.trim() && (
        <div className="mb-6 flex justify-center">
          <Button type="button" variant="outline" size="sm" onClick={() => setBusqueda("")}>
            Limpiar búsqueda
          </Button>
        </div>
      )}

      {!cargado ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-48" />
            </Card>
          ))}
        </div>
      ) : filtradas.length === 0 ? (
        <Card className="mx-auto max-w-xl bg-muted/50">
          <CardContent className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <span className="rounded-full bg-primary/10 p-4">
              <SearchX className="h-8 w-8 text-primary" />
            </span>
            <p className="text-lg font-semibold">Sin imágenes para mostrar</p>
            <p className="text-sm text-muted-foreground">
              {combinadas.length === 0
                ? "Aún no hay imágenes. Agrega la primera con el botón “Agregar imagen”."
                : `No se encontraron imágenes para “${busqueda.trim()}”. Prueba con otra búsqueda.`}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {busqueda.trim() && (
                <Button type="button" variant="outline" size="sm" onClick={() => setBusqueda("")}>
                  Limpiar búsqueda
                </Button>
              )}
              <Button type="button" size="sm" onClick={() => setDialogAbierto(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar imagen
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtradas.map((resource) => {
            const mostrarImg = esUrlImagenValida(resource.url);
            return (
              <Card
                key={resource.id}
                className="flex h-full flex-col overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:border-primary/50 hover:shadow-2xl"
              >
                {mostrarImg ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={resource.url}
                    alt={resource.alt}
                    loading="lazy"
                    className="h-44 w-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                ) : (
                  <div className="flex h-24 items-center justify-center bg-muted">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <CardHeader className="flex flex-row items-start gap-4 p-4">
                  <span className="rounded-full bg-primary/10 p-2.5">
                    <ImageIcon className="h-6 w-6 text-primary" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="font-headline text-lg font-semibold leading-snug">
                      {resource.titulo}
                    </CardTitle>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="secondary">Imagen</Badge>
                      {resource.esMia ? (
                        <Badge variant="default">Mío</Badge>
                      ) : (
                        <Badge variant="outline">Demo</Badge>
                      )}
                    </div>
                  </div>
                  {resource.esMia && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEliminar(resource.id)}
                      aria-label={`Eliminar ${resource.titulo}`}
                      title="Eliminar mi imagen"
                      className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="flex-grow space-y-2 p-4 pt-0">
                  <p className="line-clamp-3 text-sm text-muted-foreground">
                    {resource.descripcion || "Sin descripción."}
                  </p>
                  {resource.esMia && (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Texto alternativo:</span> {resource.alt}
                    </p>
                  )}
                </CardContent>
                <CardFooter className="p-4 pt-0">
                  {mostrarImg ? (
                    <Button asChild className="w-full" variant="outline">
                      <a href={resource.url} target="_blank" rel="noopener noreferrer">
                        Abrir imagen
                        <ExternalLink className="ml-2 h-4 w-4" />
                      </a>
                    </Button>
                  ) : (
                    <Button type="button" variant="outline" className="w-full" disabled>
                      Recurso de muestra
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogAbierto} onOpenChange={(o) => (o ? setDialogAbierto(true) : cerrarDialog())}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agregar imagen (mock local)</DialogTitle>
            <DialogDescription>
              Se guarda solo en tu navegador (localStorage). Incluye un texto alternativo para accesibilidad.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="img-titulo">Título *</Label>
              <Input
                id="img-titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej.: Algoritmo de pesquisa DBT2"
                maxLength={120}
              />
              {errores.titulo && <p className="text-sm text-destructive">{errores.titulo}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="img-descripcion">Descripción</Label>
              <Textarea
                id="img-descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="¿Qué muestra la imagen?"
                rows={3}
                maxLength={500}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="img-url">URL de la imagen *</Label>
              <Input
                id="img-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://ejemplo.com/imagen.jpg"
                inputMode="url"
              />
              {errores.url ? (
                <p className="text-sm text-destructive">{errores.url}</p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Debe empezar con http:// o https:// y apuntar a una imagen pública.
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="img-alt">Texto alternativo (alt)</Label>
              <Input
                id="img-alt"
                value={alt}
                onChange={(e) => setAlt(e.target.value)}
                placeholder="Ej.: Flujograma de diagnóstico de diabetes tipo 2"
                maxLength={150}
              />
              <p className="text-xs text-muted-foreground">
                Si lo dejas vacío se usará el título. Mejora la accesibilidad.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={cerrarDialog}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleGuardar}>
              Guardar imagen
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
