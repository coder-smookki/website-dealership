# 🏗️ Архитектура проекта

## Clean Architecture Overview

Проект построен по принципам **Clean Architecture** (Uncle Bob) с чётким разделением слоёв и зависимостей.

```
┌─────────────────────────────────────────────────────────┐
│                  Presentation Layer                      │
│  • HTTP обработка (Controllers, Routes)                  │
│  • Middlewares (auth, validation)                        │
│  • Plugins (CORS, Security, Logger, Swagger)             │
│  • Зависит от: Application, Domain                       │
└────────────────────┬────────────────────────────────────┘
                     │ зависит от
┌────────────────────▼────────────────────────────────────┐
│                  Application Layer                       │
│  • Services (бизнес-логика)                              │
│  • Use Cases (сценарии использования)                    │
│  • Зависит от: Domain, Infrastructure                    │
└────────────────────┬────────────────────────────────────┘
                     │ зависит от
┌────────────────────▼────────────────────────────────────┐
│                    Domain Layer                          │
│  • Entities (User, Car, Lead, Settings)                  │
│  • Interfaces (IDataSource)                              │
│  • Domain Errors (ValidationError, NotFoundError...)     │
│  • DTOs (CreateUserDTO, UpdateCarDTO...)                 │
│  • НЕ зависит ни от чего                                 │
└─────────────────────────────────────────────────────────┘
                     ▲ реализует
┌────────────────────┴────────────────────────────────────┐
│                Infrastructure Layer                      │
│  • Database (MongoDataSource, Collections)               │
│  • External Services                                     │
│  • Зависит от: Domain (реализует интерфейсы)             │
└─────────────────────────────────────────────────────────┘
```

---

## Структура директорий

```
apps/api/src/
├── domain/                    # Domain Layer (Ядро бизнес-логики)
│   ├── entities/             # Бизнес-сущности
│   │   ├── User.ts           # UserEntity, DTOs
│   │   ├── Car.ts            # CarEntity, DTOs
│   │   ├── Lead.ts           # LeadEntity, DTOs
│   │   └── Settings.ts       # SettingsEntity, DTOs
│   ├── interfaces/           # Интерфейсы для инфраструктуры
│   │   └── IDataSource.ts    # Контракт для БД
│   └── errors/               # Доменные ошибки
│       └── DomainErrors.ts   # ValidationError, NotFoundError...
│
├── config/                    # Конфигурация
│   └── env.ts                # Environment variables
│
├── controllers/              # Presentation Layer - HTTP handlers
│   ├── auth.controller.ts    # Аутентификация
│   ├── cars.controller.ts    # Управление автомобилями
│   ├── leads.controller.ts   # Управление заявками
│   ├── health.controller.ts  # Health checks
│   └── ...
│
├── services/                 # Application Layer - Бизнес-логика
│   ├── auth.service.ts       # Логин, регистрация
│   ├── token.service.ts      # JWT управление
│   ├── cars.service.ts       # CRUD для автомобилей
│   ├── leads.service.ts      # CRUD для заявок
│   └── users.service.ts      # CRUD для пользователей
│
├── db/                       # Infrastructure Layer - Data Access
│   ├── datasource.ts         # MongoDataSource (Singleton)
│   ├── client.ts             # Подключение к БД
│   └── collections.ts        # Типизированные коллекции
│
├── middlewares/              # Presentation Layer - HTTP middlewares
│   ├── auth.ts               # JWT проверка
│   ├── requireRole.ts        # Проверка ролей
│   ├── canAccessCar.ts       # Проверка доступа
│   └── requestId.ts          # Request ID
│
├── routes/                   # Presentation Layer - Маршруты
│   ├── public.routes.ts      # Публичные эндпойнты
│   ├── auth.routes.ts        # Аутентификация
│   ├── owner.routes.ts       # Эндпойнты владельца
│   ├── admin.routes.ts       # Эндпойнты админа
│   └── health.routes.ts      # Health checks
│
├── plugins/                  # Presentation Layer - Fastify plugins
│   ├── cors.ts               # CORS
│   ├── security.ts           # Security headers, rate limiting
│   ├── logger.ts             # Pino logger
│   ├── swagger.ts            # API документация
│   └── db.ts                 # DB connection plugin
│
├── utils/                    # Утилиты
│   ├── errors.ts             # Error handling
│   ├── response.ts           # sendSuccess, sendError
│   └── validate.ts           # Zod валидация
│
├── scripts/                  # CLI скрипты
│   ├── createAdmin.ts        # Создание админа
│   ├── seedDatabase.ts       # Заполнение БД
│   └── updateSettings.ts     # Обновление настроек
│
├── shutdown.ts               # Graceful shutdown manager
└── server.ts                 # Entry point
```

---

## Принципы проектирования

### 1. SOLID

#### Single Responsibility Principle (SRP)
- ✅ Каждый модуль отвечает за одну задачу
- ✅ Контроллеры — только HTTP обработка
- ✅ Сервисы — только бизнес-логика
- ✅ Репозитории — только доступ к данным

