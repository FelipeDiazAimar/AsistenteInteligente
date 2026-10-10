"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  BookOpen,
  ChevronDown,
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

const STORAGE_KEY = "asistente-demo-articles-v1";
const TIPO = "articulo";

interface ArticuloMio {
  id: string;
  titulo: string;
  descripcion: string;
  contenido: string;
}

interface RecursoVista {
  id: string;
  titulo: string;
  descripcion: string;
  contenido: string;
  esMio: boolean;
}

function cargarArticulosMios(): ArticuloMio[] {
  try {
    if (typeof window === "undefined") return [];
    const crudo = window.localStorage.getItem(STORAGE_KEY);
    if (!crudo) return [];
    const parsed: unknown = JSON.parse(crudo);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is ArticuloMio => {
      if (typeof item !== "object" || item === null) return false;
      const r = item as Record<string, unknown>;
      return (
        typeof r.id === "string" &&
        typeof r.titulo === "string" &&
        r.titulo.trim().length > 0
      );
    }).map((r) => ({
      id: String(r.id),
      titulo: String(r.titulo ?? ""),
      descripcion: typeof r.descripcion === "string" ? r.descripcion : "",
      contenido: typeof r.contenido === "string" ? r.contenido : "",
    }));
  } catch {
    return [];
  }
}

function guardarArticulosMios(items: ArticuloMio[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // se ignora
  }
}

