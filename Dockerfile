FROM php:8.3-cli-alpine

RUN apk add --no-cache \
    sqlite-dev \
    libpng-dev \
    oniguruma-dev \
    libxml2-dev \
    zip \
    unzip \
    git \
    curl \
    && docker-php-ext-install pdo pdo_sqlite mbstring bcmath

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

COPY apps/backend /app

RUN composer install --no-dev --optimize-autoloader --no-interaction

RUN mkdir -p /app/storage /app/bootstrap/cache /app/database \
    && chmod -R 777 /app/storage /app/bootstrap/cache /app/database

EXPOSE 8080

ENV PORT=8080
ENV APP_ENV=production
ENV APP_DEBUG=false
ENV DB_CONNECTION=sqlite
ENV DB_DATABASE=/app/storage/database.sqlite

CMD ["sh", "-c", "mkdir -p /app/storage && test -f /app/storage/database.sqlite || touch /app/storage/database.sqlite && chmod 777 /app/storage/database.sqlite && php artisan config:clear && php artisan route:clear && php artisan migrate --force && php -d variables_order=EGPCS -S 0.0.0.0:${PORT:-8080} -t public/ public/index.php"]
