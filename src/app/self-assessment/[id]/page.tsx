"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardCheck,
  Loader2,
  RotateCcw,
  SearchX,
  Trophy,
  XCircle,
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
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

// ---- Tipos inline (contrato esperado de DEMO_ASSESSMENTS) ----
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
  descripcion?: string;
  tema?: string;
  nivel?: string;
  preguntas: DemoPregunta[];
};

const STORAGE_KEY = "asistente-demo-assessments-v1";
const FALLBACK_IDS = ["general", "demo", "demo-quiz"];

function esPreguntaValida(p: unknown): p is DemoPregunta {
  if (typeof p !== "object" || p === null) return false;
  const c = p as Record<string, unknown>;
  return (
    typeof c.id === "string" &&
    typeof c.pregunta === "string" &&
    Array.isArray(c.opciones) &&
    (c.opciones as unknown[]).every((o) => typeof o === "string") &&
    (c.opciones as string[]).length >= 2 &&
    typeof c.respuesta === "number" &&
    Number.isInteger(c.respuesta) &&
    (c.respuesta as number) >= 0 &&
    (c.respuesta as number) < (c.opciones as string[]).length &&
    (c.explicacion === undefined || typeof c.explicacion === "string")
  );
}

function esAssessmentValido(a: unknown): a is DemoAssessment {
  if (typeof a !== "object" || a === null) return false;
  const c = a as Record<string, unknown>;
  return (
    typeof c.id === "string" &&
    c.id.length > 0 &&
    typeof c.titulo === "string" &&
    c.titulo.length > 0 &&
    (c.descripcion === undefined || typeof c.descripcion === "string") &&
    (c.tema === undefined || typeof c.tema === "string") &&
    (c.nivel === undefined || typeof c.nivel === "string") &&
    Array.isArray(c.preguntas) &&
    (c.preguntas as unknown[]).every(esPreguntaValida)
  );
}

function leerPersonalizadas(): DemoAssessment[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return (parsed as unknown[]).filter(esAssessmentValido);
  } catch {
    return [];
  }
}

// DEMO_ASSESSMENTS aún no existe en src/lib/demo.ts: acceso defensivo por
// namespace para no romper el build si el export falta o no es un array.
function leerBaseDemo(): DemoAssessment[] {
  const mod = demoModule as unknown as Record<string, unknown>;
  const base: unknown = mod.DEMO_ASSESSMENTS;
  if (!Array.isArray(base)) return [];
  return (base as unknown[]).filter(esAssessmentValido);
}

// DEMO_QUIZ sí existe: se usa solo como respaldo para que los ids
// "general" / "demo" / "demo-quiz" abran el cuestionario de demostración.
// Cualquier otro id inexistente sigue mostrando "evaluación no encontrada".
function respaldoDesdeDemoQuiz(): DemoAssessment | null {
  const mod = demoModule as unknown as Record<string, unknown>;
  const quiz: unknown = mod.DEMO_QUIZ;
  if (!Array.isArray(quiz)) return null;
  const preguntas = (quiz as unknown[]).filter(esPreguntaValida);
  if (preguntas.length === 0) return null;
  return {
    id: "general",
    titulo: "Autoevaluación general",
    descripcion:
      "Cuestionario de demostración con preguntas de repaso de atención primaria (HTA, diabetes y vacunación).",
    tema: "Atención primaria",
    nivel: "General",
    preguntas,
  };
}

function mensajePorPuntaje(porcentaje: number): string {
  if (porcentaje >= 80)
    return "¡Excelente! Dominas los conceptos clave de esta evaluación.";
  if (porcentaje >= 60)
    return "Bien. Repasa los temas marcados y vuelve a intentarlo para afianzar.";
  return "Te conviene repasar el material de estudio y reintentar la evaluación.";
}

