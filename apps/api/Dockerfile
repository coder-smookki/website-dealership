FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package.json
COPY apps/api/package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код
COPY apps/api ./

# Собираем проект
WORKDIR /app/apps/api
RUN npm run build

# Production stage
FROM node:20-alpine

WORKDIR /app

# Копируем package.json
COPY apps/api/package*.json ./

# Устанавливаем только production зависимости
RUN npm install --omit=dev

# Копируем собранные файлы
COPY --from=builder /app/dist ./dist

# Открываем порт
EXPOSE 3001

# Запускаем приложение
CMD ["node", "dist/server.js"]