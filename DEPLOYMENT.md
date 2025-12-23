# 🚀 Руководство по деплою

## Production Deployment Checklist

Перед деплоем в production **обязательно** проверьте:

- [ ] Сменили все секреты в `.env` (JWT, MongoDB пароль)
- [ ] Настроили CORS с точным доменом
- [ ] Включили HTTPS с валидным SSL сертификатом
- [ ] Настроили бэкапы MongoDB
- [ ] Настроили мониторинг и алерты
- [ ] Провели security audit (npm audit)
- [ ] Протестировали все критические сценарии
- [ ] Настроили логирование (ELK, Loki, CloudWatch)

---

## Вариант 1: Docker Compose (Простой)

### 1. Подготовка сервера

```bash
# Ubuntu 22.04 LTS
sudo apt update && sudo apt upgrade -y

# Установите Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Установите Docker Compose
sudo apt install docker-compose-plugin -y

# Добавьте пользователя в группу docker
sudo usermod -aG docker $USER
newgrp docker
```

### 2. Клонируйте проект

```bash
git clone <repository-url>
cd website-dealership
```

### 3. Создайте production .env

```env
NODE_ENV=production
API_PORT=3001
API_HOST=0.0.0.0

# MongoDB (смените пароль!)
MONGODB_URI=mongodb://admin:STRONG_PASSWORD_HERE@mongodb:27017/car-shop?authSource=admin
MONGO_ROOT_USERNAME=admin
MONGO_ROOT_PASSWORD=STRONG_PASSWORD_HERE

# JWT (сгенерируйте новые ключи!)
JWT_ACCESS_SECRET=$(openssl rand -base64 32)
JWT_REFRESH_SECRET=$(openssl rand -base64 32)
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# CORS (укажите ваш домен!)
CORS_ORIGIN=https://yourdomain.com

# Frontend
VITE_API_URL=
```

### 4. Настройте SSL (Let's Encrypt + Nginx)

Установите Certbot:

```bash
sudo apt install certbot python3-certbot-nginx -y
```

Получите сертификат:

```bash
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com
```

Обновите docker-compose.yml для использования Let's Encrypt:

```yaml
services:
  web:
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - /etc/letsencrypt:/etc/letsencrypt:ro
```

### 5. Запустите проект

```bash
# Сборка образов
docker-compose build

# Запуск в detached режиме
docker-compose up -d

# Проверьте логи
docker-compose logs -f
```

### 6. Инициализируйте БД

```bash
# Создайте администратора
docker-compose exec api npm run create-admin admin@yourdomain.com STRONG_PASSWORD

# Опционально: заполните тестовыми данными
docker-compose exec api npm run seed
```

### 7. Настройте автоматический рестарт

```bash
# Docker автоматически перезапустит контейнеры при сбое
# (уже настроено в docker-compose.yml: restart: unless-stopped)
```

---

## Вариант 2: Kubernetes (Production)

### 1. Подготовьте Kubernetes кластер

```bash
# Например, используя k3s
curl -sfL https://get.k3s.io | sh -
```

### 2. Создайте Kubernetes манифесты

#### namespace.yaml
```yaml
apiVersion: v1
kind: Namespace
metadata:
  name: car-shop
```

#### configmap.yaml
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: car-shop-config
  namespace: car-shop
data:
  NODE_ENV: "production"
  API_PORT: "3001"
  API_HOST: "0.0.0.0"
  JWT_ACCESS_EXPIRES_IN: "15m"
  JWT_REFRESH_EXPIRES_IN: "7d"
  MONGODB_URI: "mongodb://admin:password@mongodb:27017/car-shop?authSource=admin"
```

#### secret.yaml
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: car-shop-secrets
  namespace: car-shop
type: Opaque
stringData:
  MONGO_ROOT_PASSWORD: "STRONG_PASSWORD_HERE"
  JWT_ACCESS_SECRET: "YOUR_ACCESS_SECRET_HERE"
  JWT_REFRESH_SECRET: "YOUR_REFRESH_SECRET_HERE"
```

#### mongodb-deployment.yaml
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: mongodb
  namespace: car-shop
