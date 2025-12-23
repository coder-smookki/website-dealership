# 🚗 SMK Dealership

<div align="center">

![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue?logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-20+-green?logo=node.js)
![React](https://img.shields.io/badge/React-18.3-blue?logo=react)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-green?logo=mongodb)
![Fastify](https://img.shields.io/badge/Fastify-4.28-black?logo=fastify)
![License](https://img.shields.io/badge/License-Private-red)

**Современная платформа для управления автосалоном премиум-класса**

[Особенности](#-особенности) • [Технологии](#-технологический-стек) • [Быстрый старт](#-быстрый-старт) • [Документация](#-документация)

</div>

---

## 📋 Содержание

- [Описание](#-описание-проекта)
- [Особенности](#-особенности)
- [Технологический стек](#-технологический-стек)
- [Архитектура](#-архитектура)
- [Быстрый старт](#-быстрый-старт)
- [Структура проекта](#-структура-проекта)
- [API Документация](#-api-документация)
- [Разработка](#-разработка)
- [Деплой](#-деплой)
- [Безопасность](#-безопасность)

---

## 🎯 Описание проекта

**SMK Dealership** — полнофункциональная веб-платформа для управления автосалоном премиум-класса с системой модерации объявлений, управлением заявками и административной панелью.

### Основные возможности

- ✅ **Система модерации** — автоматическая модерация объявлений владельцев
- ✅ **Ролевая модель** — разделение прав доступа (admin, owner)
- ✅ **Управление статусами** — отслеживание статусов продажи (в продаже, забронирован, продан)
- ✅ **Продвинутая фильтрация** — поиск по множеству параметров
- ✅ **Галерея изображений** — зум, навигация, миниатюры
- ✅ **Модальные окна** — удобные формы обратной связи
- ✅ **Административная панель** — полное управление системой
- ✅ **Система заявок** — обработка запросов от покупателей
- ✅ **XSS защита** — санитизация пользовательского ввода
- ✅ **JWT аутентификация** — безопасная авторизация с refresh tokens

---

## ✨ Особенности

### Backend

- 🏗️ **Чистая архитектура** — разделение слоев (Presentation, Application, Domain, Infrastructure)
- 🔒 **Безопасность** — типизированная обработка ошибок, валидация данных
- 🗄️ **Mongoose ODM** — контролируемое подключение к БД с пулом соединений
- 🔐 **JWT токены** — Access Token + Refresh Token для безопасной авторизации
- 📝 **Структурированное логирование** — Pino logger с настраиваемыми уровнями
- ✅ **Валидация** — Zod схемы для проверки входных данных
- 🎯 **Стандартизированные ответы** — единый формат API ответов
- 🛡️ **Graceful shutdown** — корректное завершение работы приложения

### Frontend

- ⚛️ **React 18** — современный UI с хуками
- 🎨 **Минималистичный дизайн** — черно-белая палитра
- 🔒 **XSS защита** — DOMPurify для санитизации данных
- 📱 **Адаптивность** — responsive дизайн
- 🎭 **Модальные окна** — удобные формы обратной связи
- 🔄 **Автоматическое обновление токенов** — seamless refresh token flow
- 📦 **Разделение кода** — типы, API клиенты, компоненты

### Инфраструктура

- 🐳 **Docker Compose** — полная контейнеризация
- 🔐 **Безопасность БД** — credentials для MongoDB
- 🚀 **Production ready** — оптимизированные Docker образы
- 📊 **Health checks** — мониторинг состояния сервисов

---

## 🛠 Технологический стек

### Backend

| Технология | Версия | Назначение |
|------------|--------|------------|
| **Fastify** | 4.28 | Высокопроизводительный веб-фреймворк |
| **Mongoose** | 8.7 | ODM для MongoDB с контролируемым пулом |
| **TypeScript** | 5.6 | Строгая типизация |
| **JWT** | 9.0 | Аутентификация (Access + Refresh tokens) |
| **Zod** | 3.23 | Валидация схем |
| **Pino** | 9.4 | Структурированное логирование |
| **Swagger** | 8.15 | API документация |

### Frontend

| Технология | Версия | Назначение |
|------------|--------|------------|
| **React** | 18.3 | UI библиотека |
| **Vite** | 5.4 | Сборщик и dev-сервер |
| **TypeScript** | 5.6 | Типизация |
| **React Router** | 6.26 | Маршрутизация |
| **Zustand** | 5.0 | Управление состоянием |
| **Axios** | 1.7 | HTTP клиент |
| **DOMPurify** | 3.0 | XSS защита |

### Инфраструктура

| Технология | Назначение |
|------------|------------|
| **Docker** | Контейнеризация |
| **Docker Compose** | Оркестрация сервисов |
| **Nginx** | Reverse proxy для production |
| **MongoDB** | Документоориентированная БД |

---

## 🏗 Архитектура

### Backend Architecture

```
┌─────────────────────────────────────────────────┐
│           Presentation Layer                    │
│  (Controllers, Routes, Middlewares)              │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│         Application Layer                         │
│  (Services, Business Logic)                      │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│           Domain Layer                           │
│  (Models, Interfaces, Types)                     │
└──────────────────┬──────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────┐
│        Infrastructure Layer                      │
│  (Database, External Services)                   │
└─────────────────────────────────────────────────┘
```

### Database Connection Pattern

Проект использует **Singleton паттерн** для управления подключением к MongoDB:

- ✅ Контролируемый пул соединений
- ✅ Защита от множественных подключений
- ✅ Graceful shutdown
- ✅ Проверка состояния подключения

### Security Features

- 🔐 **JWT Authentication** — Access Token (15m) + Refresh Token (7d)
- 🛡️ **XSS Protection** — DOMPurify для санитизации
- ✅ **Input Validation** — Zod схемы
- 🔒 **Error Handling** — типизированные классы ошибок
- 🚫 **CORS** — настраиваемые разрешенные origins

---

## 🚀 Быстрый старт

### Требования

- **Node.js** 20+
- **npm** или **yarn**
- **MongoDB** 7.0+ (локально или Docker)
- **Docker & Docker Compose** (опционально)

### Установка

```bash
# 1. Клонируйте репозиторий
git clone <repository-url>
cd website-dealership

# 2. Установите зависимости
npm install

# 3. Настройте переменные окружения
cp .env.example .env
# Отредактируйте .env файл
```

### Настройка окружения

Создайте `.env` в корне проекта:

```env
# API Configuration
API_PORT=3001
API_HOST=0.0.0.0
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/car-shop
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=changeme

# JWT Configuration
JWT_SECRET=your-secret-key-change-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000
```

### Инициализация базы данных

```bash
cd apps/api

# Создать администратора
npm run create-admin admin@example.com admin123

# Заполнить базу данных (50 автомобилей, 5 владельцев)
npm run seed
```

### Запуск

**Вариант 1: Одновременный запуск (рекомендуется)**

```bash
# Из корня проекта
npm run dev
```

**Вариант 2: Раздельный запуск**

```bash
# Терминал 1 - API
cd apps/api && npm run dev

# Терминал 2 - Web
cd apps/web && npm run dev
```

### Доступ к приложению

- 🌐 **Frontend**: http://localhost:3000
- 🔧 **API**: http://localhost:3001
- 📚 **Swagger UI**: http://localhost:3001/docs

---

## 🐳 Docker

### Быстрый старт с Docker

```bash
# Запустите все сервисы
docker-compose up -d

# Просмотр логов
docker-compose logs -f

# Остановка
docker-compose down
```

### Инициализация БД в Docker

```bash
# Зайти в контейнер API
docker-compose exec api sh

# Внутри контейнера
npm run create-admin admin@example.com admin123
npm run seed
```

### Переменные окружения для Docker

Docker Compose автоматически использует переменные из `.env`:

```env
MONGODB_URI=mongodb://admin:changeme@mongodb:27017/car-shop?authSource=admin
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=changeme
```

---

## 📁 Структура проекта

```
website-dealership/
├── apps/
│   ├── api/                          # Backend API
│   │   ├── src/
│   │   │   ├── config/              # Конфигурация (env)
│   │   │   ├── controllers/         # HTTP обработчики
│   │   │   ├── services/            # Бизнес-логика
│   │   │   ├── models/              # Mongoose модели
│   │   │   ├── db/                  # Database layer
│   │   │   │   ├── datasource.ts   # MongoDataSource (Singleton)
│   │   │   │   ├── client.ts       # Database client
│   │   │   │   └── collections.ts  # Model exports
│   │   │   ├── middlewares/        # Auth, roles
│   │   │   ├── routes/             # API маршруты
│   │   │   ├── plugins/            # Fastify плагины
│   │   │   ├── utils/              # Утилиты (errors, validate)
│   │   │   ├── scripts/            # Seed, create-admin
│   │   │   ├── shutdown.ts         # Graceful shutdown
│   │   │   └── server.ts           # Точка входа
│   │   ├── Dockerfile
│   │   └── package.json
│   │
│   └── web/                          # Frontend React
│       ├── src/
│       │   ├── api/                 # API клиенты
│       │   ├── components/          # React компоненты
│       │   │   ├── admin/          # Админ компоненты
│       │   │   ├── common/         # Общие компоненты
│       │   │   ├── owner/          # Компоненты владельца
│       │   │   └── public/        # Публичные компоненты
│       │   ├── pages/              # Страницы приложения
│       │   ├── store/             # Zustand stores
│       │   ├── types/              # TypeScript типы
│       │   ├── utils/              # Утилиты (sanitize)
│       │   └── App.tsx
│       ├── public/                  # Статические файлы
│       ├── nginx.conf              # Nginx конфигурация
│       └── vite.config.ts
│
├── docker-compose.yml               # Docker Compose
├── package.json                     # Root (workspaces)
└── README.md
```

---

## 📚 API Документация

### Swagger UI

Интерактивная документация доступна после запуска API:
- **http://localhost:3001/docs**

### Основные эндпойнты

#### 🔓 Public (публичные)

| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/api/cars` | Список автомобилей (только одобренные) |
| `GET` | `/api/cars/:id` | Детали автомобиля |
| `GET` | `/api/settings` | Настройки сайта |
| `POST` | `/api/leads` | Создать заявку на автомобиль |

#### 🔐 Auth (аутентификация)

| Метод | Путь | Описание |
|-------|------|----------|
| `POST` | `/api/auth/login` | Вход (admin/owner) |
| `POST` | `/api/auth/register` | Регистрация владельца |
| `POST` | `/api/auth/refresh` | Обновить access token |
| `POST` | `/api/auth/logout` | Выход |
| `GET` | `/api/auth/me` | Текущий пользователь |

#### 👤 Owner (владелец)

| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/api/my/cars` | Мои объявления |
| `POST` | `/api/my/cars` | Создать объявление (pending) |
| `PATCH` | `/api/my/cars/:id/status` | Изменить статус |

#### 👨‍💼 Admin (администратор)

| Метод | Путь | Описание |
|-------|------|----------|
| `GET` | `/api/admin/cars` | Все объявления |
| `POST` | `/api/admin/cars` | Создать объявление (approved) |
| `PATCH` | `/api/admin/cars/:id` | Обновить объявление |
| `DELETE` | `/api/admin/cars/:id` | Удалить объявление |
| `PATCH` | `/api/admin/cars/:id/moderate` | Модерировать объявление |
| `GET` | `/api/admin/leads` | Все заявки |
| `PATCH` | `/api/admin/leads/:id/status` | Изменить статус заявки |
| `GET` | `/api/admin/users` | Все пользователи |
| `PATCH` | `/api/admin/settings` | Обновить настройки |

### Фильтры для `/api/cars`

| Параметр | Тип | Описание |
|----------|-----|----------|
| `page` | number | Номер страницы |
| `limit` | number | Количество на странице |
| `status` | string | Статус (available/reserved/sold) |
| `brand` | string | Бренд |
| `yearFrom`, `yearTo` | number | Год от/до |
| `priceFrom`, `priceTo` | number | Цена от/до |
| `fuelType` | string | Тип топлива |
| `transmission` | string | КПП |
| `drive` | string | Привод |
| `q` | string | Поиск по названию/бренду/модели |
| `sort` | string | Сортировка (priceAsc, priceDesc, yearDesc) |

---

## 💻 Разработка

### Команды разработки

```bash
# Запуск в режиме разработки
npm run dev              # API + Web одновременно
npm run dev:api          # Только API
npm run dev:web          # Только Web

# Сборка
npm run build            # Сборка всех приложений
npm run build:api        # Сборка API
npm run build:web        # Сборка Web

# Линтинг и форматирование
npm run lint             # Проверить код
npm run lint:fix         # Исправить ошибки
npm run format           # Форматировать код
```

### Структура кода

#### Backend (API)

- **Controllers** — обработка HTTP запросов, валидация
- **Services** — бизнес-логика, работа с БД через Mongoose
- **Models** — Mongoose схемы с денормализацией
- **DB Layer** — MongoDataSource (Singleton), управление подключением
- **Middlewares** — аутентификация, авторизация, проверка прав
- **Routes** — определение маршрутов API
- **Plugins** — Fastify плагины (CORS, DB, Logger, Swagger)
- **Utils** — обработка ошибок, валидация Zod
- **Shutdown** — graceful shutdown handler

#### Frontend (Web)

- **Pages** — страницы приложения (public, owner, admin)
- **Components** — переиспользуемые компоненты
- **API** — клиенты для работы с API
- **Types** — TypeScript интерфейсы
- **Store** — Zustand stores для состояния
- **Utils** — утилиты (sanitize для XSS защиты)

### Стиль кода

- ✅ **TypeScript** — строгая типизация
- ✅ **ESLint** — проверка качества кода
- ✅ **Prettier** — автоматическое форматирование
- ✅ **SOLID принципы** — чистая архитектура

---

## 🚢 Деплой

### Production сборка

```bash
# Сборка API
cd apps/api
npm run build

# Сборка Web
cd apps/web
npm run build
```

### Docker Production

```bash
# Сборка образов
docker-compose build

# Запуск в production
NODE_ENV=production docker-compose up -d
```

### Переменные окружения для Production

**⚠️ Важно:** Измените следующие переменные:

```env
NODE_ENV=production
JWT_SECRET=<strong-random-secret>
MONGODB_URI=mongodb://user:password@mongodb:27017/car-shop?authSource=admin
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=<strong-password>
CORS_ORIGIN=https://your-domain.com
```

---

## 🔒 Безопасность

### Реализованные меры

- ✅ **JWT Authentication** — Access Token (15 минут) + Refresh Token (7 дней)
- ✅ **XSS Protection** — DOMPurify для санитизации пользовательского ввода
- ✅ **Input Validation** — Zod схемы для валидации всех входных данных
- ✅ **Error Handling** — типизированные классы ошибок, без утечки информации
- ✅ **CORS** — настраиваемые разрешенные origins
- ✅ **Password Hashing** — bcryptjs для хеширования паролей
- ✅ **Database Credentials** — безопасное подключение к MongoDB
- ✅ **Type Safety** — строгая типизация TypeScript

### Рекомендации для Production

1. **Измените все секретные ключи** в `.env`
2. **Используйте HTTPS** для всех соединений
3. **Настройте rate limiting** для API
4. **Включите мониторинг** и логирование
5. **Регулярно обновляйте зависимости**

---

## 👥 Роли пользователей

### 👨‍💼 Администратор (admin)

**Доступ:**
- Полное управление объявлениями
- Модерация объявлений владельцев
- Управление заявками и пользователями
- Настройки сайта
- Просмотр аналитики

**Вход:** `/admin/login`

### 👤 Владелец (owner)

**Доступ:**
- Создание объявлений (отправка на модерацию)
- Управление своими объявлениями
- Изменение статусов автомобилей
- Просмотр статистики

**Регистрация:** `/account/register`  
**Вход:** `/account/login`

---

## 🔍 Система модерации

### Процесс модерации

1. **Владелец создает объявление** → статус `pending`
2. **Администратор видит объявление** на странице `/admin/moderation`
3. **Администратор принимает решение:**
   - ✅ **Одобрить** → статус `approved`, объявление появляется на сайте
   - ❌ **Отклонить** → статус `rejected`, можно указать причину

### Статусы

**Модерация:**
- `pending` — на модерации
- `approved` — одобрено (видно на сайте)
- `rejected` — отклонено

**Продажа:**
- `available` — в продаже
- `reserved` — забронирован
- `sold` — продан (в архиве)

---

## 📝 Скрипты

### Root (корень проекта)

```bash
npm run dev              # Запуск API и Web одновременно
npm run build            # Сборка всех приложений
npm run lint             # Проверить код во всех приложениях
npm run lint:fix         # Исправить ошибки линтера
npm run format           # Форматировать код
```

### API (`apps/api`)

```bash
npm run dev              # Запуск в режиме разработки
npm run build            # Сборка TypeScript
npm run start            # Запуск production версии
npm run create-admin     # Создать администратора
npm run seed             # Заполнить базу данных
npm run seed:clear       # Очистить и заполнить заново
npm run update-settings  # Обновить настройки сайта
```

### Web (`apps/web`)

```bash
npm run dev              # Запуск dev-сервера
npm run build            # Сборка для production
npm run preview          # Предпросмотр production сборки
```

---

## 🐛 Troubleshooting

### Проблема: CORS ошибки

**Решение:**
1. Проверьте `CORS_ORIGIN` в `.env`
2. Убедитесь, что CORS плагин зарегистрирован первым
3. Проверьте заголовки в Network tab браузера

### Проблема: JWT ошибки

**Решение:**
1. Проверьте `JWT_SECRET` в `.env`
2. Убедитесь, что токены не истекли
3. Проверьте токен в localStorage браузера

### Проблема: MongoDB подключение

**Решение:**
1. Проверьте, что MongoDB запущен
2. Проверьте `MONGODB_URI` в `.env`
3. Для Docker: используйте правильный hostname (`mongodb`)
4. Проверьте credentials (username/password)

### Проблема: Зависимости не найдены

**Решение:**
```bash
# Переустановите зависимости
cd apps/api && npm install
cd apps/web && npm install
```

---

## 📄 Лицензия

Проект создан для **SMK Dealership**. Все права защищены.

---

## 👨‍💻 Автор

**smokkkkiiii Ilin Kirill**

---

<div align="center">

**⭐ Если проект был полезен, поставьте звезду! ⭐**

Made with ❤️ using TypeScript, React, and Fastify

</div>
