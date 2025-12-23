FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package.json файлы
COPY apps/api/package*.json ./

# Устанавливаем зависимости
RUN npm ci

# Копируем исходный код и конфигурацию
COPY apps/api/src ./src
COPY apps/api/tsconfig.json ./tsconfig.json

# Собираем TypeScript
RUN npm run build

FROM node:20-alpine

WORKDIR /app

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Копируем package.json файлы
COPY apps/api/package*.json ./

# Устанавливаем только production зависимости
RUN npm ci --only=production && npm cache clean --force

# Копируем собранные файлы из builder
COPY --from=builder /app/dist ./dist

# Меняем владельца файлов
RUN chown -R nodejs:nodejs /app
USER nodejs

# Открываем порт
EXPOSE 3001

# Запускаем собранное приложение
CMD ["node", "dist/server.js"]

