# Formato de Registro de Proyecto Modular

**Universidad de Guadalajara**  
**Centro Universitario de Ciencias Exactas e Ingenierías (CUCEI)**  
**Ingeniería Informática (INNI)**

---

## Datos del Proyecto

| Campo | Información |
|-------|-------------|
| **Título del Proyecto** | Sistema Distribuido de Predicción Inteligente para Hospitales Públicos (S.D.P.I.) |
| **Alumno(a)** | Sofía Castellanos Lobo |
| **Código** | [Tu código de estudiante] |
| **Carrera** | Ingeniería Informática |
| **Módulos** | Módulo 2, Módulo 3, Módulo 4 |

---

## Objetivo General

*(Máximo 30 palabras, verbo en infinitivo)*

**Desarrollar** un sistema web distribuido que permita al personal de salud de hospitales públicos realizar predicciones de riesgo clínico mediante algoritmos de aprendizaje automático, garantizando la seguridad, integridad y disponibilidad de la información.

---

## Objetivos Específicos

*(Máximo 25 palabras cada uno, verbos en infinitivo)*

1. **Diseñar** e implementar una arquitectura de microservicios que separe las capas de presentación, lógica de negocio y procesamiento de machine learning.

2. **Desarrollar** una API REST segura con autenticación JWT y control de acceso basado en roles para proteger los datos clínicos de los pacientes.

3. **Implementar** modelos de regresión logística y árboles de decisión para predecir el riesgo de reingreso hospitalario con al menos 80% de precisión.

4. **Construir** una base de datos relacional PostgreSQL que garantice la integridad, consistencia y trazabilidad de la información médica.

5. **Crear** una interfaz web responsiva con React que facilite la visualización de predicciones y estadísticas para el personal médico.

---

## Antecedentes

*(Máximo 300 palabras)*

Los hospitales públicos en México enfrentan desafíos significativos en la gestión de recursos y la atención al paciente. Según datos del INEGI (2023), las instituciones de salud pública atienden aproximadamente al 70% de la población mexicana, generando grandes volúmenes de información clínica que frecuentemente no se aprovechan para la toma de decisiones preventivas.

El reingreso hospitalario no planificado representa un problema de salud pública considerable. Estudios del Instituto Mexicano del Seguro Social (IMSS) indican que entre el 15% y 20% de los pacientes dados de alta regresan al hospital dentro de los primeros 30 días, lo cual incrementa los costos de atención y refleja posibles deficiencias en el seguimiento post-hospitalario.

La inteligencia artificial y el aprendizaje automático han demostrado ser herramientas valiosas en el sector salud a nivel mundial. Investigaciones publicadas en journals como *The Lancet Digital Health* y *JAMIA* han reportado que los modelos predictivos pueden identificar pacientes de alto riesgo con precisión superior al 75%, permitiendo intervenciones preventivas oportunas.

En el contexto mexicano, existen iniciativas como el Expediente Clínico Electrónico y la Norma Oficial Mexicana NOM-024-SSA3-2012, que establecen lineamientos para el manejo de información de salud. Sin embargo, la implementación de sistemas predictivos inteligentes en hospitales públicos sigue siendo limitada.

Este proyecto busca contribuir a la transformación digital del sector salud mexicano mediante el desarrollo de un sistema que integre las mejores prácticas de ingeniería de software con técnicas modernas de machine learning, respetando los estándares de seguridad y privacidad de datos médicos establecidos en la legislación nacional.

---

## Justificación

*(Máximo 200 palabras)*

La implementación de un sistema de predicción inteligente en hospitales públicos se justifica desde múltiples perspectivas:

**Técnica**: El proyecto aplica arquitecturas distribuidas de microservicios, lo cual permite escalabilidad, mantenibilidad y separación de responsabilidades. Esta aproximación facilita actualizaciones independientes del modelo de machine learning sin afectar la operación del sistema principal.

**Académica**: El proyecto integra conocimientos de tres áreas fundamentales de la ingeniería informática: gestión de tecnologías de información (Módulo 2), sistemas distribuidos (Módulo 3) y cómputo flexible (Módulo 4), demostrando la aplicación práctica de competencias adquiridas durante la formación profesional.

**Social**: La identificación temprana de pacientes con alto riesgo de reingreso permite la asignación eficiente de recursos médicos y la implementación de programas de seguimiento post-hospitalario, mejorando potencialmente los indicadores de salud pública.

**Económica**: La reducción de reingresos hospitalarios evitables representa ahorros significativos para el sistema de salud pública, recursos que pueden redirigirse a otras áreas de atención prioritaria.

---

## Impacto Social

*(Máximo 200 palabras)*

El Sistema Distribuido de Predicción Inteligente (S.D.P.I.) tiene el potencial de generar impactos positivos en múltiples niveles:

**Para los pacientes**: La identificación proactiva de riesgos permite que el personal médico brinde seguimiento personalizado a pacientes vulnerables, reduciendo complicaciones y mejorando su calidad de vida post-hospitalaria.

**Para el personal de salud**: El sistema proporciona herramientas de apoyo a la decisión clínica basadas en datos, complementando la experiencia médica con análisis objetivos que facilitan la priorización de atención.

**Para las instituciones**: La visualización de estadísticas y tendencias permite a los administradores hospitalarios planificar recursos de manera más eficiente, anticipando demandas y optimizando la distribución de personal.

