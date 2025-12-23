FROM node:20-alpine AS builder

ARG VITE_API_URL=http://localhost:3001

WORKDIR /app

COPY apps/web/package*.json ./

RUN npm install && npm cache clean --force

COPY apps/web/ ./

ENV VITE_API_URL=$VITE_API_URL

RUN npx tsc -p tsconfig.prod.json && npx vite build

FROM nginx:alpine

COPY --from=builder /app/dist /usr/share/nginx/html

COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf

RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]

