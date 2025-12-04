/**
 * Contexto de Autenticación
 * 
 * Este contexto provee el estado de autenticación a toda la aplicación.
 * Maneja el login, logout y verificación de sesión con JWT.
 * 
 * [MÓDULO 2]: Seguridad - Gestión de estado de autenticación
 * 
 * @author Sofía Castellanos Lobo
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, LoginCredentials, LoginResponse } from '../types';
import authService from '../services/authService';

// ============================================
// TIPOS DEL CONTEXTO
// ============================================

/** Estado del contexto de autenticación */
interface AuthContextState {
  /** Usuario autenticado o null */
  user: User | null;
  /** Indica si está cargando la verificación inicial */
  loading: boolean;
  /** Indica si el usuario está autenticado */
  isAuthenticated: boolean;
  /** Función para iniciar sesión */
  login: (credentials: LoginCredentials) => Promise<LoginResponse>;
  /** Función para cerrar sesión */
  logout: () => void;
  /** Función para actualizar datos del usuario */
  refreshUser: () => Promise<void>;
}

// ============================================
// CONTEXTO
// ============================================

// Crear el contexto con valores por defecto
const AuthContext = createContext<AuthContextState | undefined>(undefined);

// ============================================
// PROVIDER
// ============================================

interface AuthProviderProps {
  children: React.ReactNode;
}

/**
 * Proveedor de autenticación
 * 
 * Envuelve la aplicación y provee el estado de autenticación
 * a todos los componentes hijos.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  // Estado del usuario autenticado
  const [user, setUser] = useState<User | null>(null);
  // Estado de carga inicial
  const [loading, setLoading] = useState(true);

  /**
   * Verificar sesión al cargar la aplicación
   * 
   * Comprueba si existe un token válido en localStorage
   * y restaura la sesión del usuario.
   */
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Verificar si hay un token almacenado
        const token = authService.getToken();
        
        if (token) {
          // Intentar obtener el usuario almacenado
          const storedUser = authService.getStoredUser();
          
          if (storedUser) {
            setUser(storedUser);
            
            // Verificar que el token sigue siendo válido (opcional)
            // Descomentar si se quiere validar con el backend en cada carga
            // try {
            //   const currentUser = await authService.getCurrentUser();
            //   setUser(currentUser);
            // } catch {
            //   // Token inválido, limpiar sesión
            //   authService.logout();
            //   setUser(null);
            // }
          }
        }
      } catch (error) {
        console.error('Error al inicializar autenticación:', error);
        // En caso de error, limpiar cualquier sesión corrupta
        authService.logout();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  /**
   * Iniciar sesión
   * 
   * @param credentials - Email y contraseña
   * @returns Respuesta del login con token y usuario
   */
  const login = useCallback(async (credentials: LoginCredentials): Promise<LoginResponse> => {
    const response = await authService.login(credentials);
    setUser(response.user);
    return response;
  }, []);

  /**
   * Cerrar sesión
   * 
   * Elimina el token y limpia el estado del usuario
   */
  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
  }, []);

  /**
   * Actualizar datos del usuario
   * 
   * Obtiene la información actualizada del usuario desde el backend
   */
  const refreshUser = useCallback(async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      // Si falla, posiblemente el token expiró
      logout();
    }
  }, [logout]);

  // Valor del contexto
  const value: AuthContextState = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshUser,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// ============================================
// HOOK PERSONALIZADO
// ============================================

/**
 * Hook para acceder al contexto de autenticación
 * 
 * @returns Estado y funciones de autenticación
 * @throws Error si se usa fuera del AuthProvider
 */
export const useAuth = (): AuthContextState => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  
  return context;
};

export default AuthContext;

