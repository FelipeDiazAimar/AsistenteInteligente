
"use client";

import React, { useState, type FormEvent, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FilePlus2, AlertTriangle, LogOut, UploadCloud, FileText, VideoIcon, ImageIcon, Newspaper, ClipboardCheck, SkipForward, BookOpen, Trash2, Pencil, XCircle, Loader2, User, Settings, Shield } from "lucide-react";
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import {
  saveResourceAction,
  fetchResourcesAction,
  deleteResourceAction,
  updateResourceAction,
  type ClientResource as Resource,
  type ResourceType
} from './actions';

interface ResourceTypeOption {
  value: ResourceType | 'assessment';
  label: string;
  icon: React.ReactNode;
}

const resourceTypeOptions: ResourceTypeOption[] = [
  { value: 'pdf', label: 'PDF', icon: <FileText className="h-4 w-4 mr-2" /> },
  { value: 'video', label: 'Video', icon: <VideoIcon className="h-4 w-4 mr-2" /> },
  { value: 'image', label: 'Imagen/Infografía', icon: <ImageIcon className="h-4 w-4 mr-2" /> },
  { value: 'article', label: 'Noticia/Artículo', icon: <Newspaper className="h-4 w-4 mr-2" /> },
  { value: 'assessment', label: 'Autoevaluación', icon: <ClipboardCheck className="h-4 w-4 mr-2" /> },
];

