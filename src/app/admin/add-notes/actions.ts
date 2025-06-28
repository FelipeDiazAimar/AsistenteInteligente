'use server';

import type { File } from 'buffer';
import { getPostgresClient } from '@/lib/postgres';
import { supabase } from '@/lib/supabase';
import { authenticateProfessor, type Professor } from '@/lib/auth';

export type ResourceType = 'pdf' | 'video' | 'image' | 'article' | 'assessment' | '';

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: ResourceType | 'assessment';
  link?: string;
  fileUrl?: string;
  fileName?: string;
  coverImageUrl?: string;
  coverImageName?: string;
  aiHint?: string;
  googleFormUrl?: string;
  createdAt: Date;
}

// Type for client-side, ensuring Date is stringified
export type ClientResource = Omit<Resource, 'createdAt'> & {
  createdAt: string;
};

// Nuevo tipo para el resultado de login
export interface LoginResult {
  success: boolean;
  error?: string;
  professor?: Professor;
  token?: string;
}

export async function handleLoginAction(formData: FormData): Promise<LoginResult> {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    return { success: false, error: 'Email y contraseña son obligatorios.' };
  }

  try {
    const result = await authenticateProfessor(email, password);
    return result;
  } catch (error) {
    console.error('Error en login action:', error);
    return { success: false, error: 'Error interno del servidor.' };
  }
}

