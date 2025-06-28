"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { 
  Activity, 
  Trash2, 
  Loader2,
  Clock,
  User,
  LogOut
} from "lucide-react";

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
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSessions();
    // Refrescar cada 30 segundos para mostrar sesiones actualizadas
    const interval = setInterval(fetchSessions, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSessions = async () => {
    try {
      const response = await fetch('/api/admin/sessions', {
        credentials: 'include', // Asegurar que las cookies se envíen
      });
      
      const data = await response.json();
      
      if (data.success) {
        setSessions(data.sessions);
      } else {
        setError(`Error al cargar sesiones: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      setError(`Error de conexión: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCloseSession = async (sessionId: string) => {
    if (!confirm('¿Estás seguro de que quieres cerrar esta sesión?')) return;

    try {
      const response = await fetch(`/api/admin/sessions?id=${sessionId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Sesión cerrada exitosamente');
        fetchSessions();
      } else {
        setError(data.error || 'Error al cerrar sesión');
      }
    } catch (error) {
      setError('Error de conexión');
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

  const isSessionExpired = (expiresAt: string) => {
    return new Date(expiresAt) < new Date();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Cargando sesiones...</span>
        </CardContent>
      </Card>
    );
  }

  const activeSessions = sessions.filter(session => session.is_active && !isSessionExpired(session.expires_at));
  const expiredSessions = sessions.filter(session => !session.is_active || isSessionExpired(session.expires_at));

  return (
    <div className="space-y-6">
      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium">Sesiones Activas</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{activeSessions.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Sesiones Expiradas</span>
            </div>
            <div className="text-2xl font-bold text-muted-foreground">{expiredSessions.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Total Sesiones</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{sessions.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla de sesiones activas */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              <CardTitle>Sesiones Activas</CardTitle>
            </div>
            <Button onClick={fetchSessions} variant="outline" size="sm">
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
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
              <p className="text-muted-foreground">
                Ningún profesor está conectado en este momento.
              </p>
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Profesor</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Inicio de Sesión</TableHead>
                    <TableHead>Expira</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead>Acciones</TableHead>
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
          )}
        </CardContent>
      </Card>

      {/* Tabla de sesiones recientes/expiradas */}
      {expiredSessions.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <CardTitle>Sesiones Recientes</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Profesor</TableHead>
                    <TableHead>Departamento</TableHead>
                    <TableHead>Inicio de Sesión</TableHead>
                    <TableHead>Expiró</TableHead>
                    <TableHead>Estado</TableHead>
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
