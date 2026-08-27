# --- Build stage ---
FROM node:20-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .

# Vite build-time env vars (VITE_*) — qiymat build paytida ichiga yoziladi,
# konteyner ishga tushganda o'zgartirib bo'lmaydi. Berilmasa src ichidagi
# standart manzillar qoladi (.env.example ga qarang).
#   docker build --build-arg VITE_API_URL=... --build-arg VITE_GATEWAY_URL=...
ARG VITE_API_URL
ARG VITE_GATEWAY_URL
ARG VITE_ERI_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_GATEWAY_URL=$VITE_GATEWAY_URL
ENV VITE_ERI_URL=$VITE_ERI_URL

RUN npm run build

# --- Serve stage ---
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
