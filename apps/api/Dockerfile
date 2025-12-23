FROM node:25-alpine AS builder

WORKDIR /app

COPY apps/api/package*.json ./

RUN npm install && npm cache clean --force

COPY apps/api/src ./src
COPY apps/api/tsconfig.json ./tsconfig.json

RUN npm run build

FROM node:25-alpine

WORKDIR /app

RUN apk add --no-cache curl

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

COPY apps/api/package*.json ./

RUN npm install --only=production && npm cache clean --force

COPY --from=builder /app/dist ./dist

RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 3001

CMD ["node", "dist/server.js"]

