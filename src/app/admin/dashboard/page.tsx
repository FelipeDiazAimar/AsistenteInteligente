"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  BookOpen, 
  Activity, 
  Settings,
  Plus,
  Edit,
  Trash2,
  LogOut,
  Shield,
  Clock,
  Database
} from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { Alert, AlertDescription } from "@/components/ui/alert";

// Importar componentes para cada sección
import { ProfessorsManagement, ResourcesManagement, SessionsManagement } from './components';

export default function AdminDashboard() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Verificar si el usuario es admin
  useEffect(() => {
    if (user) {
      const userIsAdmin = user.email === 'admin1@admin1.com' || user.email === 'admin@university.edu';
      setIsAdmin(userIsAdmin);
      
      if (!userIsAdmin) {
        router.push('/admin/add-notes');
        return;
      }
    }
    setLoading(false);
  }, [user, router]);

  const handleLogout = async () => {
    await logout();
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
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
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-primary mr-3" />
              <div>
                <h1 className="text-2xl font-bold text-foreground">Panel de Administración</h1>
                <p className="text-sm text-muted-foreground">Bienvenido, {user.name}</p>
              </div>
            </div>
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              Resumen
            </TabsTrigger>
            <TabsTrigger value="professors" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              Profesores
            </TabsTrigger>
            <TabsTrigger value="resources" className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Recursos
            </TabsTrigger>
            <TabsTrigger value="sessions" className="flex items-center gap-2">
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
  const [stats, setStats] = useState({
    professors: 0,
    resources: 0,
    activeSessions: 0
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        // Cargar estadísticas de recursos
        const resourcesResponse = await fetch('/api/admin/resources', {
          credentials: 'include'
        });
        const resourcesData = await resourcesResponse.json();
        
        // Por ahora, mantener profesores y sesiones como datos de ejemplo
        // En el futuro se pueden hacer llamadas reales a sus respectivas APIs
        setStats({
          professors: 4, // Dato de ejemplo
          resources: resourcesData.success ? resourcesData.resources.length : 0,
          activeSessions: 1 // Dato de ejemplo
        });
      } catch (error) {
        console.error('Error loading stats:', error);
        // Mantener datos de ejemplo en caso de error
        setStats({
          professors: 4,
          resources: 0,
          activeSessions: 1
        });
      }
    };

    loadStats();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Profesores</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.professors}</div>
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
          <div className="text-2xl font-bold">{stats.resources}</div>
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
          <div className="text-2xl font-bold">{stats.activeSessions}</div>
          <p className="text-xs text-muted-foreground">
            Profesores conectados actualmente
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
