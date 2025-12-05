# 🚀 Guía de Despliegue - S.D.P.I.

## Arquitectura de Despliegue

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRODUCCIÓN                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌─────────────┐                                               │
│   │   VERCEL    │ ◄── Frontend React                            │
│   │  (Gratis)   │     https://sdpi.vercel.app                   │
│   └──────┬──────┘                                               │
│          │                                                       │
│          │ HTTPS                                                 │
│          ▼                                                       │
│   ┌─────────────────────────────────────────────────────────┐   │
│   │                      RAILWAY                             │   │
│   │                      (Gratis)                            │   │
│   │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │   │
│   │  │ Backend API │  │ ML Service  │  │   PostgreSQL    │  │   │
│   │  │   NestJS    │  │   FastAPI   │  │    Database     │  │   │
│   │  │   :3000     │  │   :8000     │  │     :5432       │  │   │
│   │  └─────────────┘  └─────────────┘  └─────────────────┘  │   │
│   └─────────────────────────────────────────────────────────┘   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Paso 1: Crear Cuenta en Railway

1. Ve a **https://railway.app**
2. Haz clic en **"Start a New Project"**
3. Inicia sesión con tu cuenta de **GitHub**

---

## 🗄️ Paso 2: Desplegar PostgreSQL en Railway

1. En Railway, haz clic en **"New Project"**
2. Selecciona **"Provision PostgreSQL"**
3. Espera a que se cree la base de datos
4. Haz clic en el servicio PostgreSQL
5. Ve a la pestaña **"Variables"**
6. **Copia estos valores** (los necesitarás después):
   - `DATABASE_URL`
   - `PGHOST`
   - `PGPORT`
   - `PGUSER`
   - `PGPASSWORD`
   - `PGDATABASE`

---

## 🤖 Paso 3: Desplegar ML Service en Railway

### 3.1 Crear el servicio

1. En el mismo proyecto de Railway, haz clic en **"+ New"**
2. Selecciona **"GitHub Repo"**
3. Busca y selecciona tu repositorio: `Sistema-Distribuido-de-Predicci-n-Inteligente-para-Hospitales-P-blicos`
4. En la configuración que aparece:
   - **Root Directory**: `ml-service`
   - Haz clic en **"Deploy"**

### 3.2 Configurar variables de entorno

Una vez desplegado, ve a **Settings** → **Variables** y agrega:

```
PORT=8000
PYTHONUNBUFFERED=1
```

### 3.3 Obtener la URL

1. Ve a **Settings** → **Networking**
2. Haz clic en **"Generate Domain"**
3. **Copia la URL** (ejemplo: `ml-service-production-xxxx.up.railway.app`)

---

## 🔧 Paso 4: Desplegar Backend API en Railway

### 4.1 Crear el servicio

1. En el mismo proyecto, haz clic en **"+ New"**
2. Selecciona **"GitHub Repo"**
3. Selecciona el mismo repositorio
4. En la configuración:
   - **Root Directory**: `backend-api`
   - Haz clic en **"Deploy"**

### 4.2 Configurar variables de entorno

Ve a **Settings** → **Variables** y agrega estas variables:

```env
# Aplicación
NODE_ENV=production
PORT=3000

# Base de datos (usa las variables de Railway)
DB_HOST=${{Postgres.PGHOST}}
DB_PORT=${{Postgres.PGPORT}}
DB_USERNAME=${{Postgres.PGUSER}}
DB_PASSWORD=${{Postgres.PGPASSWORD}}
DB_DATABASE=${{Postgres.PGDATABASE}}

# JWT - ¡CAMBIA ESTO por un valor seguro!
JWT_SECRET=tu_super_secreto_jwt_produccion_2024_cambiar
JWT_EXPIRATION=24h

# ML Service - Usa la URL que copiaste en el paso 3
ML_SERVICE_URL=https://ml-service-production-xxxx.up.railway.app
ML_SERVICE_TIMEOUT=30000

# CORS - Se configurará después con la URL de Vercel
CORS_ORIGINS=https://sdpi.vercel.app,http://localhost:5173
```

### 4.3 Vincular con PostgreSQL

Railway permite referenciar variables de otros servicios:
1. En las variables, usa `${{Postgres.VARIABLE_NAME}}` para referenciar las variables de PostgreSQL

### 4.4 Obtener la URL del Backend

1. Ve a **Settings** → **Networking**
2. Haz clic en **"Generate Domain"**
3. **Copia la URL** (ejemplo: `backend-api-production-xxxx.up.railway.app`)

