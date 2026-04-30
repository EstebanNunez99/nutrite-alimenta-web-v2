# ETAPA 1: El Obrero (Compilación)
FROM node:20-alpine as compilador
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Compilamos el proyecto (esto genera la carpeta con los archivos estáticos)
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
ARG VITE_CLOUDINARY_UPLOAD_PRESET
ENV VITE_CLOUDINARY_UPLOAD_PRESET=$VITE_CLOUDINARY_UPLOAD_PRESET
ARG VITE_CLOUDINARY_CLOUD_NAME
ENV VITE_CLOUDINARY_CLOUD_NAME=$VITE_CLOUDINARY_CLOUD_NAME
RUN npm run build

# ETAPA 2: El Mozo (Producción)
FROM nginx:alpine
# Copiamos SOLO el resultado final del obrero y lo ponemos en la carpeta pública de Nginx
# OJO: Si usaste Vite, la carpeta suele ser /app/dist. Si usaste Create React App, es /app/build
COPY --from=compilador /app/dist /usr/share/nginx/html

COPY nginx.conf /etc/nginx/conf.d/default.conf
# Exponemos el puerto 80 interno del contenedor
EXPOSE 80
# Encendemos Nginx
CMD ["nginx", "-g", "daemon off;"]