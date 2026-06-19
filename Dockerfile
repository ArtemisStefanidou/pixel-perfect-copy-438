# --- Build stage ---
FROM oven/bun:1.2 AS build
WORKDIR /app

COPY package.json bun.lock* ./
RUN bun install --frozen-lockfile

COPY . .
RUN bunx vite build --config vite.cloudrun.config.ts

# --- Runtime stage (nginx on Cloud Run) ---
FROM nginx:1.27-alpine
COPY --from=build /app/dist-cloudrun /usr/share/nginx/html
COPY nginx.conf /etc/nginx/templates/default.conf.template

# Cloud Run injects $PORT (default 8080). The nginx image's envsubst entrypoint
# will render the template with $PORT before starting.
ENV PORT=8080
EXPOSE 8080
