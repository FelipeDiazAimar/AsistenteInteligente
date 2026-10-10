"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  BookOpenCheck,
  ClipboardList,
  HelpCircle,
  ListChecks,
  Plus,
  SearchX,
  Trash2,
} from "lucide-react";
import * as demoModule from "@/lib/demo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

// ---------------------------------------------------------------------------
// Tipos (contrato esperado de DEMO_ASSESSMENTS en src/lib/demo.ts).
// Lectura defensiva: ese export puede no existir aún (otro agente lo crea
// en paralelo). No se importa por nombre para no romper la compilación.
// ---------------------------------------------------------------------------
type DemoPregunta = {
  id: string;
  pregunta: string;
  opciones: string[];
  respuesta: number;
  explicacion?: string;
};

type DemoAssessment = {
  id: string;
  titulo: string;
  descripcion: string;
  tema: string;
  nivel: string;
  preguntas: DemoPregunta[];
};

type PreguntaDraft = {
  pregunta: string;
  opciones: string[];
  respuesta: number;
  explicacion: string;
};

const STORAGE_KEY = "asistente-demo-assessments-v1";
const NIVELES = ["Inicial", "Intermedio", "Avanzado"] as const;

function leerMocks(): DemoAssessment[] {
  const raw = (demoModule as unknown as { DEMO_ASSESSMENTS?: unknown })
    .DEMO_ASSESSMENTS;
  if (!Array.isArray(raw)) return [];
  return raw.filter(esAssessmentValido) as DemoAssessment[];
}

function esAssessmentValido(a: unknown): a is DemoAssessment {
  if (!a || typeof a !== "object") return false;
  const v = a as Record<string, unknown>;
  return (
    typeof v.id === "string" &&
    typeof v.titulo === "string" &&
    Array.isArray(v.preguntas)
  );
}

function leerLocal(): DemoAssessment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(esAssessmentValido);
  } catch {
    return [];
  }
}

function nuevaPreguntaVacia(): PreguntaDraft {
  return { pregunta: "", opciones: ["", ""], respuesta: 0, explicacion: "" };
}

