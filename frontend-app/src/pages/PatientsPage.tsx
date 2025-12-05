/**
 * Página de Gestión de Pacientes
 * 
 * Muestra la lista de pacientes con funcionalidades de búsqueda,
 * paginación y acciones CRUD.
 * 
 * [MÓDULO 2]: Gestión de información - CRUD de pacientes
 * 
 * @author Sofía Castellanos Lobo
 */

import React, { useEffect, useState, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Eye,
  Brain,
  ChevronLeft,
  ChevronRight,
  User,
  Calendar,
  X,
} from 'lucide-react';
import { patientService } from '../services';
import { Patient, PatientFormData, Gender } from '../types';
import clsx from 'clsx';

const PatientsPage: React.FC = () => {
  const navigate = useNavigate();

  // Estados
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPatients, setTotalPatients] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Estado del formulario de nuevo paciente
  const [formData, setFormData] = useState<PatientFormData>({
    firstName: '',
    lastName: '',
    birthDate: '',
    curp: '',
    gender: undefined,
    bloodType: '',
    hospitalId: '',
    phone: '',
    emergencyContact: '',
  });

  /**
   * Cargar pacientes (paginados o búsqueda)
   */
  const loadPatients = useCallback(async () => {
    setLoading(true);
    try {
      if (searchQuery.trim()) {
        // Búsqueda
        const results = await patientService.searchPatients(searchQuery);
        setPatients(results);
        setTotalPages(1);
        setTotalPatients(results.length);
      } else {
        // Lista paginada
        const response = await patientService.getPatients(currentPage, 10);
        setPatients(response.data);
        setTotalPages(response.meta.totalPages);
        setTotalPatients(response.meta.total);
      }
    } catch (error) {
      console.error('Error cargando pacientes:', error);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery]);

  // Cargar pacientes cuando cambia la página o búsqueda
  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  /**
   * Manejar búsqueda con debounce
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1); // Resetear a primera página en búsqueda
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  /**
   * Calcular edad a partir de fecha de nacimiento
   */
  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  /**
   * Obtener texto del género
   */
  const getGenderText = (gender?: Gender): string => {
    const texts: Record<Gender, string> = {
      M: 'Masculino',
      F: 'Femenino',
      OTHER: 'Otro',
    };
    return gender ? texts[gender] : 'No especificado';
  };

  /**
   * Manejar cambios en el formulario
   */
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value || undefined,
    }));
  };

  /**
   * Crear nuevo paciente
   */
  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      const newPatient = await patientService.createPatient(formData);
      // Cerrar modal y navegar al detalle del paciente
      setShowModal(false);
      navigate(`/patients/${newPatient.id}`);
    } catch (error) {
      console.error('Error creando paciente:', error);
      alert('Error al crear el paciente. Verifica los datos e intenta de nuevo.');
    } finally {
      setFormLoading(false);
    }
  };

  /**
   * Resetear formulario
   */
  const resetForm = () => {
    setFormData({
      firstName: '',
      lastName: '',
      birthDate: '',
      curp: '',
      gender: undefined,
      bloodType: '',
      hospitalId: '',
      phone: '',
      emergencyContact: '',
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ========================================
          HEADER
          ======================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pacientes</h1>
          <p className="text-gray-500">
            Gestión de registros de pacientes ({totalPatients} total)
          </p>
        </div>

        <button
          onClick={() => {
            resetForm();
            setShowModal(true);
          }}
          className="btn-primary"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nuevo Paciente
        </button>
      </div>

      {/* ========================================
          BARRA DE BÚSQUEDA
          ======================================== */}
      <div className="card">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o CURP..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="form-input pl-10"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* ========================================
          TABLA DE PACIENTES
          ======================================== */}
      <div className="card p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="spinner mx-auto mb-4" />
            <p className="text-gray-500">Cargando pacientes...</p>
          </div>
        ) : patients.length === 0 ? (
          <div className="p-8 text-center">
            <User className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p className="text-gray-500">
              {searchQuery
                ? 'No se encontraron pacientes con ese criterio'
                : 'No hay pacientes registrados'}
            </p>
          </div>
        ) : (
          <>
            {/* Tabla */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Paciente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CURP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Edad
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Género
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Hospital
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
                            <span className="text-primary-700 font-medium">
                              {patient.firstName.charAt(0)}
                              {patient.lastName.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <p className="font-medium text-gray-900">
                              {patient.firstName} {patient.lastName}
                            </p>
                            <p className="text-sm text-gray-500">
                              {patient.phone || 'Sin teléfono'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 font-mono">
                          {patient.curp || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {calculateAge(patient.birthDate)} años
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900">
                          {getGenderText(patient.gender)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-500">
                          {patient.hospitalId || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/patients/${patient.id}`}
                            className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg"
                            title="Ver detalle"
                          >
                            <Eye className="w-5 h-5" />
                          </Link>
                          <Link
                            to={`/predictions/new/${patient.id}`}
                            className="p-2 text-gray-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg"
                            title="Nueva predicción"
                          >
                            <Brain className="w-5 h-5" />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {!searchQuery && totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Mostrando página {currentPage} de {totalPages}
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

      {/* ========================================
          MODAL: NUEVO PACIENTE
          ======================================== */}
      {showModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setShowModal(false)}
          />

          {/* Modal */}
          <div className="relative min-h-screen flex items-center justify-center p-4">
            <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              {/* Header del modal */}
              <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900">
                  Registrar Nuevo Paciente
                </h2>
                <button
                  onClick={() => setShowModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Formulario */}
              <form onSubmit={handleCreatePatient} className="p-6 space-y-6">
                {/* Datos personales */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-4">
                    Datos Personales
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Nombre(s) *</label>
                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleFormChange}
                        className="form-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Apellidos *</label>
                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleFormChange}
                        className="form-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">Fecha de Nacimiento *</label>
                      <input
                        type="date"
                        name="birthDate"
                        value={formData.birthDate}
                        onChange={handleFormChange}
                        className="form-input"
                        required
                      />
                    </div>
                    <div>
                      <label className="form-label">CURP</label>
                      <input
                        type="text"
                        name="curp"
                        value={formData.curp}
                        onChange={handleFormChange}
                        className="form-input font-mono uppercase"
                        maxLength={18}
                        placeholder="XXXX000000XXXXXX00"
                      />
                    </div>
                    <div>
                      <label className="form-label">Género</label>
                      <select
                        name="gender"
                        value={formData.gender || ''}
                        onChange={handleFormChange}
                        className="form-input"
                      >
                        <option value="">Seleccionar...</option>
                        <option value="M">Masculino</option>
                        <option value="F">Femenino</option>
                        <option value="OTHER">Otro</option>
                      </select>
                    </div>
                    <div>
                      <label className="form-label">Tipo de Sangre</label>
                      <select
                        name="bloodType"
                        value={formData.bloodType}
                        onChange={handleFormChange}
                        className="form-input"
                      >
                        <option value="">Seleccionar...</option>
                        <option value="A+">A+</option>
                        <option value="A-">A-</option>
                        <option value="B+">B+</option>
                        <option value="B-">B-</option>
                        <option value="AB+">AB+</option>
                        <option value="AB-">AB-</option>
                        <option value="O+">O+</option>
                        <option value="O-">O-</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Información de contacto */}
                <div>
                  <h3 className="text-sm font-medium text-gray-700 mb-4">
                    Información de Contacto
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Teléfono</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleFormChange}
                        className="form-input"
                        placeholder="+52 33 1234 5678"
                      />
                    </div>
                    <div>
                      <label className="form-label">ID Hospital</label>
                      <input
                        type="text"
                        name="hospitalId"
                        value={formData.hospitalId}
                        onChange={handleFormChange}
                        className="form-input"
                        placeholder="HGR-45"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="form-label">Contacto de Emergencia</label>
                      <input
                        type="text"
                        name="emergencyContact"
                        value={formData.emergencyContact}
                        onChange={handleFormChange}
                        className="form-input"
                        placeholder="Nombre - Parentesco - Teléfono"
                      />
                    </div>
                  </div>
                </div>

                {/* Botones */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="btn-secondary"
                    disabled={formLoading}
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={formLoading}
                  >
                    {formLoading ? (
                      <>
                        <span className="spinner mr-2" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5 mr-2" />
                        Crear Paciente
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatientsPage;


