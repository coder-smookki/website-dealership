# Docker Guide

## Быстрый старт

### Запуск всех сервисов

```bash
# Создайте .env файл (см. README.md)
cp .env.example .env

# Запустите все сервисы
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down
```

### Доступ к сервисам

- **Frontend**: http://localhost:3000
- **API**: http://localhost:3001
- **MongoDB**: localhost:27017
- **Swagger UI**: http://localhost:3001/docs

## Команды Docker

### Управление контейнерами

```bash
# Запуск
docker-compose up -d

# Остановка
docker-compose down

# Остановка с удалением volumes
docker-compose down -v

# Перезапуск
docker-compose restart

# Просмотр логов
docker-compose logs -f [service_name]

# Просмотр статуса
docker-compose ps
```

### Сборка образов

```bash
# Сборка всех образов
docker-compose build

# Сборка конкретного сервиса
docker-compose build api
docker-compose build web

# Пересборка без кеша
docker-compose build --no-cache
```

### Работа с базой данных

```bash
# Зайти в контейнер MongoDB
docker-compose exec mongodb mongosh

# Или использовать mongosh локально
mongosh mongodb://localhost:27017/car-shop
```

### Выполнение команд в контейнерах

```bash
# Зайти в контейнер API
docker-compose exec api sh

# Выполнить команду в контейнере API
docker-compose exec api npm run seed

# Зайти в контейнер Web
docker-compose exec web sh
```

## Инициализация базы данных в Docker

```bash
# 1. Запустите контейнеры
docker-compose up -d

# 2. Дождитесь запуска MongoDB (проверьте логи)
docker-compose logs mongodb

# 3. Создайте администратора
docker-compose exec api npm run create-admin admin@example.com admin123

# 4. Заполните базу данных
docker-compose exec api npm run seed
```

## Переменные окружения для Docker

Создайте `.env` файл в корне проекта:

```env
# API Configuration
API_PORT=3001
API_HOST=0.0.0.0
NODE_ENV=production

# MongoDB (для Docker используйте имя сервиса)
MONGODB_URI=mongodb://mongodb:27017/car-shop

# JWT Configuration
JWT_SECRET=your-strong-secret-key-here
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

**Важно:** В Docker Compose используйте `mongodb://mongodb:27017/car-shop` (имя сервиса вместо localhost).

## Troubleshooting

### Проблема: Контейнеры не запускаются

```bash
# Проверьте логи
docker-compose logs

# Проверьте статус
docker-compose ps

# Пересоберите образы
docker-compose build --no-cache
docker-compose up -d
```

### Проблема: MongoDB не подключается

```bash
# Проверьте, что MongoDB контейнер запущен
docker-compose ps mongodb

# Проверьте логи MongoDB
docker-compose logs mongodb

# Проверьте healthcheck
docker-compose exec mongodb mongosh --eval "db.runCommand('ping')"
```

### Проблема: API не может подключиться к MongoDB

Убедитесь, что в `.env` используется правильный URI:
```env
MONGODB_URI=mongodb://mongodb:27017/car-shop
```

### Проблема: Изменения в коде не применяются

В production режиме код не обновляется автоматически. Пересоберите образы:

```bash
docker-compose build
docker-compose up -d
```

Для разработки используйте volumes (см. docker-compose.yml).

## Production деплой

### Рекомендации для production

1. **Измените секретные ключи:**
   ```env
   JWT_SECRET=<strong-random-secret>
   ```

2. **Используйте внешнюю MongoDB:**
   ```env
   MONGODB_URI=mongodb://your-production-mongodb:27017/car-shop
   ```

3. **Настройте CORS:**
   ```env
   CORS_ORIGIN=https://your-domain.com
   ```

4. **Используйте reverse proxy (nginx/traefik)** для SSL/TLS

5. **Настройте мониторинг и логирование**

6. **Используйте Docker secrets** для чувствительных данных

### Пример production docker-compose

```yaml
version: '3.8'

services:
  mongodb:
    image: mongo:7
    restart: always
    volumes:
      - mongodb_data:/data/db
    networks:
      - car-shop-network

  api:
    build:
      context: .
      dockerfile: apps/api/Dockerfile
    restart: always
    environment:
      NODE_ENV: production
      MONGODB_URI: mongodb://mongodb:27017/car-shop
      JWT_SECRET: ${JWT_SECRET}
      CORS_ORIGIN: ${CORS_ORIGIN}
    depends_on:
      - mongodb
    networks:
      - car-shop-network

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    restart: always
    depends_on:
      - api
    networks:
      - car-shop-network

volumes:
  mongodb_data:

networks:
  car-shop-network:
    driver: bridge
```