export default function SelfAssessmentDetailPage() {
  const params = useParams();
  const crudo = params?.id;
  const idPedido = useMemo(() => {
    const v = Array.isArray(crudo) ? (crudo[0] ?? "") : ((crudo as string) ?? "");
    try {
      return decodeURIComponent(v);
    } catch {
      return v;
    }
  }, [crudo]);

  const [cargando, setCargando] = useState(true);
  const [evaluacion, setEvaluacion] = useState<DemoAssessment | null>(null);
  const [respuestas, setRespuestas] = useState<Record<string, number>>({});
  const [corregido, setCorregido] = useState(false);

  useEffect(() => {
    const base = leerBaseDemo();
    const personalizadas = leerPersonalizadas();
    const porId = new Map<string, DemoAssessment>();
    for (const a of [...base, ...personalizadas]) porId.set(a.id, a);
    let encontrada = porId.get(idPedido) ?? null;
    if (!encontrada && FALLBACK_IDS.includes(idPedido)) {
      const respaldo = respaldoDesdeDemoQuiz();
      if (respaldo && !porId.has(respaldo.id)) encontrada = respaldo;
      else if (respaldo) encontrada = respaldo;
    }
    setEvaluacion(encontrada);
    setRespuestas({});
    setCorregido(false);
    setCargando(false);
  }, [idPedido]);

  const preguntas = useMemo(
    () => (evaluacion && Array.isArray(evaluacion.preguntas) ? evaluacion.preguntas : []),
    [evaluacion]
  );
  const total = preguntas.length;
  const respondidas = useMemo(
    () => preguntas.filter((p) => respuestas[p.id] !== undefined).length,
    [preguntas, respuestas]
  );
  const faltantes = total - respondidas;

  const puntaje = useMemo(() => {
    if (!corregido) return 0;
    return preguntas.filter((p) => respuestas[p.id] === p.respuesta).length;
  }, [corregido, preguntas, respuestas]);
  const porcentaje = total > 0 ? Math.round((puntaje / total) * 100) : 0;

  const elegir = (preguntaId: string, opcionIdx: number) => {
    if (corregido) return;
    setRespuestas((prev) => ({ ...prev, [preguntaId]: opcionIdx }));
  };

  const comprobar = () => {
    if (respondidas < total) return;
    setCorregido(true);
    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const reintentar = () => {
    setRespuestas({});
    setCorregido(false);
    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (cargando) {
    return (
      <div className="container mx-auto w-full max-w-3xl overflow-x-clip px-4 py-6 sm:py-8">
        <Card className="bg-muted/50">
          <CardContent className="flex flex-col items-center gap-3 px-6 py-12 text-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-sm text-muted-foreground">Cargando evaluación…</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!evaluacion) {
    return (
      <div className="container mx-auto w-full max-w-3xl overflow-x-clip px-4 py-6 sm:py-8">
        <Card className="mx-auto min-w-0 max-w-xl bg-muted/50">
          <CardContent className="flex min-w-0 flex-col items-center gap-3 px-4 py-10 text-center sm:px-6">
            <span className="rounded-full bg-primary/10 p-4">
              <SearchX className="h-8 w-8 text-primary" />
            </span>
            <p className="break-words text-lg font-semibold">Evaluación no encontrada</p>
            <p className="min-w-0 max-w-full break-words text-sm text-muted-foreground">
              No existe una evaluación con el identificador{" "}
              <span className="break-all font-mono font-medium text-foreground">
                {idPedido || "(vacío)"}
              </span>
              . Revisa el catálogo y elige una disponible.
            </p>
            <Button asChild className="mt-2 min-h-11 w-full sm:w-auto">
              <Link href="/self-assessment">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al catálogo
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (total === 0) {
    return (
      <div className="container mx-auto w-full max-w-3xl overflow-x-clip px-4 py-6 sm:py-8">
        <Card className="mx-auto min-w-0 max-w-xl bg-muted/50">
          <CardContent className="flex min-w-0 flex-col items-center gap-3 px-4 py-10 text-center sm:px-6">
            <span className="rounded-full bg-primary/10 p-4">
              <SearchX className="h-8 w-8 text-primary" />
            </span>
            <p className="break-words text-lg font-semibold">{evaluacion.titulo}</p>
            <p className="break-words text-sm text-muted-foreground">
              Esta evaluación todavía no tiene preguntas para mostrar.
            </p>
            <Button asChild className="mt-2 min-h-11 w-full sm:w-auto">
              <Link href="/self-assessment">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al catálogo
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto w-full max-w-3xl overflow-x-clip px-4 py-6 sm:py-8">
      <div className="mb-4 sm:mb-6">
        <Button asChild variant="ghost" size="sm" className="min-h-11">
          <Link href="/self-assessment">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Catálogo
          </Link>
        </Button>
      </div>

      <header className="mb-6 text-center sm:mb-8">
        <div className="mb-3 flex max-w-full flex-wrap items-center justify-center gap-2">
          {evaluacion.tema ? (
            <Badge variant="secondary" className="max-w-full break-words">
              {evaluacion.tema}
            </Badge>
          ) : null}
          {evaluacion.nivel ? (
            <Badge variant="outline" className="max-w-full break-words">
              {evaluacion.nivel}
            </Badge>
          ) : null}
          <Badge variant="outline" className="shrink-0">
            {total} preguntas
          </Badge>
        </div>
        <h1 className="font-headline break-words text-2xl font-bold tracking-tight text-primary sm:text-4xl md:text-5xl">
          {evaluacion.titulo}
        </h1>
        {evaluacion.descripcion ? (
          <p className="mx-auto mt-3 max-w-2xl break-words text-base text-muted-foreground sm:mt-4 sm:text-lg">
            {evaluacion.descripcion}
          </p>
        ) : (
          <p className="mx-auto mt-3 max-w-2xl break-words text-base text-muted-foreground sm:mt-4 sm:text-lg">
            Responde las {total} preguntas y comprueba tu puntaje al final.
          </p>
        )}
      </header>

      <div className="mb-6 flex min-w-0 items-center gap-3">
        <Progress
          value={total > 0 ? (respondidas / total) * 100 : 0}
          aria-label={`Progreso: ${respondidas} de ${total} respondidas`}
          className="h-3 min-w-0 flex-1 sm:h-4"
        />
        <span className="shrink-0 whitespace-nowrap text-sm font-medium tabular-nums text-muted-foreground">
          {respondidas}/{total}
        </span>
      </div>

      {corregido && (
        <Card className="mb-6 min-w-0 border-primary/40 shadow-lg sm:mb-8">
          <CardHeader className="flex min-w-0 flex-col gap-3 p-4 sm:flex-row sm:items-center sm:gap-4 sm:p-6">
            <span className="w-fit shrink-0 rounded-full bg-primary/10 p-3">
              <Trophy className="h-8 w-8 text-primary" />
            </span>
            <div className="min-w-0 flex-1">
              <CardTitle className="font-headline break-words text-xl sm:text-2xl">
                Tu puntaje: {puntaje}/{total} ({porcentaje}%)
              </CardTitle>
              <CardDescription className="mt-1 break-words text-sm sm:text-base">
                {mensajePorPuntaje(porcentaje)}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-0 sm:p-6 sm:pt-0">
            <Progress
              value={porcentaje}
              aria-label={`Puntaje: ${porcentaje} por ciento`}
              className="h-3 min-w-0 flex-1 sm:h-4"
            />
          </CardContent>
          <CardFooter className="flex flex-col gap-2 p-4 pt-0 sm:flex-row sm:p-6 sm:pt-0">
            <Button type="button" onClick={reintentar} className="min-h-11 w-full sm:w-auto">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reintentar
            </Button>
            <Button asChild variant="outline" className="min-h-11 w-full sm:w-auto">
              <Link href="/self-assessment">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Volver al catálogo
              </Link>
            </Button>
          </CardFooter>
        </Card>
      )}

      <div className="flex w-full min-w-0 flex-col gap-4 sm:gap-6">
        {preguntas.map((p, idx) => {
          const elegida = respuestas[p.id];
          const sinResponder = elegida === undefined;
          const esCorrecta = corregido && elegida === p.respuesta;
          const esIncorrecta = corregido && !sinResponder && elegida !== p.respuesta;

          return (
            <Card
              key={p.id}
              className={cn(
                "min-w-0 rounded-xl shadow-lg transition-colors",
                corregido &&
                  esCorrecta &&
                  "border-green-500/60 bg-green-50/50 dark:bg-green-950/20",
                corregido &&
                  esIncorrecta &&
                  "border-red-500/60 bg-red-50/50 dark:bg-red-950/20"
              )}
            >
              <CardHeader className="p-4 pb-3 sm:p-6 sm:pb-3">
                <div className="flex min-w-0 items-start justify-between gap-2 sm:gap-3">
                  <CardTitle className="font-headline min-w-0 flex-1 break-words text-base font-semibold leading-snug sm:text-lg">
                    <span className="mr-2 text-primary">{idx + 1}.</span>
                    {p.pregunta}
                  </CardTitle>
                  {corregido && (
                    <Badge
                      variant={esCorrecta ? "default" : "destructive"}
                      className={cn(
                        "shrink-0",
                        esCorrecta && "bg-green-600 hover:bg-green-600/90"
                      )}
                    >
                      {esCorrecta ? "Correcta" : "A revisar"}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex min-w-0 flex-col gap-2 p-4 pt-0 sm:p-6 sm:pt-0">
                {p.opciones.map((opcion, opcionIdx) => {
                  const esLaCorrecta = p.respuesta === opcionIdx;
                  const esLaElegida = elegida === opcionIdx;
                  return (
                    <button
                      key={opcionIdx}
                      type="button"
                      disabled={corregido}
                      onClick={() => elegir(p.id, opcionIdx)}
                      aria-pressed={esLaElegida}
                      className={cn(
                        "flex min-h-11 w-full min-w-0 items-center justify-between gap-2 whitespace-normal break-words rounded-lg border px-3 py-3 text-left text-sm transition-all sm:gap-3 sm:px-4",
                        !corregido &&
                          !esLaElegida &&
                          "border-border hover:border-primary/60 hover:bg-muted/60",
                        !corregido &&
                          esLaElegida &&
                          "border-primary bg-primary/10 font-medium",
                        corregido &&
                          esLaCorrecta &&
                          "border-green-600 bg-green-100 font-medium dark:bg-green-950/40",
                        corregido &&
                          esLaElegida &&
                          !esLaCorrecta &&
                          "border-red-500 bg-red-100 dark:bg-red-950/40",
                        corregido &&
                          !esLaElegida &&
                          !esLaCorrecta &&
                          "opacity-70",
                        corregido && "cursor-default"
                      )}
                    >
                      <span className="min-w-0 flex-1 break-words">
                        <span className="mr-2 font-semibold text-muted-foreground">
                          {String.fromCharCode(65 + opcionIdx)}.
                        </span>
                        {opcion}
                      </span>
                      {corregido && esLaCorrecta && (
                        <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600" />
                      )}
                      {corregido && esLaElegida && !esLaCorrecta && (
                        <XCircle className="h-5 w-5 shrink-0 text-red-500" />
                      )}
                    </button>
                  );
                })}

                {corregido && (
                  <div
                    className={cn(
                      "mt-2 flex min-w-0 items-start gap-2 break-words rounded-lg px-3 py-2 text-sm",
                      esCorrecta
                        ? "bg-green-100 text-green-900 dark:bg-green-950/40 dark:text-green-100"
                        : "bg-red-100 text-red-900 dark:bg-red-950/40 dark:text-red-100"
                    )}
                    role="status"
                  >
                    {esCorrecta ? (
                      <>
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>
                          ¡Correcto! Buen dominio de este concepto.
                          {p.explicacion ? ` ${p.explicacion}` : ""}
                        </span>
                      </>
                    ) : (
                      <>
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        <span>
                          Respuesta correcta:{" "}
                          {p.opciones[p.respuesta] ?? "revisa el material de estudio"}.
                          {p.explicacion ? ` ${p.explicacion}` : " Repasa este tema en los recursos."}
                        </span>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {!corregido ? (
        <div className="mt-8 text-center">
          <Button
            type="button"
            size="lg"
            onClick={comprobar}
            disabled={faltantes > 0}
            className="max-w-full whitespace-normal break-words w-full sm:w-auto"
          >
            <ClipboardCheck className="mr-2 h-5 w-5 shrink-0" />
            Comprobar resultados
          </Button>
          <p className="mt-3 break-words text-sm text-muted-foreground" aria-live="polite">
            {faltantes > 0
              ? `Te faltan ${faltantes} pregunta${faltantes === 1 ? "" : "s"} por responder.`
              : "¡Listo! Ya puedes ver tu puntaje."}
          </p>
        </div>
      ) : (
        <div className="mt-8 flex flex-col justify-center gap-2 sm:flex-row">
          <Button
            type="button"
            size="lg"
            variant="outline"
            onClick={reintentar}
            className="min-h-11 w-full sm:w-auto"
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Intentar de nuevo
          </Button>
          <Button asChild size="lg" className="min-h-11 w-full sm:w-auto">
            <Link href="/self-assessment">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Volver al catálogo
            </Link>
          </Button>
        </div>
      )}

      <p className="mt-8 break-words text-center text-xs text-muted-foreground">
        Evaluación de demostración con fines educativos. No reemplaza el criterio
        médico profesional.
      </p>
    </div>
  );
}
