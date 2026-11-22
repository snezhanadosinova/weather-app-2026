FROM node:24-alpine AS development

RUN apk add --no-cache git openssh-client
WORKDIR /app
RUN mkdir -p /app/node_modules && chown -R node:node /app
COPY docker/dev-entrypoint.sh /usr/local/bin/weather-dev
USER node
EXPOSE 5173
ENTRYPOINT ["sh", "/usr/local/bin/weather-dev"]
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0", "--port", "5173", "--strictPort"]

FROM node:24-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
ARG VITE_WEATHER_API_KEY
RUN test -n "$VITE_WEATHER_API_KEY" && npm run build

FROM nginx:stable-alpine AS runtime
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