#### Open/Closed Principle (OCP)
- ✅ Код открыт для расширения, закрыт для модификации
- ✅ Интерфейс `IDataSource` позволяет заменить БД без изменения бизнес-логики

#### Liskov Substitution Principle (LSP)
- ✅ Любая реализация `IDataSource` может заменить `MongoDataSource`

#### Interface Segregation Principle (ISP)
- ✅ Интерфейсы узкие и специализированные
- ✅ DTOs для разных use cases (CreateUserDTO, UpdateUserDTO)

#### Dependency Inversion Principle (DIP)
- ✅ Зависимости направлены от внешних слоёв к внутренним
- ✅ Domain не зависит от Infrastructure
- ✅ Services зависят от `IDataSource`, а не от `MongoDataSource`

### 2. Dependency Rule

**Правило:** Зависимости направлены только внутрь (к Domain).

```
Presentation → Application → Domain ← Infrastructure
     ↓              ↓           ↑           ↓
  (зависит)    (зависит)   (не зависит) (реализует)
```

### 3. Separation of Concerns

- **Domain** — бизнес-правила, не зависит от фреймворков
- **Application** — сценарии использования, оркестрация
- **Infrastructure** — детали реализации (БД, API)
- **Presentation** — интерфейс пользователя (HTTP)

---

## Паттерны проектирования

### 1. Singleton (MongoDataSource)

**Проблема:** Нужно одно подключение к БД с контролируемым пулом.

**Решение:**
```typescript
export class MongoDataSource implements IDataSource {
  private static instance: MongoDataSource;
  
  private constructor() {}
  
  static getInstance(): MongoDataSource {
    if (!MongoDataSource.instance) {
      MongoDataSource.instance = new MongoDataSource();
    }
    return MongoDataSource.instance;
  }
}
```

### 2. Dependency Injection (Fastify plugins)

**Проблема:** Как внедрить зависимости в контроллеры?

**Решение:** Fastify decorators
```typescript
fastify.decorate('logger', logger);
fastify.decorate('db', db);
```

### 3. Repository Pattern (Collections)

**Проблема:** Абстракция доступа к данным.

**Решение:**
```typescript
export function getUsersCollection(db: Db): Collection<UserEntity> {
  return db.collection<UserEntity>('users');
}
```

### 4. DTO Pattern

**Проблема:** Разделение внутренних и внешних моделей данных.

**Решение:**
```typescript
export interface CreateUserDTO {
  email: string;
  password: string; // не хранится в Entity
  role: 'admin' | 'owner';
}

export interface UserEntity {
  _id: ObjectId;
  email: string;
  passwordHash: string; // хешированный пароль
  role: 'admin' | 'owner';
}
```

### 5. Error Handling Pattern

**Проблема:** Централизованная обработка ошибок.

**Решение:**
```typescript
// Сервисы бросают типизированные ошибки
throw new ValidationError('Invalid email');

// Global handler ловит и форматирует
fastify.setErrorHandler((error, request, reply) => {
  return handleError(error, reply, request, fastify);
});
```

---

## Data Flow

### 1. Request Flow (Входящий запрос)

```
HTTP Request
    ↓
Fastify Router
    ↓
Middleware (auth, validation)
    ↓
Controller (HTTP обработка)
    ↓
Service (бизнес-логика)
    ↓
Repository (доступ к БД)
    ↓
MongoDB
```

### 2. Response Flow (Исходящий ответ)

```
MongoDB
    ↓
Repository (Entity)
    ↓
Service (DTO)
    ↓
Controller (Response)
    ↓
Middleware (logging)
    ↓
HTTP Response
```

### 3. Error Flow

```
Error (любой слой)
    ↓
throw DomainError
    ↓
Global Error Handler
    ↓
sendError (стандартизированный ответ)
    ↓
HTTP Response (правильный код)
```

---

## Database Design

### 1. Collections

- **users** — пользователи (admin, owner)
- **cars** — объявления об автомобилях
- **leads** — заявки от покупателей
- **settings** — настройки сайта

### 2. Денормализация

**Проблема:** Populate в Mongoose медленный.

**Решение:** Денормализация данных владельца в документах автомобилей.

```typescript
export interface CarEntity {
  _id: ObjectId;
  title: string;
  ownerId: ObjectId;        // Ссылка на User
  ownerName?: string;       // Денормализованные данные
  ownerEmail?: string;      // Денормализованные данные
  ownerPhone?: string;      // Денормализованные данные
}
```

**Преимущества:**
- Нет JOIN'ов
- Быстрое чтение
- Простые запросы

**Недостатки:**
- При изменении владельца нужно обновить все его автомобили
- Дублирование данных

### 3. Indexes

```typescript
// cars collection
db.cars.createIndex({ brand: 1, model: 1 });
db.cars.createIndex({ status: 1 });
db.cars.createIndex({ moderationStatus: 1 });
db.cars.createIndex({ ownerId: 1 });
db.cars.createIndex({ price: 1, year: 1 });

// users collection
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ refreshToken: 1 });

// leads collection
db.leads.createIndex({ carId: 1 });
db.leads.createIndex({ status: 1 });
```

