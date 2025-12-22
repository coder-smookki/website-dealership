FROM node:20-alpine AS builder

# Аргументы сборки
ARG VITE_API_URL=http://localhost:3001

WORKDIR /app

# Копируем package.json файлы
COPY apps/web/package*.json ./

# Устанавливаем зависимости
RUN npm install && npm cache clean --force

# Копируем исходный код и конфигурационные файлы
COPY apps/web/ ./

# Устанавливаем переменную окружения для сборки
ENV VITE_API_URL=$VITE_API_URL

# Собираем проект с продакшен конфигурацией
RUN npx tsc -p tsconfig.prod.json && npx vite build

# Production stage
FROM nginx:alpine

# Устанавливаем curl для health check
RUN apk add --no-cache curl

# Копируем собранные файлы
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем конфигурацию nginx
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

# Nginx пользователь уже существует в базовом образе, просто настраиваем права
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

