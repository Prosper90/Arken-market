# Stage 1: Build
FROM node:22 AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

# Bake production API/socket URLs so no .env file is needed on the server.
# These are relative paths — nginx proxies /api/ and /socket.io/ internally.
ENV VITE_API_HOST=/api/
ENV VITE_SOCKET_URL=

RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

COPY --from=builder /usr/src/app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]