**Para la comunidad académica**: El proyecto genera conocimiento aplicable sobre la implementación de sistemas de inteligencia artificial en el contexto del sector salud mexicano, contribuyendo a la investigación y desarrollo tecnológico nacional.

**A largo plazo**: La adopción de tecnologías predictivas en la salud pública contribuye a la modernización del sector, alineándose con objetivos de desarrollo sostenible relacionados con salud y bienestar (ODS 3).

---

## Hipótesis

*(Si aplica)*

**H1**: Un modelo de regresión logística entrenado con datos clínicos estructurados puede predecir el riesgo de reingreso hospitalario a 30 días con una precisión (accuracy) igual o superior al 75%.

**H2**: La arquitectura distribuida de microservicios permite escalar el componente de procesamiento de machine learning de forma independiente sin afectar la disponibilidad del sistema web principal.

---

## Metodología Propuesta

### Metodología de Desarrollo: SCRUM

Se utilizará la metodología ágil SCRUM con sprints de 2 semanas, permitiendo entregas incrementales y retroalimentación continua.

**Roles**:
- Product Owner: Asesor académico
- Scrum Master: Sofía Castellanos Lobo
- Development Team: Sofía Castellanos Lobo

**Artefactos**:
- Product Backlog con historias de usuario
- Sprint Backlog por iteración
- Incrementos de producto funcionales

### Fases del Proyecto

| Sprint | Duración | Entregables |
|--------|----------|-------------|
| Sprint 1 | Semanas 1-2 | Arquitectura, BD, Backend skeleton |
| Sprint 2 | Semanas 3-4 | Auth, Módulo pacientes, ML service |
| Sprint 3 | Semanas 5-6 | Frontend core, Integración |
| Sprint 4 | Semanas 7-8 | Predicciones, Dashboard, Pruebas |
| Sprint 5 | Semanas 9-10 | Documentación, Despliegue, Optimización |

---

## Herramientas y Tecnologías

### Software

| Componente | Tecnología | Justificación |
|------------|------------|---------------|
| **Frontend** | React 18 + TypeScript + Vite | Ecosistema maduro, tipado fuerte, rendimiento |
| **Backend** | NestJS + TypeScript | Arquitectura modular, inyección de dependencias |
| **ML Service** | Python + FastAPI + scikit-learn | Estándar en ML, rendimiento, facilidad de uso |
| **Base de datos** | PostgreSQL 15 | Robustez, soporte JSONB, estándar empresarial |
| **Contenedores** | Docker + Docker Compose | Portabilidad, reproducibilidad, despliegue |

### Algoritmos de Machine Learning

| Algoritmo | Tipo | Uso en el proyecto |
|-----------|------|-------------------|
| **Regresión Logística** | Clasificación supervisada | Predicción principal de riesgo |
| **Random Forest** | Ensemble (árboles de decisión) | Comparación y validación |

### Estándares y Normas

| Estándar | Aplicación |
|----------|------------|
| **ISO/IEC 25010** | Calidad del software (funcionalidad, seguridad, mantenibilidad) |
| **ISO/IEC 27001** | Gestión de seguridad de la información |
| **OWASP Top 10** | Prevención de vulnerabilidades web |
| **NOM-024-SSA3-2012** | Sistemas de información de registro electrónico para la salud |

---

## Módulos Académicos Cubiertos

### Módulo 2: Gestión de las Tecnologías de la Información

- ✅ Modelado e implementación de sistema de información
- ✅ Aplicación de metodología de ingeniería de software (SCRUM)
- ✅ Base de datos relacional (PostgreSQL)
- ✅ Calidad del software (ISO 25010)
- ✅ Seguridad de la información (JWT, bcrypt, RBAC)

### Módulo 3: Sistemas Robustos, Paralelos y Distribuidos

- ✅ Arquitectura cliente-servidor distribuida
- ✅ Microservicios (Backend API + ML Service)
- ✅ Comunicación HTTP/REST entre servicios
- ✅ Contenedores Docker para distribución
- ✅ Tolerancia a fallos (health checks, retries)

### Módulo 4: Cómputo Flexible / Softcomputing

- ✅ Machine Learning (Regresión Logística)
- ✅ Árboles de decisión (Random Forest)
- ✅ Modelo matemático documentado
- ✅ Dataset de 50+ registros
- ✅ Métricas de evaluación (Accuracy, Precision, Recall, F1, ROC-AUC)

---

## Referencias Bibliográficas

1. Géron, A. (2019). *Hands-On Machine Learning with Scikit-Learn, Keras, and TensorFlow*. O'Reilly Media.

2. Newman, S. (2021). *Building Microservices: Designing Fine-Grained Systems*. O'Reilly Media.

3. INEGI. (2023). *Estadísticas de Salud en Establecimientos Particulares*. Instituto Nacional de Estadística y Geografía.

4. NOM-024-SSA3-2012. *Sistemas de información de registro electrónico para la salud*. Diario Oficial de la Federación.

5. Rajkomar, A., et al. (2018). Scalable and accurate deep learning with electronic health records. *NPJ Digital Medicine*, 1(1), 18.

---

*Documento generado para el proyecto modular de Ingeniería Informática, CUCEI, Universidad de Guadalajara.*

