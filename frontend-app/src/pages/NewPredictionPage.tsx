/**
 * Página de Nueva Predicción
 * 
 * Formulario para solicitar una nueva predicción de riesgo.
 * Permite seleccionar paciente, registro clínico y tipo de predicción.
 * 
 * [MÓDULO 3]: Comunicación con microservicio ML
 * [MÓDULO 4]: Interfaz de solicitud de predicción
 * 
 * @author Sofía Castellanos Lobo
 */

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Brain,
  Search,
  User,
  Activity,
  AlertTriangle,
  CheckCircle,
  Loader,
  ChevronRight,
} from 'lucide-react';
import { patientService, predictionService } from '../services';
import { Patient, ClinicalRecord, Prediction, PredictionType, RiskLevel } from '../types';
import clsx from 'clsx';

const NewPredictionPage: React.FC = () => {
  const { patientId } = useParams<{ patientId?: string }>();
  const navigate = useNavigate();

  // Estados del flujo
  const [step, setStep] = useState<'select-patient' | 'select-record' | 'processing' | 'result'>(
    patientId ? 'select-record' : 'select-patient'
  );

  // Estados de datos
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [clinicalRecords, setClinicalRecords] = useState<ClinicalRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<ClinicalRecord | null>(null);
  const [predictionType, setPredictionType] = useState<PredictionType>('READMISSION_RISK');
  const [result, setResult] = useState<Prediction | null>(null);

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Si viene con patientId, cargar el paciente
   */
  useEffect(() => {
    if (patientId) {
      loadPatient(patientId);
    }
  }, [patientId]);

  /**
   * Cargar paciente por ID
   */
  const loadPatient = async (id: string) => {
    try {
      const patient = await patientService.getPatientById(id);
      setSelectedPatient(patient);
      
      const records = await patientService.getClinicalRecords(id);
      setClinicalRecords(records);
      
      setStep('select-record');
    } catch (error) {
      console.error('Error cargando paciente:', error);
      setError('No se pudo cargar el paciente');
    }
  };

  /**
   * Buscar pacientes
   */
  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    
    setLoading(true);
    try {
      const results = await patientService.searchPatients(searchQuery);
      setSearchResults(results);
    } catch (error) {
      console.error('Error buscando pacientes:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Seleccionar paciente
   */
  const handleSelectPatient = async (patient: Patient) => {
    setSelectedPatient(patient);
    setLoading(true);
    
    try {
      const records = await patientService.getClinicalRecords(patient.id);
      setClinicalRecords(records);
      setStep('select-record');
    } catch (error) {
      console.error('Error cargando registros:', error);
      setError('Error al cargar registros clínicos');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Ejecutar predicción
   */
  const handlePredict = async () => {
    if (!selectedPatient || !selectedRecord) return;

    setStep('processing');
    setError(null);

    try {
      const prediction = await predictionService.requestPrediction({
        patientId: selectedPatient.id,
        clinicalRecordId: selectedRecord.id,
        predictionType,
      });

      setResult(prediction);
      setStep('result');
    } catch (error) {
      console.error('Error en predicción:', error);
      setError('Error al procesar la predicción. Verifica que el servicio ML esté disponible.');
      setStep('select-record');
    }
  };

  /**
   * Obtener configuración de riesgo
   */
  const getRiskConfig = (level: RiskLevel) => {
    const config: Record<RiskLevel, { bg: string; text: string; border: string; label: string }> = {
      LOW: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Bajo' },
      MEDIUM: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', label: 'Medio' },
      HIGH: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'Alto' },
    };
    return config[level];
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

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      {/* ========================================
          HEADER
          ======================================== */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nueva Predicción</h1>
          <p className="text-gray-500">
            Evalúa el riesgo clínico de un paciente usando Machine Learning
          </p>
        </div>
      </div>

      {/* Indicador de progreso */}
      <div className="flex items-center gap-4">
        {['Paciente', 'Registro', 'Resultado'].map((label, index) => {
          const stepIndex = step === 'select-patient' ? 0 
            : step === 'select-record' ? 1 
            : step === 'processing' ? 2 
            : 2;
          
          return (
            <React.Fragment key={label}>
              <div className={clsx(
                'flex items-center gap-2',
                index <= stepIndex ? 'text-primary-600' : 'text-gray-400'
              )}>
                <div className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  index < stepIndex && 'bg-primary-600 text-white',
                  index === stepIndex && 'bg-primary-100 text-primary-600 border-2 border-primary-600',
                  index > stepIndex && 'bg-gray-100 text-gray-400'
                )}>
                  {index < stepIndex ? '✓' : index + 1}
                </div>
                <span className="hidden sm:inline font-medium">{label}</span>
              </div>
              {index < 2 && (
                <ChevronRight className="w-5 h-5 text-gray-300" />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {/* ========================================
          PASO 1: SELECCIONAR PACIENTE
          ======================================== */}
      {step === 'select-patient' && (
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Seleccionar Paciente
          </h2>

          {/* Búsqueda */}
          <div className="flex gap-3 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar por nombre o CURP..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                className="form-input pl-10"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading || !searchQuery.trim()}
              className="btn-primary"
            >
              {loading ? <Loader className="w-5 h-5 animate-spin" /> : 'Buscar'}
            </button>
          </div>

          {/* Resultados */}
          {searchResults.length > 0 && (
            <div className="space-y-2">
              {searchResults.map((patient) => (
                <button
                  key={patient.id}
                  onClick={() => handleSelectPatient(patient)}
                  className="w-full flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors text-left"
                >
                  <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-primary-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">
                      {patient.firstName} {patient.lastName}
                    </p>
                    <p className="text-sm text-gray-500">
                      {patient.curp || 'Sin CURP'} • {patient.hospitalId || 'Sin hospital'}
                    </p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              ))}
            </div>
          )}

          {searchQuery && searchResults.length === 0 && !loading && (
            <div className="text-center py-8 text-gray-500">
              No se encontraron pacientes
            </div>
          )}
        </div>
      )}

      {/* ========================================
          PASO 2: SELECCIONAR REGISTRO Y TIPO
          ======================================== */}
      {step === 'select-record' && selectedPatient && (
        <div className="space-y-6">
          {/* Info del paciente seleccionado */}
          <div className="card bg-primary-50 border-primary-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-primary-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">
                  {selectedPatient.firstName} {selectedPatient.lastName}
                </p>
                <p className="text-sm text-gray-600">
                  Paciente seleccionado
                </p>
              </div>
            </div>
          </div>

          {/* Tipo de predicción */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Tipo de Predicción
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <button
                onClick={() => setPredictionType('READMISSION_RISK')}
                className={clsx(
                  'p-4 border-2 rounded-lg text-left transition-colors',
                  predictionType === 'READMISSION_RISK'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <Activity className={clsx(
                  'w-8 h-8 mb-2',
                  predictionType === 'READMISSION_RISK' ? 'text-primary-600' : 'text-gray-400'
                )} />
                <p className="font-medium text-gray-900">Riesgo de Reingreso</p>
                <p className="text-sm text-gray-500">
                  Probabilidad de reingreso hospitalario en 30 días
                </p>
              </button>

              <button
                onClick={() => setPredictionType('DIABETES_RISK')}
                className={clsx(
                  'p-4 border-2 rounded-lg text-left transition-colors',
                  predictionType === 'DIABETES_RISK'
                    ? 'border-primary-500 bg-primary-50'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <AlertTriangle className={clsx(
                  'w-8 h-8 mb-2',
                  predictionType === 'DIABETES_RISK' ? 'text-primary-600' : 'text-gray-400'
                )} />
                <p className="font-medium text-gray-900">Riesgo de Diabetes</p>
                <p className="text-sm text-gray-500">
                  Probabilidad de desarrollar diabetes
                </p>
              </button>
            </div>
          </div>

          {/* Seleccionar registro clínico */}
          <div className="card">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Registro Clínico Base
            </h2>

            {clinicalRecords.length === 0 ? (
              <div className="text-center py-8">
                <Activity className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p className="text-gray-500 mb-4">
                  Este paciente no tiene registros clínicos
                </p>
                <p className="text-sm text-gray-400">
                  Debes agregar un registro clínico antes de realizar una predicción
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {clinicalRecords.map((record) => (
                  <button
                    key={record.id}
                    onClick={() => setSelectedRecord(record)}
                    className={clsx(
                      'w-full p-4 border-2 rounded-lg text-left transition-colors',
                      selectedRecord?.id === record.id
                        ? 'border-primary-500 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    )}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-gray-900">
                        {formatDate(record.recordDate)}
                      </span>
                      <span className="text-sm text-gray-500">
                        Edad: {record.age} años
                      </span>
                    </div>
                    <div className="grid grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="text-gray-400">IMC:</span> {record.bmi || '-'}
                      </div>
                      <div>
                        <span className="text-gray-400">Glucosa:</span> {record.glucoseLevel || '-'}
                      </div>
                      <div>
                        <span className="text-gray-400">PA:</span> {record.bloodPressureSystolic}/{record.bloodPressureDiastolic}
                      </div>
                      <div>
                        <span className="text-gray-400">Ingresos:</span> {record.previousAdmissions}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Botón ejecutar */}
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setStep('select-patient')}
              className="btn-secondary"
            >
              Cambiar paciente
            </button>
            <button
              onClick={handlePredict}
              disabled={!selectedRecord}
              className="btn-primary"
            >
              <Brain className="w-5 h-5 mr-2" />
              Ejecutar Predicción
            </button>
          </div>
        </div>
      )}

      {/* ========================================
          PROCESANDO
          ======================================== */}
      {step === 'processing' && (
        <div className="card text-center py-12">
          <div className="w-20 h-20 mx-auto mb-6 relative">
            <div className="absolute inset-0 border-4 border-primary-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-transparent border-t-primary-600 rounded-full animate-spin"></div>
            <Brain className="absolute inset-0 m-auto w-10 h-10 text-primary-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Procesando predicción...
          </h2>
          <p className="text-gray-500">
            Analizando datos clínicos con el modelo de Machine Learning
          </p>
        </div>
      )}

      {/* ========================================
          RESULTADO
          ======================================== */}
      {step === 'result' && result && (
        <div className="space-y-6">
          {/* Resultado principal */}
          <div className={clsx(
            'card border-2',
            getRiskConfig(result.riskLevel).border,
            getRiskConfig(result.riskLevel).bg
          )}>
            <div className="text-center">
              <div className={clsx(
                'w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center',
                result.riskLevel === 'HIGH' && 'bg-red-100',
                result.riskLevel === 'MEDIUM' && 'bg-yellow-100',
                result.riskLevel === 'LOW' && 'bg-green-100'
              )}>
                <span className={clsx(
                  'text-4xl font-bold',
                  getRiskConfig(result.riskLevel).text
                )}>
                  {Math.round(result.riskScore * 100)}%
                </span>
              </div>

              <h2 className={clsx(
                'text-2xl font-bold mb-2',
                getRiskConfig(result.riskLevel).text
              )}>
                Riesgo {getRiskConfig(result.riskLevel).label}
              </h2>

              <p className="text-gray-600">
                {result.predictionType === 'READMISSION_RISK'
                  ? 'Probabilidad de reingreso hospitalario en 30 días'
                  : 'Probabilidad de desarrollar diabetes'}
              </p>
            </div>
          </div>

          {/* Detalles */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Información del modelo */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Información del Modelo
              </h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Algoritmo</span>
                  <span className="font-medium">{result.modelAlgorithm}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Versión</span>
                  <span className="font-medium">{result.modelVersion}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tiempo de procesamiento</span>
                  <span className="font-medium">{result.processingTimeMs}ms</span>
                </div>
              </div>
            </div>

            {/* Factores de riesgo */}
            <div className="card">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Factores Principales
              </h3>
              <div className="space-y-3">
                {Object.entries(result.featureImportance)
                  .slice(0, 6)
                  .map(([feature, importance]) => (
                    <div key={feature}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600 capitalize">
                          {feature.replace(/_/g, ' ')}
                        </span>
                        <span className="font-medium">
                          {(Number(importance) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-primary-500 h-2 rounded-full"
                          style={{ width: `${Number(importance) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex justify-center gap-4">
            <Link
              to={`/patients/${selectedPatient?.id}`}
              className="btn-secondary"
            >
              Ver Paciente
            </Link>
            <button
              onClick={() => {
                setResult(null);
                setSelectedRecord(null);
                setStep('select-record');
              }}
              className="btn-primary"
            >
              <Brain className="w-5 h-5 mr-2" />
              Nueva Predicción
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewPredictionPage;