export default function ArticleResourcesPage() {
  const [busqueda, setBusqueda] = useState("");
  const [mios, setMios] = useState<ArticuloMio[]>([]);
  const [cargado, setCargado] = useState(false);
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [expandidas, setExpandidas] = useState<Record<string, boolean>>({});

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [contenido, setContenido] = useState("");
  const [errorTitulo, setErrorTitulo] = useState<string | undefined>(undefined);

  useEffect(() => {
    setMios(cargarArticulosMios());
    setCargado(true);
  }, []);

  const mocks = useMemo<RecursoVista[]>(() => {
    const base = Array.isArray(DEMO_RESOURCES) ? DEMO_RESOURCES : [];
    return base
      .filter((r) => (r as { tipo?: unknown })?.tipo === TIPO)
      .map((r) => {
        const rec = r as { id?: unknown; titulo?: unknown; descripcion?: unknown };
        return {
          id: String(rec.id ?? crypto.randomUUID()),
          titulo: String(rec.titulo ?? "Artículo sin título"),
          descripcion: String(rec.descripcion ?? ""),
          contenido: "",
          esMio: false,
        };
      });
  }, []);

  const combinados = useMemo<RecursoVista[]>(() => {
    const propios: RecursoVista[] = mios.map((m) => ({ ...m, esMio: true }));
    return [...propios, ...mocks];
  }, [mios, mocks]);

  const filtrados = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return combinados;
    return combinados.filter(
      (r) =>
        r.titulo.toLowerCase().includes(q) ||
        r.descripcion.toLowerCase().includes(q) ||
        r.contenido.toLowerCase().includes(q)
    );
  }, [combinados, busqueda]);

  const cerrarDialog = () => {
    setDialogAbierto(false);
    setTitulo("");
    setDescripcion("");
    setContenido("");
    setErrorTitulo(undefined);
  };

  const handleGuardar = () => {
    if (!titulo.trim()) {
      setErrorTitulo("El título es obligatorio.");
      return;
    }
    const nuevo: ArticuloMio = {
      id: `articulo-mio-${Date.now()}`,
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      contenido: contenido.trim(),
    };
    const actualizados = [nuevo, ...mios];
    setMios(actualizados);
    guardarArticulosMios(actualizados);
    cerrarDialog();
  };

  const handleEliminar = (id: string) => {
    const actualizados = mios.filter((m) => m.id !== id);
    setMios(actualizados);
    guardarArticulosMios(actualizados);
  };

  const alternarExpandida = (id: string) =>
    setExpandidas((prev) => ({ ...prev, [id]: !prev[id] }));

  return (
    <div className="container mx-auto min-w-0 px-4 py-6 sm:py-8">
      <Button asChild variant="ghost" size="sm" className="mb-4">
        <Link href="/resources">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver a recursos
        </Link>
      </Button>

      <h1 className="mb-3 break-words px-1 text-center font-headline text-2xl font-bold leading-tight text-primary sm:text-3xl">
        Artículos y publicaciones
      </h1>
      <p className="mx-auto mb-6 max-w-2xl break-words px-1 text-center text-sm leading-relaxed text-muted-foreground sm:text-base">
        Lecturas recomendadas para profundizar en atención primaria (contenido
        demo + tus aportes locales).
      </p>

      <div className="mx-auto mb-6 flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-grow">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar artículos por título, descripción o contenido…"
            aria-label="Buscar artículos"
            className="h-11 pl-9 text-base"
          />
        </div>
        <Button
          type="button"
          onClick={() => setDialogAbierto(true)}
          className="h-11 w-full shrink-0 sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar artículo
        </Button>
      </div>

      <p className="mb-4 break-words px-2 text-center text-xs text-muted-foreground sm:text-sm" aria-live="polite">
        {cargado
          ? `Mostrando ${filtrados.length} de ${combinados.length} artículo${combinados.length === 1 ? "" : "s"} (${mios.length} mío${mios.length === 1 ? "" : "s"} + ${mocks.length} demo)`
          : "Cargando artículos…"}
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
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="h-40" />
            </Card>
          ))}
        </div>
      ) : filtrados.length === 0 ? (
        <Card className="mx-auto max-w-xl bg-muted/50">
          <CardContent className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <span className="rounded-full bg-primary/10 p-4">
              <SearchX className="h-8 w-8 text-primary" />
            </span>
            <p className="text-lg font-semibold">Sin artículos para mostrar</p>
            <p className="text-sm text-muted-foreground">
              {combinados.length === 0
                ? "Aún no hay artículos. Agrega el primero con el botón “Agregar artículo”."
                : `No se encontraron artículos para “${busqueda.trim()}”. Prueba con otra búsqueda.`}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {busqueda.trim() && (
                <Button type="button" variant="outline" size="sm" onClick={() => setBusqueda("")}>
                  Limpiar búsqueda
                </Button>
              )}
              <Button type="button" size="sm" onClick={() => setDialogAbierto(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar artículo
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((resource) => {
            const expandida = !!expandidas[resource.id];
            const tieneContenido = !!(resource.esMio && resource.contenido);
            return (
            <Card
              key={resource.id}
              className="flex h-full min-w-0 flex-col overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:border-primary/50 hover:shadow-2xl"
            >
              <CardHeader className="flex flex-row items-start gap-3 p-4 sm:gap-4">
                <span className="shrink-0 rounded-full bg-primary/10 p-2.5">
                  <BookOpen className="h-6 w-6 text-primary" />
                </span>
                <div className="min-w-0 flex-1">
                  <CardTitle className="break-words font-headline text-base font-semibold leading-snug sm:text-lg">
                    {resource.titulo}
                  </CardTitle>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="secondary">Artículo</Badge>
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
                    title="Eliminar mi artículo"
                    className="shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </CardHeader>
              <CardContent className="flex-grow space-y-2 p-4 pt-0">
                <p className={`break-words leading-relaxed text-muted-foreground ${expandida ? "whitespace-pre-line text-sm sm:text-[15px]" : "line-clamp-3 text-sm sm:text-[15px]"}`}>
                  {resource.descripcion || "Sin descripción."}
                </p>
                {tieneContenido && (
                  <div className={expandida ? "max-h-[45dvh] overflow-y-auto overscroll-contain rounded-md bg-muted/60 p-2.5" : "overflow-hidden rounded-md bg-muted/60 p-2.5"}>
                    <p className={`break-words whitespace-pre-line leading-relaxed text-foreground ${expandida ? "text-sm sm:text-[15px]" : "line-clamp-4 text-sm sm:text-[15px]"}`}>
                      {resource.contenido}
                    </p>
                  </div>
                )}
                {tieneContenido && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => alternarExpandida(resource.id)}
                    aria-expanded={expandida}
                    className="h-9 px-2"
                  >
                    {expandida ? "Leer menos" : "Leer más"}
                    <ChevronDown
                      className={`ml-1 h-4 w-4 transition-transform ${expandida ? "rotate-180" : ""}`}
                    />
                  </Button>
                )}
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button type="button" variant="outline" className="w-full min-w-0 truncate" disabled>
                  {resource.esMio ? "Artículo local (mock)" : "Recurso de muestra"}
                </Button>
              </CardFooter>
            </Card>
            );
          })}
        </div>
      )}

      <Dialog open={dialogAbierto} onOpenChange={(o) => (o ? setDialogAbierto(true) : cerrarDialog())}>
        <DialogContent className="max-h-[90dvh] w-[calc(100vw-2rem)] overflow-y-auto overscroll-contain rounded-xl p-4 sm:max-w-lg sm:p-6">
          <DialogHeader>
            <DialogTitle>Agregar artículo (mock local)</DialogTitle>
            <DialogDescription>
              Se guarda solo en tu navegador (localStorage). No se comparte ni se sube al servidor.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="art-titulo">Título *</Label>
              <Input
                id="art-titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej.: Dieta DASH en consultorio"
                maxLength={120}
                className="h-11 text-base"
              />
              {errorTitulo && <p className="text-sm text-destructive">{errorTitulo}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="art-descripcion">Descripción</Label>
              <Textarea
                id="art-descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Resumen corto del artículo…"
                rows={3}
                maxLength={300}
                className="min-h-[88px] text-base leading-relaxed"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="art-contenido">Contenido</Label>
              <Textarea
                id="art-contenido"
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                placeholder="Pega aquí el texto, ideas clave o resumen del artículo…"
                rows={6}
                maxLength={4000}
                className="min-h-[140px] text-base leading-relaxed"
              />
            </div>
          </div>
          <DialogFooter className="gap-2">
            <Button type="button" variant="outline" onClick={cerrarDialog} className="h-11 w-full sm:w-auto">
              Cancelar
            </Button>
            <Button type="button" onClick={handleGuardar} className="h-11 w-full sm:w-auto">
              Guardar artículo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
