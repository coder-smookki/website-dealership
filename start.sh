#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Запуск Car Shop приложения...${NC}"

# Проверяем наличие Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Docker не установлен. Пожалуйста, установите Docker.${NC}"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ Docker Compose не установлен. Пожалуйста, установите Docker Compose.${NC}"
    exit 1
fi

# Проверяем наличие .env файла
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env файл не найден. Создаем из .env.example...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✅ .env файл создан. Пожалуйста, отредактируйте его при необходимости.${NC}"
    else
        echo -e "${YELLOW}⚠️  .env.example не найден. Создаем базовый .env файл...${NC}"
        cat > .env << EOF
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production-min-32-chars

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# API Configuration
VITE_API_URL=http://localhost:3001

# Environment
NODE_ENV=production
EOF
        echo -e "${GREEN}✅ Базовый .env файл создан.${NC}"
    fi
fi

# Останавливаем существующие контейнеры
echo -e "${YELLOW}🛑 Останавливаем существующие контейнеры...${NC}"
docker-compose down

# Собираем и запускаем контейнеры
echo -e "${GREEN}🔨 Собираем и запускаем контейнеры...${NC}"
docker-compose up --build -d

# Ждем запуска сервисов
echo -e "${YELLOW}⏳ Ждем запуска сервисов...${NC}"
sleep 10

# Проверяем статус контейнеров
echo -e "${GREEN}📊 Статус контейнеров:${NC}"
docker-compose ps

echo -e "${GREEN}✅ Приложение запущено!${NC}"
echo -e "${GREEN}🌐 Веб-приложение: http://localhost:3000${NC}"
echo -e "${GREEN}🔧 API: http://localhost:3001${NC}"
echo -e "${GREEN}📚 API документация: http://localhost:3001/docs${NC}"
echo -e "${GREEN}🗄️  MongoDB: localhost:27017${NC}"

echo -e "${YELLOW}📝 Для просмотра логов используйте: docker-compose logs -f${NC}"
echo -e "${YELLOW}🛑 Для остановки используйте: docker-compose down${NC}"
