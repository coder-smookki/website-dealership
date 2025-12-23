# 🔒 Руководство по безопасности

## Production Checklist

Перед деплоем в production **обязательно** выполните следующие шаги:

### 1. Секреты и пароли

✅ **Смените все секреты в `.env`:**

```env
# ❌ НЕ используйте эти значения в production!
JWT_ACCESS_SECRET=your-super-secret-access-token-change-in-production-min-32-chars
JWT_REFRESH_SECRET=your-super-secret-refresh-token-change-in-production-min-32-chars
MONGO_ROOT_PASSWORD=changeme123

# ✅ Используйте криптографически стойкие случайные строки:
JWT_ACCESS_SECRET=<32+ случайных символов>
JWT_REFRESH_SECRET=<32+ случайных символов>
MONGO_ROOT_PASSWORD=<надежный пароль>
```

**Генерация безопасных секретов:**

```bash
# Linux/macOS
openssl rand -base64 32

# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 2. CORS

✅ **Укажите точный домен:**

```env
# ❌ НЕ используйте wildcard в production
CORS_ORIGIN=*

# ✅ Укажите точный домен
CORS_ORIGIN=https://yourdomain.com
```

### 3. MongoDB

✅ **Создайте отдельного пользователя для приложения:**

```javascript
// Подключитесь к MongoDB
db.createUser({
  user: "carshop_app",
  pwd: "strong_password_here",
  roles: [
    { role: "readWrite", db: "car-shop" }
  ]
})

// Используйте этого пользователя в .env
MONGODB_URI=mongodb://carshop_app:strong_password_here@mongodb:27017/car-shop?authSource=car-shop
```

✅ **Включите аутентификацию в MongoDB:**

```yaml
# docker-compose.yml
services:
  mongodb:
    command: mongod --auth
```

### 4. HTTPS

✅ **Используйте только HTTPS в production:**

- Настройте SSL/TLS сертификаты (Let's Encrypt)
- Используйте reverse proxy (nginx, Traefik, Caddy)
- Включите HSTS (уже включён в securityPlugin)

### 5. Rate Limiting

✅ **Настройте rate limiting:**

По умолчанию: 100 запросов/минуту на IP+URL.

Для изменения отредактируйте `apps/api/src/plugins/security.ts`:

```typescript
const limit = 100; // Измените на нужное значение
const windowMs = 60 * 1000; // 1 минута
```

### 6. Логирование

✅ **Настройте централизованное логирование:**

- ELK Stack (Elasticsearch, Logstash, Kibana)
- Loki + Grafana
- CloudWatch (AWS)
- StackDriver (GCP)

Логи выводятся в STDOUT (JSON формат) и готовы для сбора.

### 7. Мониторинг

✅ **Используйте health endpoints для мониторинга:**

```yaml
# Kubernetes liveness probe
livenessProbe:
  httpGet:
    path: /live
    port: 3001
  initialDelaySeconds: 30
  periodSeconds: 10

# Kubernetes readiness probe
readinessProbe:
  httpGet:
    path: /ready
    port: 3001
  initialDelaySeconds: 10
  periodSeconds: 5
```

### 8. Firewall

✅ **Ограничьте доступ к портам:**

- MongoDB (27017) — только внутренняя сеть
- API (3001) — доступ через reverse proxy
- Web (3000/80) — публичный доступ

### 9. Обновления

✅ **Регулярно обновляйте зависимости:**

```bash
# Проверка уязвимостей
npm audit

# Обновление зависимостей
npm update

# Проверка устаревших пакетов
npm outdated
```

### 10. Бэкапы

✅ **Настройте регулярные бэкапы MongoDB:**

```bash
# Бэкап
docker-compose exec mongodb mongodump \
  --uri="mongodb://admin:password@localhost:27017/car-shop?authSource=admin" \
  --out=/backup/$(date +%Y%m%d)

# Восстановление
docker-compose exec mongodb mongorestore \
  --uri="mongodb://admin:password@localhost:27017/car-shop?authSource=admin" \
  /backup/20240101
