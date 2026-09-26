#!/bin/bash
# =====================================================================================
# tuveuxun.expert — frontend STATIQUE servi par nginx sur le KVM 2 Hostinger.
#
# Cree le 12/09/2026. Le site Next.js est exporte en HTML statique (STATIC_EXPORT=1 npm run
# build -> dossier out/), envoye par scp dans /var/www/tuveuxun, et nginx le sert avec HTTPS.
# Zero Node sur le serveur : les 2 vCPU / 8 Go restent pour Ollama + le bot.
#
# Pre-requis : SSH root, DNS tuveuxun.expert + www -> IP du VPS, dossier /var/www/tuveuxun
# deja rempli par scp (voir DEPLOY-KVM2.md). Relancer ce script est sans danger.
# Usage (sur le serveur) : bash deploy-front.sh
# =====================================================================================

set -euo pipefail

DOMAIN="tuveuxun.expert"
WEBROOT="/var/www/tuveuxun"
MAIL="tabascocity@proton.me"

echo "==> 1/4 · nginx"
if ! command -v nginx &> /dev/null; then
  apt-get update && apt-get install -y nginx
fi
systemctl enable --now nginx

echo "==> 2/4 · Dossier web"
mkdir -p "$WEBROOT"
if [ ! -f "$WEBROOT/index.html" ]; then
  echo "    ATTENTION : $WEBROOT/index.html absent — envoie d'abord le dossier out/ par scp" >&2
fi
chown -R www-data:www-data "$WEBROOT"

echo "==> 3/4 · Vhost $DOMAIN"
cat > /etc/nginx/sites-available/$DOMAIN <<EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;
    root $WEBROOT;
    index index.html;

    # Export Next.js : /tarifs -> tarifs.html, /marketplace -> marketplace.html
    location / {
        try_files \$uri \$uri.html \$uri/ =404;
    }

    # Assets versionnes par Next : cache long
    location /_next/static/ {
        expires 365d;
        add_header Cache-Control "public, immutable";
    }

    # Modeles 3D, musiques, images : cache 7 jours
    location ~* \.(glb|gltf|mp3|ogg|png|jpg|jpeg|webp|svg|woff2)$ {
        expires 7d;
        add_header Cache-Control "public";
    }

    error_page 404 /404.html;
    gzip on;
    gzip_types text/html text/css application/javascript application/json image/svg+xml;
}
EOF

ln -sf /etc/nginx/sites-available/$DOMAIN /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl reload nginx

echo "==> 4/4 · HTTPS (certbot)"
if ! command -v certbot &> /dev/null; then
  apt-get update && apt-get install -y certbot python3-certbot-nginx
fi
certbot --nginx -d "$DOMAIN" -d "www.$DOMAIN" --non-interactive --agree-tos -m "$MAIL" --redirect

echo "==> Verification"
curl -s -o /dev/null -w "https://$DOMAIN/        -> %{http_code}\n" "https://$DOMAIN/"
curl -s -o /dev/null -w "https://$DOMAIN/tarifs  -> %{http_code}\n" "https://$DOMAIN/tarifs"
echo "==> Termine."
