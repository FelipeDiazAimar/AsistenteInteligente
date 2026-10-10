"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Plus,
  Edit,
  Trash2,
  Users,
  Loader2,
  Info
} from "lucide-react";
import { isDemoMode } from '@/lib/demo';

interface Professor {
  id: string;
  name: string;
  email: string;
  department: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export default function ProfessorsManagement() {
  const demo = isDemoMode();
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(!demo);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProfessor, setEditingProfessor] = useState<Professor | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    department: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    // En modo demo no hay base de datos: estado vacío elegante sin llamar a la API.
    if (demo) {
      setLoading(false);
      setProfessors([]);
      return;
    }
    fetchProfessors();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [demo]);

  const fetchProfessors = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch('/api/admin/professors', {
        credentials: 'include', // Asegurar que las cookies se envíen
      });

      if (!response.ok) {
        throw new Error(`La API respondió con estado ${response.status}`);
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.professors)) {
        setProfessors(data.professors);
      } else {
        setProfessors([]);
        setError(`No se pudieron cargar los profesores: ${data.error || 'respuesta no válida'}`);
      }
    } catch (error) {
      console.error('Error al cargar profesores:', error);
      setProfessors([]);
      setError('No se pudo conectar con el servidor. Intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (demo) {
      setError('La gestión de profesores no está disponible en modo demo.');
      return;
    }
    setError('');
    setSuccess('');

    try {
      const method = editingProfessor ? 'PUT' : 'POST';
      const url = editingProfessor
        ? `/api/admin/professors/${editingProfessor.id}`
        : '/api/admin/professors';

      const body = editingProfessor
        ? {
            name: formData.name,
            email: formData.email,
            department: formData.department,
            is_active: true
          }
        : formData;

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        throw new Error(`La API respondió con estado ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setSuccess(editingProfessor ? 'Profesor actualizado exitosamente' : 'Profesor creado exitosamente');
        fetchProfessors();
        resetForm();
        setDialogOpen(false);
      } else {
        setError(data.error || 'Error al procesar solicitud');
      }
    } catch (error) {
      console.error('Error al guardar profesor:', error);
      setError('Error de conexión. Intenta de nuevo más tarde.');
    }
  };

  const handleEdit = (professor: Professor) => {
    setEditingProfessor(professor);
    setFormData({
      name: professor.name,
      email: professor.email,
      password: '',
      department: professor.department
    });
    setDialogOpen(true);
  };

  const handleDelete = async (professorId: string) => {
    if (demo) {
      setError('La eliminación de profesores no está disponible en modo demo.');
      return;
    }
    if (!confirm('¿Estás seguro de que quieres eliminar este profesor?')) return;

    try {
      const response = await fetch(`/api/admin/professors/${professorId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(`La API respondió con estado ${response.status}`);
      }

      const data = await response.json();

      if (data.success) {
        setSuccess('Profesor eliminado exitosamente');
        fetchProfessors();
      } else {
        setError(data.error || 'Error al eliminar profesor');
      }
    } catch (error) {
      console.error('Error al eliminar profesor:', error);
      setError('Error de conexión. Intenta de nuevo más tarde.');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', password: '', department: '' });
    setEditingProfessor(null);
    setError('');
    setSuccess('');
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    resetForm();
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Cargando profesores...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              <div>
                <CardTitle>Gestión de Profesores</CardTitle>
                <CardDescription>Alta, edición y baja de cuentas docentes</CardDescription>
              </div>
            </div>
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button onClick={() => setDialogOpen(true)} disabled={demo} title={demo ? 'No disponible en modo demo' : undefined}>
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Profesor
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingProfessor ? 'Editar Profesor' : 'Agregar Nuevo Profesor'}
                  </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nombre</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                    />
                  </div>
                  {!editingProfessor && (
                    <div>
                      <Label htmlFor="password">Contraseña</Label>
                      <Input
                        id="password"
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="department">Departamento</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      required
                    />
                  </div>
                  {error && (
                    <Alert variant="destructive">
                      <AlertDescription>{error}</AlertDescription>
                    </Alert>
                  )}
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={handleDialogClose}>
                      Cancelar
                    </Button>
                    <Button type="submit">
                      {editingProfessor ? 'Actualizar' : 'Crear'} Profesor
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {demo && (
            <Alert className="mb-4 border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-100">
              <Info className="h-4 w-4" />
              <AlertDescription>
                Modo demo: la gestión de profesores requiere base de datos y no está
                disponible aquí. Se muestra un estado vacío.
              </AlertDescription>
            </Alert>
          )}
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

          {professors.length === 0 ? (
            <div className="text-center py-8 sm:py-12">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Sin profesores para mostrar</h3>
              <p className="text-muted-foreground text-sm sm:text-base">
                {demo
                  ? 'En modo demo no hay registros de profesores.'
                  : 'Todavía no hay profesores registrados o no se pudieron cargar.'}
              </p>
              {!demo && (
                <Button variant="outline" size="sm" className="mt-4" onClick={fetchProfessors}>
                  Reintentar
                </Button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block rounded-md border">
                <ScrollArea className="w-full">
                  <div className="min-w-[800px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nombre</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Departamento</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead>Creado</TableHead>
                          <TableHead className="text-right">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {professors.map((professor) => (
                          <TableRow key={professor.id}>
                            <TableCell className="font-medium">{professor.name}</TableCell>
                            <TableCell className="max-w-[200px] truncate">{professor.email}</TableCell>
                            <TableCell>{professor.department}</TableCell>
                            <TableCell>
                              <Badge variant={professor.is_active ? "default" : "secondary"}>
                                {professor.is_active ? 'Activo' : 'Inactivo'}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {new Date(professor.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleEdit(professor)}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDelete(professor.id)}
                                  disabled={professor.email === 'admin1@admin1.com'}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </ScrollArea>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden space-y-3">
                {professors.map((professor) => (
                  <Card key={professor.id} className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="space-y-1">
                        <h3 className="font-medium text-sm">{professor.name}</h3>
                        <p className="text-xs text-muted-foreground break-all">{professor.email}</p>
                      </div>
                      <Badge variant={professor.is_active ? "default" : "secondary"} className="text-xs">
                        {professor.is_active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Departamento:</span>
                        <span className="font-medium">{professor.department}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Creado:</span>
                        <span>{new Date(professor.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(professor)}
                        className="flex-1"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(professor.id)}
                        disabled={professor.email === 'admin1@admin1.com'}
                        className="flex-1"
                      >
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
