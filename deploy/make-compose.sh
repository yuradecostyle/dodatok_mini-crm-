#!/bin/sh
# Збирає deploy/compose.yaml: усі файли додатку вбудовуються в compose (архів base64),
# тому серверу не потрібен доступ до приватного GitHub-репозиторію.
# Використання: sh deploy/make-compose.sh  → потім розгорнути deploy/compose.yaml як Docker-проєкт "minicrm".
set -eu
cd "$(dirname "$0")/.."
VERSION=$(date -u +%Y%m%d%H%M%S)
TMP=$(mktemp -d)
cp index.html styles.css app.js manifest.json "$TMP/"
mkdir -p "$TMP/icons" && cp icons/* "$TMP/icons/"
# нова версія кешу service worker при кожному розгортанні
sed "s/const CACHE = 'minicrm-v[^']*';/const CACHE = 'minicrm-$VERSION';/" sw.js > "$TMP/sw.js"
SITE=$(tar -C "$TMP" -czf - . | base64 -w 0)
rm -rf "$TMP"
{
cat <<YAML
# Mini CRM — згенеровано deploy/make-compose.sh, версія $VERSION
name: minicrm
services:
  minicrm:
    image: nginx:1.27-alpine
    container_name: minicrm
    restart: unless-stopped
    entrypoint: ["/bin/sh", "-c"]
    command: ["rm -rf /usr/share/nginx/html/* && base64 -d /site.b64 | tar -xz -C /usr/share/nginx/html && exec nginx -g 'daemon off;'"]
    configs:
      - source: site
        target: /site.b64
      - source: nginx
        target: /etc/nginx/conf.d/default.conf
    networks:
      - marta_school_default
    healthcheck:
      test: ["CMD", "wget", "-qO-", "http://127.0.0.1/health"]
      interval: 30s
      timeout: 5s
      retries: 3
      start_period: 10s
networks:
  marta_school_default:
    external: true
configs:
  nginx:
    content: |
YAML
sed 's/^/      /; s/\$/$$/g' deploy/nginx.conf
cat <<YAML
  site:
    content: "$SITE"
YAML
} > deploy/compose.yaml
echo "deploy/compose.yaml: $(wc -c < deploy/compose.yaml) bytes, version $VERSION"
