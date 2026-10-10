"use client";

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, LogIn, GraduationCap, Info } from "lucide-react";
import { ThemeToggleButton } from "@/components/theme-toggle-button";
import { isDemoMode, DEMO_ADMIN } from "@/lib/demo";

// Componente que usa useSearchParams debe estar separado
function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = searchParams.get('redirect') || '/admin/add-notes';
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
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
      {/* Theme toggle button in top right corner */}
      <div className="absolute top-4 right-4">
        <ThemeToggleButton />
      </div>

      <Card className="w-full max-w-md shadow-lg border-border">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <GraduationCap className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold text-foreground">
            Panel de Administración
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Ingresa tus credenciales para acceder
          </CardDescription>
        </CardHeader>

        <CardContent>
          {demoMode && (
            <Alert className="mb-4 border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-100">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Estás en <strong>modo demo</strong> (sin base de datos). El acceso usa el flujo real de
                autenticación (<span className="font-mono text-xs">/api/auth/login</span>).
                Ingresá con las credenciales demo de abajo.
              </AlertDescription>
            </Alert>
          )}

          {sessionExpired && (
            <Alert className="mb-4 border-orange-200 bg-orange-50 text-orange-800">
              <AlertDescription>
                Tu sesión ha expirado (20 minutos de inactividad). Por favor, inicia sesión nuevamente.
              </AlertDescription>
            </Alert>
          )}

          {networkError && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>
                Error de conexión. Por favor, verifica tu conexión a internet e intenta nuevamente.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu-email@universidad.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="email"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={isLoading}
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
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

          <div className="mt-6 text-center text-sm text-muted-foreground">
            <p className="font-medium">Credenciales demo (solo visuales):</p>
            <div className="font-mono text-xs bg-muted p-3 rounded mt-2 space-y-1 text-muted-foreground text-left">
              <div>
                <strong>Email:</strong> {DEMO_ADMIN.email}
              </div>
              <div>
                <strong>Contraseña:</strong> {DEMO_ADMIN.password}
              </div>
            </div>
            <p className="mt-2 text-xs">
              Referencia informativa del modo demo. El inicio de sesión se valida
              con el flujo real de autenticación del servidor.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-2"
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
      <div className="min-h-screen flex items-center justify-center bg-background p-4 relative">
        {/* Theme toggle button in top right corner */}
        <div className="absolute top-4 right-4">
          <ThemeToggleButton />
        </div>

        <Card className="w-full max-w-md shadow-lg border-border">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <GraduationCap className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl font-bold text-foreground">
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