export default function SelfAssessmentCatalogPage() {
  const mocks = useMemo(() => leerMocks(), []);
  const [mias, setMias] = useState<DemoAssessment[]>([]);
  const [hidratado, setHidratado] = useState(false);

  // Formulario "Crear evaluación"
  const [abierto, setAbierto] = useState(false);
  const [titulo, setTitulo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [tema, setTema] = useState("");
  const [nivel, setNivel] = useState<string>("Inicial");
  const [preguntas, setPreguntas] = useState<PreguntaDraft[]>([
    nuevaPreguntaVacia(),
  ]);
  const [error, setError] = useState<string | null>(null);

  // Hidratar customizadas desde localStorage (solo cliente).
  useEffect(() => {
    setMias(leerLocal());
    setHidratado(true);
  }, []);

  // Persistir customizadas.
  useEffect(() => {
    if (!hidratado) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(mias));
    } catch {
      // Cuota llena o almacenamiento bloqueado: no rompe la página.
    }
  }, [mias, hidratado]);

  const idsMias = useMemo(() => new Set(mias.map((m) => m.id)), [mias]);

  const evaluaciones = useMemo(() => {
    const vistas = new Map<string, DemoAssessment>();
    for (const m of mocks) vistas.set(m.id, m);
    // Las mías fusionan con los mocks (sin duplicar ids).
    for (const c of mias) vistas.set(c.id, c);
    return Array.from(vistas.values());
  }, [mocks, mias]);

  function resetForm() {
    setTitulo("");
    setDescripcion("");
    setTema("");
    setNivel("Inicial");
    setPreguntas([nuevaPreguntaVacia()]);
    setError(null);
  }

  function actualizarPregunta(i: number, patch: Partial<PreguntaDraft>) {
    setPreguntas((prev) =>
      prev.map((p, idx) => (idx === i ? { ...p, ...patch } : p))
    );
  }

  function actualizarOpcion(pi: number, oi: number, valor: string) {
    setPreguntas((prev) =>
      prev.map((p, idx) =>
        idx === pi
          ? { ...p, opciones: p.opciones.map((o, j) => (j === oi ? valor : o)) }
          : p
      )
    );
  }

  function agregarPregunta() {
    setPreguntas((prev) => [...prev, nuevaPreguntaVacia()]);
  }

  function quitarPregunta(i: number) {
    setPreguntas((prev) => (prev.length <= 1 ? prev : prev.filter((_, idx) => idx !== i)));
  }

  function agregarOpcion(pi: number) {
    setPreguntas((prev) =>
      prev.map((p, idx) =>
        idx === pi ? { ...p, opciones: [...p.opciones, ""] } : p
      )
    );
  }

  function quitarOpcion(pi: number, oi: number) {
    setPreguntas((prev) =>
      prev.map((p, idx) => {
        if (idx !== pi) return p;
        if (p.opciones.length <= 2) return p;
        const opciones = p.opciones.filter((_, j) => j !== oi);
        const respuesta = Math.min(p.respuesta, opciones.length - 1);
        return { ...p, opciones, respuesta };
      })
    );
  }

  function guardar() {
    const tituloLimpio = titulo.trim();
    if (!tituloLimpio) {
      setError("Ponle un título a la evaluación.");
      return;
    }
    const validas = preguntas
      .map((p) => ({
        pregunta: p.pregunta.trim(),
        opciones: p.opciones.map((o) => o.trim()),
        respuesta: p.respuesta,
        explicacion: p.explicacion.trim(),
      }))
      .filter(
        (p) =>
          p.pregunta.length > 0 &&
          p.opciones.length >= 2 &&
          p.opciones.every((o) => o.length > 0) &&
          p.respuesta >= 0 &&
          p.respuesta < p.opciones.length
      );
    if (validas.length === 0) {
      setError(
        "Agrega al menos una pregunta válida: texto, 2 o más opciones con texto y marca la correcta."
      );
      return;
    }
    const stamp = Date.now();
    const nueva: DemoAssessment = {
      id: `mia-${stamp}`,
      titulo: tituloLimpio,
      descripcion:
        descripcion.trim() || "Evaluación creada por ti en este navegador.",
      tema: tema.trim() || "General",
      nivel: nivel.trim() || "Inicial",
      preguntas: validas.map((p, i) => ({
        id: `mia-${stamp}-p${i}`,
        pregunta: p.pregunta,
        opciones: p.opciones,
        respuesta: p.respuesta,
        ...(p.explicacion ? { explicacion: p.explicacion } : {}),
      })),
    };
    setMias((prev) => [...prev, nueva]);
    setAbierto(false);
    resetForm();
  }

  function eliminar(id: string) {
    setMias((prev) => prev.filter((m) => m.id !== id));
  }

  return (
    <div className="container mx-auto w-full max-w-6xl overflow-x-clip px-4 py-6 sm:py-8">
      <header className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-headline break-words text-3xl font-bold tracking-tight text-primary sm:text-4xl md:text-5xl">
            Autoevaluaciones
          </h1>
          <p className="mt-3 max-w-2xl break-words text-base text-muted-foreground sm:text-lg">
            Elige una evaluación para poner a prueba tus conocimientos.
            {hidratado && evaluaciones.length > 0
              ? ` Hay ${evaluaciones.length} disponible${evaluaciones.length === 1 ? "" : "s"}.`
              : " Las preguntas se corrigen con feedback inmediato."}
          </p>
        </div>

        <Dialog
          open={abierto}
          onOpenChange={(v) => {
            setAbierto(v);
            if (!v) setError(null);
          }}
        >
          <DialogTrigger asChild>
            <Button type="button" className="min-h-11 w-full sm:w-auto">
              <Plus className="mr-2 h-4 w-4" />
              Crear evaluación
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[85dvh] w-[calc(100vw-2rem)] overflow-y-auto overscroll-contain p-4 sm:max-w-2xl sm:p-6">
            <DialogHeader>
              <DialogTitle>Crear evaluación</DialogTitle>
              <DialogDescription>
                Se guarda solo en este navegador (demo local) y aparece con la
                insignia “Mía”.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-2">
              <div className="grid gap-2">
                <Label htmlFor="nueva-titulo">Título *</Label>
                <Input
                  id="nueva-titulo"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Ej. Repaso de HTA"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="nueva-descripcion">Descripción</Label>
                <Textarea
                  id="nueva-descripcion"
                  value={descripcion}
                  onChange={(e) => setDescripcion(e.target.value)}
                  placeholder="¿Qué repasa esta evaluación?"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="grid gap-2">
                  <Label htmlFor="nueva-tema">Tema</Label>
                  <Input
                    id="nueva-tema"
                    value={tema}
                    onChange={(e) => setTema(e.target.value)}
                    placeholder="Ej. Hipertensión"
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="nueva-nivel">Nivel</Label>
                  <Select value={nivel} onValueChange={setNivel}>
                    <SelectTrigger id="nueva-nivel">
                      <SelectValue placeholder="Elige un nivel" />
                    </SelectTrigger>
                    <SelectContent>
                      {NIVELES.map((n) => (
                        <SelectItem key={n} value={n}>
                          {n}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-3">
                <div className="flex items-center justify-between">
                  <Label>Preguntas *</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={agregarPregunta}
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Agregar pregunta
                  </Button>
                </div>

                {preguntas.map((p, pi) => (
                  <div key={pi} className="min-w-0 rounded-lg border p-3 sm:p-4">
                    <div className="mb-3 flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold">
                        Pregunta {pi + 1}
                      </p>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => quitarPregunta(pi)}
                        disabled={preguntas.length <= 1}
                        aria-label={`Quitar pregunta ${pi + 1}`}
                      >
                        <Trash2 className="mr-1 h-4 w-4" />
                        Quitar
                      </Button>
                    </div>

                    <div className="grid gap-3">
                      <Input
                        value={p.pregunta}
                        onChange={(e) =>
                          actualizarPregunta(pi, { pregunta: e.target.value })
                        }
                        placeholder="Escribe la pregunta"
                        aria-label={`Texto de la pregunta ${pi + 1}`}
                      />

                      <div className="grid gap-2">
                        {p.opciones.map((op, oi) => (
                          <div key={oi} className="flex min-w-0 items-center gap-2">
                            <input
                              type="radio"
                              name={`correcta-${pi}`}
                              checked={p.respuesta === oi}
                              onChange={() =>
                                actualizarPregunta(pi, { respuesta: oi })
                              }
                              aria-label={`Marcar opción ${oi + 1} como correcta en pregunta ${pi + 1}`}
                              className="h-4 w-4 shrink-0 accent-primary"
                            />
                            <Input
                              value={op}
                              onChange={(e) =>
                                actualizarOpcion(pi, oi, e.target.value)
                              }
                              placeholder={`Opción ${oi + 1} (marca la correcta)`}
                              aria-label={`Opción ${oi + 1} de la pregunta ${pi + 1}`}
                              className="min-w-0 flex-1"
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => quitarOpcion(pi, oi)}
                              disabled={p.opciones.length <= 2}
                              aria-label={`Quitar opción ${oi + 1}`}
                              className="shrink-0"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => agregarOpcion(pi)}
                          className="w-fit"
                        >
                          <Plus className="mr-1 h-4 w-4" />
                          Agregar opción
                        </Button>
                      </div>

                      <Input
                        value={p.explicacion}
                        onChange={(e) =>
                          actualizarPregunta(pi, {
                            explicacion: e.target.value,
                          })
                        }
                        placeholder="Explicación (opcional)"
                        aria-label={`Explicación de la pregunta ${pi + 1}`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {error && (
                <p role="alert" className="text-sm text-destructive">
                  {error}
                </p>
              )}
            </div>

            <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => setAbierto(false)}
                className="min-h-11 w-full sm:w-auto"
              >
                Cancelar
              </Button>
              <Button
                type="button"
                onClick={guardar}
                className="min-h-11 w-full sm:w-auto"
              >
                Guardar evaluación
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      {!hidratado ? (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 w-2/3 rounded bg-muted" />
                <div className="mt-2 h-3 w-full rounded bg-muted" />
              </CardHeader>
              <CardContent>
                <div className="h-3 w-1/2 rounded bg-muted" />
              </CardContent>
              <CardFooter>
                <div className="h-10 w-full rounded bg-muted" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : evaluaciones.length === 0 ? (
        <Card className="mx-auto max-w-xl bg-muted/50">
          <CardContent className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <span className="rounded-full bg-primary/10 p-4">
              <SearchX className="h-8 w-8 text-primary" />
            </span>
            <p className="text-lg font-semibold">Pronto habrá evaluaciones</p>
            <p className="text-sm text-muted-foreground">
              Aún no hay autoevaluaciones disponibles. Puedes crear la primera
              con el botón “Crear evaluación”: se guarda en este navegador.
            </p>
            <Button
              type="button"
              onClick={() => setAbierto(true)}
              className="mt-2"
            >
              <Plus className="mr-2 h-4 w-4" />
              Crear mi primera evaluación
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {evaluaciones.map((a) => {
            const esMia = idsMias.has(a.id);
            const total = Array.isArray(a.preguntas) ? a.preguntas.length : 0;
            return (
              <Card key={a.id} className="flex min-w-0 flex-col rounded-xl shadow-lg">
                <CardHeader className="pb-3">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    {a.tema && (
                      <Badge variant="secondary" className="max-w-full break-words">
                        {a.tema}
                      </Badge>
                    )}
                    {a.nivel && (
                      <Badge variant="outline" className="max-w-full break-words">
                        {a.nivel}
                      </Badge>
                    )}
                    {esMia && <Badge>Mía</Badge>}
                  </div>
                  <CardTitle className="font-headline break-words text-lg font-semibold leading-snug">
                    {a.titulo}
                  </CardTitle>
                  {a.descripcion && (
                    <CardDescription className="break-words line-clamp-2">
                      {a.descripcion}
                    </CardDescription>
                  )}
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-2 text-sm text-muted-foreground">
                  <p className="flex items-center gap-2 break-words">
                    <ListChecks className="h-4 w-4 shrink-0 text-primary" />
                    {total} pregunta{total === 1 ? "" : "s"}
                  </p>
                  <p className="flex items-center gap-2 break-words">
                    <ClipboardList className="h-4 w-4 shrink-0 text-primary" />
                    Corrección con feedback inmediato
                  </p>
                </CardContent>
                <CardFooter className="flex gap-2">
                  <Button asChild className="min-h-11 min-w-0 flex-1">
                    <Link href={`/self-assessment/${a.id}`}>
                      <BookOpenCheck className="mr-2 h-4 w-4 shrink-0" />
                      <span className="truncate">Comenzar</span>
                    </Link>
                  </Button>
                  {esMia && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => eliminar(a.id)}
                      aria-label={`Eliminar ${a.titulo}`}
                      title="Eliminar mi evaluación"
                      className="shrink-0"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </CardFooter>
              </Card>
            );
          })}
        </div>
      )}

      <p className="mt-8 flex items-start justify-center gap-2 break-words text-center text-xs text-muted-foreground">
        <HelpCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span>
          Contenido de demostración con fines educativos. Las evaluaciones
          creadas se guardan solo en este navegador.
        </span>
      </p>
    </div>
  );
}
