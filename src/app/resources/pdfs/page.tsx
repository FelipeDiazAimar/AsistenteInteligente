"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  FileText,
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

const STORAGE_KEY = "asistente-demo-pdfs-v1";
const TIPO = "pdf";

interface PdfMio {
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

function cargarPdfsMios(): PdfMio[] {
  try {
    if (typeof window === "undefined") return [];
    const crudo = window.localStorage.getItem(STORAGE_KEY);
    if (!crudo) return [];
    const parsed: unknown = JSON.parse(crudo);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is PdfMio => {
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

function guardarPdfsMios(items: PdfMio[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  } catch {
    // se ignora
  }
}

export default function PdfResourcesPage() {
  const [busqueda, setBusqueda] = useState("");
  const [mios, setMios] = useState<PdfMio[]>([]);
  const [cargado, setCargado] = useState(false);
  const [dialogAbierto, setDialogAbierto] = useState(false);

  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [contenido, setContenido] = useState("");
  const [errorTitulo, setErrorTitulo] = useState<string | undefined>(undefined);

  useEffect(() => {
    setMios(cargarPdfsMios());
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
          titulo: String(rec.titulo ?? "PDF sin título"),
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
    const nuevo: PdfMio = {
      id: `pdf-mio-${Date.now()}`,
      titulo: titulo.trim(),
      descripcion: descripcion.trim(),
      contenido: contenido.trim(),
    };
    const actualizados = [nuevo, ...mios];
    setMios(actualizados);
    guardarPdfsMios(actualizados);
    cerrarDialog();
  };

  const handleEliminar = (id: string) => {
    const actualizados = mios.filter((m) => m.id !== id);
    setMios(actualizados);
    guardarPdfsMios(actualizados);
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
        Documentos PDF
      </h1>
      <p className="mb-6 text-center text-muted-foreground">
        Guías, protocolos y manuales esenciales para tu práctica clínica
        (contenido demo + tus resúmenes locales).
      </p>

      <div className="mx-auto mb-6 flex max-w-2xl flex-col gap-2 sm:flex-row sm:items-center">
        <div className="relative flex-grow">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar PDFs por título, descripción o contenido…"
            aria-label="Buscar PDFs"
            className="pl-9"
          />
        </div>
        <Button
          type="button"
          onClick={() => setDialogAbierto(true)}
          className="w-full sm:w-auto"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar PDF
        </Button>
      </div>

      <p className="mb-4 text-center text-sm text-muted-foreground" aria-live="polite">
        {cargado
          ? `Mostrando ${filtrados.length} de ${combinados.length} documento${combinados.length === 1 ? "" : "s"} (${mios.length} mío${mios.length === 1 ? "" : "s"} + ${mocks.length} demo)`
          : "Cargando documentos…"}
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
            <p className="text-lg font-semibold">Sin documentos para mostrar</p>
            <p className="text-sm text-muted-foreground">
              {combinados.length === 0
                ? "Aún no hay documentos. Agrega el primero con el botón “Agregar PDF”."
                : `No se encontraron PDFs para “${busqueda.trim()}”. Prueba con otra búsqueda.`}
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              {busqueda.trim() && (
                <Button type="button" variant="outline" size="sm" onClick={() => setBusqueda("")}>
                  Limpiar búsqueda
                </Button>
              )}
              <Button type="button" size="sm" onClick={() => setDialogAbierto(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Agregar PDF
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtrados.map((resource) => (
            <Card
              key={resource.id}
              className="flex flex-col rounded-xl shadow-lg transition-all duration-300 hover:border-primary/50 hover:shadow-2xl"
            >
              <CardHeader className="flex flex-row items-start gap-4 p-4">
                <span className="rounded-full bg-primary/10 p-2.5">
                  <FileText className="h-6 w-6 text-primary" />
                </span>
                <div className="min-w-0 flex-1">
                  <CardTitle className="font-headline text-lg font-semibold leading-snug">
                    {resource.titulo}
                  </CardTitle>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <Badge variant="secondary">PDF</Badge>
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
                    title="Eliminar mi documento"
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
                {resource.esMio && resource.contenido && (
                  <p className="line-clamp-4 whitespace-pre-line rounded-md bg-muted/60 p-2 text-xs text-foreground">
                    {resource.contenido}
                  </p>
                )}
              </CardContent>
              <CardFooter className="p-4 pt-0">
                <Button type="button" variant="outline" className="w-full" disabled>
                  {resource.esMio ? "Resumen local (mock)" : "Recurso de muestra"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogAbierto} onOpenChange={(o) => (o ? setDialogAbierto(true) : cerrarDialog())}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Agregar PDF (mock local)</DialogTitle>
            <DialogDescription>
              Se guarda solo en tu navegador (localStorage). Ideal para guardar un resumen o apunte asociado.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="pdf-titulo">Título *</Label>
              <Input
                id="pdf-titulo"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Ej.: Guía HTA - Resumen de bolsillo"
                maxLength={120}
              />
              {errorTitulo && <p className="text-sm text-destructive">{errorTitulo}</p>}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pdf-descripcion">Descripción</Label>
              <Textarea
                id="pdf-descripcion"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="¿Qué contiene este documento?"
                rows={2}
                maxLength={300}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="pdf-contenido">Contenido / resumen</Label>
              <Textarea
                id="pdf-contenido"
                value={contenido}
                onChange={(e) => setContenido(e.target.value)}
                placeholder="Pega aquí un resumen, índice o notas clave del PDF…"
                rows={5}
                maxLength={2000}
              />
              <p className="text-xs text-muted-foreground">
                Mock local: no sube archivos, solo guarda texto en tu navegador.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={cerrarDialog}>
              Cancelar
            </Button>
            <Button type="button" onClick={handleGuardar}>
              Guardar PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
