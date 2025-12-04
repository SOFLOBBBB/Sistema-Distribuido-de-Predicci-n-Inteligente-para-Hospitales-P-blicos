/**
 * Configuración del cliente HTTP (Axios)
 * 
 * Este archivo configura el cliente Axios para comunicarse con el
 * Backend API. Incluye interceptores para manejo de tokens JWT
 * y errores globales.
 * 
 * [MÓDULO 3]: Comunicación distribuida Frontend ↔ Backend API
 * 
 * @author Sofía Castellanos Lobo
 */

import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// URL base de la API (configurable por entorno)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

/**
 * Instancia de Axios configurada para la API
 * 
 * Esta instancia se utiliza en toda la aplicación para
 * realizar peticiones HTTP al backend.
 */
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos de timeout
});

/**
 * Interceptor de peticiones
 * 
 * Agrega automáticamente el token JWT a todas las peticiones
 * si existe en localStorage.
 */
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Obtener token del almacenamiento local
    const token = localStorage.getItem('sdpi_token');
    
    // Si existe token, agregarlo al header Authorization
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    // Manejar error de configuración de petición
    console.error('Error en configuración de petición:', error);
    return Promise.reject(error);
  }
);

/**
 * Interceptor de respuestas
 * 
 * Maneja errores globales como:
 * - 401 Unauthorized: Redirige al login
 * - 403 Forbidden: Muestra mensaje de acceso denegado
 * - 500+ Server Error: Muestra mensaje de error del servidor
 */
api.interceptors.response.use(
  (response) => {
    // Respuesta exitosa, retornar sin modificar
    return response;
  },
  (error: AxiosError) => {
    // Manejar diferentes tipos de error
    if (error.response) {
      const { status } = error.response;
      
      switch (status) {
        case 401:
          // Token inválido o expirado
          console.warn('Sesión expirada o token inválido');
          // Limpiar almacenamiento local
          localStorage.removeItem('sdpi_token');
          localStorage.removeItem('sdpi_user');
          // Redirigir al login (si no estamos ya en login)
          if (window.location.pathname !== '/login') {
            window.location.href = '/login';
          }
          break;
          
        case 403:
          // Acceso denegado
          console.warn('Acceso denegado:', error.response.data);
          break;
          
        case 404:
          // Recurso no encontrado
          console.warn('Recurso no encontrado:', error.config?.url);
          break;
          
        case 500:
        case 502:
        case 503:
          // Error del servidor
          console.error('Error del servidor:', error.response.data);
          break;
          
        default:
          // Otros errores
          console.error('Error de la API:', error.response.data);
      }
    } else if (error.request) {
      // Error de red (no se recibió respuesta)
      console.error('Error de red - No se pudo conectar con el servidor');
    } else {
      // Error en la configuración de la petición
      console.error('Error:', error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;

