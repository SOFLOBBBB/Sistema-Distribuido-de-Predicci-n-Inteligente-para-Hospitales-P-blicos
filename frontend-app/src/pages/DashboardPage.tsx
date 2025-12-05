/**
 * Página de Dashboard
 * 
 * Panel principal que muestra estadísticas generales del sistema,
 * gráficas de predicciones y actividad reciente.
 * 
 * @author Sofía Castellanos Lobo
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Brain,
  AlertTriangle,
  TrendingUp,
  Activity,
  ArrowRight,
  CheckCircle,
  Clock,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';
import { patientService, predictionService } from '../services';
import { PatientStatistics, PredictionStatistics, RiskLevel } from '../types';

// Colores para las gráficas de nivel de riesgo
const RISK_COLORS: Record<RiskLevel, string> = {
  LOW: '#22c55e',
  MEDIUM: '#eab308',
  HIGH: '#ef4444',
};

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  // Estados para las estadísticas
  const [patientStats, setPatientStats] = useState<PatientStatistics | null>(null);
  const [predictionStats, setPredictionStats] = useState<PredictionStatistics | null>(null);
  const [mlStatus, setMlStatus] = useState<{ status: string; model_version: string } | null>(null);
  const [loading, setLoading] = useState(true);

  /**
   * Cargar estadísticas al montar el componente
   */
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Cargar todas las estadísticas en paralelo
        const [patients, predictions, mlHealth] = await Promise.all([
          patientService.getStatistics(),
          predictionService.getStatistics(),
          predictionService.checkMLHealth(),
        ]);

        setPatientStats(patients);
        setPredictionStats(predictions);
        setMlStatus(mlHealth);
      } catch (error) {
        console.error('Error cargando estadísticas:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  /**
   * Preparar datos para gráfica de pastel (distribución de riesgo)
   */
  const riskPieData = predictionStats?.byRiskLevel?.map((item) => ({
    name: item.riskLevel === 'LOW' ? 'Bajo' : item.riskLevel === 'MEDIUM' ? 'Medio' : 'Alto',
    value: Number(item.count),
    color: RISK_COLORS[item.riskLevel],
  })) || [];

  /**
   * Preparar datos para gráfica de barras (predicciones por tipo)
   */
  const predictionBarData = predictionStats?.byType?.map((item) => ({
    name: item.predictionType === 'READMISSION_RISK' ? 'Reingreso' : 'Diabetes',
    cantidad: Number(item.count),
    riesgoPromedio: Number((Number(item.avgRiskScore) * 100).toFixed(1)),
  })) || [];

  /**
   * Formatear fecha para mostrar
   */
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Obtener clase de badge según nivel de riesgo
   */
  const getRiskBadgeClass = (level: RiskLevel) => {
    const classes: Record<RiskLevel, string> = {
      LOW: 'badge-success',
      MEDIUM: 'badge-warning',
      HIGH: 'badge-danger',
    };
    return classes[level];
  };

  /**
   * Obtener texto del nivel de riesgo
   */
  const getRiskText = (level: RiskLevel) => {
    const texts: Record<RiskLevel, string> = {
      LOW: 'Bajo',
      MEDIUM: 'Medio',
      HIGH: 'Alto',
    };
    return texts[level];
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ========================================
          HEADER
          ======================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Bienvenido, {user?.firstName}
          </h1>
          <p className="text-gray-500">
            Resumen general del sistema de predicción hospitalaria
          </p>
        </div>
        
        {/* Estado del servicio ML */}
        {mlStatus && (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-green-700">
              ML Service: {mlStatus.model_version}
            </span>
          </div>
        )}
      </div>

      {/* ========================================
          TARJETAS DE ESTADÍSTICAS
          ======================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total de pacientes */}
        <div className="stat-card">
          <div className="stat-icon bg-blue-100">
            <Users className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <p className="stat-value">
              {loading ? '...' : patientStats?.total || 0}
            </p>
            <p className="stat-label">Pacientes registrados</p>
          </div>
        </div>

        {/* Total de predicciones */}
        <div className="stat-card">
          <div className="stat-icon bg-purple-100">
            <Brain className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="stat-value">
              {loading ? '...' : predictionStats?.total || 0}
            </p>
            <p className="stat-label">Predicciones realizadas</p>
          </div>
        </div>

        {/* Pacientes alto riesgo */}
        <div className="stat-card">
          <div className="stat-icon bg-red-100">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="stat-value">
              {loading ? '...' : predictionStats?.highRiskCount || 0}
            </p>
            <p className="stat-label">Pacientes alto riesgo</p>
          </div>
        </div>

        {/* Nuevos este mes */}
        <div className="stat-card">
          <div className="stat-icon bg-green-100">
            <TrendingUp className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <p className="stat-value">
              {loading ? '...' : patientStats?.thisMonth || 0}
            </p>
            <p className="stat-label">Nuevos este mes</p>
          </div>
        </div>
      </div>

      {/* ========================================
          GRÁFICAS
          ======================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfica de distribución de riesgo */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Distribución de Niveles de Riesgo
          </h3>
          {riskPieData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {riskPieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No hay datos de predicciones
            </div>
          )}
        </div>

        {/* Gráfica de predicciones por tipo */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Predicciones por Tipo
          </h3>
          {predictionBarData.length > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={predictionBarData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="cantidad" fill="#0d6ce3" name="Cantidad" />
                  <Bar dataKey="riesgoPromedio" fill="#eab308" name="Riesgo Promedio %" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-gray-400">
              No hay datos de predicciones
            </div>
          )}
        </div>
      </div>

      {/* ========================================
          ACTIVIDAD RECIENTE Y ACCIONES RÁPIDAS
          ======================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Predicciones recientes */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Predicciones Recientes
            </h3>
            <Link
              to="/predictions"
              className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
            >
              Ver todas
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {predictionStats?.recentPredictions && predictionStats.recentPredictions.length > 0 ? (
            <div className="space-y-3">
              {predictionStats.recentPredictions.slice(0, 5).map((prediction) => (
                <div
                  key={prediction.id}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                      <Activity className="w-5 h-5 text-primary-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {prediction.patient?.firstName} {prediction.patient?.lastName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {prediction.predictionType === 'READMISSION_RISK'
                          ? 'Riesgo de Reingreso'
                          : 'Riesgo de Diabetes'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={getRiskBadgeClass(prediction.riskLevel)}>
                      {getRiskText(prediction.riskLevel)}
                    </span>
                    <p className="text-xs text-gray-400 mt-1">
                      {formatDate(prediction.createdAt)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">
              <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No hay predicciones recientes</p>
            </div>
          )}
        </div>

        {/* Acciones rápidas */}
        <div className="card">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Acciones Rápidas
          </h3>
          <div className="space-y-3">
            <Link
              to="/patients"
              className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-blue-900">Nuevo Paciente</p>
                <p className="text-sm text-blue-600">Registrar paciente</p>
              </div>
            </Link>

            <Link
              to="/predictions/new"
              className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors"
            >
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium text-purple-900">Nueva Predicción</p>
                <p className="text-sm text-purple-600">Evaluar riesgo</p>
              </div>
            </Link>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Sistema Operativo</p>
                <p className="text-sm text-gray-500">Todos los servicios activos</p>
              </div>
            </div>
          </div>

          {/* Información del modelo ML */}
          {mlStatus && (
            <div className="mt-6 p-4 bg-gradient-to-r from-primary-50 to-purple-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Brain className="w-5 h-5 text-primary-600" />
                <span className="font-medium text-primary-900">Modelo ML</span>
              </div>
              <p className="text-sm text-gray-600">
                Versión: {mlStatus.model_version}
              </p>
              <p className="text-sm text-gray-600">
                Algoritmo: Regresión Logística
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;


