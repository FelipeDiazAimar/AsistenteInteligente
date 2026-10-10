"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  ClipboardCheck,
  RotateCcw,
  SearchX,
  Trophy,
  XCircle,
} from "lucide-react";
import { DEMO_QUIZ } from "@/lib/demo";
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

function mensajePorPuntaje(porcentaje: number): string {
  if (porcentaje >= 80)
    return "¡Excelente! Dominas los conceptos clave de atención primaria.";
  if (porcentaje >= 60)
    return "Bien. Repasa los temas marcados y vuelve a intentarlo para afianzar.";
  return "Te conviene repasar los apuntes (HTA, diabetes y vacunación) y reintentar el quiz.";
}

export default function SelfAssessmentPage() {
  const preguntas = useMemo(
    () => (Array.isArray(DEMO_QUIZ) ? DEMO_QUIZ : []),
    []
  );
  const [respuestas, setRespuestas] = useState<Record<string, number>>({});
  const [corregido, setCorregido] = useState(false);

  const respondidas = Object.keys(respuestas).length;
  const total = preguntas.length;
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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const reintentar = () => {
    setRespuestas({});
    setCorregido(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (preguntas.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <header className="mb-8 text-center">
          <h1 className="font-headline text-4xl font-bold tracking-tight text-primary md:text-5xl">
            Autoevaluación
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
            Pon a prueba tus conocimientos con preguntas de repaso.
          </p>
        </header>
        <Card className="mx-auto max-w-xl bg-muted/50">
          <CardContent className="flex flex-col items-center gap-3 px-6 py-10 text-center">
            <span className="rounded-full bg-primary/10 p-4">
              <SearchX className="h-8 w-8 text-primary" />
            </span>
            <p className="text-lg font-semibold">
              Sin preguntas por el momento
            </p>
            <p className="text-sm text-muted-foreground">
              No se pudo cargar el cuestionario de demostración. Intenta
              recargar la página más tarde.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <header className="mb-8 text-center">
        <h1 className="font-headline text-4xl font-bold tracking-tight text-primary md:text-5xl">
          Autoevaluación
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Responde las {total} preguntas y comprueba tu puntaje al final.
          Recibirás feedback por pregunta.
        </p>
      </header>

      <div className="mb-6 flex items-center gap-3">
        <Progress
          value={total > 0 ? (respondidas / total) * 100 : 0}
          aria-label={`Progreso: ${respondidas} de ${total} respondidas`}
        />
        <span className="whitespace-nowrap text-sm text-muted-foreground">
          {respondidas}/{total}
        </span>
      </div>

      {corregido && (
        <Card className="mb-8 border-primary/40 shadow-lg">
          <CardHeader className="flex flex-row items-center gap-4">
            <span className="rounded-full bg-primary/10 p-3">
              <Trophy className="h-8 w-8 text-primary" />
            </span>
            <div>
              <CardTitle className="font-headline text-2xl">
                Tu puntaje: {puntaje}/{total} ({porcentaje}%)
              </CardTitle>
              <CardDescription className="mt-1 text-base">
                {mensajePorPuntaje(porcentaje)}
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <Progress value={porcentaje} aria-label={`Puntaje: ${porcentaje} por ciento`} />
          </CardContent>
          <CardFooter className="flex flex-col gap-2 sm:flex-row">
            <Button type="button" onClick={reintentar} className="w-full sm:w-auto">
              <RotateCcw className="mr-2 h-4 w-4" />
              Reintentar quiz
            </Button>
            <p className="text-sm text-muted-foreground sm:ml-2 sm:self-center">
              Puedes cambiar tus respuestas solo después de reintentar.
            </p>
          </CardFooter>
        </Card>
      )}

      <div className="flex flex-col gap-6">
        {preguntas.map((p, idx) => {
          const elegida = respuestas[p.id];
          const sinResponder = elegida === undefined;
          const esCorrecta = corregido && elegida === p.respuesta;
          const esIncorrecta =
            corregido && !sinResponder && elegida !== p.respuesta;

          return (
            <Card
              key={p.id}
              className={cn(
                "rounded-xl shadow-lg transition-colors",
                corregido &&
                  esCorrecta &&
                  "border-green-500/60 bg-green-50/50 dark:bg-green-950/20",
                corregido &&
                  esIncorrecta &&
                  "border-red-500/60 bg-red-50/50 dark:bg-red-950/20"
              )}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="font-headline text-lg font-semibold leading-snug">
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
              <CardContent className="flex flex-col gap-2">
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
                        "flex items-center justify-between gap-3 rounded-lg border px-4 py-3 text-left text-sm transition-all",
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
                      <span>
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
                  <p
                    className={cn(
                      "mt-2 flex items-start gap-2 rounded-lg px-3 py-2 text-sm",
                      esCorrecta
                        ? "bg-green-100 text-green-900 dark:bg-green-950/40 dark:text-green-100"
                        : "bg-red-100 text-red-900 dark:bg-red-950/40 dark:text-red-100"
                    )}
                    role="status"
                  >
                    {esCorrecta ? (
                      <>
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                        ¡Correcto! Buen dominio de este concepto.
                      </>
                    ) : (
                      <>
                        <XCircle className="mt-0.5 h-4 w-4 shrink-0" />
                        Respuesta correcta:{" "}
                        {p.opciones[p.respuesta] ??
                          "revisa el material de estudio"}
                        . Repasa este tema en los recursos.
                      </>
                    )}
                  </p>
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
            className="w-full sm:w-auto"
          >
            <ClipboardCheck className="mr-2 h-5 w-5" />
            Comprobar resultados
          </Button>
          <p className="mt-3 text-sm text-muted-foreground" aria-live="polite">
            {faltantes > 0
              ? `Te faltan ${faltantes} pregunta${faltantes === 1 ? "" : "s"} por responder.`
              : "¡Listo! Ya puedes ver tu puntaje."}
          </p>
        </div>
      ) : (
        <div className="mt-8 text-center">
          <Button
            type="button"
            size="lg"
            variant="outline"
            onClick={reintentar}
            className="w-full sm:w-auto"
          >
            <RotateCcw className="mr-2 h-5 w-5" />
            Intentar de nuevo
          </Button>
        </div>
      )}

      <p className="mt-8 text-center text-xs text-muted-foreground">
        Cuestionario de demostración con fines educativos. No reemplaza el
        criterio médico profesional.
      </p>
    </div>
  );
}