---

## 💻 Paso 5: Desplegar Frontend en Vercel

### 5.1 Configurar en Vercel

1. Ve a **https://vercel.com**
2. Haz clic en **"Add New Project"**
3. Importa tu repositorio de GitHub
4. Configura:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend-app`
   
### 5.2 Variables de entorno

Antes de hacer deploy, agrega esta variable:

| Nombre | Valor |
|--------|-------|
| `VITE_API_URL` | `https://backend-api-production-xxxx.up.railway.app/api/v1` |

(Usa la URL del backend que obtuviste en el paso 4.4)

### 5.3 Desplegar

1. Haz clic en **"Deploy"**
2. Espera a que termine el build
3. Copia la URL de tu frontend (ejemplo: `sdpi-xxxx.vercel.app`)

---

## 🔄 Paso 6: Actualizar CORS en Backend

Ahora que tienes la URL del frontend, actualiza CORS en Railway:

1. Ve a tu servicio **backend-api** en Railway
2. En **Variables**, actualiza:
   ```
   CORS_ORIGINS=https://tu-frontend.vercel.app,http://localhost:5173
   ```
3. Railway redesplegará automáticamente

---

## 👤 Paso 7: Crear Usuario Inicial

### Opción A: Usando curl

```bash
curl -X POST https://backend-api-production-xxxx.up.railway.app/api/v1/auth/register-initial \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@hospital.gob.mx",
    "password": "Admin123!",
    "firstName": "Administrador",
    "lastName": "Sistema"
  }'
```

### Opción B: Usando Swagger

1. Ve a `https://tu-backend.up.railway.app/api/docs`
2. Busca `POST /auth/register-initial`
3. Ejecuta con los datos del usuario

---

## ✅ Verificar Despliegue

### Checklist

| Servicio | URL de Verificación | Respuesta Esperada |
|----------|--------------------|--------------------|
| ML Service | `https://ml-service-xxx.up.railway.app/health` | `{"status": "healthy"}` |
| Backend API | `https://backend-xxx.up.railway.app/api/v1/predictions/ml-health` | `{"status": "healthy"}` |
| Frontend | `https://tu-app.vercel.app` | Página de Login |

### Probar el flujo completo

1. Abre tu frontend en Vercel
2. Inicia sesión con `admin@hospital.gob.mx` / `Admin123!`
3. Crea un paciente de prueba
4. Agrega un registro clínico
5. Ejecuta una predicción

---

## 🔧 Solución de Problemas

### Error: "Cannot connect to database"

1. Verifica que PostgreSQL esté corriendo en Railway
2. Revisa que las variables de entorno estén correctas
3. Verifica que el servicio backend pueda comunicarse con PostgreSQL

### Error: "ML Service unavailable"

1. Verifica que el ML Service esté corriendo
2. Revisa la variable `ML_SERVICE_URL` en el backend
3. Asegúrate de incluir `https://` en la URL

### Error: "CORS policy"

1. Actualiza `CORS_ORIGINS` en el backend con la URL exacta de Vercel
2. No incluyas trailing slash (`/`) al final

### El modelo ML no carga

Railway inicia los servicios, pero el modelo se genera en el primer uso. Ejecuta una predicción de prueba para inicializarlo.

---

## 📊 Costos Estimados

| Servicio | Plan | Costo |
|----------|------|-------|
| **Railway** | Hobby | $5 USD/mes (500 horas gratis) |
| **Vercel** | Hobby | Gratis |
| **Total** | - | ~$0-5 USD/mes |

Railway ofrece $5 de crédito gratis al mes, suficiente para proyectos pequeños.

---

## 🔗 URLs de tu Proyecto (ejemplo)

```
Frontend:    https://sdpi-sofia.vercel.app
Backend:     https://backend-api-production-xxxx.up.railway.app
ML Service:  https://ml-service-production-xxxx.up.railway.app
API Docs:    https://backend-api-production-xxxx.up.railway.app/api/docs
```

---

## 📝 Notas Importantes

1. **Railway tiene límites**: El plan gratuito tiene 500 horas de ejecución/mes
2. **Vercel es gratuito**: Para proyectos personales sin límites significativos
3. **Base de datos**: Railway PostgreSQL es gratuito con límites de almacenamiento
4. **SSL/HTTPS**: Ambas plataformas proveen certificados SSL automáticamente

---

**Autor**: Sofía Castellanos Lobo  
**Universidad de Guadalajara - CUCEI**  
**Ingeniería Informática**


