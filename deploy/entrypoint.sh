#!/bin/sh
# Старт контейнера: дані й секрети живуть у томі /data, тому переживають оновлення.
set -e
mkdir -p /data/storage/framework/cache/data /data/storage/framework/sessions /data/storage/framework/views /data/storage/logs /data/storage/app

# Ключ шифрування Laravel: з оточення або згенерований один раз
if [ -z "$APP_KEY" ]; then
  if [ ! -s /data/app_key ]; then
    php -r 'echo "base64:".base64_encode(random_bytes(32));' > /data/app_key
    chmod 600 /data/app_key
  fi
  export APP_KEY="$(cat /data/app_key)"
fi

export DB_CONNECTION=sqlite DB_DATABASE=/data/database.sqlite LARAVEL_STORAGE_PATH=/data/storage
[ -f /data/database.sqlite ] || touch /data/database.sqlite

# storage Laravel → у томі
if [ ! -L /app/storage ]; then rm -rf /app/storage && ln -s /data/storage /app/storage; fi

if [ "${RUN_MIGRATIONS:-1}" = "1" ]; then
  php artisan migrate --force --no-interaction
  php artisan owner:ensure || true
  php artisan config:cache && php artisan route:cache && php artisan view:cache
fi

exec "$@"
