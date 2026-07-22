FROM php:8.3-cli-alpine

# Install system dependencies
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

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app

# Copy backend application
COPY apps/backend /app

# Install PHP packages
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Touch database file & set permissions
RUN touch /app/database/database.sqlite \
    && chmod -R 777 /app/storage /app/bootstrap/cache /app/database

EXPOSE 8080

ENV PORT=8080
ENV APP_ENV=production
ENV APP_DEBUG=false
ENV DB_CONNECTION=sqlite
ENV DB_DATABASE=/app/database/database.sqlite

CMD ["sh", "-c", "php artisan config:clear && php artisan route:clear && php artisan migrate:fresh --seed --force && php artisan serve --host=0.0.0.0 --port=${PORT:-8080}"]
