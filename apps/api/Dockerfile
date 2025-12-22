FROM node:20-alpine

# Устанавливаем curl для health check и tsx для запуска TypeScript
RUN apk add --no-cache curl

WORKDIR /app

# Создаем пользователя для безопасности
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Копируем package.json файлы
COPY apps/api/package*.json ./

# Устанавливаем все зависимости (включая tsx для запуска TS)
RUN npm install && npm cache clean --force

# Копируем исходный код
COPY apps/api/src ./src
COPY apps/api/tsconfig.json ./tsconfig.json

# Меняем владельца файлов
RUN chown -R nodejs:nodejs /app
USER nodejs

# Открываем порт
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Запускаем приложение с tsx (без сборки)
CMD ["npx", "tsx", "src/server.ts"]

