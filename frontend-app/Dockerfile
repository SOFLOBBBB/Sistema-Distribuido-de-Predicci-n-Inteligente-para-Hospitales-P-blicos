# =============================================================================
# S.D.P.I. Frontend - Dockerfile
# Aplicación React con Vite para producción
# 
# [MÓDULO 2]: Interfaz de usuario
# [MÓDULO 3]: Contenedor distribuido para frontend
# =============================================================================

# Etapa 1: Construcción
FROM node:18-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar código fuente
COPY . .

# Construir la aplicación para producción
RUN npm run build

# =============================================================================
# Etapa 2: Servidor de producción con Nginx
# =============================================================================

FROM nginx:alpine AS production

# Copiar configuración personalizada de Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar archivos construidos desde la etapa anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Exponer puerto 80
EXPOSE 80

# Comando por defecto
CMD ["nginx", "-g", "daemon off;"]

