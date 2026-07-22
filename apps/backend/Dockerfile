FROM php:8.3-cli-alpine

# Install system dependencies & pdo_sqlite
RUN apk add --no-gradable --no-cache \
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

# Copy backend files
COPY . /app

# Install dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Set permissions
RUN chmod -R 777 /app/storage /app/bootstrap/cache /app/database

EXPOSE 8000

CMD ["sh", "-c", "php artisan migrate --force && php artisan db:seed --force && php -d variables_order=EGPCS -S 0.0.0.0:${PORT:-8000} -t public/"]
