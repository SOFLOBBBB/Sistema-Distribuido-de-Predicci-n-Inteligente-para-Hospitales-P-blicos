/**
 * Servicio de Predicciones
 * 
 * Este servicio maneja las operaciones relacionadas con las
 * predicciones de Machine Learning, incluyendo solicitar nuevas
 * predicciones y consultar el historial.
 * 
 * [MÓDULO 3]: Comunicación con microservicio ML
 * [MÓDULO 4]: Interfaz de predicciones ML
 * 
 * @author Sofía Castellanos Lobo
 */

import api from './api';
import {
  Prediction,
  PredictionRequest,
  PredictionStatistics,
  PaginatedResponse,
  MLHealthStatus,
} from '../types';

/**
 * Servicio de predicciones ML
 */
export const predictionService = {
  /**
   * Solicitar una nueva predicción
   * 
   * Esta función envía una solicitud al backend, que a su vez
   * se comunica con el microservicio de ML para obtener
   * la predicción de riesgo.
   * 
   * [MÓDULO 3]: Flujo distribuido Frontend → Backend → ML Service
   * 
   * @param data - Datos de la solicitud de predicción
   * @returns Resultado de la predicción
   */
  async requestPrediction(data: PredictionRequest): Promise<Prediction> {
    const response = await api.post<Prediction>('/predictions', data);
    return response.data;
  },

  /**
   * Obtener lista de predicciones paginada
   * 
   * @param page - Número de página
   * @param limit - Elementos por página
   * @returns Lista paginada de predicciones
   */
  async getPredictions(page = 1, limit = 20): Promise<PaginatedResponse<Prediction>> {
    const response = await api.get<PaginatedResponse<Prediction>>(
      `/predictions?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  /**
   * Obtener predicción por ID
   * 
   * @param id - UUID de la predicción
   * @returns Detalle de la predicción
   */
  async getPredictionById(id: string): Promise<Prediction> {
    const response = await api.get<Prediction>(`/predictions/${id}`);
    return response.data;
  },

  /**
   * Obtener historial de predicciones de un paciente
   * 
   * @param patientId - UUID del paciente
   * @returns Lista de predicciones del paciente
   */
  async getPatientPredictions(patientId: string): Promise<Prediction[]> {
    const response = await api.get<Prediction[]>(`/predictions/patient/${patientId}`);
    return response.data;
  },

  /**
   * Obtener estadísticas de predicciones
   * 
   * Incluye distribución por nivel de riesgo, tipo de predicción
   * y predicciones recientes.
   * 
   * @returns Estadísticas de predicciones
   */
  async getStatistics(): Promise<PredictionStatistics> {
    const response = await api.get<PredictionStatistics>('/predictions/statistics');
    return response.data;
  },

  /**
   * Verificar estado del servicio ML
   * 
   * [MÓDULO 3]: Health check del microservicio distribuido
   * 
   * @returns Estado de salud del servicio ML
   */
  async checkMLHealth(): Promise<MLHealthStatus> {
    const response = await api.get<MLHealthStatus>('/predictions/ml-health');
    return response.data;
  },

  /**
   * Obtener información del modelo ML
   * 
   * [MÓDULO 4]: Metadatos del modelo de Machine Learning
   * 
   * @returns Información del modelo (versión, algoritmo, features)
   */
  async getModelInfo(): Promise<Record<string, unknown>> {
    const response = await api.get<Record<string, unknown>>('/predictions/model-info');
    return response.data;
  },
};

export default predictionService;

