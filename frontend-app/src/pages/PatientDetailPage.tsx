/**
 * Página de Detalle de Paciente
 * 
 * Muestra la información completa del paciente, historial clínico
 * y predicciones realizadas.
 * 
 * @author Sofía Castellanos Lobo
 */

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  User,
  Calendar,
  Phone,
  MapPin,
  Activity,
  Brain,
  Plus,
  AlertTriangle,
  Heart,
  Droplet,
} from 'lucide-react';
import { patientService, predictionService } from '../services';
import { Patient, ClinicalRecord, Prediction, RiskLevel } from '../types';
import clsx from 'clsx';

const PatientDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Estados
  const [patient, setPatient] = useState<Patient | null>(null);
  const [clinicalRecords, setClinicalRecords] = useState<ClinicalRecord[]>([]);
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'info' | 'clinical' | 'predictions'>('info');

  /**
   * Cargar datos del paciente
   */
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;

      try {
        const [patientData, records, predictionHistory] = await Promise.all([
          patientService.getPatientById(id),
          patientService.getClinicalRecords(id),
          predictionService.getPatientPredictions(id),
        ]);

        setPatient(patientData);
        setClinicalRecords(records);
        setPredictions(predictionHistory);
      } catch (error) {
        console.error('Error cargando datos del paciente:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  /**
   * Calcular edad
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
   * Formatear fecha
   */
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    });
  };

  /**
   * Obtener badge de riesgo
   */
  const getRiskBadge = (level: RiskLevel) => {
    const config: Record<RiskLevel, { class: string; text: string }> = {
      LOW: { class: 'badge-success', text: 'Bajo' },
      MEDIUM: { class: 'badge-warning', text: 'Medio' },
      HIGH: { class: 'badge-danger', text: 'Alto' },
    };
    return config[level];
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="spinner mx-auto mb-4" />
          <p className="text-gray-500">Cargando información del paciente...</p>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <User className="w-16 h-16 mx-auto mb-4 text-gray-300" />
        <h2 className="text-xl font-semibold text-gray-900">Paciente no encontrado</h2>
        <p className="text-gray-500 mt-2">El paciente solicitado no existe.</p>
        <Link to="/patients" className="btn-primary mt-4 inline-block">
          Volver a pacientes
        </Link>
      </div>
    );
  }

  // Obtener última predicción para mostrar en header
  const lastPrediction = predictions[0];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* ========================================
          HEADER
          ======================================== */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/patients')}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-bold text-primary-700">
                {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
              </span>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {patient.firstName} {patient.lastName}
              </h1>
              <p className="text-gray-500">
                {calculateAge(patient.birthDate)} años • {patient.curp || 'Sin CURP'}
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Indicador de último riesgo */}
          {lastPrediction && (
            <div className={clsx(
              'px-4 py-2 rounded-lg flex items-center gap-2',
              lastPrediction.riskLevel === 'HIGH' && 'bg-red-50',
              lastPrediction.riskLevel === 'MEDIUM' && 'bg-yellow-50',
              lastPrediction.riskLevel === 'LOW' && 'bg-green-50'
            )}>
              <AlertTriangle className={clsx(
                'w-5 h-5',
                lastPrediction.riskLevel === 'HIGH' && 'text-red-500',
                lastPrediction.riskLevel === 'MEDIUM' && 'text-yellow-500',
                lastPrediction.riskLevel === 'LOW' && 'text-green-500'
              )} />
              <span className={clsx(
                'font-medium',
                lastPrediction.riskLevel === 'HIGH' && 'text-red-700',
                lastPrediction.riskLevel === 'MEDIUM' && 'text-yellow-700',
                lastPrediction.riskLevel === 'LOW' && 'text-green-700'
              )}>
                Riesgo {getRiskBadge(lastPrediction.riskLevel).text}
              </span>
            </div>
          )}

          <Link
            to={`/predictions/new/${patient.id}`}
            className="btn-primary"
          >
            <Brain className="w-5 h-5 mr-2" />
            Nueva Predicción
          </Link>
        </div>
      </div>

      {/* ========================================
          TABS
          ======================================== */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-8">
          {[
            { id: 'info', label: 'Información', icon: User },
            { id: 'clinical', label: 'Historial Clínico', icon: Activity },
            { id: 'predictions', label: 'Predicciones', icon: Brain },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={clsx(
                'flex items-center gap-2 py-4 border-b-2 font-medium transition-colors',
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              )}
            >
              <tab.icon className="w-5 h-5" />
              {tab.label}
              {tab.id === 'predictions' && predictions.length > 0 && (
                <span className="ml-1 px-2 py-0.5 text-xs bg-primary-100 text-primary-700 rounded-full">
                  {predictions.length}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {/* ========================================
          TAB: INFORMACIÓN
          ======================================== */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Datos personales */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Datos Personales
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Fecha de nacimiento</p>
                  <p className="font-medium">{formatDate(patient.birthDate)}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <User className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Género</p>
                  <p className="font-medium">
                    {patient.gender === 'M' ? 'Masculino' : patient.gender === 'F' ? 'Femenino' : 'Otro'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Droplet className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Tipo de sangre</p>
                  <p className="font-medium">{patient.bloodType || 'No especificado'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contacto */}
          <div className="card">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Información de Contacto
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Teléfono</p>
                  <p className="font-medium">{patient.phone || 'No registrado'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Hospital</p>
                  <p className="font-medium">{patient.hospitalId || 'No especificado'}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Heart className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Contacto de emergencia</p>
                  <p className="font-medium">{patient.emergencyContact || 'No registrado'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================
          TAB: HISTORIAL CLÍNICO
          ======================================== */}
      {activeTab === 'clinical' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Registros Clínicos
            </h3>
            <button className="btn-secondary">
              <Plus className="w-5 h-5 mr-2" />
              Nuevo Registro
            </button>
          </div>

          {clinicalRecords.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No hay registros clínicos</p>
              <p className="text-sm text-gray-400 mt-1">
                Agrega un registro para poder realizar predicciones
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {clinicalRecords.map((record) => (
                <div
                  key={record.id}
                  className="p-4 bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-medium text-gray-900">
                      {formatDate(record.recordDate)}
                    </span>
                    <span className="text-sm text-gray-500">
                      Edad: {record.age} años
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-500">IMC</p>
                      <p className="font-medium">{record.bmi || '-'}</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Presión Arterial</p>
                      <p className="font-medium">
                        {record.bloodPressureSystolic}/{record.bloodPressureDiastolic || '-'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-500">Glucosa</p>
                      <p className="font-medium">{record.glucoseLevel || '-'} mg/dL</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Ingresos previos</p>
                      <p className="font-medium">{record.previousAdmissions}</p>
                    </div>
                  </div>
                  {/* Indicadores booleanos */}
                  <div className="flex gap-2 mt-3">
                    {record.hasDiabetes && (
                      <span className="badge-warning">Diabetes</span>
                    )}
                    {record.hasHypertension && (
                      <span className="badge-warning">Hipertensión</span>
                    )}
                    {record.hasHeartDisease && (
                      <span className="badge-danger">Cardiopatía</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ========================================
          TAB: PREDICCIONES
          ======================================== */}
      {activeTab === 'predictions' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              Historial de Predicciones
            </h3>
            <Link
              to={`/predictions/new/${patient.id}`}
              className="btn-primary"
            >
              <Brain className="w-5 h-5 mr-2" />
              Nueva Predicción
            </Link>
          </div>

          {predictions.length === 0 ? (
            <div className="text-center py-12">
              <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p className="text-gray-500">No hay predicciones realizadas</p>
              <p className="text-sm text-gray-400 mt-1">
                Realiza una predicción para evaluar el riesgo del paciente
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {predictions.map((prediction) => (
                <div
                  key={prediction.id}
                  className="p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={clsx(
                        'w-12 h-12 rounded-full flex items-center justify-center',
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
                        <p className="font-medium text-gray-900">
                          {prediction.predictionType === 'READMISSION_RISK'
                            ? 'Riesgo de Reingreso'
                            : 'Riesgo de Diabetes'}
                        </p>
                        <p className="text-sm text-gray-500">
                          {formatDate(prediction.createdAt)}
                        </p>
                      </div>
                    </div>
                    <span className={getRiskBadge(prediction.riskLevel).class}>
                      Riesgo {getRiskBadge(prediction.riskLevel).text}
                    </span>
                  </div>
                  <div className="text-sm text-gray-500">
                    <span>Modelo: {prediction.modelAlgorithm}</span>
                    <span className="mx-2">•</span>
                    <span>Versión: {prediction.modelVersion}</span>
                    <span className="mx-2">•</span>
                    <span>Tiempo: {prediction.processingTimeMs}ms</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientDetailPage;

