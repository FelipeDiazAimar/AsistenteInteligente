"use client";

import { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from './use-auth';

export function useSessionExpiration() {
  const router = useRouter();
  const { logout } = useAuth();

  // Función para verificar si la sesión ha expirado
  const checkSessionExpiration = useCallback(async () => {
    try {
      const response = await fetch('/api/auth/me', {
        credentials: 'include'
      });

      if (!response.ok || response.status === 401) {
        // Sesión expirada o inválida
        console.log('Sesión expirada, redirigiendo al login...');
        await logout();
        router.push('/admin/login?expired=true');
      }
    } catch (error) {
      console.error('Error verificando sesión:', error);
      // En caso de error de red, también cerrar sesión
      await logout();
      router.push('/admin/login?error=network');
    }
  }, [logout, router]);

  // Función para limpiar sesiones expiradas en el servidor
  const cleanExpiredSessions = useCallback(async () => {
    try {
      await fetch('/api/admin/sessions/cleanup', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.error('Error limpiando sesiones expiradas:', error);
    }
  }, []);

  useEffect(() => {
    // Verificar sesión cada 2 minutos (120,000 ms)
    const sessionCheckInterval = setInterval(checkSessionExpiration, 2 * 60 * 1000);

    // Limpiar sesiones expiradas cada 5 minutos (300,000 ms)
    const cleanupInterval = setInterval(cleanExpiredSessions, 5 * 60 * 1000);

    // Verificar inmediatamente al montar el componente
    checkSessionExpiration();

    // Limpiar intervalos al desmontar
    return () => {
      clearInterval(sessionCheckInterval);
      clearInterval(cleanupInterval);
    };
  }, [checkSessionExpiration, cleanExpiredSessions]);

  return {
    checkSessionExpiration,
    cleanExpiredSessions
  };
}
