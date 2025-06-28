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
import { useSessionExpiration } from '@/hooks/use-session-expiration';
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

  // Hook para manejar expiración automática de sesiones
  useSessionExpiration();

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
      <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8">
        
        {/* Header with professor info and logout */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <User className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">Panel de Administración</h1>
              <p className="text-sm text-muted-foreground">Bienvenido, {professor.name}</p>
              {professor.department && (
                <p className="text-xs sm:text-sm text-muted-foreground">{professor.department}</p>
              )}
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
            {isAdmin && (
              <Button 
                variant="outline" 
                onClick={() => router.push('/admin/dashboard')}
                className="flex items-center justify-center gap-2 text-xs sm:text-sm"
                size="sm"
              >
                <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Panel Admin</span>
                <span className="sm:hidden">Admin</span>
              </Button>
            )}
            <Button 
              variant="outline" 
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 text-xs sm:text-sm"
              size="sm"
            >
              <LogOut className="h-3 w-3 sm:h-4 sm:w-4" />
              <span className="hidden sm:inline">Cerrar Sesión</span>
              <span className="sm:hidden">Salir</span>
            </Button>
          </div>
        </div>

        {/* Feedback Message */}
        {feedbackMessage && (
          <div className={`mb-4 sm:mb-6 p-3 sm:p-4 rounded-lg border text-sm sm:text-base ${
            feedbackMessage.type === 'success' 
              ? 'bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200' 
              : 'bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200'
          }`}>
            <div className="flex items-center gap-2">
              {feedbackMessage.type === 'success' ? (
                <div className="w-4 h-4 sm:w-5 sm:h-5 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">✓</span>
                </div>
              ) : (
                <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 flex-shrink-0" />
              )}
              <span className="break-words">{feedbackMessage.text}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setFeedbackMessage(null)}
                className="ml-auto p-1 h-auto"
              >
                <XCircle className="h-3 w-3 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
          
          {/* Resource Form Card */}
          <Card className="shadow-lg rounded-xl" ref={resourceFormCardRef}>
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
                <FilePlus2 className="h-4 w-4 sm:h-5 sm:w-5" />
                {isEditing ? 'Editar Recurso' : 'Agregar Nuevo Recurso'}
              </CardTitle>
              <CardDescription className="text-sm">
                {isEditing ? 'Modifica los detalles del recurso' : 'Completa el formulario para agregar un nuevo recurso educativo'}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="p-4 sm:p-6">
              <form key={formKey} onSubmit={handleSubmit} className="space-y-4 sm:space-y-6" id="resource-form">
                {/* Resource Type Selection */}
                <div className="space-y-2">
                  <Label htmlFor="resourceType" className="text-sm font-medium">Tipo de Recurso *</Label>
                  <Select 
                    name="resourceType" 
                    value={selectedResourceType} 
                    onValueChange={(value: string) => setSelectedResourceType(value as ResourceType | 'assessment' | '')}
                    required
                  >
                    <SelectTrigger className="w-full">
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
                  <Label htmlFor="resourceTitle" className="text-sm font-medium">Título *</Label>
                  <Input
                    id="resourceTitle"
                    name="resourceTitle"
                    placeholder="Ingresa el título del recurso"
                    defaultValue={isEditing ? currentEditingResource?.title : ''}
                    className="w-full"
                    required
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="resourceDescription" className="text-sm font-medium">Descripción *</Label>
                  <Textarea
                    id="resourceDescription"
                    name="resourceDescription"
                    placeholder="Describe el contenido del recurso"
                    defaultValue={isEditing ? currentEditingResource?.description : ''}
                    className="w-full min-h-[80px] sm:min-h-[100px] resize-vertical"
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

                {/* URL input for article and video */}
                {(selectedResourceType === 'article' || selectedResourceType === 'video') && (
                  <div className="space-y-2">
                    <Label htmlFor="resourceUrl" className="text-sm font-medium">
                      URL {selectedResourceType === 'article' ? 'del Artículo' : 'del Video'} *
                    </Label>
                    <Input
                      id="resourceUrl"
                      name="resourceUrl"
                      type="url"
                      placeholder={selectedResourceType === 'article' ? 'https://ejemplo.com/articulo' : 'https://youtube.com/watch?v=...'}
                      defaultValue={isEditing ? currentEditingResource?.link : ''}
                      className="w-full"
                      required
                    />
                  </div>
                )}

                {/* File upload for PDF and Images */}
                {(selectedResourceType === 'pdf' || selectedResourceType === 'image') && (
                  <div className="space-y-2">
                    <Label htmlFor="resourceFile" className="text-sm font-medium">
                      Archivo {selectedResourceType === 'pdf' ? 'PDF' : 'de Imagen'}
                      {!isEditing && ' *'}
                    </Label>
                    <Input
                      id="resourceFile"
                      name="resourceFile"
                      type="file"
                      accept={selectedResourceType === 'pdf' ? '.pdf' : 'image/*'}
                      required={!isEditing}
                      className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/90"
                    />
                    {isEditing && currentEditingResource?.fileName && (
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Archivo actual: {currentEditingResource.fileName}
                      </p>
                    )}
                  </div>
                )}

                {/* Cover image upload */}
                {selectedResourceType && selectedResourceType !== 'image' && (
                  <div className="space-y-2">
                    <Label htmlFor="resourceCoverImage" className="text-sm font-medium">Imagen de Portada (Opcional)</Label>
                    <Input
                      id="resourceCoverImage"
                      name="resourceCoverImage"
                      type="file"
                      accept="image/*"
                      className="w-full file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-secondary file:text-secondary-foreground hover:file:bg-secondary/90"
                    />
                    {isEditing && currentEditingResource?.coverImageName && (
                      <p className="text-xs sm:text-sm text-muted-foreground">
                        Portada actual: {currentEditingResource.coverImageName}
                      </p>
                    )}
                  </div>
                )}

                {/* AI Hint */}
                <div className="space-y-2">
                  <Label htmlFor="resourceAiHint" className="text-sm font-medium">Sugerencia para IA (Opcional)</Label>
                  <Textarea
                    id="resourceAiHint"
                    name="resourceAiHint"
                    placeholder="Información adicional que ayude a la IA a recomendar este recurso"
                    defaultValue={isEditing ? currentEditingResource?.aiHint : ''}
                    className="w-full min-h-[60px] sm:min-h-[80px] resize-vertical"
                  />
                </div>
              </form>
            </CardContent>
            
            <CardFooter className="p-4 sm:p-6 pt-0">
              <div className="flex flex-col sm:flex-row gap-3 w-full">              <Button 
                type="submit" 
                disabled={!selectedResourceType || isSubmitting}
                className="flex-1 sm:flex-none sm:w-auto"
              >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      <span className="hidden sm:inline">
                        {isEditing ? 'Actualizando...' : 'Guardando...'}
                      </span>
                      <span className="sm:hidden">
                        {isEditing ? 'Actualizando...' : 'Guardando...'}
                      </span>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="h-4 w-4 mr-2" />
                      <span className="hidden sm:inline">
                        {isEditing ? 'Actualizar Recurso' : 'Agregar Recurso'}
                      </span>
                      <span className="sm:hidden">
                        {isEditing ? 'Actualizar' : 'Agregar'}
                      </span>
                    </>
                  )}
                </Button>
                
                {isEditing && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={handleCancelEdit}
                    className="flex-1 sm:flex-none sm:w-auto"
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    <span className="hidden sm:inline">Cancelar Edición</span>
                    <span className="sm:hidden">Cancelar</span>
                  </Button>
                )}
              </div>
            </CardFooter>
          </Card>

          {/* Resources List */}
          <Card className="shadow-lg rounded-xl">
            <CardHeader className="pb-4 sm:pb-6">
              <CardTitle className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <span className="text-lg sm:text-xl">Recursos Existentes</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm text-muted-foreground">Filtrar:</span>
                  <Select 
                    value={resourceFilterType} 
                    onValueChange={(value: string) => setResourceFilterType(value as ResourceType | 'assessment' | 'all')}
                  >
                    <SelectTrigger className="w-[140px] sm:w-[180px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        <div className="flex items-center">
                          <BookOpen className="h-4 w-4 mr-2" />
                          Todos
                        </div>
                      </SelectItem>
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
              </CardTitle>
            </CardHeader>
            
            <CardContent className="p-4 sm:p-6">
              {isLoadingResources ? (
                <div className="text-center py-8 sm:py-12">
                  <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin mx-auto mb-4 text-primary" />
                  <p className="text-sm sm:text-base text-muted-foreground">Cargando recursos...</p>
                </div>
              ) : filteredResources.length === 0 ? (
                <div className="text-center py-8 sm:py-12">
                  <BookOpen className="h-8 w-8 sm:h-12 sm:w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm sm:text-base text-muted-foreground">
                    {resourceFilterType === 'all' 
                      ? 'No hay recursos agregados aún.' 
                      : `No hay recursos del tipo ${resourceTypeOptions.find(o => o.value === resourceFilterType)?.label}.`
                    }
                  </p>
                </div>
              ) : (
                <div className="grid gap-3 sm:gap-4 grid-cols-1 md:grid-cols-2 xl:grid-cols-1 2xl:grid-cols-2">
                  {filteredResources.map((resource) => (
                    <Card key={resource.id} className="group hover:shadow-md transition-shadow">
                      <CardContent className="p-3 sm:p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex items-center gap-2">
                            {resourceTypeOptions.find(opt => opt.value === resource.type)?.icon}
                            <span className="text-xs sm:text-sm font-medium text-muted-foreground capitalize">
                              {resource.type}
                            </span>
                          </div>
                          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleEditResource(resource)}
                              className="h-7 w-7 p-0"
                            >
                              <Pencil className="h-3 w-3" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => handleDeleteResource(resource.id)}
                              className="h-7 w-7 p-0 text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        
                        <h3 className="font-semibold text-sm sm:text-base mb-2 line-clamp-2">{resource.title}</h3>
                        <p className="text-xs sm:text-sm text-muted-foreground mb-3 line-clamp-3">{resource.description}</p>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>
                            {new Date(resource.createdAt).toLocaleDateString('es-ES')}
                          </span>
                          {resource.link && (
                            <a 
                              href={resource.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary hover:text-primary/80 transition-colors text-xs truncate max-w-[100px]"
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
    </div>
  );
}