spec:
  replicas: 1
  selector:
    matchLabels:
      app: mongodb
  template:
    metadata:
      labels:
        app: mongodb
    spec:
      containers:
      - name: mongodb
        image: mongo:7
        ports:
        - containerPort: 27017
        env:
        - name: MONGO_INITDB_ROOT_USERNAME
          value: "admin"
        - name: MONGO_INITDB_ROOT_PASSWORD
          valueFrom:
            secretKeyRef:
              name: car-shop-secrets
              key: MONGO_ROOT_PASSWORD
        volumeMounts:
        - name: mongodb-storage
          mountPath: /data/db
      volumes:
      - name: mongodb-storage
        persistentVolumeClaim:
          claimName: mongodb-pvc
---
apiVersion: v1
kind: Service
metadata:
  name: mongodb
  namespace: car-shop
spec:
  selector:
    app: mongodb
  ports:
  - port: 27017
    targetPort: 27017
```

#### api-deployment.yaml
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: api
  namespace: car-shop
spec:
  replicas: 3
  selector:
    matchLabels:
      app: api
  template:
    metadata:
      labels:
        app: api
    spec:
      containers:
      - name: api
        image: your-registry/car-shop-api:latest
        ports:
        - containerPort: 3001
        envFrom:
        - configMapRef:
            name: car-shop-config
        - secretRef:
            name: car-shop-secrets
        livenessProbe:
          httpGet:
            path: /live
            port: 3001
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3001
          initialDelaySeconds: 10
          periodSeconds: 5
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
---
apiVersion: v1
kind: Service
metadata:
  name: api
  namespace: car-shop
spec:
  selector:
    app: api
  ports:
  - port: 3001
    targetPort: 3001
```

#### ingress.yaml (с cert-manager для SSL)
```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: car-shop-ingress
  namespace: car-shop
  annotations:
    cert-manager.io/cluster-issuer: "letsencrypt-prod"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  ingressClassName: nginx
  tls:
  - hosts:
    - yourdomain.com
    secretName: car-shop-tls
  rules:
  - host: yourdomain.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api
            port:
              number: 3001
      - path: /
        pathType: Prefix
        backend:
          service:
            name: web
            port:
              number: 80
```

### 3. Деплой

```bash
# Создайте namespace
kubectl apply -f namespace.yaml

# Создайте secrets и configmap
kubectl apply -f secret.yaml
kubectl apply -f configmap.yaml

# Деплой MongoDB
kubectl apply -f mongodb-deployment.yaml

# Деплой API
kubectl apply -f api-deployment.yaml

# Деплой Web
kubectl apply -f web-deployment.yaml

# Настройте Ingress
kubectl apply -f ingress.yaml

# Проверьте статус
kubectl get pods -n car-shop
kubectl get svc -n car-shop
kubectl get ingress -n car-shop
```

---

## Вариант 3: Cloud Providers

### AWS (ECS + RDS)

1. **Database:** Amazon DocumentDB (MongoDB-совместимая)
2. **API:** ECS Fargate
3. **Web:** CloudFront + S3
4. **Secrets:** AWS Secrets Manager
5. **Logs:** CloudWatch

### Google Cloud (GKE + Cloud SQL)

1. **Database:** Cloud SQL для MongoDB
2. **API:** GKE (Google Kubernetes Engine)
3. **Web:** Cloud CDN + Cloud Storage
4. **Secrets:** Secret Manager
5. **Logs:** Cloud Logging

### Azure (AKS + Cosmos DB)

1. **Database:** Azure Cosmos DB (MongoDB API)
2. **API:** AKS (Azure Kubernetes Service)
3. **Web:** Azure CDN + Blob Storage
4. **Secrets:** Key Vault
5. **Logs:** Azure Monitor

---

## Мониторинг и Логирование

### 1. Prometheus + Grafana

```yaml
# prometheus.yaml
scrape_configs:
  - job_name: 'car-shop-api'
    static_configs:
      - targets: ['api:3001']
    metrics_path: /metrics
```

### 2. ELK Stack (Elasticsearch + Logstash + Kibana)

```yaml
# docker-compose.yml
services:
  elasticsearch:
    image: elasticsearch:8.11.0
  
  logstash:
    image: logstash:8.11.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
  
  kibana:
    image: kibana:8.11.0
```