---

## Security Architecture

### 1. Authentication Flow

```
Login (email + password)
    ↓
bcrypt.compare (проверка пароля)
    ↓
Generate Access Token (15 min)
    ↓
Generate Refresh Token (7 days)
    ↓
Store Refresh Token in DB
    ↓
Return both tokens to client
```

### 2. Token Refresh Flow

```
Access Token expired
    ↓
Send Refresh Token
    ↓
Verify Refresh Token (JWT + DB check)
    ↓
Generate new token pair
    ↓
Update Refresh Token in DB
    ↓
Return new tokens
```

### 3. Authorization

```
Request with Access Token
    ↓
authMiddleware (verify JWT)
    ↓
Extract user (id, role, email)
    ↓
requireRole middleware (check role)
    ↓
Controller (access granted)
```

---

## Frontend Architecture

### Структура

```
apps/web/src/
├── api/                # API clients (axios)
│   ├── http.ts         # Axios instance + interceptors
│   ├── auth.ts         # Auth API
│   ├── cars.ts         # Cars API
│   ├── leads.ts        # Leads API
│   └── users.ts        # Users API
│
├── components/         # React компоненты
│   ├── common/        # Общие компоненты
│   ├── public/        # Публичные компоненты
│   ├── owner/         # Компоненты владельца
│   └── admin/         # Компоненты админа
│
├── pages/             # Страницы
│   ├── public/        # Публичные страницы
│   ├── owner/         # Страницы владельца
│   └── admin/         # Страницы админа
│
├── store/             # State management (Zustand)
│   └── authStore.ts   # Аутентификация
│
├── types/             # TypeScript типы
│   ├── car.ts
│   └── settings.ts
│
├── utils/             # Утилиты
│   └── sanitize.ts    # XSS защита (DOMPurify)
│
└── App.tsx            # Root component + Router
```

### State Management (Zustand)

```typescript
// Простой и минималистичный store
export const useAuthStore = create<AuthStore>((set, get) => ({
  token: localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  
  login: (data) => {
    localStorage.setItem('token', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    set({ token: data.accessToken, user: data.user });
  },
  
  logout: () => {
    localStorage.clear();
    set({ token: null, user: null });
  },
}));
```

---

## Deployment Architecture

### Docker Compose (3 сервиса)

```
┌──────────────┐
│   Browser    │
└──────┬───────┘
       │ HTTP :3000
┌──────▼───────┐
│   Nginx      │ (Web container)
│  React SPA   │
└──────┬───────┘
       │ Proxy /api → :3001
┌──────▼───────┐
│  Fastify API │ (API container)
│   Node.js    │
└──────┬───────┘
       │ MongoDB protocol
┌──────▼───────┐
│   MongoDB    │ (DB container)
│   Port 27017 │
└──────────────┘
```

### Networks

- **car-shop-network** — bridge network для всех сервисов
- API и MongoDB общаются напрямую
- Web проксирует API запросы через nginx

---

## Performance Considerations

### 1. Connection Pooling

```typescript
const options: MongoClientOptions = {
  maxPoolSize: 10,      // Макс 10 соединений
  minPoolSize: 1,       // Мин 1 соединение
  serverSelectionTimeoutMS: 5000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 10000,
};
```

### 2. Денормализация

Вместо populate используем денормализацию для частых запросов.

### 3. Indexes

Индексы на часто запрашиваемые поля (brand, status, ownerId).

### 4. Rate Limiting

Защита от DDoS (100 req/min на IP).

---

## Monitoring & Observability

### 1. Health Checks

- `/health` — полная проверка (БД, память)
- `/ready` — готовность принимать трафик
- `/live` — жив ли процесс

### 2. Structured Logging

```json
{
  "level": "INFO",
  "request_id": "abc123",
  "method": "GET",
  "path": "/api/cars",
  "status_code": 200,
  "duration_ms": 45,
  "timestamp": "2024-12-23T10:00:00Z"
}
```

### 3. Metrics (будущее)

- Request duration
- Error rate
- Database response time
- Active connections

---

## Testing Strategy (будущее)

### 1. Unit Tests

```typescript
// services/*.test.ts
describe('AuthService', () => {
  it('should hash password', async () => {
    const hash = await hashPassword('password');
    expect(hash).not.toBe('password');
  });
});
```

### 2. Integration Tests

```typescript
// controllers/*.test.ts
describe('POST /api/auth/login', () => {
  it('should return tokens', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: { email: 'test@test.com', password: 'test' }
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toHaveProperty('accessToken');
  });
});
```

### 3. E2E Tests

```typescript
// e2e/auth.test.ts
describe('Authentication Flow', () => {
  it('should login, refresh token, logout', async () => {
    // Полный сценарий
  });
});
```

---

**Дата последнего обновления:** 2024-12-23

