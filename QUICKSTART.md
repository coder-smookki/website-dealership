# 🚀 Быстрый старт SMK Dealership

## Вариант 1: Docker (Рекомендуется) - 5 минут

### 1. Подготовка

```bash
# Клонируйте проект
git clone <repository-url>
cd website-dealership
```

### 2. Создайте .env файл

Создайте файл `.env` в корне проекта:

```env
NODE_ENV=production
API_PORT=3001
API_HOST=0.0.0.0

# MongoDB
MONGODB_URI=mongodb://admin:changeme123@mongodb:27017/car-shop?authSource=admin
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=changeme123

# JWT (смените на свои!)
JWT_ACCESS_SECRET=your-super-secret-access-token-change-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-token-change-in-production-min-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Frontend
VITE_API_URL=
```

### 3. Запустите проект

```bash
# Запустите все сервисы
docker-compose up -d

# Дождитесь пока все сервисы запустятся (30-60 секунд)
docker-compose ps
```

### 4. Инициализируйте БД

```bash
# Зайдите в контейнер API
docker-compose exec api sh

# Создайте администратора
npm run create-admin admin@example.com admin123

# Заполните тестовыми данными (опционально)
npm run seed

# Выйдите
exit
```

### 5. Готово! 🎉

Откройте в браузере:
- **Фронтенд:** http://localhost:3000
- **API:** http://localhost:3001
- **Swagger:** http://localhost:3001/docs
- **Health:** http://localhost:3001/health

**Данные для входа:**
- Email: `admin@example.com`
- Пароль: `admin123`

---

## Вариант 2: Локальный запуск - 10 минут

### 1. Установите MongoDB

```bash
# Ubuntu/Debian
sudo apt-get install mongodb-org

# macOS
brew install mongodb-community@7.0

# Windows - скачайте с mongodb.com
```

Запустите MongoDB:

```bash
# Linux/macOS
sudo systemctl start mongod

# Windows - запустится автоматически
```

### 2. Подготовьте проект

```bash
# Клонируйте
git clone <repository-url>
cd website-dealership

# Установите зависимости
npm install
```

### 3. Создайте .env

```env
NODE_ENV=development
API_PORT=3001
API_HOST=0.0.0.0

# MongoDB локально (БЕЗ аутентификации)
MONGODB_URI=mongodb://localhost:27017/car-shop

# JWT
JWT_ACCESS_SECRET=dev-access-secret
JWT_REFRESH_SECRET=dev-refresh-secret
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=http://localhost:3000

# Frontend
VITE_API_URL=http://localhost:3001
```

### 4. Инициализируйте БД

```bash
cd apps/api
npm run create-admin admin@example.com admin123
npm run seed
cd ../..
```

### 5. Запустите в dev режиме

```bash
# Из корня проекта
npm run dev
```

Или в 2 терминалах:

```bash
# Терминал 1
cd apps/api && npm run dev

# Терминал 2
cd apps/web && npm run dev
```

### 6. Готово! 🎉

- **Фронтенд:** http://localhost:3000
- **API:** http://localhost:3001
- **Swagger:** http://localhost:3001/docs

---

## Полезные команды

### Docker

```bash
# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down

# Перезапуск сервиса
docker-compose restart api

# Пересборка
docker-compose build
```

### Разработка

```bash
# Линтинг
npm run lint
npm run lint:fix

# Форматирование
npm run format

# Сборка
npm run build
```

### База данных

```bash
# Создать админа
cd apps/api
npm run create-admin email@example.com password123

# Заполнить данными
npm run seed

# Очистить и заполнить
npm run seed:clear
```

---

## Troubleshooting

### MongoDB не подключается

```bash
# Проверьте health
curl http://localhost:3001/health

# Проверьте логи
docker-compose logs mongodb
```

### CORS ошибки

Убедитесь что `CORS_ORIGIN` в `.env` = адресу фронтенда.

### API 503

```bash
# Подождите 30-60 секунд после запуска
# Проверьте что БД запустилась
docker-compose ps
```

---

## Что дальше?

1. Прочитайте полный README.md
2. Изучите API docs: http://localhost:3001/docs
3. Смените пароли и секреты для production
4. Настройте свой домен в CORS_ORIGIN

**Документация:** README.md  
**API Docs:** http://localhost:3001/docs

