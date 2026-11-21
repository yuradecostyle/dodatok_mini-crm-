# Mini CRM — Laravel на FrankenPHP (вебсервер + PHP в одному процесі)

# ---------- 1. Залежності PHP ----------
FROM composer:2 AS vendor
# Додаткові CA-сертифікати (у репозиторії порожньо; потрібні лише для локальної збірки за проксі)
COPY deploy/ca-certs/ /usr/local/share/ca-certificates/extra/
RUN update-ca-certificates 2>/dev/null || true
# SSL_CERT_FILE передається лише при локальній збірці за проксі
ARG SSL_CERT_FILE
ARG COMPOSER_MAX_PARALLEL_HTTP=6
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install --no-dev --no-scripts --no-autoloader --prefer-dist --no-interaction --no-progress --ignore-platform-reqs
COPY . .
RUN rm -rf deploy/ca-certs tests .env \
 && composer dump-autoload --optimize --no-dev --no-interaction --no-scripts

# ---------- 2. Робочий образ ----------
FROM dunglas/frankenphp:1-php8.3-bookworm

COPY deploy/ca-certs/ /usr/local/share/ca-certificates/extra/
RUN update-ca-certificates 2>/dev/null || true

# INSTALL_EXT=0 лише для локальної перевірки без доступу до apt
ARG INSTALL_EXT=1
RUN if [ "$INSTALL_EXT" = "1" ]; then install-php-extensions pdo_sqlite gmp bcmath intl opcache pcntl; fi

ENV TZ=Europe/Kyiv \
    APP_ENV=production \
    APP_DEBUG=false \
    SERVER_NAME=":80"

WORKDIR /app
COPY --from=vendor /app /app
RUN php artisan package:discover --ansi \
 && cp deploy/php.ini "$PHP_INI_DIR/conf.d/zz-minicrm.ini" \
 && chmod +x deploy/entrypoint.sh

VOLUME /data
EXPOSE 80
ENTRYPOINT ["/app/deploy/entrypoint.sh"]
CMD ["frankenphp", "php-server", "--root", "/app/public", "--listen", ":80"]
