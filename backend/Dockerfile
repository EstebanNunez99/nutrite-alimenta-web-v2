# 1. Usamos una versión de Node ultra liviana
FROM node:20-alpine

# 2. Le decimos al contenedor dónde vamos a trabajar por dentro
WORKDIR /app

# 3. Copiamos SOLO los archivos de dependencias primero (Esto optimiza el caché)
COPY package*.json ./

# 4. Instalamos las dependencias (solo las de producción, sin nodemon ni cosas extra)
RUN npm install --production

# 5. Copiamos el resto de tu código fuente
COPY . .

# 6. Exponemos el puerto que usa tu API (asumo el 5000, cambialo si usás otro)
EXPOSE 5000

# 7. El comando final para encender el servidor
CMD ["npm", "start"]