
"use client";

import React, { useState, type FormEvent, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { FilePlus2, AlertTriangle, LogIn, UploadCloud, FileText, VideoIcon, ImageIcon, Newspaper, ClipboardCheck, SkipForward, BookOpen, Trash2, Pencil, XCircle, Loader2 } from "lucide-react";
import {
  handleLoginAction,
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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggedInProfessorName, setLoggedInProfessorName] = useState('');

  const [selectedResourceType, setSelectedResourceType] = useState<ResourceType | 'assessment' | ''>('');
  const [formKey, setFormKey] = useState<string | number>(Date.now()); 

  const [resourcesList, setResourcesList] = useState<Resource[]>([]);
  const [isLoadingResources, setIsLoadingResources] = useState(false);
  const [resourceFilterType, setResourceFilterType] = useState<ResourceType | 'assessment' | 'all'>('all');
  const [feedbackMessage, setFeedbackMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [currentEditingResource, setCurrentEditingResource] = useState<Resource | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
    if (isLoggedIn) {
      fetchAndSetResources(resourceFilterType);
    }
  }, [isLoggedIn, resourceFilterType]);

  const handleLoginSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoginError('');
    setFeedbackMessage(null);
    const formData = new FormData(event.currentTarget);
    const result = await handleLoginAction(formData);
    if (result.success) {
      setIsLoggedIn(true);
      setLoggedInProfessorName(result.loggedInName!);
      setName('');
      setPassword('');
      setConfirmPassword('');
    } else {
      setLoginError(result.error!);
    }
  };

  const handleSkipLogin = () => {
    setIsLoggedIn(true);
    setLoggedInProfessorName("Profesor Test");
    setLoginError('');
    setName('');
    setPassword('');
    setConfirmPassword('');
  };

  const resetFormAndEditingState = () => {
    setIsEditing(false);
    setCurrentEditingResource(null);
    setSelectedResourceType('');
    setFormKey(Date.now()); 
    const form = document.getElementById('resourceForm') as HTMLFormElement;
    if (form) form.reset();
  };

  const handleResourceFormSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedbackMessage(null);
    setIsSubmitting(true);

    const currentFormData = new FormData(event.currentTarget);
    const resourceTypeFromState = selectedResourceType;

    if (!resourceTypeFromState) {
        setFeedbackMessage({type: 'error', text: "Por favor, seleccione un tipo de recurso."});
        setIsSubmitting(false);
        return;
    }
    currentFormData.set('resourceType', resourceTypeFromState); 

    let result;
    try {
      if (isEditing && currentEditingResource) {
        result = await updateResourceAction(currentEditingResource.id, currentFormData);
      } else {
        result = await saveResourceAction(currentFormData);
      }

      if (result.success) {
        setFeedbackMessage({type: 'success', text: result.message || (isEditing ? "Recurso actualizado." : "Recurso guardado.")});
        resetFormAndEditingState();
        fetchAndSetResources(resourceFilterType); 
      } else {
        setFeedbackMessage({type: 'error', text: result.error || (isEditing ? "Error al actualizar." : "Error al guardar.")});
      }
    } catch (error) {
      console.error("Error submitting resource form:", error);
      setFeedbackMessage({ type: 'error', text: "Ocurrió un error inesperado al enviar el formulario."});
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleEditClick = (resource: Resource) => {
    setIsEditing(true);
    setCurrentEditingResource(resource);
    setSelectedResourceType(resource.type);
    setFormKey(resource.id); 
    setFeedbackMessage(null); 
     if (resourceFormCardRef.current) {
      resourceFormCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleCancelEdit = () => {
    resetFormAndEditingState();
    setFeedbackMessage(null);
  };

  const handleDeleteResource = async (resource: Resource) => {
    if (!resource.id) return;
    if (confirm(`¿Está seguro de que desea eliminar el recurso "${resource.title}"?`)) {
      setFeedbackMessage(null);
      const result = await deleteResourceAction(resource.id); 
      if (result.success) {
        setFeedbackMessage({type: 'success', text: result.message || "Recurso eliminado."});
        if (currentEditingResource?.id === resource.id) { 
          resetFormAndEditingState();
        }
        fetchAndSetResources(resourceFilterType);
      } else {
        setFeedbackMessage({type: 'error', text: result.error || "Error al eliminar."});
      }
    }
  };

  return (
    <div className="container mx-auto py-8">
      <header className="text-center mb-12">
        <h1 className="text-4xl font-bold tracking-tight font-headline text-primary md:text-5xl">
          <FilePlus2 className="inline-block h-10 w-10 mr-2 align-bottom" />
          Gestión de Apuntes (Profesores)
        </h1>
        {!isLoggedIn && (
          <p className="mt-4 text-lg text-muted-foreground md:text-xl max-w-2xl mx-auto">
            Esta sección es para uso exclusivo de profesores. Inicie sesión para cargar y administrar los recursos educativos.
          </p>
        )}
      </header>

      {!isLoggedIn ? (
        <>
          <Card className="max-w-md mx-auto shadow-xl rounded-xl mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline text-xl">
                <LogIn className="h-6 w-6 text-primary" />
                Inicio de Sesión
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nombre</Label>
                  <Input id="name" name="name" type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Ingrese su nombre" />
                </div>
                <div>
                  <Label htmlFor="password">Contraseña</Label>
                  <Input id="password" name="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Ingrese su contraseña" />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
                  <Input id="confirmPassword" name="confirmPassword" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Confirme su contraseña" />
                </div>
                {loginError && <p className="text-sm text-destructive">{loginError}</p>}
                 {feedbackMessage && feedbackMessage.text.includes("Credenciales") && (
                  <p className={`text-sm ${feedbackMessage.type === 'success' ? 'text-green-600' : 'text-destructive'}`}>{feedbackMessage.text}</p>
                )}
                <Button type="submit" className="w-full">Ingresar</Button>
              </form>
              <Button variant="outline" onClick={handleSkipLogin} className="w-full mt-3">
                <SkipForward className="mr-2 h-4 w-4" />
                Saltar Inicio de Sesión (Test)
              </Button>
            </CardContent>
          </Card>

          <Card className="max-w-3xl mx-auto shadow-xl rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-3 font-headline text-lg">
                <AlertTriangle className="h-6 w-6 text-destructive" />
                Acceso Restringido
              </CardTitle>
              <CardDescription>
                Esta funcionalidad está diseñada para que los profesores puedan subir y organizar el material de estudio.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Por favor, inicie sesión para acceder a las herramientas de carga de apuntes.</p>
            </CardContent>
          </Card>
        </>
      ) : (
        <>
          <div className="text-center mb-8">
            <h2 className="text-2xl font-semibold text-foreground">Bienvenido Profesor {loggedInProfessorName}!</h2>
            <p className="text-muted-foreground">Gestione los recursos educativos (Backend: Simulación en memoria).</p>
          </div>

          <Card className="max-w-2xl mx-auto shadow-xl rounded-xl mb-12" key={formKey} ref={resourceFormCardRef}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline text-xl">
                {isEditing ? <Pencil className="h-6 w-6 text-primary" /> : <UploadCloud className="h-6 w-6 text-primary" />}
                {isEditing ? "Editar Recurso" : "Cargar Nuevo Recurso"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form id="resourceForm" onSubmit={handleResourceFormSubmit} className="space-y-6">
                <div>
                  <Label htmlFor="resourceTypeSelect">Tipo de Recurso</Label>
                  <Select
                    name="resourceTypeSelectValue" 
                    value={selectedResourceType}
                    onValueChange={(value) => setSelectedResourceType(value as ResourceType | 'assessment' | '')}
                    disabled={isEditing || isSubmitting} 
                  >
                    <SelectTrigger id="resourceTypeSelect">
                      <SelectValue placeholder="Seleccione un tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {resourceTypeOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center">
                            {option.icon} {option.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {selectedResourceType && (
                  <>
                    <div>
                      <Label htmlFor="resourceTitle">Título</Label>
                      <Input name="resourceTitle" id="resourceTitle" type="text" placeholder="Título del recurso" required defaultValue={currentEditingResource?.title ?? ''} disabled={isSubmitting}/>
                    </div>
                    <div>
                      <Label htmlFor="resourceDescription">Descripción</Label>
                      <Textarea name="resourceDescription" id="resourceDescription" placeholder="Breve descripción del recurso" defaultValue={currentEditingResource?.description ?? ''} disabled={isSubmitting}/>
                    </div>

                    {(selectedResourceType === 'video' || selectedResourceType === 'article' || selectedResourceType === 'assessment') && (
                         <div>
                           <Label htmlFor="resourceLink">Enlace (URL){selectedResourceType === 'assessment' ? ' de Google Form' : ''}</Label>
                           <Input name="resourceLink" id="resourceLink" type="url" placeholder="https://ejemplo.com/recurso" defaultValue={currentEditingResource?.link ?? currentEditingResource?.googleFormUrl ?? ''} disabled={isSubmitting}/>
                         </div>
                       )}

                    {(selectedResourceType === 'pdf' || selectedResourceType === 'image') && (
                       <div>
                        <Label htmlFor="resourceFile">Archivo Principal ({selectedResourceType === 'pdf' ? 'PDF' : 'Imagen'})</Label>
                        {isEditing && currentEditingResource?.fileName && (
                            <p className="text-xs text-muted-foreground mb-1">Archivo actual: {currentEditingResource.fileName}. Seleccione uno nuevo para reemplazarlo.</p>
                        )}
                        <Input name="resourceFile" id="resourceFile" type="file" accept={selectedResourceType === 'pdf' ? '.pdf' : 'image/*'} disabled={isSubmitting}/>
                       </div>
                     )}

                    <div>
                      <Label htmlFor="resourceCoverImageFile">Imagen de Portada/Miniatura (Opcional)</Label>
                      {isEditing && currentEditingResource?.coverImageName && (
                            <p className="text-xs text-muted-foreground mb-1">Portada actual: {currentEditingResource.coverImageName}. Seleccione una nueva para reemplazarla.</p>
                        )}
                      <Input name="resourceCoverImage" id="resourceCoverImageFile" type="file" accept="image/*" disabled={isSubmitting}/>
                    </div>
                     <div>
                      <Label htmlFor="resourceAiHint">AI Hint (para imagen de portada, máx 2 palabras)</Label>
                      <Input name="resourceAiHint" id="resourceAiHint" type="text" placeholder="Ej: 'medical book', 'doctor patient'" defaultValue={currentEditingResource?.aiHint ?? ''} disabled={isSubmitting}/>
                    </div>
                  </>
                )}
                {feedbackMessage && (
                  <p className={`text-sm ${feedbackMessage.type === 'success' ? 'text-green-600' : 'text-destructive'}`}>{feedbackMessage.text}</p>
                )}
                <div className="flex flex-col sm:flex-row gap-2">
                    <Button type="submit" className="w-full" disabled={!selectedResourceType || isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isEditing ? "Actualizando..." : "Subiendo..."}
                        </>
                      ) : (
                        <>
                          {isEditing ? <Pencil className="mr-2 h-4 w-4" /> : <UploadCloud className="mr-2 h-4 w-4" />}
                          {isEditing ? "Actualizar Recurso" : "Subir Recurso"}
                        </>
                      )}
                    </Button>
                    {isEditing && (
                        <Button type="button" variant="outline" onClick={handleCancelEdit} className="w-full" disabled={isSubmitting}>
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancelar Edición
                        </Button>
                    )}
                </div>
              </form>
            </CardContent>
             <CardFooter className="flex-col items-start">
                <Button variant="outline" onClick={() => setIsLoggedIn(false)} className="w-full mt-4" disabled={isSubmitting}>
                  Cerrar Sesión
                </Button>
              </CardFooter>
          </Card>

          <Card className="max-w-4xl mx-auto shadow-xl rounded-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-headline text-xl">
                <BookOpen className="h-6 w-6 text-primary" />
                Recursos Cargados (Simulación en memoria)
              </CardTitle>
              <CardDescription>Ver, editar o eliminar recursos existentes.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex items-center gap-4">
                <Label htmlFor="resourceFilterTypeSelect" className="whitespace-nowrap">Filtrar por tipo:</Label>
                <Select
                  value={resourceFilterType}
                  onValueChange={(value) => {
                    setResourceFilterType(value as ResourceType | 'assessment' | 'all');
                    setFeedbackMessage(null); 
                  }}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="resourceFilterTypeSelect" className="w-[200px]">
                    <SelectValue placeholder="Todos los tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos los tipos</SelectItem>
                    {resourceTypeOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center">
                          {option.icon} {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {isLoadingResources ? (
                <p>Cargando recursos...</p>
              ) : resourcesList.length > 0 ? (
                <div className="space-y-4">
                  {resourcesList.map(resource => (
                    <Card key={resource.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 gap-4">
                      <div className="flex-grow">
                        <p className="font-semibold">{resource.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Tipo: {resourceTypeOptions.find(opt => opt.value === resource.type)?.label || resource.type}
                        </p>
                         <p className="text-xs text-muted-foreground">
                           Subido: {resource.createdAt ? new Date(resource.createdAt).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div className="flex gap-2 flex-shrink-0">
                        <Button variant="outline" size="sm" onClick={() => handleEditClick(resource)} disabled={isSubmitting}>
                          <Pencil className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Editar</span>
                        </Button>
                        <Button variant="destructive" size="sm" onClick={() => handleDeleteResource(resource)} disabled={isSubmitting}>
                          <Trash2 className="h-4 w-4 mr-1 sm:mr-2" /> <span className="hidden sm:inline">Eliminar</span>
                        </Button>
                      </div>
                    </Card>
                  ))}
                </div>
              ) : (
                <p>No hay recursos para mostrar con el filtro actual.</p>
              )}
               {feedbackMessage && feedbackMessage.text.includes("recursos") && (
                <p className={`mt-4 text-sm ${feedbackMessage.type === 'success' ? 'text-green-600' : 'text-destructive'}`}>{feedbackMessage.text}</p>
              )}
            </CardContent>
          </Card>
        </>
      )}

      <Card className="max-w-3xl mx-auto shadow-xl rounded-xl mt-12">
        <CardHeader>
          <CardTitle className="font-headline text-lg">Consideraciones para la Carga (PostgreSQL)</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc list-inside text-sm text-muted-foreground space-y-2">
            <li>
              Implementarás la lógica de conexión y consulta a tu base de datos PostgreSQL dentro de las Server Actions (en <code>actions.ts</code>).
            </li>
            <li>
              Necesitarás un sistema para manejar la subida de archivos (ej. a un servidor local, AWS S3, etc.) y almacenar las URLs/paths resultantes en tu base de datos PostgreSQL.
            </li>
            <li>Asegúrate de que los archivos cumplen con los formatos permitidos.</li>
            <li>Optimiza el tamaño de los archivos para una mejor experiencia del usuario.</li>
            <li>Provee títulos claros y descripciones concisas.</li>
            <li>Verifica que los enlaces proporcionados sean correctos y accesibles.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}

    