### 3. Loki + Grafana (проще)

```yaml
services:
  loki:
    image: grafana/loki:latest
    command: -config.file=/etc/loki/local-config.yaml
  
  promtail:
    image: grafana/promtail:latest
    volumes:
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
  
  grafana:
    image: grafana/grafana:latest
```

---

## Бэкапы

### 1. MongoDB автоматический бэкап

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/$DATE"

docker-compose exec -T mongodb mongodump \
  --uri="mongodb://admin:password@localhost:27017/car-shop?authSource=admin" \
  --out="$BACKUP_DIR"

# Загрузка в S3 (опционально)
aws s3 sync "$BACKUP_DIR" s3://your-backup-bucket/mongodb/$DATE

# Удаление старых бэкапов (старше 30 дней)
find /backups -type d -mtime +30 -exec rm -rf {} \;
```

Добавьте в crontab:

```bash
# Бэкап каждую ночь в 2:00
0 2 * * * /path/to/backup.sh
```

### 2. Восстановление из бэкапа

```bash
docker-compose exec mongodb mongorestore \
  --uri="mongodb://admin:password@localhost:27017/car-shop?authSource=admin" \
  /backups/20240101_020000
```

---

## CI/CD

### GitHub Actions

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Build Docker images
        run: |
          docker build -t your-registry/car-shop-api:${{ github.sha }} -f apps/api/Dockerfile .
          docker build -t your-registry/car-shop-web:${{ github.sha }} -f apps/web/Dockerfile .
      
      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push your-registry/car-shop-api:${{ github.sha }}
          docker push your-registry/car-shop-web:${{ github.sha }}
      
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/api api=your-registry/car-shop-api:${{ github.sha }} -n car-shop
          kubectl set image deployment/web web=your-registry/car-shop-web:${{ github.sha }} -n car-shop
```

---

## Масштабирование

### Horizontal Scaling (API)

```bash
# Docker Compose (ограниченное)
docker-compose up --scale api=3

# Kubernetes (рекомендуется)
kubectl scale deployment/api --replicas=5 -n car-shop

# Автоскейлинг
kubectl autoscale deployment/api \
  --cpu-percent=70 \
  --min=3 \
  --max=10 \
  -n car-shop
```

### Vertical Scaling (MongoDB)

```yaml
# Kubernetes
resources:
  requests:
    memory: "2Gi"
    cpu: "1000m"
  limits:
    memory: "4Gi"
    cpu: "2000m"
```

---

## Performance Tuning

### 1. MongoDB

```javascript
// Создайте индексы
db.cars.createIndex({ brand: 1, model: 1 });
db.cars.createIndex({ status: 1, moderationStatus: 1 });
db.users.createIndex({ email: 1 }, { unique: true });
```

### 2. API

```typescript
// Увеличьте connection pool
maxPoolSize: 50,
minPoolSize: 5,
```

### 3. Nginx

```nginx
# Включите кеширование
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=1g;

location /api/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
}
```

---

## Troubleshooting Production

### Проверка логов

```bash
# Docker
docker-compose logs -f api
docker-compose logs -f mongodb

# Kubernetes
kubectl logs -f deployment/api -n car-shop
kubectl logs -f deployment/mongodb -n car-shop
```

### Проверка health

```bash
# Локально
curl https://yourdomain.com/health

# Kubernetes
kubectl exec -it deployment/api -n car-shop -- wget -O- http://localhost:3001/health
```

### Database connection issues

```bash
# Проверьте подключение к MongoDB
docker-compose exec api sh
mongosh "mongodb://admin:password@mongodb:27017/car-shop?authSource=admin"
```

---

## Rollback

### Docker Compose

```bash
# Откатитесь к предыдущей версии
git checkout previous-commit
docker-compose down
docker-compose up -d --build
```

### Kubernetes

```bash
# Откатитесь к предыдущей версии деплоя
kubectl rollout undo deployment/api -n car-shop

# Откатитесь к конкретной ревизии
kubectl rollout history deployment/api -n car-shop
kubectl rollout undo deployment/api --to-revision=2 -n car-shop
```

---

**Дата последнего обновления:** 2024-12-23

