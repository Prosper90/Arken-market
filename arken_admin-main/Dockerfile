# Stage 1: Build
FROM node:18 AS builder

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

# Pass production URLs at build time
ARG REACT_APP_APISERVICE_MAIN
ARG REACT_APP_siteUrl
ENV REACT_APP_APISERVICE_MAIN=$REACT_APP_APISERVICE_MAIN
ENV REACT_APP_siteUrl=$REACT_APP_siteUrl

# Disable source maps — cuts build time and memory usage in half
ENV GENERATE_SOURCEMAP=false

# Give Node enough heap so it doesn't OOM-kill on a 2GB server
ENV NODE_OPTIONS=--max-old-space-size=1536

RUN npm run build

# Stage 2: Serve with nginx
FROM nginx:alpine

COPY --from=builder /usr/src/app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3001

CMD ["nginx", "-g", "daemon off;"]
