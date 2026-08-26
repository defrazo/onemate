FROM node:22-bookworm-slim AS build

WORKDIR /app

ARG VITE_IPINFO_API_KEY
ARG VITE_MYMEMORY_API_KEY
ARG VITE_OPENWEATHER_API_KEY

ENV VITE_IPINFO_API_KEY=$VITE_IPINFO_API_KEY \
    VITE_MYMEMORY_API_KEY=$VITE_MYMEMORY_API_KEY \
    VITE_OPENWEATHER_API_KEY=$VITE_OPENWEATHER_API_KEY

COPY package*.json ./

RUN npm ci --no-audit --no-fund --legacy-peer-deps || \
    npm install --no-audit --no-fund --legacy-peer-deps

COPY . .

RUN npm run build


FROM nginx:1.27-alpine

RUN rm /etc/nginx/conf.d/default.conf

COPY nginx.conf /etc/nginx/conf.d/app.conf

COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]