export async function saveResourceAction(formData: FormData) {
  const title = formData.get('resourceTitle') as string;
  const description = formData.get('resourceDescription') as string;
  const type = formData.get('resourceType') as ResourceType | 'assessment';
  const link = formData.get('resourceLink') as string | null;
  const aiHint = formData.get('resourceAiHint') as string | null;
  const resourceFile = formData.get('resourceFile') as File | null;
  const resourceCoverImageFile = formData.get('resourceCoverImage') as File | null;

  let fileUrlForDb: string | undefined;
  let originalFileName: string | undefined;
  let coverImageUrlForDb: string | undefined;
  let originalCoverImageName: string | undefined;

  // ARCHIVO PRINCIPAL (PDF o imagen)
  if (resourceFile && resourceFile.size > 0) {
    const fileName = `${Date.now()}-${resourceFile.name.replace(/\s+/g, '_')}`;
    const fileBlob = new Blob([await resourceFile.arrayBuffer()]);
    const { error } = await supabase.storage
      .from('uploads')
      .upload(fileName, fileBlob, { upsert: true });

    if (error) {
      return { success: false, error: "Error al subir archivo a Supabase." };
    }

    const { data: publicUrlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(fileName);

    fileUrlForDb = publicUrlData.publicUrl;
    originalFileName = resourceFile.name;

    // Si no se subió una portada explícita, usa la misma imagen como portada
    if (!resourceCoverImageFile || resourceCoverImageFile.size === 0) {
      coverImageUrlForDb = publicUrlData.publicUrl;
      originalCoverImageName = resourceFile.name;
    }
  }

  // IMAGEN DE PORTADA (si se sube explícitamente)
  if (resourceCoverImageFile && resourceCoverImageFile.size > 0) {
    const coverFileName = `${Date.now()}-${resourceCoverImageFile.name.replace(/\s+/g, '_')}`;
    const coverBlob = new Blob([await resourceCoverImageFile.arrayBuffer()]);
    const { error } = await supabase.storage
      .from('uploads')
      .upload(coverFileName, coverBlob, { upsert: true });

    if (error) {
      return { success: false, error: "Error al subir portada a Supabase." };
    }

    const { data: publicUrlData } = supabase.storage
      .from('uploads')
      .getPublicUrl(coverFileName);

    coverImageUrlForDb = publicUrlData.publicUrl;
    originalCoverImageName = resourceCoverImageFile.name;
  } else if (aiHint) {
    coverImageUrlForDb = `https://placehold.co/300x200.png`;
  } else if (!coverImageUrlForDb) {
    coverImageUrlForDb = `https://placehold.co/300x200.png`;
  }

  const newResourceData: Resource = {
    id: '',
    title,
    description,
    type,
    link: link || undefined,
    aiHint: aiHint || undefined,
    fileUrl: fileUrlForDb,
    fileName: originalFileName,
    coverImageUrl: coverImageUrlForDb,
    coverImageName: originalCoverImageName,
    googleFormUrl: type === 'assessment' ? link || undefined : undefined,
    createdAt: new Date(),
  };

  try {
    const client = await getPostgresClient();
    const query = `
      INSERT INTO resources (title, description, type, link, file_url, file_name, cover_image_url, cover_image_name, ai_hint, google_form_url, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *;
    `;
    const values = [
      title,
      description,
      type,
      link,
      fileUrlForDb,
      originalFileName,
      coverImageUrlForDb,
      originalCoverImageName,
      aiHint,
      type === 'assessment' ? link : null,
      new Date()
    ];
    const result = await client.query(query, values);
    client.release();
    const row = result.rows[0];
    return { success: true, data: { ...row, createdAt: new Date(row.created_at).toISOString() } };
  } catch (error) {
    return { success: false, error: "Error al guardar el recurso en la base de datos." };
  }
}

export async function updateResourceAction(resourceId: string, formData: FormData): Promise<{ success: boolean; error?: string; message?: string; updatedResource?: ClientResource }> {
  const title = formData.get('resourceTitle') as string;
  const description = formData.get('resourceDescription') as string;
  const type = formData.get('resourceType') as ResourceType | 'assessment';
  const link = formData.get('resourceLink') as string | null;
  const aiHint = formData.get('resourceAiHint') as string | null;
  const resourceFile = formData.get('resourceFile') as File | null;
  const resourceCoverImageFile = formData.get('resourceCoverImage') as File | null;

  if (!resourceId) {
    return { success: false, error: "ID de recurso es inválido para actualizar." };
  }
  if (!title || !type) {
    return { success: false, error: "Título y tipo de recurso son obligatorios para la actualización." };
  }

  try {
    const client = await getPostgresClient();
    const selectQuery = "SELECT * FROM resources WHERE id = $1";
    const selectResult = await client.query(selectQuery, [resourceId]);
    if (selectResult.rows.length === 0) {
      await client.release();
      return { success: false, error: "Recurso no encontrado para actualizar." };
    }
    const existingResourceFromDb = selectResult.rows[0];

    let newFileUrl: string | undefined = existingResourceFromDb.file_url;
    let newFileName: string | undefined = existingResourceFromDb.file_name;
    let newCoverImageUrl: string | undefined = existingResourceFromDb.cover_image_url;
    let newCoverImageName: string | undefined = existingResourceFromDb.cover_image_name;

    // Si se sube un archivo principal nuevo
    if (resourceFile && resourceFile.size > 0) {
      const fileName = `${Date.now()}-${resourceFile.name.replace(/\s+/g, '_')}`;
      const fileBlob = new Blob([await resourceFile.arrayBuffer()]);
      const { error } = await supabase.storage
        .from('uploads')
        .upload(fileName, fileBlob, { upsert: true });

      if (error) {
        return { success: false, error: "Error al subir archivo a Supabase." };
      }

      const { data: publicUrlData } = supabase.storage
        .from('uploads')
        .getPublicUrl(fileName);

      newFileUrl = publicUrlData.publicUrl;
      newFileName = resourceFile.name;

      // Si no se subió una portada explícita, usa la misma imagen como portada
      if (!resourceCoverImageFile || resourceCoverImageFile.size === 0) {
        newCoverImageUrl = publicUrlData.publicUrl;
        newCoverImageName = resourceFile.name;
      }
    }

    // Si se sube una portada explícita
    if (resourceCoverImageFile && resourceCoverImageFile.size > 0) {
      const coverFileName = `${Date.now()}-${resourceCoverImageFile.name.replace(/\s+/g, '_')}`;
      const coverBlob = new Blob([await resourceCoverImageFile.arrayBuffer()]);
      const { error } = await supabase.storage
        .from('uploads')
        .upload(coverFileName, coverBlob, { upsert: true });

      if (error) {
        return { success: false, error: "Error al subir portada a Supabase." };
      }

      const { data: publicUrlData } = supabase.storage
        .from('uploads')
        .getPublicUrl(coverFileName);

      newCoverImageUrl = publicUrlData.publicUrl;
      newCoverImageName = resourceCoverImageFile.name;
    } else if (!newCoverImageUrl && aiHint) {
      newCoverImageUrl = `https://placehold.co/300x200.png`;
    } else if (!newCoverImageUrl) {
      newCoverImageUrl = `https://placehold.co/300x200.png`;
    }

    const updateQuery = `
      UPDATE resources
      SET title = $1, description = $2, type = $3, link = $4, file_url = $5, file_name = $6,
          cover_image_url = $7, cover_image_name = $8, ai_hint = $9, google_form_url = $10
      WHERE id = $11
      RETURNING *;
    `;
    const values = [
      title,
      description,
      type,
      link,
      newFileUrl,
      newFileName,
      newCoverImageUrl,
      newCoverImageName,
      aiHint,
      type === 'assessment' ? link : null,
      resourceId
    ];
    const updateResult = await client.query(updateQuery, values);
    const dbUpdatedResource = updateResult.rows[0];
    await client.release();

    const clientUpdatedResource: ClientResource = {
      ...dbUpdatedResource,
      createdAt: new Date(dbUpdatedResource.created_at).toISOString(),
    };

    return { success: true, message: `Recurso "${title}" actualizado exitosamente.`, updatedResource: clientUpdatedResource };
  } catch (dbError) {
    return { success: false, error: "Error al actualizar el recurso en la base de datos." };
  }
}

export async function fetchResourcesAction(
  typeFilter?: ResourceType | 'assessment' | 'all',
  searchQuery?: string
): Promise<{ success: boolean; data?: ClientResource[]; error?: string; }> {
  console.log(`Obteniendo recursos de la base de datos con filtro: ${typeFilter || 'ninguno'} y búsqueda: "${searchQuery || ''}"`);
  
  await new Promise(resolve => setTimeout(resolve, 50)); 

  // POSTGRESQL INTEGRATION POINT:
  try {
    const client = await getPostgresClient();
    let baseQuery = "SELECT * FROM resources";
    const queryParams: any[] = [];
    const conditions: string[] = [];

    if (typeFilter && typeFilter !== 'all') {
      queryParams.push(typeFilter);
      conditions.push(`type = $${queryParams.length}`);
    }

    if (searchQuery && searchQuery.trim() !== '') {
      queryParams.push(`%${searchQuery.trim().toLowerCase()}%`);
      conditions.push(`(LOWER(title) LIKE $${queryParams.length} OR LOWER(description) LIKE $${queryParams.length})`);
    }

    if (conditions.length > 0) {
      baseQuery += " WHERE " + conditions.join(" AND ");
    }
    baseQuery += " ORDER BY created_at DESC";

    const result = await client.query(baseQuery, queryParams);
    await client.release();
    const dbResources: Resource[] = result.rows.map(row => ({ // Map DB row to Resource type
        id: row.id.toString(),
        title: row.title,
        description: row.description,
        type: row.type,
        link: row.link,
        fileUrl: row.file_url,
        fileName: row.file_name,
        coverImageUrl: row.cover_image_url,
        coverImageName: row.cover_image_name,
        aiHint: row.ai_hint,
        googleFormUrl: row.google_form_url,
        createdAt: new Date(row.created_at), // Ensure this is a Date object
    }));
     const clientData: ClientResource[] = dbResources.map(resource => ({
       ...resource,
       createdAt: resource.createdAt.toISOString(),
     }));
    return { success: true, data: clientData };
  } catch (dbError) {
    console.error("Error obteniendo recursos de PostgreSQL:", dbError);
    return { success: false, error: "Error al cargar los recursos de la base de datos." };
  }
}

export async function deleteResourceAction(resourceId: string): Promise<{ success: boolean; error?: string; message?: string }> {
  if (!resourceId) {
    return { success: false, error: "ID de recurso es requerido para eliminar." };
  }
  console.log(`Intentando eliminar recurso: ${resourceId}`);
  
  // POSTGRESQL INTEGRATION POINT:
  try {
    const client = await getPostgresClient();
    // 1. Get the resource to find file URLs for deletion from storage
    const selectQuery = "SELECT file_url, cover_image_url, title FROM resources WHERE id = $1";
    const selectResult = await client.query(selectQuery, [resourceId]);
    
    if (selectResult.rows.length === 0) {
      await client.release();
      return { success: false, error: "Recurso no encontrado para eliminar." };
    }
    const resourceToDelete = selectResult.rows[0];

    // 2. Delete from PostgreSQL
    const deleteQuery = "DELETE FROM resources WHERE id = $1 RETURNING title";
    const deleteResult = await client.query(deleteQuery, [resourceId]);
    await client.release();

    if (deleteResult.rowCount === 0) { // Should not happen if select found it, but good check
      return { success: false, error: "Error al eliminar el recurso de la base de datos (no se encontró)." };
    }
    const deletedTitle = deleteResult.rows[0].title;

    // 3. Delete files from storage (implement these functions)
    // if (resourceToDelete.file_url) {
    //   await deleteFileFromYourStorage(resourceToDelete.file_url);
    // }
    // if (resourceToDelete.cover_image_url && !resourceToDelete.cover_image_url.startsWith('https://placehold.co')) {
    //   await deleteFileFromYourStorage(resourceToDelete.cover_image_url);
    // }
    return { success: true, message: `Recurso "${deletedTitle}" eliminado exitosamente.` };
  } catch (dbError) {
    console.error("Error eliminando recurso de PostgreSQL:", dbError);
    return { success: false, error: "Error al eliminar el recurso de la base de datos." };
  }
}