```

---

## Реализованные меры безопасности

### Backend

- ✅ **JWT с refresh tokens** — Access Token (15 min), Refresh Token (7 days)
- ✅ **Password hashing** — bcryptjs с salt rounds 10
- ✅ **Rate limiting** — 100 req/min на IP+URL
- ✅ **Security headers** — X-Frame-Options, CSP, HSTS, X-Content-Type-Options
- ✅ **Input validation** — Zod схемы для всех входных данных
- ✅ **Error handling** — Типизированные ошибки без утечки информации
- ✅ **CORS** — Настраиваемые origins
- ✅ **MongoDB credentials** — authSource=admin
- ✅ **Graceful shutdown** — Корректное закрытие соединений
- ✅ **No SQL injection** — Параметризованные запросы через MongoDB Driver

### Frontend

- ✅ **XSS защита** — DOMPurify для всех пользовательских данных
- ✅ **Token refresh** — Автоматическое обновление токенов
- ✅ **Secure storage** — Токены в localStorage (можно перенести в httpOnly cookies)
- ✅ **Input sanitization** — sanitize.ts для всех форм
- ✅ **Error handling** — Корректная обработка ошибок API

### Infrastructure

- ✅ **Docker** — Контейнеризация с непривилегированными пользователями
- ✅ **Multi-stage builds** — Минимальные production образы
- ✅ **Health checks** — Автоматический рестарт при сбоях
- ✅ **Network isolation** — Docker network для внутренних сервисов

---

## Известные ограничения

### 1. Токены в localStorage

**Проблема:** Токены хранятся в localStorage (доступны для XSS).

**Решение:** Перенести в httpOnly cookies:

```typescript
// Backend - отправка токена в cookie
reply.setCookie('accessToken', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
  maxAge: 15 * 60 * 1000 // 15 min
});

// Frontend - axios автоматически отправит cookie
// Не нужно вручную добавлять Authorization header
```

### 2. In-memory rate limiting

**Проблема:** Rate limit сбрасывается при рестарте сервера.

**Решение:** Использовать Redis для distributed rate limiting:

```typescript
import Redis from 'ioredis';
import { RateLimiterRedis } from 'rate-limiter-flexible';

const redis = new Redis({ host: 'redis' });
const rateLimiter = new RateLimiterRedis({
  storeClient: redis,
  points: 100,
  duration: 60,
});
```

### 3. Нет 2FA

**Проблема:** Только email/password аутентификация.

**Решение:** Добавить 2FA (TOTP):

```bash
npm install otplib qrcode
```

---

## Отчёт об уязвимостях

Если вы обнаружили уязвимость безопасности, пожалуйста:

1. **НЕ** создавайте публичный issue
2. Отправьте email на security@yourdomain.com
3. Включите подробное описание и шаги воспроизведения
4. Мы ответим в течение 48 часов

---

## Дополнительные рекомендации

### 1. Content Security Policy (CSP)

Настроена базовая CSP в `securityPlugin.ts`. Для более строгой политики:

```typescript
reply.header('Content-Security-Policy', 
  "default-src 'self'; " +
  "script-src 'self'; " +
  "style-src 'self' 'unsafe-inline'; " +
  "img-src 'self' data: https:; " +
  "font-src 'self'; " +
  "connect-src 'self'; " +
  "frame-ancestors 'none'"
);
```

### 2. Subresource Integrity (SRI)

Для CDN ресурсов используйте SRI:

```html
<script src="https://cdn.example.com/lib.js"
        integrity="sha384-..."
        crossorigin="anonymous"></script>
```

### 3. Audit логи

Добавьте логирование критических операций:

```typescript
fastify.logger.warn({
  action: 'user.delete',
  performedBy: request.user.id,
  targetUser: userId,
  timestamp: new Date().toISOString(),
});
```

### 4. IP Whitelist для админки

Ограничьте доступ к админке по IP:

```typescript
fastify.addHook('onRequest', async (request, reply) => {
  if (request.url.startsWith('/admin')) {
    const allowedIPs = ['1.2.3.4', '5.6.7.8'];
    if (!allowedIPs.includes(request.ip)) {
      throw new ForbiddenError('IP not allowed');
    }
  }
});
```

---

## Compliance

### GDPR

Для соответствия GDPR добавьте:

1. Политику конфиденциальности
2. Согласие на обработку данных
3. Возможность удаления аккаунта
4. Экспорт данных пользователя

### PCI DSS

Если принимаете платежи:

1. Используйте Stripe/PayPal (PCI-compliant)
2. НЕ храните данные карт
3. Логируйте все платежные операции

---

**Дата последнего обновления:** 2024-12-23

