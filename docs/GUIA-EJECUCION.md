# Guía de Ejecución del Sistema S.D.P.I.

## Sistema Distribuido de Predicción Inteligente para Hospitales Públicos

Esta guía explica cómo ejecutar todos los componentes del sistema de forma local para desarrollo y pruebas.

---

## 📋 Requisitos Previos

Antes de comenzar, asegúrate de tener instalado:

| Software | Versión Mínima | Verificar con |
|----------|----------------|---------------|
| **Node.js** | 18.x | `node --version` |
| **npm** | 9.x | `npm --version` |
| **Python** | 3.10+ | `python3 --version` |
| **PostgreSQL** | 14+ | `psql --version` |
| **Git** | 2.x | `git --version` |

### Instalación de Requisitos (macOS)

```bash
# Con Homebrew
brew install node
brew install python@3.11
brew install postgresql@15

# Iniciar PostgreSQL
brew services start postgresql@15
```

### Instalación de Requisitos (Ubuntu/Debian)

```bash
# Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Python 3.11
sudo apt-get install python3.11 python3.11-venv python3-pip

# PostgreSQL
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

---

## 🗄️ Paso 1: Configurar la Base de Datos

### 1.1 Crear la base de datos y usuario

```bash
# Acceder a PostgreSQL
psql postgres

# Ejecutar estos comandos SQL:
CREATE USER sdpi_user WITH PASSWORD 'sdpi_password_2024';
CREATE DATABASE sdpi_db OWNER sdpi_user;
GRANT ALL PRIVILEGES ON DATABASE sdpi_db TO sdpi_user;
\q
```

### 1.2 Inicializar el esquema (opcional - se crea automáticamente)

```bash
# Si quieres crear las tablas manualmente:
psql -U sdpi_user -d sdpi_db -f infrastructure/init-db.sql
```

---

## 🤖 Paso 2: Iniciar el ML Service (Python)

El servicio de Machine Learning debe iniciarse primero.

### 2.1 Navegar al directorio

```bash
cd ml-service
```

### 2.2 Crear entorno virtual

```bash
# Crear entorno virtual
python3 -m venv venv

# Activar entorno virtual
# En macOS/Linux:
source venv/bin/activate

# En Windows:
# venv\Scripts\activate
```

### 2.3 Instalar dependencias

```bash
pip install -r requirements.txt
```

### 2.4 (Opcional) Entrenar el modelo

```bash
# Esto genera el modelo con los datos de ejemplo
python training/train_model.py
```

### 2.5 Iniciar el servicio

```bash
uvicorn app.main:app --reload --port 8000
```

**Verificar**: Abre http://localhost:8000/docs para ver la documentación Swagger del ML Service.

**Salida esperada:**
```
============================================================
  S.D.P.I. ML Service Starting...
============================================================
  ✓ Model loaded: 1.0.0
  ✓ Algorithm: logistic_regression
============================================================
INFO:     Uvicorn running on http://127.0.0.1:8000
```

---

## 🔧 Paso 3: Iniciar el Backend API (NestJS)

Abre una **nueva terminal** para este paso.

### 3.1 Navegar al directorio

```bash
cd backend-api
```

### 3.2 Instalar dependencias

```bash
npm install
```

### 3.3 Configurar variables de entorno

```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar .env con tus valores
nano .env  # o usa tu editor preferido
```

**Contenido del archivo `.env`:**

```env
# Aplicación
NODE_ENV=development
PORT=3000

# Base de datos PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=sdpi_user
DB_PASSWORD=sdpi_password_2024
DB_DATABASE=sdpi_db

# JWT (cambia el secret en producción)
JWT_SECRET=mi_secreto_jwt_super_seguro_2024
JWT_EXPIRATION=24h

# ML Service
ML_SERVICE_URL=http://localhost:8000
ML_SERVICE_TIMEOUT=30000

# CORS
CORS_ORIGINS=http://localhost:5173
```

### 3.4 Iniciar el servidor

```bash
npm run start:dev
```

**Verificar**: Abre http://localhost:3000/api/docs para ver la documentación Swagger.

**Salida esperada:**
```
╔═══════════════════════════════════════════════════════════╗
║           S.D.P.I. Backend API Started                    ║
╠═══════════════════════════════════════════════════════════╣
║  🚀 Server running on: http://localhost:3000              ║
║  📚 API Docs:          http://localhost:3000/api/docs     ║
║  🔒 Environment:       development                        ║
╚═══════════════════════════════════════════════════════════╝
```

---

## 💻 Paso 4: Iniciar el Frontend (React)

Abre una **nueva terminal** para este paso.

### 4.1 Navegar al directorio

```bash
cd frontend-app
```

### 4.2 Instalar dependencias

```bash
npm install
```

### 4.3 (Opcional) Configurar URL de la API

Si el backend está en un puerto diferente, crea un archivo `.env`:

```bash
echo "VITE_API_URL=http://localhost:3000/api/v1" > .env
```

### 4.4 Iniciar el servidor de desarrollo

```bash
npm run dev
```

**Verificar**: Abre http://localhost:5173 para ver la aplicación.

**Salida esperada:**
```
  VITE v5.0.8  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

---

## 🔐 Paso 5: Crear Usuario Inicial

### Opción A: Usando la API (Swagger)

1. Abre http://localhost:3000/api/docs
2. Busca el endpoint `POST /auth/register-initial`
3. Haz clic en "Try it out"
4. Ingresa los datos:

```json
{
  "email": "admin@hospital.gob.mx",
  "password": "Admin123!",
  "firstName": "Administrador",
  "lastName": "Sistema"
}
```

