"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  ChevronDown,
  Plus,
  Search,
  SearchX,
  Trash2,
} from "lucide-react";
import { DEMO_NOTES } from "@/lib/demo";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const STORAGE_KEY = "asistente-demo-notes-v1";

interface Nota {
  id: string;
  titulo: string;
  contenido: string;
  esMia: boolean;
}

function normalizarTexto(valor: unknown): string {
  return typeof valor === "string" ? valor.trim() : "";
}

function esNotaValida(
  valor: unknown
): valor is { id: unknown; titulo: unknown; contenido: unknown } {
  if (typeof valor !== "object" || valor === null) return false;
  const v = valor as Record<string, unknown>;
  return (
    normalizarTexto(v.titulo).length > 0 &&
    normalizarTexto(v.contenido).length > 0
  );
}

function leerNotasPropias(): Nota[] {
  try {
    const crudo = localStorage.getItem(STORAGE_KEY);
    if (!crudo) return [];
    const parsed: unknown = JSON.parse(crudo);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(esNotaValida).map((n, i) => ({
      id: normalizarTexto(n.id) || `mio-${i}`,
      titulo: normalizarTexto(n.titulo),
      contenido: normalizarTexto(n.contenido),
      esMia: true,
    }));
  } catch {
    return [];
  }
}

