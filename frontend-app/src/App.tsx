/**
 * Componente Principal de la Aplicación
 * 
 * Este es el componente raíz que define las rutas y la estructura
 * general de la aplicación.
 * 
 * @author Sofía Castellanos Lobo
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Páginas
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import PatientsPage from './pages/PatientsPage';
import PatientDetailPage from './pages/PatientDetailPage';
import PredictionsPage from './pages/PredictionsPage';
import NewPredictionPage from './pages/NewPredictionPage';

// Componentes de layout
import MainLayout from './components/layout/MainLayout';
import LoadingScreen from './components/common/LoadingScreen';

// ============================================
// COMPONENTE DE RUTA PROTEGIDA
// ============================================

interface ProtectedRouteProps {
  children: React.ReactNode;
}

/**
 * Componente para proteger rutas que requieren autenticación
 * 
 * Si el usuario no está autenticado, redirige al login.
 */
const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  // Mostrar pantalla de carga mientras verifica la sesión
  if (loading) {
    return <LoadingScreen />;
  }

  // Si no está autenticado, redirigir al login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// ============================================
// COMPONENTE PRINCIPAL
// ============================================

/**
 * Componente App
 * 
 * Define todas las rutas de la aplicación y la estructura
 * de navegación.
 */
const App: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  // Mostrar pantalla de carga durante la verificación inicial
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <Routes>
      {/* ========================================
          RUTA DE LOGIN (Pública)
          ======================================== */}
      <Route
        path="/login"
        element={
          isAuthenticated ? (
            <Navigate to="/dashboard" replace />
          ) : (
            <LoginPage />
          )
        }
      />

      {/* ========================================
          RUTAS PROTEGIDAS (Requieren autenticación)
          ======================================== */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        {/* Redirigir raíz al dashboard */}
        <Route index element={<Navigate to="/dashboard" replace />} />

        {/* Dashboard principal */}
        <Route path="dashboard" element={<DashboardPage />} />

        {/* Gestión de pacientes */}
        <Route path="patients" element={<PatientsPage />} />
        <Route path="patients/:id" element={<PatientDetailPage />} />

        {/* Predicciones */}
        <Route path="predictions" element={<PredictionsPage />} />
        <Route path="predictions/new" element={<NewPredictionPage />} />
        <Route path="predictions/new/:patientId" element={<NewPredictionPage />} />
      </Route>

      {/* ========================================
          RUTA 404 - Página no encontrada
          ======================================== */}
      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <h1 className="text-6xl font-bold text-gray-300">404</h1>
              <p className="text-xl text-gray-600 mt-4">Página no encontrada</p>
              <a
                href="/dashboard"
                className="btn-primary mt-6 inline-block"
              >
                Volver al inicio
              </a>
            </div>
          </div>
        }
      />
    </Routes>
  );
};

export default App;


