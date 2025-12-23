FROM node:25-alpine AS builder

ARG VITE_API_URL

WORKDIR /app

COPY apps/web/package*.json ./

RUN npm install && npm cache clean --force

COPY apps/web/ ./

RUN if [ -n "$VITE_API_URL" ]; then \
      VITE_API_URL="$VITE_API_URL" npx tsc -p tsconfig.prod.json && \
      VITE_API_URL="$VITE_API_URL" npx vite build; \
    else \
      npx tsc -p tsconfig.prod.json && \
      npx vite build; \
    fi

FROM nginx:alpine

RUN apk add --no-cache curl

COPY --from=builder /app/dist /usr/share/nginx/html

COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

EXPOSE 80

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]

