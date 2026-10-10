"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ExternalLink,
  Plus,
  Search,
  SearchX,
  Trash2,
  Video as VideoIcon,
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

const STORAGE_KEY = "asistente-demo-videos-v1";
const TIPO = "video";

interface VideoMio {
  id: string;
  titulo: string;
  descripcion: string;
  url: string;
}

interface RecursoVista {
  id: string;
  titulo: string;
  descripcion: string;
  url: string;
  esMio: boolean;
}

function cargarVideosMios(): VideoMio[] {
  try {
    if (typeof window === "undefined") return [];
    const crudo = window.localStorage.getItem(STORAGE_KEY);
    if (!crudo) return [];
    const parsed: unknown = JSON.parse(crudo);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is VideoMio => {
      if (typeof item !== "object" || item === null) return false;
      const r = item as Record<string, unknown>;
      return (
        typeof r.id === "string" &&
        typeof r.titulo === "string" &&
        typeof r.descripcion === "string" &&
        typeof r.url === "string" &&
        r.titulo.trim().length > 0
      );
    });
  } catch {
    return [];
  }
}

function guardarVideosMios(items: VideoMio[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // almacenamiento no disponible (modo privado, cuota llena): se ignora
  }
}

function esUrlValida(url: string): boolean {
  const v = url.trim();
  if (!v) return false;
  if (v === "#") return false;
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
}

function obtenerYouTubeId(url: string): string | null {
  const v = url.trim();
  const m = v.match(
    /(?:youtube\.com\/(?:watch\?.*v=|embed\/|shorts\/|v\/)|youtu\.be\/)([\w-]{11})/
  );
  return m ? m[1] : null;
}

function obtenerVimeoId(url: string): string | null {
  const m = url.trim().match(/vimeo\.com\/(?:video\/)?(\d+)/);
  return m ? m[1] : null;
}

function esVideoDirecto(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?.*)?(#.*)?$/i.test(url.trim());
}

