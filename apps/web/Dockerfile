FROM node:20-alpine AS builder

WORKDIR /app

# Копируем package.json файлы
COPY package*.json ./
COPY apps/web/package*.json ./apps/web/

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код
COPY apps/web ./apps/web

# Собираем проект
WORKDIR /app/apps/web
RUN npm run build

# Production stage
FROM nginx:alpine

# Копируем собранные файлы
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html

# Копируем конфигурацию nginx
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