function persistirNotasPropias(notas: Nota[]) {
  try {
    const soloMias = notas
      .filter((n) => n.esMia)
      .map(({ id, titulo, contenido }) => ({ id, titulo, contenido }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(soloMias));
  } catch {
    // localStorage lleno o no disponible: no bloquea la UI.
  }
}

export default function ApuntesPage() {
  const [busqueda, setBusqueda] = useState("");
  const [mias, setMias] = useState<Nota[]>([]);
  const [expandidas, setExpandidas] = useState<Record<string, boolean>>({});
  const [dialogAbierto, setDialogAbierto] = useState(false);
  const [tituloNuevo, setTituloNuevo] = useState("");
  const [contenidoNuevo, setContenidoNuevo] = useState("");

  useEffect(() => {
    setMias(leerNotasPropias());
  }, []);

  const demoNotas: Nota[] = useMemo(() => {
    const fuente: unknown = DEMO_NOTES;
    if (!Array.isArray(fuente)) return [];
    return fuente.filter(esNotaValida).map((n, i) => ({
      id: normalizarTexto(n.id) || `demo-${i}`,
      titulo: normalizarTexto(n.titulo),
      contenido: normalizarTexto(n.contenido),
      esMia: false,
    }));
  }, []);

  // Las notas propias van primero.
  const todas = useMemo(() => [...mias, ...demoNotas], [mias, demoNotas]);

  const filtradas = useMemo(() => {
    const q = busqueda.trim().toLowerCase();
    if (!q) return todas;
    return todas.filter(
      (n) =>
        n.titulo.toLowerCase().includes(q) ||
        n.contenido.toLowerCase().includes(q)
    );
  }, [todas, busqueda]);

  const alternarExpandida = (id: string) =>
    setExpandidas((prev) => ({ ...prev, [id]: !prev[id] }));

  const formularioValido =
    tituloNuevo.trim().length > 0 && contenidoNuevo.trim().length > 0;

  const guardarApunte = () => {
    const titulo = tituloNuevo.trim();
    const contenido = contenidoNuevo.trim();
    if (!titulo || !contenido) return;
    const nueva: Nota = {
      id: `mio-${Date.now()}`,
      titulo,
      contenido,
      esMia: true,
    };
    const actualizadas = [nueva, ...mias];
    setMias(actualizadas);
    persistirNotasPropias(actualizadas);
    setTituloNuevo("");
    setContenidoNuevo("");
    setDialogAbierto(false);
  };

  const eliminarApunte = (id: string) => {
    const actualizadas = mias.filter((n) => n.id !== id);
    setMias(actualizadas);
    persistirNotasPropias(actualizadas);
  };

  return (
    <div className="container mx-auto min-w-0 px-4 py-6 sm:py-8">
      <header className="mb-6 text-center sm:mb-8">
        <h1 className="break-words px-1 font-headline text-3xl font-bold leading-tight tracking-tight text-primary sm:text-4xl md:text-5xl">
          Apuntes
        </h1>
        <p className="mx-auto mt-3 max-w-2xl break-words px-1 text-sm leading-relaxed text-muted-foreground sm:mt-4 sm:text-lg">
          Catálogo de apuntes de demostración. Busca por título o contenido,
          expande cada tarjeta y agrega tus propios apuntes.
        </p>
      </header>

      <div className="mx-auto mb-6 flex max-w-2xl flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-grow">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            placeholder="Buscar apuntes por título o contenido…"
            aria-label="Buscar apuntes"
            className="h-11 pl-9 text-base"
          />
        </div>
        <Dialog open={dialogAbierto} onOpenChange={setDialogAbierto}>
          <DialogTrigger asChild>
            <Button type="button" className="h-11 w-full shrink-0 sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Agregar apunte
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90dvh] w-[calc(100vw-2rem)] overflow-y-auto overscroll-contain rounded-xl p-4 sm:max-w-lg sm:p-6">
            <DialogHeader>
              <DialogTitle>Agregar apunte</DialogTitle>
              <DialogDescription>
                Se guarda solo en tu navegador (localStorage) y aparece primero
                con la insignia “Mío”.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="apunte-titulo">Título</Label>
                <Input
                  id="apunte-titulo"
                  value={tituloNuevo}
                  onChange={(e) => setTituloNuevo(e.target.value)}
                  placeholder="Ej.: Signos de alarma en consulta"
                  maxLength={120}
                  className="h-11 text-base"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="apunte-contenido">Contenido</Label>
                <Textarea
                  id="apunte-contenido"
                  value={contenidoNuevo}
                  onChange={(e) => setContenidoNuevo(e.target.value)}
                  placeholder="Escribe el contenido del apunte…"
                  rows={6}
                  className="min-h-[140px] text-base leading-relaxed"
                />
              </div>
            </div>
            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setDialogAbierto(false)}
                className="h-11 w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={guardarApunte}
                disabled={!formularioValido}
                className="h-11 w-full sm:w-auto"
              >
                Guardar apunte
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <p
        className="mb-6 break-words px-2 text-center text-xs text-muted-foreground sm:text-sm"
        aria-live="polite"
      >
        Mostrando {filtradas.length} de {todas.length} apuntes
        {busqueda.trim() ? ` · búsqueda: “${busqueda.trim()}”` : ""}
      </p>

      {todas.length === 0 ? (
        <Card className="mx-auto max-w-xl bg-muted/50">
          <CardContent className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <span className="rounded-full bg-primary/10 p-4">
              <BookOpen className="h-8 w-8 text-primary" />
            </span>
            <p className="text-lg font-semibold">Sin apuntes por el momento</p>
            <p className="text-sm text-muted-foreground">
              No se pudo cargar el material de demostración. Agrega tu primer
              apunte con el botón superior.
            </p>
          </CardContent>
        </Card>
      ) : filtradas.length === 0 ? (
        <Card className="mx-auto max-w-xl bg-muted/50">
          <CardContent className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <span className="rounded-full bg-primary/10 p-4">
              <SearchX className="h-8 w-8 text-primary" />
            </span>
            <p className="text-lg font-semibold">Sin resultados</p>
            <p className="text-sm text-muted-foreground">
              No hay apuntes que coincidan con esa búsqueda. Prueba con otros
              términos.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setBusqueda("")}
            >
              Limpiar búsqueda
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filtradas.map((nota) => {
            const expandida = !!expandidas[nota.id];
            return (
              <Card
                key={nota.id}
                className="flex min-w-0 flex-col overflow-hidden rounded-xl shadow-lg transition-all duration-300 hover:border-primary/50 hover:shadow-2xl"
              >
                <CardHeader className="pb-2">
                  <div className="mb-2 flex flex-wrap gap-2">
                    {nota.esMia && <Badge>Mío</Badge>}
                    {!nota.esMia && (
                      <Badge variant="secondary">Demo</Badge>
                    )}
                  </div>
                  <CardTitle className="break-words font-headline text-base font-semibold leading-snug sm:text-lg">
                    {nota.titulo}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-grow pt-0">
                  <div className={expandida ? "max-h-[50dvh] overflow-y-auto overscroll-contain rounded-md pr-1" : "overflow-hidden"}>
                    <p
                      className={
                        expandida
                          ? "break-words whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-[15px]"
                          : "line-clamp-3 break-words whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-[15px]"
                      }
                    >
                      {nota.contenido}
                    </p>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-wrap items-center justify-between gap-2 pt-0">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => alternarExpandida(nota.id)}
                    aria-expanded={expandida}
                    className="h-9"
                  >
                    {expandida ? "Leer menos" : "Leer más"}
                    <ChevronDown
                      className={`ml-1 h-4 w-4 transition-transform ${expandida ? "rotate-180" : ""}`}
                    />
                  </Button>
                  {nota.esMia && (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => eliminarApunte(nota.id)}
                      aria-label={`Eliminar apunte ${nota.titulo}`}
                    >
                      <Trash2 className="mr-1 h-4 w-4" />
                      Eliminar
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