export default function VideoResourcesPage() {
  const [busqueda, setBusqueda] = useState("");
  const [mios, setMios] = useState<VideoMio[]>([]);
  const [cargado, setCargado] = useState(false);
  const [dialogAbierto, setDialogAbierto] = useState(false);

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [url, setUrl] = useState("");
  const [errores, setErrores] = useState<{ titulo?: string; url?: string }>({});

  useEffect(() => {
    setMios(cargarVideosMios());
    setCargado(true);
  }, []);

  const mocks = useMemo<RecursoVista[]>(() => {
    const base = Array.isArray(DEMO_RESOURCES) ? DEMO_RESOURCES : [];
    return base
      .filter((r) => (r as { tipo?: unknown })?.tipo === TIPO)
      .map((r) => {
        const rec = r as { id?: unknown; titulo?: unknown; descripcion?: unknown; url?: unknown };
        return {
          id: String(rec.id ?? crypto.randomUUID()),
          titulo: String(rec.titulo ?? "Video sin título"),
          descripcion: String(rec.descripcion ?? ""),
          url: typeof rec.url === "string" ? rec.url : "#",
          esMio: false,
        };
      });
  }, []);

  const combinados = useMemo<RecursoVista[]>(() => {
    const propios: RecursoVista[] = mios.map((v) => ({
      id: v.id,
      titulo: v.titulo,
      descripcion: v.descripcion,
      url: v.url,
      esMio: true,
    }));
    return [...propios, ...mocks];
  }, [mios, mocks]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return combinados;
    return combinados.filter(
      (r) =>
        r.titulo.toLowerCase().includes(q) ||
        r.descripcion.toLowerCase().includes(q) ||
        r.url.toLowerCase().includes(q)
    );
  }, [combinados, busqueda]);

  const limpiarBusqueda = () => setBusqueda("");

  const cerrarDialog = () => {
    setDialogAbierto(false);
    setTitulo("");
    setDescripcion("");
    setUrl("");
    setErrores({});
  };

  const handleGuardar = () => {
    const nuevosErrores: { titulo?: string; url?: string } = {};
    if (!titulo.trim()) nuevosErrores.titulo = "El título es obligatorio.";
    if (!url.trim()) {
      nuevosErrores.url = "La URL es obligatoria.";
    } else if (!esUrlValida(url)) {
      nuevosErrores.url = "Ingresa una URL válida que empiece con http:// o https://";
    }
    setErrores(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) return;

    const nuevo: VideoMio = {
      id: `video-mio-${Date.now()}`,
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      url: url.trim(),
    };
    const actualizados = [nuevo, ...mios];
    setMios(actualizados);
    guardarVideosMios(actualizados);
    cerrarDialog();
  };

  const handleEliminar = (id: string) => {
    const actualizados = mios.filter((v) => v.id !== id);
    setMios(actualizados);
    guardarVideosMios(actualizados);
  };

  return (
    <div className="container mx-auto w-full min-w-0 max-w-7xl overflow-x-clip px-4 py-6 sm:py-8">
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link href="/resources">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a recursos
        </Link>
      </Button>

      <h1 className="mb-3 break-words px-2 text-center font-headline text-2xl font-bold leading-tight text-primary sm:mb-4 sm:text-3xl">
        Videos educativos
      </h1>
      <p className="mx-auto mb-6 max-w-2xl break-words px-2 text-center text-sm text-muted-foreground sm:text-base">
        Demostraciones visuales y tutoriales para reforzar tu aprendizaje
        (contenido demo + tus aportes locales).
      </p>

      <div className="mx-auto mb-6 flex w-full max-w-2xl flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative w-full min-w-0 flex-grow">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar videos por título, descripción o URL…"
            aria-label="Buscar videos"
            className="w-full min-w-0 pl-9"
          />
        </div>
        <Button
          type="button"
          onClick={() => setDialogAbierto(true)}
          className="w-full shrink-0 sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar video
        </Button>
      </div>

      <p
        className="mb-4 break-words px-2 text-center text-sm text-muted-foreground"
        aria-live="polite"
      >
        {cargado
          ? `Mostrando ${filtrados.length} de ${combinados.length} videos (${mios.length} mío${mios.length === 1 ? "" : "s"} + ${mocks.length} demo)`
          : "Cargando videos…"}
        {busqueda.trim() ? ` · búsqueda: “${busqueda.trim()}”` : ""}
      </p>

      {busqueda.trim() && (
        <div className="mb-6 flex justify-center">
          <Button type="button" variant="outline" size="sm" onClick={limpiarBusqueda}>
            Limpiar búsqueda
          </Button>
        </div>
      )}

      {!cargado ? (
        <div className="grid w-full min-w-0 grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="w-full min-w-0 animate-pulse">
              <CardContent className="h-40" />
            </Card>
          ))}
        </div>
      ) : filtrados.length === 0 ? (
        <Card className="mx-auto w-full min-w-0 max-w-xl bg-muted/50">
          <CardContent className="flex flex-col items-center gap-3 px-4 py-10 text-center sm:px-6">
            <span className="rounded-full bg-primary/10 p-4">
              <SearchX className="h-8 w-8 text-primary" />
            </span>
            <p className="text-lg font-semibold">Sin videos para mostrar</p>
            <p className="text-sm text-muted-foreground">
              {combinados.length === 0
                ? "Aún no hay videos. Agrega el primero con el botón “Agregar video”."
                : `No se encontraron videos para “${busqueda.trim()}”. Prueba con otra búsqueda.`}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {busqueda.trim() && (
                <Button type="button" variant="outline" size="sm" onClick={limpiarBusqueda}>
                  Limpiar búsqueda
                </Button>
              )}
              <Button type="button" size="sm" onClick={() => setDialogAbierto(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar video
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid w-full min-w-0 grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((resource) => {
            const urlValida = esUrlValida(resource.url);
            const youtubeId = urlValida ? obtenerYouTubeId(resource.url) : null;
            const vimeoId = urlValida && !youtubeId ? obtenerVimeoId(resource.url) : null;
            const directo =
              urlValida && !youtubeId && !vimeoId && esVideoDirecto(resource.url);
            return (
              <Card
                key={resource.id}
                className="flex h-full w-full min-w-0 max-w-full flex-col overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:border-primary/50 hover:shadow-2xl"
              >
                <div className="aspect-video w-full max-w-full overflow-hidden bg-muted">
                  {youtubeId ? (
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}`}
                      title={resource.titulo}
                      loading="lazy"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full max-w-full border-0"
                    />
                  ) : vimeoId ? (
                    <iframe
                      src={`https://player.vimeo.com/video/${vimeoId}`}
                      title={resource.titulo}
                      loading="lazy"
                      allow="autoplay; fullscreen; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full max-w-full border-0"
                    />
                  ) : directo ? (
                    <video
                      controls
                      preload="none"
                      src={resource.url}
                      aria-label={resource.titulo}
                      className="h-full w-full max-w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-muted">
                      <VideoIcon className="h-10 w-10 text-muted-foreground" />
                    </div>
                  )}
                </div>
                <CardHeader className="flex w-full min-w-0 flex-row items-start gap-4 p-4">
                  <span className="shrink-0 rounded-full bg-primary/10 p-2.5">
                    <VideoIcon className="h-6 w-6 text-primary" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <CardTitle className="break-words font-headline text-base font-semibold leading-snug sm:text-lg">
                      {resource.titulo}
                    </CardTitle>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Badge variant="secondary">Video</Badge>
                      {resource.esMio ? (
                        <Badge variant="default">Mío</Badge>
                      ) : (
                        <Badge variant="outline">Demo</Badge>
                      )}
                    </div>
                  </div>
                  {resource.esMio && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEliminar(resource.id)}
                      aria-label={`Eliminar ${resource.titulo}`}
                      title="Eliminar mi video"
                      className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </CardHeader>
                <CardContent className="w-full min-w-0 flex-grow space-y-2 p-4 pt-0">
                  <p className="line-clamp-3 break-words text-sm text-muted-foreground">
                    {resource.descripcion || "Sin descripción."}
                  </p>
                  <p className="block max-w-full truncate text-xs text-muted-foreground" title={resource.url}>
                    {resource.url}
                  </p>
                </CardContent>
                <CardFooter className="w-full min-w-0 p-4 pt-0">
                  {urlValida ? (
                    <Button asChild className="w-full">
                      <a href={resource.url} target="_blank" rel="noopener noreferrer">
                        Ver video
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
        <DialogContent className="max-h-[90vh] w-[calc(100%-2rem)] max-w-lg overflow-y-auto rounded-lg p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="break-words pr-6 text-left">Agregar video (mock local)</DialogTitle>
            <DialogDescription className="break-words text-left">
              Se guarda solo en tu navegador (localStorage). No se comparte ni se sube al servidor.
            </DialogDescription>
          </DialogHeader>
          <div className="grid w-full min-w-0 gap-4 py-2">
            <div className="grid w-full min-w-0 gap-2">
              <Label htmlFor="video-titulo">Título *</Label>
              <Input
                id="video-titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej.: Técnica de RCP en 5 minutos"
                maxLength={120}
                className="w-full min-w-0"
              />
              {errores.titulo && (
                <p className="break-words text-sm text-destructive">{errores.titulo}</p>
              )}
            </div>
            <div className="grid w-full min-w-0 gap-2">
              <Label htmlFor="video-descripcion">Descripción</Label>
              <Textarea
                id="video-descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="¿Qué se aprende en este video?"
                rows={3}
                maxLength={500}
                className="w-full min-w-0"
              />
            </div>
            <div className="grid w-full min-w-0 gap-2">
              <Label htmlFor="video-url">URL del video *</Label>
              <Input
                id="video-url"
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://ejemplo.com/video"
                inputMode="url"
                className="w-full min-w-0"
              />
              {errores.url ? (
                <p className="break-words text-sm text-destructive">{errores.url}</p>
              ) : (
                <p className="break-words text-xs text-muted-foreground">
                  Debe empezar con http:// o https:// (YouTube, Vimeo, etc.).
                </p>
              )}
            </div>
          </div>
          <DialogFooter className="flex-col-reverse gap-2 sm:flex-row sm:gap-0">
            <Button type="button" variant="outline" onClick={cerrarDialog} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button type="button" onClick={handleGuardar} className="w-full sm:w-auto">
              Guardar video
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