5. Haz clic en "Execute"

### Opción B: Usando curl

```bash
curl -X POST http://localhost:3000/api/v1/auth/register-initial \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hospital.gob.mx",
    "password": "Admin123!",
    "firstName": "Administrador",
    "lastName": "Sistema"
  }'
```

### Opción C: Usando el SQL de inicialización

Si ejecutaste `init-db.sql`, ya tienes usuarios de prueba:

| Email | Contraseña | Rol |
|-------|------------|-----|
| `admin@hospital.gob.mx` | `Admin123!` | ADMIN |
| `doctor@hospital.gob.mx` | `Doctor123!` | DOCTOR |

---

## ✅ Verificación del Sistema

### Verificar que todos los servicios estén corriendo:

| Servicio | URL | Estado Esperado |
|----------|-----|-----------------|
| **ML Service** | http://localhost:8000/health | `{"status": "healthy"}` |
| **Backend API** | http://localhost:3000/api/v1/predictions/ml-health | `{"status": "healthy"}` |
| **Frontend** | http://localhost:5173 | Página de login |

### Probar el flujo completo:

1. **Login**: Ingresa a http://localhost:5173 con las credenciales
2. **Dashboard**: Verifica que carga sin errores
3. **Crear Paciente**: Ve a Pacientes → Nuevo Paciente
4. **Crear Registro Clínico**: En el detalle del paciente
5. **Ejecutar Predicción**: Ve a Predicciones → Nueva Predicción

---

## 🐳 Alternativa: Usar Docker Compose

Si prefieres usar Docker (más fácil pero requiere Docker instalado):

### Iniciar todos los servicios

```bash
cd infrastructure
docker-compose up -d
```

### Ver logs

```bash
docker-compose logs -f
```

### Detener servicios

```bash
docker-compose down
```

### URLs con Docker

| Servicio | URL |
|----------|-----|
| Frontend | http://localhost:5173 |
| Backend API | http://localhost:3000 |
| ML Service | http://localhost:8000 |
| PostgreSQL | localhost:5432 |

---

## 🔧 Solución de Problemas Comunes

### Error: "Cannot connect to PostgreSQL"

```bash
# Verificar que PostgreSQL está corriendo
pg_isready

# En macOS
brew services restart postgresql@15

# En Linux
sudo systemctl restart postgresql
```

### Error: "ML Service is not available"

1. Verificar que el ML Service está corriendo en puerto 8000
2. Verificar la variable `ML_SERVICE_URL` en `.env` del backend
3. Verificar que no hay firewall bloqueando

```bash
curl http://localhost:8000/health
```

### Error: "Invalid token" o "Unauthorized"

1. El token JWT pudo haber expirado (24h por defecto)
2. Cierra sesión y vuelve a iniciar sesión
3. Verifica que `JWT_SECRET` sea el mismo en el backend

### Error: "CORS policy"

Verificar que `CORS_ORIGINS` en `.env` incluye la URL del frontend:

```env
CORS_ORIGINS=http://localhost:5173
```

### El modelo no carga

```bash
# Regenerar el modelo
cd ml-service
source venv/bin/activate
python training/train_model.py
```

---

## 📊 Resumen de Puertos

| Servicio | Puerto | Protocolo |
|----------|--------|-----------|
| Frontend | 5173 | HTTP |
| Backend API | 3000 | HTTP |
| ML Service | 8000 | HTTP |
| PostgreSQL | 5432 | TCP |

---

## 🚀 Script de Inicio Rápido

Crea un archivo `start-all.sh` en la raíz del proyecto:

```bash
#!/bin/bash

echo "🏥 Iniciando S.D.P.I. - Sistema de Predicción Hospitalaria"
echo "==========================================================="

# Terminal 1: ML Service
echo "🤖 Iniciando ML Service..."
cd ml-service
source venv/bin/activate 2>/dev/null || python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt -q
uvicorn app.main:app --port 8000 &
ML_PID=$!
cd ..

# Esperar a que ML Service esté listo
sleep 5

# Terminal 2: Backend
echo "🔧 Iniciando Backend API..."
cd backend-api
npm install -q
npm run start:dev &
BACKEND_PID=$!
cd ..

# Esperar a que Backend esté listo
sleep 10

# Terminal 3: Frontend
echo "💻 Iniciando Frontend..."
cd frontend-app
npm install -q
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo "✅ Sistema iniciado correctamente!"
echo ""
echo "📍 URLs:"
echo "   Frontend:    http://localhost:5173"
echo "   Backend API: http://localhost:3000/api/docs"
echo "   ML Service:  http://localhost:8000/docs"
echo ""
echo "🔑 Credenciales de prueba:"
echo "   Email:    admin@hospital.gob.mx"
echo "   Password: Admin123!"
echo ""
echo "Presiona Ctrl+C para detener todos los servicios"

# Esperar señal de interrupción
trap "kill $ML_PID $BACKEND_PID $FRONTEND_PID 2>/dev/null" EXIT
wait
```

Dar permisos y ejecutar:

```bash
chmod +x start-all.sh
./start-all.sh
```

---

## 📚 Documentación Adicional

- **Swagger Backend**: http://localhost:3000/api/docs
- **Swagger ML Service**: http://localhost:8000/docs
- **Arquitectura**: `/docs/architecture.md`
- **Mapeo de Módulos**: `/docs/module-mapping.md`

---

**Autor**: Sofía Castellanos Lobo  
**Universidad de Guadalajara - CUCEI**  
**Ingeniería Informática - Proyecto Modular**


