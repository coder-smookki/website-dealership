# 🚗 SMK Dealership

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?style=for-the-badge&logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-20+-green?style=for-the-badge&logo=node.js)
![React](https://img.shields.io/badge/React-18.3-blue?style=for-the-badge&logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green?style=for-the-badge&logo=mongodb)
![Fastify](https://img.shields.io/badge/Fastify-4.28-black?style=for-the-badge&logo=fastify)
![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=for-the-badge&logo=docker)

**Production-Ready платформа для управления автосалоном премиум-класса**

[Быстрый старт](#-быстрый-старт) • [Docker](#-docker-запуск-рекомендуется) • [API Docs](#-api-документация) • [Архитектура](#-архитектура)

</div>

---

## 📋 Содержание

- [Описание](#-описание-проекта)
- [Особенности](#-особенности)
- [Быстрый старт](#-быстрый-старт)
  - [Docker (рекомендуется)](#-docker-запуск-рекомендуется)
  - [Локальный запуск](#-локальный-запуск-без-docker)
- [Технологический стек](#-технологический-стек)
- [Архитектура](#-архитектура)
- [API Документация](#-api-документация)
- [Структура проекта](#-структура-проекта)
- [Безопасность](#-безопасность)
- [Troubleshooting](#-troubleshooting)

---

## 🎯 Описание проекта

**SMK Dealership** — полнофункциональная веб-платформа для управления автосалоном премиум-класса с системой модерации объявлений, управлением заявками и административной панелью.

### Основные возможности

- ✅ **Система модерации** — автоматическая модерация объявлений владельцев
- ✅ **Ролевая модель** — разделение прав доступа (admin, owner)
- ✅ **Управление статусами** — отслеживание статусов продажи
- ✅ **Продвинутая фильтрация** — поиск по множеству параметров
- ✅ **JWT Authentication** — Access Token (15m) + Refresh Token (7d)
- ✅ **XSS защита** — санитизация пользовательского ввода
- ✅ **Rate Limiting** — защита от перегрузки (100 req/min)
- ✅ **Health Checks** — liveness/readiness проверки для K8s
- ✅ **Clean Architecture** — строгое разделение Domain/Application/Infrastructure

---

## ✨ Особенности

### Backend (Fastify + MongoDB)

- 🏗️ **Clean Architecture** — Domain/Application/Infrastructure layers
- 🔒 **Типизированная обработка ошибок** — без утечек, строгая типизация
- 🗄️ **MongoDB Native Driver** — без ORM, прямой контроль пула
- 🔐 **JWT с Refresh Tokens** — безопасная ротация токенов
- 📝 **Структурированное логирование** — Pino logger
- 🛡️ **Security headers** — Helmet-like защита, CSP
- 📊 **Денормализация** — ownerName/Email в документах для производительности
- 🚫 **Без Mongoose** — MongoDB Driver для максимального контроля

### Frontend (React + Vite)

- ⚛️ **React 18** — современный UI с хуками
- 🎨 **Минималистичный дизайн** — черно-белая палитра
- 🔒 **XSS защита** — DOMPurify для всех пользовательских данных
- 📱 **Адаптивность** — responsive дизайн
- 🔄 **Автоматическое обновление токенов** — seamless refresh flow
- 📦 **Четкое разделение** — types/, api/, components/, pages/

### Инфраструктура

- 🐳 **Docker Compose** — полная контейнеризация
- 🔐 **Безопасная БД** — credentials для MongoDB с authSource
- 🚀 **Production ready** — multi-stage Docker образы
- ⚡ **Nginx reverse proxy** — проксирование API
- 📊 **Health checks** — мониторинг состояния сервисов

---

## 🚀 Быстрый старт

### Требования

- **Node.js** 20+
- **npm** 9+
- **MongoDB** 7.0+ (или Docker)
- **Docker & Docker Compose** (для контейнеризации)

---

## 🐳 Docker запуск (РЕКОМЕНДУЕТСЯ)

Самый простой способ запустить проект — использовать Docker Compose.

### 1. Клонируйте репозиторий

```bash
git clone <repository-url>
cd website-dealership
```

### 2. Создайте файл окружения

Создайте файл `.env` в корне проекта (скопируйте из примера ниже):

```env
# Node Environment
NODE_ENV=production

# API Configuration
API_PORT=3001
API_HOST=0.0.0.0

# MongoDB Configuration (для Docker)
MONGODB_URI=mongodb://admin:changeme123@mongodb:27017/car-shop?authSource=admin
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=changeme123

# JWT Configuration
# ВАЖНО: В production используйте криптографически стойкие ключи (32+ символов)
JWT_ACCESS_SECRET=your-super-secret-access-token-change-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-token-change-in-production-min-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Frontend Build (оставьте пустым для production)
VITE_API_URL=
```

**⚠️ ВАЖНО для Production:**
- Смените `MONGO_ROOT_PASSWORD` на надёжный пароль
- Смените `JWT_ACCESS_SECRET` и `JWT_REFRESH_SECRET` на случайные строки 32+ символов
- Укажите ваш домен в `CORS_ORIGIN`

### 3. Запустите все сервисы

```bash
docker-compose up -d
```

Это запустит:
- **MongoDB** (порт 27017)
- **API** (порт 3001)
- **Web** (порт 3000)

### 4. Инициализируйте базу данных

```bash
# Зайдите в контейнер API
docker-compose exec api sh

# Создайте администратора
npm run create-admin admin@example.com admin123

# Заполните базу тестовыми данными (опционально)
npm run seed

# Выйдите из контейнера
exit
```

### 5. Откройте в браузере

- 🌐 **Frontend**: http://localhost:3000
- 🔧 **API**: http://localhost:3001
- 📚 **Swagger**: http://localhost:3001/docs
- ❤️ **Health**: http://localhost:3001/health

### Управление Docker

```bash
# Просмотр логов
docker-compose logs -f

# Просмотр логов конкретного сервиса
docker-compose logs -f api
docker-compose logs -f web

# Остановка
docker-compose down

# Остановка с удалением volumes (УДАЛИТ ДАННЫЕ БД!)
docker-compose down -v

# Пересборка образов
docker-compose build

# Перезапуск сервиса
docker-compose restart api
```

---

## 💻 Локальный запуск (без Docker)

### 1. Установите MongoDB локально

```bash
# Ubuntu/Debian
sudo apt-get install mongodb

# macOS
brew install mongodb-community@7.0

# Windows
# Скачайте установщик с mongodb.com
```

Запустите MongoDB:

```bash
# Linux/macOS
sudo systemctl start mongodb
# или
mongod

# Windows
# MongoDB запустится как сервис автоматически
```

### 2. Клонируйте и установите зависимости

```bash
git clone <repository-url>
cd website-dealership

# Установите зависимости для всего monorepo
npm install
```

### 3. Создайте .env

Создайте файл `.env` в корне проекта:

```env
# Node Environment
NODE_ENV=production

# API Configuration
API_PORT=3001
API_HOST=0.0.0.0

# MongoDB Configuration
MONGODB_URI=mongodb://admin:changeme123@mongodb:27017/car-shop?authSource=admin
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=changeme123

# JWT Configuration
# ВАЖНО: В production используйте криптографически стойкие ключи (32+ символов)
# Сгенерируйте новые ключи: openssl rand -base64 32
JWT_ACCESS_SECRET=your-super-secret-access-token-change-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-token-change-in-production-min-32-chars
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# Frontend Build
# Оставьте пустым для production (будет использовать относительные пути через nginx proxy)
# Для разработки укажите: http://localhost:3001
VITE_API_URL=
```

### 4. Инициализируйте базу данных

```bash
cd apps/api

# Создайте администратора
npm run create-admin admin@example.com admin123

# Заполните тестовыми данными (опционально)
npm run seed
```

### 5. Запустите в режиме разработки

**Вариант 1: Запуск всех сервисов одновременно (рекомендуется)**

```bash
# Из корня проекта
npm run dev
```

Это запустит:
- API на http://localhost:3001
- Web на http://localhost:3000

**Вариант 2: Раздельный запуск**

Откройте 2 терминала:

```bash
# Терминал 1 - API
cd apps/api
npm run dev

# Терминал 2 - Web
cd apps/web
npm run dev
```

### 6. Production сборка

```bash
# Сборка API
cd apps/api
npm run build
npm start

# Сборка Web
cd apps/web
npm run build
npm run preview
```

---

## 🛠 Технологический стек

### Backend

| Технология | Версия | Назначение |
|------------|--------|------------|
| **Fastify** | 4.28 | Высокопроизводительный веб-фреймворк |
| **MongoDB Driver** | 6.10 | Нативный драйвер без ORM |
| **TypeScript** | 5.6 | Строгая типизация |
| **JWT** | 9.0 | Access + Refresh токены |
| **Zod** | 3.23 | Валидация схем |
| **Pino** | 9.4 | Структурированное логирование |
| **bcryptjs** | 2.4 | Хеширование паролей |

### Frontend

| Технология | Версия | Назначение |
|------------|--------|------------|
| **React** | 18.3 | UI библиотека |
| **Vite** | 5.4 | Сборщик и dev-сервер |
| **TypeScript** | 5.6 | Типизация |
| **React Router** | 6.26 | Маршрутизация |
| **Zustand** | 5.0 | Управление состоянием |
| **Axios** | 1.7 | HTTP клиент с interceptors |
| **DOMPurify** | 3.0 | XSS защита |

---

## 🏗 Архитектура

### Backend Architecture (Clean Architecture + SOLID)

```
┌─────────────────────────────────────────────────┐
│         Presentation Layer (HTTP)                │
│  • Controllers (только обработка HTTP)           │
│  • Routes (маршрутизация)                        │
│  • Middlewares (auth, validation)                │
│  • Plugins (CORS, Security, Logger, Swagger)     │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│         Application Layer (Business Logic)        │
│  • Services (auth, cars, leads, users...)        │
│  • Token Service (JWT управление)                │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│         Domain Layer (Business Rules)            │
│  • Entities (User, Car, Lead, Settings)          │
│  • Interfaces (IDataSource)                      │
│  • Error classes (ValidationError, NotFound...)  │
│  • DTOs (CreateUserDTO, UpdateCarDTO...)         │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│       Infrastructure Layer (Data Access)         │
│  • MongoDataSource (Singleton pattern)           │
│  • Database Client (connection pool)             │
│  • Collections (typed collections)               │
│  • Shutdown Manager (graceful shutdown)          │
└─────────────────────────────────────────────────┘
```

### Ключевые архитектурные решения

1. **MongoDB Native Driver вместо Mongoose** — прямой контроль, нет ORM overhead
2. **Денормализация** — ownerName/Email в документах автомобилей
3. **Singleton для БД** — единственное подключение с пулом (10 max, 1 min)
4. **JWT Library** — jsonwebtoken напрямую, без @fastify/jwt
5. **Global Error Handler** — централизованная обработка, контроллеры без try/catch
6. **Domain-Driven Design** — чёткое разделение слоёв
7. **Security by Design** — rate limiting, headers, CORS, XSS защита

---

## 📚 API Документация

### Swagger UI

Интерактивная документация доступна по адресу:
- **http://localhost:3001/docs**

### Health Endpoints

| Endpoint | Описание |
|----------|----------|
| `GET /health` | Полная проверка (БД, память, uptime) |
| `GET /ready` | Readiness probe для K8s |
| `GET /live` | Liveness probe для K8s |

### Основные эндпойнты

#### 🔓 Public (без авторизации)

| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/api/cars` | Список автомобилей (только approved) |
| `GET` | `/api/cars/:id` | Детали автомобиля |
| `GET` | `/api/settings` | Настройки сайта |
| `POST` | `/api/leads` | Создать заявку |

#### 🔐 Auth

| Метод | Путь | Описание |
|-------|------|----------|
| `POST` | `/api/auth/login` | Вход (возвращает access + refresh) |
| `POST` | `/api/auth/register` | Регистрация владельца |
| `POST` | `/api/auth/refresh` | Обновить токены |
| `POST` | `/api/auth/logout` | Выход (revoke refresh token) |
| `GET` | `/api/auth/me` | Текущий пользователь |

#### 👤 Owner (требует роль owner)

| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/api/my/cars` | Мои объявления |
| `POST` | `/api/my/cars` | Создать (pending) |
| `PATCH` | `/api/my/cars/:id/status` | Изменить статус |

#### 👨‍💼 Admin (требует роль admin)

| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/api/admin/cars` | Все объявления |
| `POST` | `/api/admin/cars` | Создать (approved) |
| `PATCH` | `/api/admin/cars/:id` | Обновить |
| `DELETE` | `/api/admin/cars/:id` | Удалить |
| `PATCH` | `/api/admin/cars/:id/moderate` | Модерировать |
| `GET` | `/api/admin/leads` | Все заявки |
| `PATCH` | `/api/admin/leads/:id/status` | Изменить статус |
| `GET` | `/api/admin/users` | Все пользователи |
| `PATCH` | `/api/admin/settings` | Обновить настройки |

### Response Format

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "code": "ERROR_CODE"
  }
}
```

---

## 📁 Структура проекта

```
website-dealership/
├── apps/
│   ├── api/                          # Backend API
│   │   ├── src/
│   │   │   ├── domain/              # Domain Layer (Clean Architecture)
│   │   │   │   ├── entities/       # User, Car, Lead, Settings
│   │   │   │   ├── interfaces/     # IDataSource
│   │   │   │   └── errors/         # DomainErrors
│   │   │   ├── config/              # env.ts
│   │   │   ├── controllers/         # HTTP handlers
│   │   │   ├── services/            # Business logic
│   │   │   ├── db/                  # Infrastructure layer
│   │   │   │   ├── datasource.ts   # Singleton MongoDB client
│   │   │   │   ├── client.ts       # Database connection
│   │   │   │   └── collections.ts  # Typed collections
│   │   │   ├── middlewares/        # auth, requireRole
│   │   │   ├── routes/             # public, auth, owner, admin, health
│   │   │   ├── plugins/            # cors, security, logger, swagger
│   │   │   ├── utils/              # errors, response, validate
│   │   │   ├── scripts/            # createAdmin, seed
│   │   │   ├── shutdown.ts         # Graceful shutdown
│   │   │   └── server.ts           # Entry point
│   │   ├── Dockerfile              # Multi-stage build
│   │   └── package.json
│   │
│   └── web/                          # Frontend React
│       ├── src/
│       │   ├── api/                 # API clients
│       │   ├── components/          # React components
│       │   ├── pages/              # Pages (public, owner, admin)
│       │   ├── store/              # Zustand stores
│       │   ├── types/              # TypeScript interfaces
│       │   ├── utils/              # sanitize.ts (DOMPurify)
│       │   └── App.tsx
│       ├── public/                  # Static assets
│       ├── nginx.conf              # Production nginx config
│       └── vite.config.ts
│
├── docker-compose.yml               # 3 services: mongodb, api, web
├── .env.example                     # Environment template
├── package.json                     # Root workspace
└── README.md
```

---

## 🔒 Безопасность

### Реализованные меры

| Мера | Описание |
|------|----------|
| **JWT Authentication** | Access Token (15m) + Refresh Token (7d) в БД |
| **XSS Protection** | DOMPurify для всех пользовательских данных |
| **Rate Limiting** | 100 запросов/минуту на IP+URL |
| **Security Headers** | X-Frame-Options, CSP, HSTS, X-Content-Type-Options |
| **Input Validation** | Zod схемы для всех входных данных |
| **Error Handling** | Типизированные ошибки без утечки информации |
| **CORS** | Настраиваемые origins |
| **Password Hashing** | bcryptjs с salt rounds 10 |
| **DB Credentials** | authSource=admin для MongoDB |

### Token Flow

```
Login → Access (15m) + Refresh (7d) → Store in DB
Access expires → Send refresh → New token pair
Logout → Revoke refresh from DB
```

---

## 🐛 Troubleshooting

### MongoDB не подключается

```bash
# Проверьте что MongoDB запущен
docker-compose ps mongodb

# Проверьте логи
docker-compose logs mongodb

# Проверьте URI в .env
MONGODB_URI=mongodb://admin:changeme123@mongodb:27017/car-shop?authSource=admin
```

### API возвращает 503 Service Unavailable

```bash
# Проверьте health endpoint
curl http://localhost:3001/health

# Если БД не подключена, перезапустите API
docker-compose restart api
```

### Frontend не может подключиться к API

Проверьте:
1. API запущен на порту 3001
2. В `.env` правильный `VITE_API_URL`
3. Nginx проксирует запросы (если используется Docker)

```bash
# Проверьте API
curl http://localhost:3001/api/settings

# Проверьте nginx config
docker-compose exec web cat /etc/nginx/conf.d/default.conf
```

### CORS ошибки

Убедитесь что `CORS_ORIGIN` в `.env` соответствует адресу фронтенда:

```env
# Development
CORS_ORIGIN=http://localhost:3000

# Production
CORS_ORIGIN=https://yourdomain.com
```

### Ошибки аутентификации

```bash
# Проверьте что токены генерируются
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'

# Должен вернуть accessToken и refreshToken
```

---

## 📝 Команды разработки

```bash
# Разработка (из корня)
npm run dev              # API + Web одновременно
npm run dev:api          # Только API
npm run dev:web          # Только Web

# Сборка
npm run build            # Сборка всех приложений
npm run build:api        # Сборка API (TypeScript → JS)
npm run build:web        # Сборка Web (Vite)

# Линтинг
npm run lint             # Проверить код
npm run lint:fix         # Исправить ошибки
npm run format           # Форматировать код

# API команды
cd apps/api
npm run create-admin     # Создать администратора
npm run seed             # Заполнить БД тестовыми данными
npm run seed:clear       # Очистить и заполнить заново
```

---

## 👥 Роли пользователей

### 👨‍💼 Администратор (admin)

- ✅ Полное управление объявлениями
- ✅ Модерация объявлений владельцев
- ✅ Управление заявками и пользователями
- ✅ Настройки сайта

**Вход:** `/admin/login`

### 👤 Владелец (owner)

- ✅ Создание объявлений (на модерацию)
- ✅ Управление своими объявлениями
- ✅ Изменение статусов

**Регистрация:** `/account/register`  
**Вход:** `/account/login`

---

## 📄 Лицензия

Проект создан для **SMK Dealership**. Все права защищены.

## 👨‍💻 Автор

**smokkkkiiii Ilin Kirill**

---

<div align="center">

**⭐ If you find this project useful, give it a star! ⭐**

Made with ❤️ using Clean Architecture, TypeScript, React, Fastify, and MongoDB

</div>
