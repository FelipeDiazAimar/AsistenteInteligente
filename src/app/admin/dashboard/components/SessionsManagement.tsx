"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Activity,
  Trash2,
  Loader2,
  Clock,
  User,
  LogOut,
  Info
} from "lucide-react";
import { isDemoMode } from '@/lib/demo';

interface Session {
  id: string;
  session_token: string;
  expires_at: string;
  created_at: string;
  professor_name: string;
  professor_email: string;
  department: string;
  is_active: boolean;
}

export default function SessionsManagement() {
  const demo = isDemoMode();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(!demo);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [cleaningUp, setCleaningUp] = useState(false);

  const fetchSessions = useCallback(async () => {
    // En modo demo no hay seguimiento de sesiones: estado vacío sin llamar a la API.
    if (demo) {
      setSessions([]);
      setLoading(false);
      return;
    }
    try {
      const response = await fetch('/api/admin/sessions', {
        credentials: 'include', // Asegurar que las cookies se envíen
      });

      if (!response.ok) {
        throw new Error(`La API respondió con estado ${response.status}`);
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.sessions)) {
        setSessions(data.sessions);
      } else {
        setSessions([]);
        setError(`No se pudieron cargar las sesiones: ${data.error || 'respuesta no válida'}`);
      }
    } catch (error) {
      console.error('Error al cargar sesiones:', error);
      setSessions([]);
      setError('No se pudo conectar con el servidor. Intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  }, [demo]);

  useEffect(() => {
    fetchSessions();
    // En modo demo no se sondea la API.
    if (demo) return;
    // Refrescar cada 30 segundos (antes cada 5: competía con la navegación)
    const interval = setInterval(fetchSessions, 30000);
    return () => clearInterval(interval);
  }, [fetchSessions, demo]);

  const handleCloseSession = async (sessionId: string) => {
    if (demo) {
      setError('El cierre de sesiones no está disponible por el momento.');
      return;
    }
    if (!confirm('¿Estás seguro de que quieres cerrar esta sesión?')) return;

    try {
      const response = await fetch(`/api/admin/sessions?id=${sessionId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`La API respondió con estado ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setSuccess('Sesión cerrada exitosamente');
        fetchSessions();
      } else {
        setError(data.error || 'Error al cerrar sesión');
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
      setError('Error de conexión. Intenta de nuevo más tarde.');
    }
  };

  const handleCleanExpiredSessions = async () => {
    if (demo) {
      setError('La limpieza de sesiones no está disponible por el momento.');
      return;
    }
    if (!confirm('¿Estás seguro de que quieres limpiar todas las sesiones expiradas?')) return;

    setCleaningUp(true);
    try {
      const response = await fetch('/api/admin/sessions/cleanup', {
        method: 'POST',
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`La API respondió con estado ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setSuccess(`${data.deletedCount ?? 0} sesiones expiradas eliminadas`);
        fetchSessions();
      } else {
        setError(data.error || 'Error al limpiar sesiones');
      }
    } catch (error) {
      console.error('Error al limpiar sesiones:', error);
      setError('Error de conexión. Intenta de nuevo más tarde.');
    } finally {
      setCleaningUp(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = (expiresAt: string) => {
    const now = new Date();
    const expiry = new Date(expiresAt);
    const diffMs = expiry.getTime() - now.getTime();

    if (diffMs <= 0) {
      return 'Expirada';
    }

    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffSeconds = Math.floor((diffMs % (1000 * 60)) / 1000);

    if (diffMinutes > 0) {
      return `${diffMinutes}m ${diffSeconds}s`;
    } else {
      return `${diffSeconds}s`;
    }
  };

  const isSessionExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <Card className="w-full min-w-0 overflow-hidden">
        <CardContent className="flex flex-col sm:flex-row items-center justify-center gap-2 p-4 sm:p-8 text-center">
          <Loader2 className="h-8 w-8 shrink-0 animate-spin" />
          <span>Cargando sesiones...</span>
        </CardContent>
      </Card>
    );
  }

  const activeSessions = sessions.filter(session => session.is_active && !isSessionExpired(session.expires_at));
  const expiredSessions = sessions.filter(session => !session.is_active || isSessionExpired(session.expires_at));

  return (
    <div className="w-full min-w-0 space-y-4 md:space-y-6">
      {demo && (
        <Alert className="border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-100">
          <Info className="h-4 w-4" />
          <AlertDescription>
            El seguimiento de sesiones no está disponible por el momento. Se muestra
            un estado vacío.
          </AlertDescription>
        </Alert>
      )}

      {/* Estadísticas rápidas */}
      <div className="grid w-full min-w-0 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
        <Card className="w-full min-w-0 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex flex-row items-center gap-2 min-w-0">
              <Activity className="h-4 w-4 shrink-0 text-green-600" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">Sesiones Activas</span>
            </div>
            <div className="mt-1 text-2xl font-bold text-green-600">{activeSessions.length}</div>
          </CardContent>
        </Card>

        <Card className="w-full min-w-0 overflow-hidden">
          <CardContent className="p-4">
            <div className="flex flex-row items-center gap-2 min-w-0">
              <Clock className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">Sesiones Expiradas</span>
            </div>
            <div className="mt-1 text-2xl font-bold text-muted-foreground">{expiredSessions.length}</div>
          </CardContent>
        </Card>

        <Card className="w-full min-w-0 overflow-hidden sm:col-span-2 lg:col-span-1">
          <CardContent className="p-4">
            <div className="flex flex-row items-center gap-2 min-w-0">
              <User className="h-4 w-4 shrink-0 text-blue-600" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">Total Sesiones</span>
            </div>
            <div className="mt-1 text-2xl font-bold text-blue-600">{sessions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de sesiones activas */}
      <Card className="w-full min-w-0 overflow-hidden">
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              <div>
                <CardTitle>Sesiones Activas</CardTitle>
                <CardDescription>Profesores conectados actualmente</CardDescription>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                onClick={handleCleanExpiredSessions}
                variant="outline"
                size="sm"
                disabled={cleaningUp || demo}
                title={demo ? 'No disponible por el momento' : undefined}
                className="w-full sm:w-auto min-h-[44px]"
              >
                {cleaningUp ? (
                  <Loader2 className="h-4 w-4 shrink-0 animate-spin mr-2" />
                ) : (
                  <Trash2 className="h-4 w-4 shrink-0 mr-2" />
                )}
                Limpiar Expiradas
              </Button>
              <Button onClick={fetchSessions} variant="outline" size="sm" disabled={demo} title={demo ? 'No disponible por el momento' : undefined} className="w-full sm:w-auto min-h-[44px]">
                Actualizar
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="w-full min-w-0 p-4 sm:p-6 sm:pt-0 pt-0">
          {success && (
            <Alert className="mb-4">
              <AlertDescription>{success}</AlertDescription>
            </Alert>
          )}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {activeSessions.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No hay sesiones activas</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                Ningún profesor está conectado en este momento.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table with horizontal scroll */}
              <div className="hidden w-full min-w-0 max-w-full overflow-x-auto lg:block">
                <ScrollArea className="w-full">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[200px]">Profesor</TableHead>
                          <TableHead className="min-w-[150px]">Departamento</TableHead>
                          <TableHead className="min-w-[140px]">Inicio de Sesión</TableHead>
                          <TableHead className="min-w-[140px]">Expira</TableHead>
                          <TableHead className="min-w-[130px]">Tiempo Restante</TableHead>
                          <TableHead className="min-w-[100px]">Estado</TableHead>
                          <TableHead className="min-w-[100px]">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {activeSessions.map((session) => (
                          <TableRow key={session.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{session.professor_name}</div>
                                <div className="text-sm text-muted-foreground">{session.professor_email}</div>
                              </div>
                            </TableCell>
                            <TableCell>{session.department}</TableCell>
                            <TableCell>{formatDate(session.created_at)}</TableCell>
                            <TableCell>{formatDate(session.expires_at)}</TableCell>
                            <TableCell>
                              <span className={`font-mono text-sm ${
                                getTimeRemaining(session.expires_at) === 'Expirada'
                                  ? 'text-red-600'
                                  : getTimeRemaining(session.expires_at).includes('m') && parseInt(getTimeRemaining(session.expires_at)) < 5
                                    ? 'text-orange-600'
                                    : 'text-green-600'
                              }`}>
                                {getTimeRemaining(session.expires_at)}
                              </span>
                            </TableCell>
                            <TableCell>
                              <Badge variant="default" className="bg-green-100 text-green-800">
                                Activa
                              </Badge>
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleCloseSession(session.id)}
                              >
                                <LogOut className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </ScrollArea>
              </div>

              {/* Mobile card layout */}
              <div className="w-full min-w-0 space-y-3 lg:hidden">
                {activeSessions.map((session) => (
                  <Card key={session.id} className="w-full min-w-0 max-w-full overflow-hidden p-4 break-words">
                    <div className="min-w-0 space-y-3">
                      {/* Header with status and actions */}
                      <div className="flex min-w-0 items-center justify-between gap-2">
                        <Badge variant="default" className="shrink-0 bg-green-100 text-green-800 text-xs">
                          Activa
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCloseSession(session.id)}
                          aria-label={`Cerrar sesión de ${session.professor_name}`}
                          title="Cerrar sesión"
                          className="shrink-0 min-h-[44px] min-w-[44px]"
                        >
                          <LogOut className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Professor info */}
                      <div className="min-w-0">
                        <h3 className="font-medium text-sm break-words">{session.professor_name}</h3>
                        <p className="text-xs text-muted-foreground break-all line-clamp-1">{session.professor_email}</p>
                      </div>

                      {/* Department */}
                      <div className="min-w-0">
                        <p className="text-xs break-words"><span className="font-medium">Depto:</span> {session.department}</p>
                      </div>

                      {/* Time info in grid */}
                      <div className="grid min-w-0 grid-cols-1 min-[400px]:grid-cols-2 gap-2 text-xs">
                        <div className="min-w-0">
                          <span className="font-medium block">Inicio:</span>
                          <span className="text-muted-foreground break-words">{formatDate(session.created_at)}</span>
                        </div>
                        <div className="min-w-0">
                          <span className="font-medium block">Expira:</span>
                          <span className="text-muted-foreground break-words">{formatDate(session.expires_at)}</span>
                        </div>
                      </div>

                      {/* Time remaining - prominent */}
                      <div className="min-w-0 text-center p-2 bg-muted/50 rounded">
                        <span className="text-xs font-medium block">Tiempo restante</span>
                        <span className={`font-mono text-sm font-bold ${
                          getTimeRemaining(session.expires_at) === 'Expirada'
                            ? 'text-red-600'
                            : getTimeRemaining(session.expires_at).includes('m') && parseInt(getTimeRemaining(session.expires_at)) < 5
                              ? 'text-orange-600'
                              : 'text-green-600'
                        }`}>
                          {getTimeRemaining(session.expires_at)}
                        </span>
                      </div>

                      {/* Full-width tactile close */}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCloseSession(session.id)}
                        className="w-full min-h-[44px]"
                      >
                        <LogOut className="h-4 w-4 mr-2 shrink-0" />
                        Cerrar sesión
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Tabla de sesiones recientes/expiradas */}
      {expiredSessions.length > 0 && (
        <Card className="w-full min-w-0 overflow-hidden">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex min-w-0 items-center gap-2">
              <Clock className="h-5 w-5 shrink-0" />
              <CardTitle className="min-w-0 break-words">Sesiones Recientes</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="w-full min-w-0 p-4 sm:p-6 sm:pt-0 pt-0">
            {/* Desktop table with horizontal scroll */}
            <div className="hidden w-full min-w-0 max-w-full overflow-x-auto lg:block">
              <ScrollArea className="w-full">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[200px]">Profesor</TableHead>
                        <TableHead className="min-w-[150px]">Departamento</TableHead>
                        <TableHead className="min-w-[140px]">Inicio de Sesión</TableHead>
                        <TableHead className="min-w-[140px]">Expiró</TableHead>
                        <TableHead className="min-w-[100px]">Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {expiredSessions.slice(0, 10).map((session) => (
                        <TableRow key={session.id}>
                          <TableCell>
                            <div>
                              <div className="font-medium">{session.professor_name}</div>
                              <div className="text-sm text-muted-foreground">{session.professor_email}</div>
                            </div>
                          </TableCell>
                          <TableCell>{session.department}</TableCell>
                          <TableCell>{formatDate(session.created_at)}</TableCell>
                          <TableCell>{formatDate(session.expires_at)}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">
                              Expirada
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </ScrollArea>
            </div>

            {/* Mobile card layout */}
            <div className="w-full min-w-0 space-y-3 lg:hidden">
              {expiredSessions.slice(0, 10).map((session) => (
                <Card key={session.id} className="w-full min-w-0 max-w-full overflow-hidden p-4 break-words">
                  <div className="min-w-0 space-y-3">
                    {/* Header with status */}
                    <div className="flex min-w-0 items-center justify-between gap-2">
                      <Badge variant="secondary" className="shrink-0 text-xs">
                        Expirada
                      </Badge>
                    </div>

                    {/* Professor info */}
                    <div className="min-w-0">
                      <h3 className="font-medium text-sm break-words">{session.professor_name}</h3>
                      <p className="text-xs text-muted-foreground break-all line-clamp-1">{session.professor_email}</p>
                    </div>

                    {/* Department */}
                    <div className="min-w-0">
                      <p className="text-xs break-words"><span className="font-medium">Depto:</span> {session.department}</p>
                    </div>

                    {/* Time info in grid */}
                    <div className="grid min-w-0 grid-cols-1 min-[400px]:grid-cols-2 gap-2 text-xs">
                      <div className="min-w-0">
                        <span className="font-medium block">Inicio:</span>
                        <span className="text-muted-foreground break-words">{formatDate(session.created_at)}</span>
                      </div>
                      <div className="min-w-0">
                        <span className="font-medium block">Expiró:</span>
                        <span className="text-muted-foreground break-words">{formatDate(session.expires_at)}</span>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
