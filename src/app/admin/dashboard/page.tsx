"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Users,
  BookOpen,
  Activity,
  FileText,
  HelpCircle,
  LogOut,
  Shield,
  Database,
  Info,
  LogIn,
} from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { useSessionExpiration } from '@/hooks/use-session-expiration';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { DEMO_NOTES, DEMO_QUIZ, DEMO_RESOURCES, isDemoMode, DEMO_ADMIN } from '@/lib/demo';

// Importar componentes para cada sección
import { ProfessorsManagement, ResourcesManagement, SessionsManagement } from './components';

const ADMIN_EMAILS = ['admin1@admin1.com', 'admin@university.edu'];

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout, isLoading: authLoading } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const demo = isDemoMode();

  // Hook para manejar expiración automática de sesiones
  useSessionExpiration();

  // Verificar si el usuario es admin (en modo demo, admin@demo.local también es admin)
  useEffect(() => {
    // En demo no se espera al auth: vista previa inmediata.
    if (demo) {
      setLoading(false);
      return;
    }
    if (authLoading) return;
    if (user) {
      const userIsAdmin =
        ADMIN_EMAILS.includes(user.email) || (demo && user.email?.toLowerCase() === DEMO_ADMIN.email);
      setIsAdmin(userIsAdmin);

      if (!userIsAdmin) {
        router.push('/resources/apuntes');
        return;
      }
    }
    setLoading(false);
  }, [user, authLoading, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  if (!demo && (loading || authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 sm:h-32 sm:w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  // En modo demo se permite vista previa sin sesión; en modo real se exige admin.
  const demoPreview = demo && (!user || !isAdmin);

  if (!demoPreview && (!user || !isAdmin)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <Alert className="max-w-md">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            No tienes permisos de administrador para acceder a esta página.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card shadow border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 py-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-primary mr-3 shrink-0" />
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-foreground">Panel de Administración</h1>
                <p className="text-sm text-muted-foreground">
                  Bienvenido, {user?.name ?? 'visitante'}
                </p>
              </div>
            </div>
            {user ? (
              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </Button>
            ) : (
              <Button
                variant="outline"
                onClick={() => router.push('/admin/login')}
                className="flex items-center gap-2 w-full sm:w-auto"
              >
                <LogIn className="h-4 w-4" />
                Ir al acceso
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {demoPreview && (
          <Alert className="mb-6 border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-100">
            <Info className="h-4 w-4" />
            <AlertDescription>
              <strong>Vista previa:</strong> las cifras provienen de los datos
              locales disponibles y no requieren base de datos. Para gestionar datos
              completos, inicia sesión con una cuenta administradora.
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 h-auto gap-1">
            <TabsTrigger value="overview" className="flex items-center gap-2 text-xs sm:text-sm">
              <Database className="h-4 w-4" />
              Resumen
            </TabsTrigger>
            <TabsTrigger value="professors" className="flex items-center gap-2 text-xs sm:text-sm">
              <Users className="h-4 w-4" />
              Profesores
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2 text-xs sm:text-sm">
              <BookOpen className="h-4 w-4" />
              Recursos
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-2 text-xs sm:text-sm">
              <Activity className="h-4 w-4" />
              Sesiones
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <OverviewSection />
          </TabsContent>

          <TabsContent value="professors" className="space-y-6">
            <ProfessorsManagement />
          </TabsContent>

          <TabsContent value="resources" className="space-y-6">
            <ResourcesManagement />
          </TabsContent>

          <TabsContent value="sessions" className="space-y-6">
            <SessionsManagement />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

// Componente de resumen
function OverviewSection() {
  const demo = isDemoMode();
  const [stats, setStats] = useState({
    professors: 0,
    resources: 0,
    activeSessions: 0,
  });
  const [error, setError] = useState<string | null>(null);
  const [loadingStats, setLoadingStats] = useState(!demo);

  useEffect(() => {
    // En modo demo no se llama a la API: cifras locales de demostración.
    if (demo) return;

    let cancelled = false;

    const loadStats = async () => {
      setLoadingStats(true);
      setError(null);
      try {
        const resourcesResponse = await fetch('/api/admin/resources', {
          credentials: 'include'
        });

        if (!resourcesResponse.ok) {
          throw new Error(`La API respondió con estado ${resourcesResponse.status}`);
        }

        const resourcesData = await resourcesResponse.json();

        if (cancelled) return;

        // Por ahora, mantener profesores y sesiones como datos de ejemplo
        // En el futuro se pueden hacer llamadas reales a sus respectivas APIs
        setStats({
          professors: 4, // Dato de ejemplo
          resources: resourcesData.success && Array.isArray(resourcesData.resources)
            ? resourcesData.resources.length
            : 0,
          activeSessions: 1 // Dato de ejemplo
        });

        if (!resourcesData.success) {
          setError('No se pudieron cargar los recursos. Se muestran valores parciales.');
        }
      } catch (error) {
        console.error('Error loading stats:', error);
        if (cancelled) return;
        // Estado elegante en vez de romper: valores en cero + aviso
        setStats({
          professors: 0,
          resources: 0,
          activeSessions: 0
        });
        setError('No se pudo conectar con el servidor. Intenta de nuevo más tarde.');
      } finally {
        if (!cancelled) setLoadingStats(false);
      }
    };

    loadStats();
    return () => { cancelled = true; };
  }, [demo]);

  if (demo) {
    const demoCards = [
      {
        title: 'Apuntes',
        value: DEMO_NOTES.length,
        description: 'Apuntes precargados disponibles sin base de datos',
        icon: FileText,
      },
      {
        title: 'Recursos',
        value: DEMO_RESOURCES.length,
        description: 'Guías, videos y material de ejemplo',
        icon: BookOpen,
      },
      {
        title: 'Preguntas',
        value: DEMO_QUIZ.length,
        description: 'Preguntas de autoevaluación precargadas',
        icon: HelpCircle,
      },
      {
        title: 'Sesiones',
        value: 0,
        description: 'Sin sesiones registradas por el momento',
        icon: Activity,
      },
    ];

    return (
      <div className="space-y-4">
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40">
          <CardContent className="pt-6">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              Cifras calculadas con los datos locales disponibles (apuntes, recursos y
              autoevaluación). No se consultó ninguna API.
            </p>
          </CardContent>
        </Card>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {demoCards.map((card) => (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
                <card.icon className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{card.value}</div>
                <p className="text-xs text-muted-foreground">
                  {card.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Profesores</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loadingStats ? '—' : stats.professors}</div>
            <p className="text-xs text-muted-foreground">
              Profesores registrados en el sistema
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Recursos Totales</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loadingStats ? '—' : stats.resources}</div>
            <p className="text-xs text-muted-foreground">
              Recursos educativos disponibles
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sesiones Activas</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loadingStats ? '—' : stats.activeSessions}</div>
            <p className="text-xs text-muted-foreground">
              Profesores conectados actualmente
            </p>
          </CardContent>
        </Card>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Acerca de estas cifras</CardTitle>
          <CardDescription>
            Los contadores de profesores y sesiones son valores de ejemplo hasta integrar
            sus APIs definitivas.
          </CardDescription>
        </CardHeader>
      </Card>
    </div>
  );
}
