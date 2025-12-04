/**
 * Servicio de Pacientes
 * 
 * Este servicio maneja todas las operaciones CRUD relacionadas
 * con los registros de pacientes y sus datos clínicos.
 * 
 * [MÓDULO 2]: Gestión de información - Registros de pacientes
 * 
 * @author Sofía Castellanos Lobo
 */

import api from './api';
import {
  Patient,
  PatientFormData,
  ClinicalRecord,
  ClinicalRecordFormData,
  PaginatedResponse,
  PatientStatistics,
} from '../types';

/**
 * Servicio de gestión de pacientes
 */
export const patientService = {
  /**
   * Obtener lista de pacientes paginada
   * 
   * @param page - Número de página (default: 1)
   * @param limit - Elementos por página (default: 20)
   * @returns Lista paginada de pacientes
   */
  async getPatients(page = 1, limit = 20): Promise<PaginatedResponse<Patient>> {
    const response = await api.get<PaginatedResponse<Patient>>(
      `/patients?page=${page}&limit=${limit}`
    );
    return response.data;
  },

  /**
   * Buscar pacientes por nombre o CURP
   * 
   * @param query - Texto de búsqueda
   * @returns Lista de pacientes que coinciden
   */
  async searchPatients(query: string): Promise<Patient[]> {
    const response = await api.get<Patient[]>(`/patients/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  /**
   * Obtener paciente por ID
   * 
   * @param id - UUID del paciente
   * @returns Datos del paciente
   */
  async getPatientById(id: string): Promise<Patient> {
    const response = await api.get<Patient>(`/patients/${id}`);
    return response.data;
  },

  /**
   * Crear nuevo paciente
   * 
   * @param data - Datos del nuevo paciente
   * @returns Paciente creado
   */
  async createPatient(data: PatientFormData): Promise<Patient> {
    const response = await api.post<Patient>('/patients', data);
    return response.data;
  },

  /**
   * Actualizar paciente existente
   * 
   * @param id - UUID del paciente
   * @param data - Datos actualizados
   * @returns Paciente actualizado
   */
  async updatePatient(id: string, data: Partial<PatientFormData>): Promise<Patient> {
    const response = await api.put<Patient>(`/patients/${id}`, data);
    return response.data;
  },

  /**
   * Obtener estadísticas de pacientes
   * 
   * @returns Estadísticas generales de pacientes
   */
  async getStatistics(): Promise<PatientStatistics> {
    const response = await api.get<PatientStatistics>('/patients/statistics');
    return response.data;
  },

  // ============================================
  // REGISTROS CLÍNICOS
  // ============================================

  /**
   * Obtener registros clínicos de un paciente
   * 
   * @param patientId - UUID del paciente
   * @returns Lista de registros clínicos
   */
  async getClinicalRecords(patientId: string): Promise<ClinicalRecord[]> {
    const response = await api.get<ClinicalRecord[]>(
      `/patients/${patientId}/clinical-records`
    );
    return response.data;
  },

  /**
   * Obtener el registro clínico más reciente
   * 
   * @param patientId - UUID del paciente
   * @returns Último registro clínico o null
   */
  async getLatestClinicalRecord(patientId: string): Promise<ClinicalRecord | null> {
    const response = await api.get<ClinicalRecord | null>(
      `/patients/${patientId}/clinical-records/latest`
    );
    return response.data;
  },

  /**
   * Crear nuevo registro clínico
   * 
   * @param patientId - UUID del paciente
   * @param data - Datos del registro clínico
   * @returns Registro clínico creado
   */
  async createClinicalRecord(
    patientId: string,
    data: Omit<ClinicalRecordFormData, 'patientId'>
  ): Promise<ClinicalRecord> {
    const response = await api.post<ClinicalRecord>(
      `/patients/${patientId}/clinical-records`,
      data
    );
    return response.data;
  },
};

export default patientService;