export default function AddNotesPage() {
  const { professor, isLoading: authLoading, logout } = useAuth();
  const router = useRouter();

  const [selectedResourceType, setSelectedResourceType] = useState<ResourceType | 'assessment' | ''>('');
  const [formKey, setFormKey] = useState<string | number>(Date.now()); 

  const [resourcesList, setResourcesList] = useState<Resource[]>([]);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [resourceFilterType, setResourceFilterType] = useState<ResourceType | 'assessment' | 'all'>('all');
  const [feedbackMessage, setFeedbackMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [currentEditingResource, setCurrentEditingResource] = useState<Resource | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verificar si el usuario es admin
  const isAdmin = professor?.email === 'admin1@admin1.com' || professor?.email === 'admin@university.edu';
  
  const resourceFormCardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && currentEditingResource && resourceFormCardRef.current) {
      resourceFormCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [isEditing, currentEditingResource]);


  const fetchAndSetResources = async (filter?: ResourceType | 'assessment' | 'all') => {
    setIsLoadingResources(true);
    const actualFilter = filter === 'all' ? undefined : filter;
    const result = await fetchResourcesAction(actualFilter as ResourceType | 'assessment' | undefined);
    if (result.success && result.data) {
      setResourcesList(result.data);
    } else {
      setFeedbackMessage({ type: 'error', text: result.error || "Error cargando recursos." });
      setResourcesList([]);
    }
    setIsLoadingResources(false);
  };

  useEffect(() => {
    if (professor) {
      fetchAndSetResources(resourceFilterType);
    }
  }, [professor, resourceFilterType]);

  const handleLogout = async () => {
    await logout();
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFeedbackMessage(null);

    const formData = new FormData(event.currentTarget);

    try {
      let result;
      if (isEditing && currentEditingResource) {
        result = await updateResourceAction(currentEditingResource.id, formData);
      } else {
        result = await saveResourceAction(formData);
      }

      if (result.success) {
        setFeedbackMessage({type: 'success', text: isEditing ? "Recurso actualizado." : "Recurso guardado."});
        
        if (isEditing) {
          setIsEditing(false);
          setCurrentEditingResource(null);
        }
        
        event.currentTarget.reset();
        setSelectedResourceType('');
        setFormKey(Date.now());
        
        await fetchAndSetResources(resourceFilterType);
      } else {
        setFeedbackMessage({type: 'error', text: result.error || "Error procesando recurso."});
      }
    } catch (error) {
      console.error('Error:', error);
      setFeedbackMessage({type: 'error', text: "Error inesperado."});
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteResource = async (resourceId: string) => {
    const confirmed = window.confirm("¿Estás seguro de que quieres eliminar este recurso?");
    if (!confirmed) return;

    const result = await deleteResourceAction(resourceId);
    if (result.success) {
      setFeedbackMessage({type: 'success', text: "Recurso eliminado."});
      await fetchAndSetResources(resourceFilterType);
    } else {
      setFeedbackMessage({type: 'error', text: result.error || "Error eliminando recurso."});
    }
  };

  const handleEditResource = (resource: Resource) => {
    setCurrentEditingResource(resource);
    setIsEditing(true);
    setSelectedResourceType(resource.type);
    setFeedbackMessage(null);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setCurrentEditingResource(null);
    setSelectedResourceType('');
    setFormKey(Date.now());
    setFeedbackMessage(null);
  };

  const filteredResources = resourceFilterType === 'all' 
    ? resourcesList 
    : resourcesList.filter(r => r.type === resourceFilterType);

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Verificando autenticación...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - this shouldn't happen due to middleware, but just in case
  if (!professor) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2 text-foreground">Acceso Denegado</h1>
          <p className="text-muted-foreground mb-4">Necesitas estar autenticado para acceder a esta página.</p>
          <Button onClick={() => window.location.href = '/admin/login'}>
            Ir al Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header with professor info and logout */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Panel de Administración</h1>
              <p className="text-muted-foreground">Bienvenido, {professor.name}</p>
              {professor.department && (
                <p className="text-sm text-muted-foreground">{professor.department}</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {isAdmin && (
              <Button 
                variant="outline" 
                onClick={() => router.push('/admin/dashboard')}
                className="flex items-center gap-2"
              >
                <Shield className="h-4 w-4" />
                Panel Admin
              </Button>
            )}
            <Button variant="outline" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Cerrar Sesión
            </Button>
          </div>
        </div>

        {/* Feedback Message */}
        {feedbackMessage && (
          <div className={`mb-6 p-4 rounded-lg border ${
            feedbackMessage.type === 'success' 
              ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200' 
              : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {feedbackMessage.type === 'success' ? (
                <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xs">✓</span>
                </div>
              ) : (
                <AlertTriangle className="h-5 w-5 text-red-500" />
              )}
              <span>{feedbackMessage.text}</span>
            </div>
          </div>
        )}

        {/* Resource Form */}
        <Card className="mb-8" ref={resourceFormCardRef}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FilePlus2 className="h-5 w-5" />
              {isEditing ? 'Editar Recurso' : 'Agregar Nuevo Recurso'}
            </CardTitle>
            <CardDescription>
              {isEditing ? 'Modifica los detalles del recurso' : 'Completa el formulario para agregar un nuevo recurso educativo'}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <form key={formKey} onSubmit={handleSubmit} className="space-y-6">
              {/* Resource Type Selection */}
              <div className="space-y-2">
                <Label htmlFor="resourceType">Tipo de Recurso *</Label>
                <Select 
                  name="resourceType" 
                  value={selectedResourceType} 
                  onValueChange={(value: string) => setSelectedResourceType(value as ResourceType | 'assessment' | '')}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona el tipo de recurso" />
                  </SelectTrigger>
                  <SelectContent>
                    {resourceTypeOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center">
                          {option.icon}
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="resourceTitle">Título *</Label>
                <Input
                  id="resourceTitle"
                  name="resourceTitle"
                  placeholder="Ingresa el título del recurso"
                  defaultValue={isEditing ? currentEditingResource?.title : ''}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="resourceDescription">Descripción *</Label>
                <Textarea
                  id="resourceDescription"
                  name="resourceDescription"
                  placeholder="Describe brevemente el contenido del recurso"
                  defaultValue={isEditing ? currentEditingResource?.description : ''}
                  required
                />
              </div>

              {/* Conditional fields based on resource type */}
              {selectedResourceType === 'assessment' && (
                <div className="space-y-2">
                  <Label htmlFor="resourceLink">URL del Google Form *</Label>
                  <Input
                    id="resourceLink"
                    name="resourceLink"
                    type="url"
                    placeholder="https://forms.gle/..."
                    defaultValue={isEditing ? currentEditingResource?.googleFormUrl : ''}
                    required
                  />
                </div>
              )}

              {selectedResourceType === 'article' && (
                <div className="space-y-2">
                  <Label htmlFor="resourceLink">URL del Artículo *</Label>
                  <Input
                    id="resourceLink"
                    name="resourceLink"
                    type="url"
                    placeholder="https://ejemplo.com/articulo"
                    defaultValue={isEditing ? currentEditingResource?.link : ''}
                    required
                  />
                </div>
              )}

              {selectedResourceType === 'video' && (
                <div className="space-y-2">
                  <Label htmlFor="resourceLink">URL del Video *</Label>
                  <Input
                    id="resourceLink"
                    name="resourceLink"
                    type="url"
                    placeholder="https://youtube.com/watch?v=..."
                    defaultValue={isEditing ? currentEditingResource?.link : ''}
                    required
                  />
                </div>
              )}

              {/* File upload for PDF and Images */}
              {(selectedResourceType === 'pdf' || selectedResourceType === 'image') && (
                <div className="space-y-2">
                  <Label htmlFor="resourceFile">
                    Archivo {selectedResourceType === 'pdf' ? 'PDF' : 'de Imagen'}
                    {!isEditing && ' *'}
                  </Label>
                  <Input
                    id="resourceFile"
                    name="resourceFile"
                    type="file"
                    accept={selectedResourceType === 'pdf' ? '.pdf' : 'image/*'}
                    required={!isEditing}
                  />
                  {isEditing && currentEditingResource?.fileName && (
                    <p className="text-sm text-muted-foreground">
                      Archivo actual: {currentEditingResource.fileName}
                    </p>
                  )}
                </div>
              )}

              {/* Cover image upload */}
              {selectedResourceType && selectedResourceType !== 'image' && (
                <div className="space-y-2">
                  <Label htmlFor="resourceCoverImage">Imagen de Portada (Opcional)</Label>
                  <Input
                    id="resourceCoverImage"
                    name="resourceCoverImage"
                    type="file"
                    accept="image/*"
                  />
                  {isEditing && currentEditingResource?.coverImageName && (
                    <p className="text-sm text-muted-foreground">
                      Portada actual: {currentEditingResource.coverImageName}
                    </p>
                  )}
                </div>
              )}

              {/* AI Hint */}
              <div className="space-y-2">
                <Label htmlFor="resourceAiHint">Sugerencia para IA (Opcional)</Label>
                <Textarea
                  id="resourceAiHint"
                  name="resourceAiHint"
                  placeholder="Información adicional que ayude a la IA a recomendar este recurso"
                  defaultValue={isEditing ? currentEditingResource?.aiHint : ''}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button type="submit" disabled={isSubmitting || !selectedResourceType}>
                  {isSubmitting ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <UploadCloud className="h-4 w-4 mr-2" />
                  )}
                  {isSubmitting ? 'Procesando...' : (isEditing ? 'Actualizar Recurso' : 'Guardar Recurso')}
                </Button>

                {isEditing && (
                  <Button type="button" variant="outline" onClick={handleCancelEdit}>
                    <XCircle className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Resources List */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Recursos Existentes
                </CardTitle>
                <CardDescription>
                  Gestiona los recursos que has agregado
                </CardDescription>
              </div>
              
              {/* Filter */}
              <Select value={resourceFilterType} onValueChange={(value: ResourceType | 'assessment' | 'all') => setResourceFilterType(value)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los tipos</SelectItem>
                  {resourceTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center">
                        {option.icon}
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          
          <CardContent>
            {isLoadingResources ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
                <p className="text-muted-foreground">Cargando recursos...</p>
              </div>
            ) : filteredResources.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  {resourceFilterType === 'all' 
                    ? 'No hay recursos agregados aún.' 
                    : `No hay recursos del tipo ${resourceTypeOptions.find(o => o.value === resourceFilterType)?.label}.`
                  }
                </p>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {filteredResources.map((resource) => (
                  <Card key={resource.id} className="group hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          {resourceTypeOptions.find(opt => opt.value === resource.type)?.icon}
                          <span className="text-sm font-medium text-muted-foreground capitalize">
                            {resource.type}
                          </span>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleEditResource(resource)}
                          >
                            <Pencil className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            onClick={() => handleDeleteResource(resource.id)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <h4 className="font-semibold mb-2 line-clamp-2 text-foreground">{resource.title}</h4>
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{resource.description}</p>
                      
                      {resource.coverImageUrl && (
                        <div className="mb-3">
                          <img 
                            src={resource.coverImageUrl} 
                            alt="Portada" 
                            className="w-full h-32 object-cover rounded-md"
                          />
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>
                          {new Date(resource.createdAt).toLocaleDateString('es-ES')}
                        </span>
                        {resource.link && (
                          <a 
                            href={resource.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 transition-colors"
                          >
                            Ver enlace
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

    