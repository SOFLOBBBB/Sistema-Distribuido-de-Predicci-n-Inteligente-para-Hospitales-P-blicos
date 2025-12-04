/**
 * Página de Login
 * 
 * Página de inicio de sesión con formulario de autenticación JWT.
 * Incluye validación de campos y manejo de errores.
 * 
 * [MÓDULO 2]: Seguridad - Interfaz de autenticación
 * 
 * @author Sofía Castellanos Lobo
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // Estados del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Manejar envío del formulario
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Intentar login
      await login({ email, password });
      // Redirigir al dashboard en caso de éxito
      navigate('/dashboard');
    } catch (err: unknown) {
      // Manejar error de autenticación
      console.error('Error de login:', err);
      
      // Mostrar mensaje de error apropiado
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosError = err as { response?: { status?: number } };
        if (axiosError.response?.status === 401) {
          setError('Credenciales incorrectas. Verifica tu email y contraseña.');
        } else {
          setError('Error al conectar con el servidor. Intenta de nuevo.');
        }
      } else {
        setError('Error inesperado. Intenta de nuevo.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-medical flex">
      {/* ========================================
          PANEL IZQUIERDO - Información
          ======================================== */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center px-12 text-white">
        <div className="max-w-md">
          {/* Logo y título */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-16 h-16 bg-white/20 backdrop-blur-lg rounded-2xl flex items-center justify-center">
              <Activity className="w-10 h-10 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">S.D.P.I.</h1>
              <p className="text-white/80">Sistema de Predicción Inteligente</p>
            </div>
          </div>

          {/* Descripción */}
          <h2 className="text-4xl font-bold mb-6 leading-tight">
            Predicciones clínicas con
            <span className="text-cyan-300"> Inteligencia Artificial</span>
          </h2>
          
          <p className="text-lg text-white/80 mb-8">
            Sistema distribuido para hospitales públicos que utiliza
            Machine Learning para predecir riesgos de reingreso hospitalario
            y mejorar la atención al paciente.
          </p>

          {/* Características */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span>Predicción de riesgo de reingreso</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span>Gestión segura de expedientes</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span>Visualización de estadísticas</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-12 text-sm text-white/60">
          <p>Universidad de Guadalajara • CUCEI</p>
          <p>Ingeniería Informática - Proyecto Modular</p>
        </div>
      </div>

      {/* ========================================
          PANEL DERECHO - Formulario de Login
          ======================================== */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Card del formulario */}
          <div className="bg-white rounded-2xl shadow-2xl p-8">
            {/* Header móvil */}
            <div className="lg:hidden text-center mb-8">
              <div className="w-16 h-16 bg-gradient-medical rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Activity className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-gray-900">S.D.P.I.</h1>
              <p className="text-gray-500">Sistema de Predicción Inteligente</p>
            </div>

            {/* Título del formulario */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900">
                Iniciar Sesión
              </h2>
              <p className="text-gray-500 mt-1">
                Ingresa tus credenciales para acceder al sistema
              </p>
            </div>

            {/* Mensaje de error */}
            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Formulario */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Campo de email */}
              <div>
                <label htmlFor="email" className="form-label">
                  Correo electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="form-input pl-10"
                    placeholder="doctor@hospital.gob.mx"
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Campo de contraseña */}
              <div>
                <label htmlFor="password" className="form-label">
                  Contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="form-input pl-10 pr-10"
                    placeholder="••••••••"
                    required
                    disabled={loading}
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
              </div>

              {/* Botón de envío */}
              <button
                type="submit"
                disabled={loading}
                className="w-full btn-primary py-3 text-base"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="spinner" />
                    Iniciando sesión...
                  </span>
                ) : (
                  'Iniciar Sesión'
                )}
              </button>
            </form>

            {/* Credenciales de prueba */}
            <div className="mt-8 p-4 bg-gray-50 rounded-lg">
              <p className="text-xs font-medium text-gray-500 mb-2">
                Credenciales de prueba:
              </p>
              <p className="text-xs text-gray-600">
                <strong>Email:</strong> admin@hospital.gob.mx
              </p>
              <p className="text-xs text-gray-600">
                <strong>Contraseña:</strong> Admin123!
              </p>
            </div>
          </div>

          {/* Footer móvil */}
          <p className="lg:hidden text-center mt-6 text-sm text-white/80">
            Universidad de Guadalajara • CUCEI
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

