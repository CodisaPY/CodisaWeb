# 1️⃣ Usa una imagen base Debian para construir (más compatible con binarios nativos)
FROM node:18-bullseye AS builder

# 2️⃣ Establecer directorio de trabajo
WORKDIR /app

# 3️⃣ Copiar package.json y lock
COPY package*.json ./

# 4️⃣ Eliminar lockfile si da conflictos en Alpine/ARM y luego instalar dependencias
RUN rm -f package-lock.json && npm install --legacy-peer-deps

# 5️⃣ Copiar el resto del código
COPY . .

# Copia el archivo de entorno de producción
COPY .env.production .env

# 6️⃣ Construir la app
RUN npm run build

# 7️⃣ Segunda etapa: imagen de producción minimalista
FROM node:18-bullseye-slim

# 8️⃣ Establecer directorio de trabajo
WORKDIR /app

# 9️⃣ Instalar `serve` globalmente
RUN npm install -g serve

# 🔟 Copiar solo el build final
COPY --from=builder /app/dist /app/dist

# 1️⃣1️⃣ Exponer puerto
EXPOSE 3000

# 1️⃣2️⃣ Comando para servir
CMD ["serve", "-s", "dist", "-l", "3000"]
