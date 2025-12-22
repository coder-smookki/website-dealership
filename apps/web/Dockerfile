FROM node:20-alpine AS builder

WORKDIR /app


# Копируем package.json
COPY apps/web/package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код
COPY apps/web ./

# Собираем проект
RUN npm run build

# Production stage
FROM nginx:alpine

# Копируем собранные файлы
COPY --from=builder /app/dist /usr/share/nginx/html

# Копируем конфигурацию nginx
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]