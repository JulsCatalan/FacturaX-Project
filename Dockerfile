# Etapa 1: construir frontend
FROM node:18 AS build-frontend
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm install
COPY frontend/ .
RUN npm run build

# Etapa 2: backend
FROM node:18
WORKDIR /app/backend
COPY package*.json ./
RUN npm install
COPY backend/ .

COPY test ./test

# Copiar frontend build al backend para servirlo
COPY --from=build-frontend /app/frontend/dist ./frontend/dist

EXPOSE 3000

CMD ["node", "app.js"]
