"use client";

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, LogIn, GraduationCap, Info } from "lucide-react";
import { isDemoMode, DEMO_ADMIN } from "@/lib/demo";

// Componente que usa useSearchParams debe estar separado
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/resources/apuntes';
  const sessionExpired = searchParams.get('expired') === 'true';
  const networkError = searchParams.get('error') === 'network';
  // NEXT_PUBLIC_DEMO_MODE se inyecta en build: en cliente refleja el modo demo.
  const demoMode = isDemoMode();

  const fillDemoCredentials = () => {
    setEmail(DEMO_ADMIN.email);
    setPassword(DEMO_ADMIN.password);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Flujo real de autenticación: siempre contra la API.
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (data.success) {
        // El token se guarda automáticamente en las cookies desde el servidor
        router.push(redirectPath);
        router.refresh();
      } else {
        setError(data.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      console.error('Error en login:', error);
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[100dvh] items-center justify-center overflow-x-clip bg-muted/40 px-4 py-8">
      <Card className="mx-auto w-full max-w-sm min-w-0 border-border shadow-md">
        <CardHeader className="space-y-3 pb-4 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
            <GraduationCap className="h-7 w-7 shrink-0 text-primary" />
          </div>
          <div className="min-w-0 space-y-1">
            <CardTitle className="text-xl leading-tight font-bold tracking-tight text-balance text-foreground sm:text-2xl">
              Panel de Administración
            </CardTitle>
            <CardDescription className="text-sm leading-relaxed text-pretty text-muted-foreground">
              Ingresa tus credenciales para acceder
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="min-w-0">
          {demoMode && (
            <Alert className="mb-4 min-w-0 border-blue-200 bg-blue-50 text-sm leading-relaxed break-words text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-100">
              <Info className="h-4 w-4 shrink-0" />
              <AlertDescription className="min-w-0 break-words">
                Estás en <strong>modo demo</strong> (sin base de datos). El acceso usa el flujo real de
                autenticación (<span className="font-mono text-xs break-all">/api/auth/login</span>).
                Ingresá con las credenciales demo de abajo.
              </AlertDescription>
            </Alert>
          )}

          {sessionExpired && (
            <Alert className="mb-4 min-w-0 border-orange-200 bg-orange-50 text-sm leading-relaxed break-words text-orange-800">
              <AlertDescription className="break-words">
                Tu sesión ha expirado (20 minutos de inactividad). Por favor, inicia sesión nuevamente.
              </AlertDescription>
            </Alert>
          )}

          {networkError && (
            <Alert variant="destructive" className="mb-4 min-w-0 text-sm leading-relaxed break-words">
              <AlertDescription className="break-words">
                Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="min-w-0 space-y-4">
            {error && (
              <Alert variant="destructive" className="min-w-0">
                <AlertDescription className="text-sm leading-relaxed break-words">{error}</AlertDescription>
              </Alert>
            )}

            <div className="min-w-0 space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu-email@universidad.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="email"
                className="h-11 w-full min-w-0 text-base sm:text-sm"
              />
            </div>

            <div className="min-w-0 space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="current-password"
                className="h-11 w-full min-w-0 text-base sm:text-sm"
              />
            </div>

            <Button
              type="submit"
              className="h-11 w-full text-base sm:text-sm"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <LogIn className="mr-2 h-4 w-4" />
                  Iniciar Sesión
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 min-w-0 rounded-lg border bg-muted/60 p-3 text-center">
            <p className="text-xs font-semibold text-foreground">Credenciales demo</p>
            <div className="mt-1.5 min-w-0 space-y-1 font-mono text-[11px] leading-relaxed break-words text-muted-foreground sm:text-xs">
              <p className="min-w-0 break-all">{DEMO_ADMIN.email}</p>
              <p className="min-w-0 break-all">{DEMO_ADMIN.password}</p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2.5 h-9 w-full text-xs sm:h-8"
              onClick={fillDemoCredentials}
              disabled={isLoading}
            >
              Autocompletar credenciales demo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Componente principal con Suspense
export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[100dvh] items-center justify-center overflow-x-clip bg-muted/40 px-4 py-8">
        <Card className="mx-auto w-full max-w-sm min-w-0 border-border shadow-md">
          <CardHeader className="space-y-3 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 ring-1 ring-primary/20">
              <GraduationCap className="h-7 w-7 shrink-0 text-primary" />
            </div>
            <CardTitle className="text-xl leading-tight font-bold tracking-tight text-foreground sm:text-2xl">
              Cargando...
            </CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <LoginForm />
    </Suspense>
  );
}
