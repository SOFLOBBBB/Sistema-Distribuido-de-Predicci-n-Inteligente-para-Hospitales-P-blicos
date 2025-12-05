/**
 * Servicio de Autenticación
 * 
 * Este servicio maneja todas las operaciones relacionadas con
 * la autenticación de usuarios, incluyendo login, logout y
 * verificación de sesión.
 * 
 * [MÓDULO 2]: Seguridad - Autenticación JWT
 * 
 * @author Sofía Castellanos Lobo
 */

import api from './api';
import { LoginCredentials, LoginResponse, User } from '../types';

/**
 * Claves para almacenamiento local
 */
const TOKEN_KEY = 'sdpi_token';
const USER_KEY = 'sdpi_user';

/**
 * Servicio de autenticación
 */
export const authService = {
  /**
   * Iniciar sesión con credenciales
   * 
   * Envía las credenciales al backend y almacena el token JWT
   * y la información del usuario en localStorage.
   * 
   * @param credentials - Email y contraseña del usuario
   * @returns Respuesta con token y datos del usuario
   */
  async login(credentials: LoginCredentials): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>('/auth/login', credentials);
    
    // Guardar token en localStorage
    localStorage.setItem(TOKEN_KEY, response.data.accessToken);
    // Guardar información del usuario
    localStorage.setItem(USER_KEY, JSON.stringify(response.data.user));
    
    return response.data;
  },

  /**
   * Cerrar sesión
   * 
   * Elimina el token y la información del usuario del
   * almacenamiento local.
   */
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  /**
   * Obtener el token almacenado
   * 
   * @returns Token JWT o null si no existe
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Obtener el usuario almacenado
   * 
   * @returns Información del usuario o null si no existe
   */
  getStoredUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY);
    if (!userStr) return null;
    
    try {
      return JSON.parse(userStr) as User;
    } catch {
      return null;
    }
  },

  /**
   * Verificar si hay una sesión activa
   * 
   * @returns true si existe un token almacenado
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  /**
   * Obtener el perfil del usuario actual desde el backend
   * 
   * Útil para verificar que el token sigue siendo válido
   * y obtener información actualizada del usuario.
   * 
   * @returns Información actualizada del usuario
   */
  async getCurrentUser(): Promise<User> {
    const response = await api.post<User>('/auth/me');
    // Actualizar información almacenada
    localStorage.setItem(USER_KEY, JSON.stringify(response.data));
    return response.data;
  },

  /**
   * Registrar usuario inicial (solo cuando no hay usuarios)
   * 
   * Este endpoint solo funciona cuando la base de datos
   * no tiene usuarios registrados.
   * 
   * @param userData - Datos del nuevo usuario
   */
  async registerInitial(userData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
  }): Promise<User> {
    const response = await api.post<User>('/auth/register-initial', userData);
    return response.data;
  },
};

export default authService;


