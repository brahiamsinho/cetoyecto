FROM composer:2.7 AS builder

RUN composer create-project --no-interaction --prefer-dist laravel/laravel:^10.0 /app

RUN composer --working-dir=/app require --no-interaction laravel/sanctum:^3.2
RUN composer --working-dir=/app require --no-interaction stripe/stripe-php:^15.0
RUN composer --working-dir=/app require --no-interaction --ignore-platform-reqs phpoffice/phpspreadsheet
RUN composer --working-dir=/app require --no-interaction --ignore-platform-reqs dompdf/dompdf

FROM php:8.2-fpm

RUN apt-get update && apt-get install -y \
    libpq-dev \
    libzip-dev \
    zip \
    unzip \
    && docker-php-ext-install pdo pdo_pgsql pgsql zip bcmath

COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

COPY --from=builder /app .

COPY backend/composer.json composer.json
COPY backend/app app/
COPY backend/config config/
COPY backend/database database/
COPY backend/routes routes/
COPY backend/resources resources/
COPY backend/.env.example .env.example

RUN rm -f database/migrations/2014_10_12_000000_create_users_table.php && \
    cp .env.example .env && \
    php artisan key:generate --force && \
    php artisan storage:link && \
    php artisan config:clear && \
    true

RUN mkdir -p bootstrap/cache && \
    chown -R www-data:www-data storage bootstrap/cache && \
    chmod -R 775 storage bootstrap/cache

EXPOSE 8000
CMD ["php", "artisan", "serve", "--host=0.0.0.0", "--port=8000"]
