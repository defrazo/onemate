#!/bin/sh
set -e

if [ ! -f "public/index.php" ]; then
    cp -a /var/www/html-public-src/. public/
fi

if [ -z "$APP_KEY" ] || ! grep -q "^APP_KEY=base64" .env 2>/dev/null; then
    php artisan key:generate --force || true
fi

if [ "$RUN_MIGRATIONS" = "true" ]; then
    php artisan migrate --force
fi

exec "$@"