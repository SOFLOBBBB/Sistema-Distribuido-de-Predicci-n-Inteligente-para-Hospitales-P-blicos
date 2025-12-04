/**
 * Página de Predicciones
 * 
 * Muestra el historial de predicciones realizadas con filtros
 * y estadísticas.
 * 
 * [MÓDULO 4]: Visualización de resultados de ML
 * 
 * @author Sofía Castellanos Lobo
 */

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Brain,
  Plus,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  Filter,
} from 'lucide-react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { predictionService } from '../services';
import { Prediction, RiskLevel, PredictionType } from '../types';
import clsx from 'clsx';

// Colores para niveles de riesgo
const RISK_COLORS: Record<RiskLevel, string> = {
  LOW: '#22c55e',
  MEDIUM: '#eab308',
  HIGH: '#ef4444',
};

const PredictionsPage: React.FC = () => {
  // Estados
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPredictions, setTotalPredictions] = useState(0);
  
  // Estadísticas
  const [stats, setStats] = useState<{
    byRiskLevel: { riskLevel: RiskLevel; count: number }[];
    highRiskCount: number;
  } | null>(null);

  // Filtros
  const [riskFilter, setRiskFilter] = useState<RiskLevel | 'ALL'>('ALL');
  const [typeFilter, setTypeFilter] = useState<PredictionType | 'ALL'>('ALL');

  /**
   * Cargar predicciones
   */
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [predictionsData, statsData] = await Promise.all([
          predictionService.getPredictions(currentPage, 15),
          predictionService.getStatistics(),
        ]);

        setPredictions(predictionsData.data);
        setTotalPages(predictionsData.meta.totalPages);
        setTotalPredictions(predictionsData.meta.total);
        setStats({
          byRiskLevel: statsData.byRiskLevel,
          highRiskCount: statsData.highRiskCount,
        });
      } catch (error) {
        console.error('Error cargando predicciones:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage]);

  /**
   * Filtrar predicciones localmente
   */
  const filteredPredictions = predictions.filter((p) => {
    if (riskFilter !== 'ALL' && p.riskLevel !== riskFilter) return false;
    if (typeFilter !== 'ALL' && p.predictionType !== typeFilter) return false;
    return true;
  });

  /**
   * Formatear fecha
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * Obtener configuración de badge de riesgo
   */
  const getRiskConfig = (level: RiskLevel) => {
    const config: Record<RiskLevel, { class: string; text: string; icon: typeof CheckCircle }> = {
      LOW: { class: 'badge-success', text: 'Bajo', icon: CheckCircle },
      MEDIUM: { class: 'badge-warning', text: 'Medio', icon: Clock },
      HIGH: { class: 'badge-danger', text: 'Alto', icon: AlertTriangle },
    };
    return config[level];
  };

  /**
   * Preparar datos para gráfica
   */
  const pieData = stats?.byRiskLevel?.map((item) => ({
    name: getRiskConfig(item.riskLevel).text,
    value: Number(item.count),
    color: RISK_COLORS[item.riskLevel],
  })) || [];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ========================================
          HEADER
          ======================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Predicciones</h1>
          <p className="text-gray-500">
            Historial de predicciones de riesgo ({totalPredictions} total)
          </p>
        </div>

        <Link to="/predictions/new" className="btn-primary">
          <Plus className="w-5 h-5 mr-2" />
          Nueva Predicción
        </Link>
      </div>

      {/* ========================================
          RESUMEN Y GRÁFICA
          ======================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Estadísticas rápidas */}
        <div className="stat-card">
          <div className="stat-icon bg-purple-100">
            <Brain className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <p className="stat-value">{totalPredictions}</p>
            <p className="stat-label">Total predicciones</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon bg-red-100">
            <AlertTriangle className="w-6 h-6 text-red-600" />
          </div>
          <div>
            <p className="stat-value">{stats?.highRiskCount || 0}</p>
            <p className="stat-label">Alto riesgo</p>
          </div>
        </div>

        {/* Mini gráfica de distribución */}
        <div className="lg:col-span-2 card flex items-center gap-6">
          <div className="w-24 h-24">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={25}
                  outerRadius={40}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Distribución de Riesgo</h3>
            <div className="flex gap-4 text-sm">
              {pieData.map((item) => (
                <div key={item.name} className="flex items-center gap-1">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-gray-600">{item.name}: {item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ========================================
          FILTROS
          ======================================== */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-700">Filtros:</span>
          </div>
          
          {/* Filtro por riesgo */}
          <select
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value as RiskLevel | 'ALL')}
            className="form-input py-2 w-auto"
          >
            <option value="ALL">Todos los niveles</option>
            <option value="LOW">Riesgo Bajo</option>
            <option value="MEDIUM">Riesgo Medio</option>
            <option value="HIGH">Riesgo Alto</option>
          </select>

          {/* Filtro por tipo */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as PredictionType | 'ALL')}
            className="form-input py-2 w-auto"
          >
            <option value="ALL">Todos los tipos</option>
            <option value="READMISSION_RISK">Riesgo de Reingreso</option>
            <option value="DIABETES_RISK">Riesgo de Diabetes</option>
          </select>

          {/* Botón limpiar filtros */}
          {(riskFilter !== 'ALL' || typeFilter !== 'ALL') && (
            <button
              onClick={() => {
                setRiskFilter('ALL');
                setTypeFilter('ALL');
              }}
              className="text-sm text-primary-600 hover:text-primary-700"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* ========================================
          LISTA DE PREDICCIONES
          ======================================== */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="spinner mx-auto mb-4" />
            <p className="text-gray-500">Cargando predicciones...</p>
          </div>
        ) : filteredPredictions.length === 0 ? (
          <div className="p-8 text-center">
            <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">No hay predicciones que coincidan con los filtros</p>
          </div>
        ) : (
          <>
            {/* Lista */}
            <div className="divide-y divide-gray-200">
              {filteredPredictions.map((prediction) => {
                const riskConfig = getRiskConfig(prediction.riskLevel);
                const RiskIcon = riskConfig.icon;

                return (
                  <div
                    key={prediction.id}
                    className="p-4 sm:p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      {/* Info del paciente y predicción */}
                      <div className="flex items-start gap-4">
                        <div className={clsx(
                          'w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0',
                          prediction.riskLevel === 'HIGH' && 'bg-red-100',
                          prediction.riskLevel === 'MEDIUM' && 'bg-yellow-100',
                          prediction.riskLevel === 'LOW' && 'bg-green-100'
                        )}>
                          <span className={clsx(
                            'text-lg font-bold',
                            prediction.riskLevel === 'HIGH' && 'text-red-600',
                            prediction.riskLevel === 'MEDIUM' && 'text-yellow-600',
                            prediction.riskLevel === 'LOW' && 'text-green-600'
                          )}>
                            {Math.round(prediction.riskScore * 100)}%
                          </span>
                        </div>

                        <div>
                          <h3 className="font-medium text-gray-900">
                            {prediction.patient?.firstName} {prediction.patient?.lastName}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {prediction.predictionType === 'READMISSION_RISK'
                              ? 'Riesgo de Reingreso Hospitalario'
                              : 'Riesgo de Diabetes'}
                          </p>
                          <p className="text-xs text-gray-400 mt-1">
                            {formatDate(prediction.createdAt)}
                          </p>
                        </div>
                      </div>

                      {/* Badge y detalles */}
                      <div className="flex items-center gap-4">
                        <div className="text-right text-sm text-gray-500 hidden md:block">
                          <p>Modelo: {prediction.modelAlgorithm}</p>
                          <p>Tiempo: {prediction.processingTimeMs}ms</p>
                        </div>
                        
                        <span className={clsx(riskConfig.class, 'flex items-center gap-1')}>
                          <RiskIcon className="w-4 h-4" />
                          Riesgo {riskConfig.text}
                        </span>

                        <Link
                          to={`/patients/${prediction.patientId}`}
                          className="btn-secondary py-2 px-3"
                        >
                          Ver Paciente
                        </Link>
                      </div>
                    </div>

                    {/* Feature importance (expandido) */}
                    {prediction.featureImportance && Object.keys(prediction.featureImportance).length > 0 && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs font-medium text-gray-500 mb-2">
                          Factores más importantes:
                        </p>
                        <div className="flex flex-wrap gap-2">
                          {Object.entries(prediction.featureImportance)
                            .slice(0, 5)
                            .map(([feature, importance]) => (
                              <span
                                key={feature}
                                className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600"
                              >
                                {feature.replace(/_/g, ' ')}: {(Number(importance) * 100).toFixed(1)}%
                              </span>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Página {currentPage} de {totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="btn-secondary py-2 px-3 disabled:opacity-50"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="btn-secondary py-2 px-3 disabled:opacity-50"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PredictionsPage;

