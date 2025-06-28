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
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  BookOpen, 
  Trash2, 
  Loader2,
  FileText,
  Video,
  Image,
  Newspaper,
  ClipboardCheck
} from "lucide-react";

interface Resource {
  id: string;
  title: string;
  description: string;
  type: string;
  link?: string;
  file_url?: string;
  file_name?: string;
  cover_image_url?: string;
  cover_image_name?: string;
  ai_hint?: string;
  google_form_url?: string;
  created_at: string;
}

const getTypeIcon = (type: string) => {
  switch (type) {
    case 'pdf':
      return <FileText className="h-4 w-4" />;
    case 'video':
      return <Video className="h-4 w-4" />;
    case 'image':
      return <Image className="h-4 w-4" />;
    case 'article':
      return <Newspaper className="h-4 w-4" />;
    case 'assessment':
      return <ClipboardCheck className="h-4 w-4" />;
    default:
      return <BookOpen className="h-4 w-4" />;
  }
};

const getTypeBadgeColor = (type: string) => {
  switch (type) {
    case 'pdf':
      return 'bg-red-100 dark:bg-red-950/30 text-red-800 dark:text-red-200';
    case 'video':
      return 'bg-purple-100 dark:bg-purple-950/30 text-purple-800 dark:text-purple-200';
    case 'image':
      return 'bg-green-100 dark:bg-green-950/30 text-green-800 dark:text-green-200';
    case 'article':
      return 'bg-blue-100 dark:bg-blue-950/30 text-blue-800 dark:text-blue-200';
    case 'assessment':
      return 'bg-yellow-100 dark:bg-yellow-950/30 text-yellow-800 dark:text-yellow-200';
    default:
      return 'bg-muted text-muted-foreground';
  }
};

export default function ResourcesManagement() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchResources();
  }, []);

  const fetchResources = async () => {
    try {
      const response = await fetch('/api/admin/resources', {
        credentials: 'include', // Asegurar que las cookies se envíen
      });
      
      const data = await response.json();
      
      if (data.success) {
        setResources(data.resources);
      } else {
        setError(`Error al cargar recursos: ${data.error || 'Unknown error'}`);
      }
    } catch (error) {
      setError(`Error de conexión: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (resourceId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este recurso?')) return;

    try {
      const response = await fetch(`/api/admin/resources?id=${resourceId}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Recurso eliminado exitosamente');
        fetchResources();
      } else {
        setError(data.error || 'Error al eliminar recurso');
      }
    } catch (error) {
      setError('Error de conexión');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center p-8">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Cargando recursos...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              <CardTitle>Gestión de Recursos</CardTitle>
            </div>
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
          
          {resources.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No hay recursos</h3>
              <p className="text-muted-foreground">
                Los profesores aún no han subido recursos al sistema.
              </p>
            </div>
          ) : (
            <>
              {/* Desktop table with horizontal scroll */}
              <div className="hidden md:block">
                <ScrollArea className="w-full">
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="min-w-[120px]">Tipo</TableHead>
                          <TableHead className="min-w-[200px]">Título</TableHead>
                          <TableHead className="min-w-[250px]">Descripción</TableHead>
                          <TableHead className="min-w-[200px]">Archivo / IA Hint</TableHead>
                          <TableHead className="min-w-[120px]">Creado</TableHead>
                          <TableHead className="min-w-[100px]">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {resources.map((resource) => (
                          <TableRow key={resource.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getTypeIcon(resource.type)}
                                <Badge className={getTypeBadgeColor(resource.type)}>
                                  {resource.type.toUpperCase()}
                                </Badge>
                              </div>
                            </TableCell>
                            <TableCell className="font-medium">
                              <div className="max-w-[180px] truncate" title={resource.title}>
                                {resource.title}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="max-w-[230px] truncate" title={resource.description}>
                                {resource.description}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>
                                <div className="font-medium max-w-[180px] truncate" title={resource.file_name || resource.title}>
                                  {resource.file_name || resource.title}
                                </div>
                                <div className="text-sm text-muted-foreground max-w-[180px] truncate" title={resource.ai_hint || 'Sin pista de IA'}>
                                  {resource.ai_hint || 'Sin pista de IA'}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              {new Date(resource.created_at).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(resource.id)}
                              >
                                <Trash2 className="h-4 w-4" />
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
              <div className="md:hidden space-y-4">
                {resources.map((resource) => (
                  <Card key={resource.id} className="p-4">
                    <div className="space-y-3">
                      {/* Header with type and actions */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getTypeIcon(resource.type)}
                          <Badge className={getTypeBadgeColor(resource.type)}>
                            {resource.type.toUpperCase()}
                          </Badge>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(resource.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {/* Title */}
                      <div>
                        <h3 className="font-medium text-base line-clamp-2">{resource.title}</h3>
                      </div>
                      
                      {/* Description */}
                      <div>
                        <p className="text-sm text-muted-foreground line-clamp-3">{resource.description}</p>
                      </div>
                      
                      {/* File info */}
                      <div className="space-y-1">
                        <div className="text-sm font-medium line-clamp-1" title={resource.file_name || resource.title}>
                          📁 {resource.file_name || resource.title}
                        </div>
                        <div className="text-xs text-muted-foreground line-clamp-2" title={resource.ai_hint || 'Sin pista de IA'}>
                          🤖 {resource.ai_hint || 'Sin pista de IA'}
                        </div>
                      </div>
                      
                      {/* Date */}
                      <div className="text-xs text-muted-foreground">
                        Creado: {new Date(resource.created_at).toLocaleDateString()}
                      </div>
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
