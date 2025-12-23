# 🚀 Инструкция по запуску проекта

## ✅ Исправления выполнены

### Проблема с MongoDB решена
- **Исправлено:** `MONGO_ROOT_PASSWORD` → `MONGO_INITDB_ROOT_PASSWORD` в docker-compose.yml
- **Удалены:** Все комментарии из кода
- **Переведены:** Все сообщения на русский язык

## Быстрый старт

### 1. Создайте файл .env

Создайте файл `.env` в корне проекта:

```env
NODE_ENV=development
API_PORT=3001
API_HOST=0.0.0.0

MONGODB_URI=mongodb://localhost:27017/car-shop
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=changeme123

JWT_ACCESS_SECRET=dev-access-secret-key-change-in-production
JWT_REFRESH_SECRET=dev-refresh-secret-key-change-in-production
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

JWT_SECRET=dev-secret-key
JWT_EXPIRES_IN=7d

CORS_ORIGIN=http://localhost:3000

VITE_API_URL=http://localhost:3001
```

### 2. Запустите проект

```bash
docker-compose up -d
```

### 3. Инициализируйте БД

```bash
docker-compose exec api npm run create-admin admin@example.com admin123

docker-compose exec api npm run seed
```

### 4. Откройте в браузере

- **Фронтенд:** http://localhost:3000
- **API:** http://localhost:3001
- **Swagger:** http://localhost:3001/docs
- **Health:** http://localhost:3001/health

**Данные для входа:**
- Email: `admin@example.com`
- Пароль: `admin123`

## Что изменено

### Docker-compose
- Исправлена переменная окружения MongoDB
- Обновлён healthcheck для API

### Backend
- Удалены все комментарии
- Переведены все сообщения на русский:
  - Логи сервера
  - Сообщения об ошибках
  - Health check ответы
  - Сообщения rate limiting

### Архитектура
- Полностью переработана структура (Clean Architecture)
- Добавлен `domain/` слой с entities, interfaces, errors
- Удалены неиспользуемые файлы (Mongoose models, JWT plugin)

## Проверка работы

```bash
curl http://localhost:3001/health
```

Должен вернуть:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "...",
    "uptime": 123,
    "checks": {
      "database": {
        "status": "connected",
        "responseTime": 5
      },
      "memory": {
        "used": 50,
        "total": 100,
        "percentUsed": 50
      }
    }
  }
}
```

## Troubleshooting

### MongoDB не запускается

Проверьте логи:
```bash
docker-compose logs mongodb
```

Убедитесь что в `.env` указаны правильные переменные:
- `MONGO_ROOT_USERNAME=admin`
- `MONGO_ROOT_PASSWORD=changeme123`

### API не подключается к БД

```bash
docker-compose restart api
docker-compose logs -f api
```

### Очистка и перезапуск

```bash
docker-compose down -v
docker-compose up -d
```

**Внимание:** Флаг `-v` удалит все данные из БД!

---

**Проект готов к работе! 🎉**

