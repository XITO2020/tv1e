#!/bin/bash
# Redeploie le FRONTEND de tuveuxun.expert en ligne (KVM 2 Hostinger, Traefik).
# Build statique -> transfert -> redemarrage du conteneur nginx. ~2-3 min.
# Le backend chatbot (api.tuveuxun.expert) n'est PAS touche ici.
set -euo pipefail
cd "$(dirname "$0")/.."   # racine du site

SRV="root@187.77.144.220"

echo "== 1/3 build statique (cache .next-export, isole du .next d'un dev en cours) =="
# On ne touche PAS a .next : un `next dev` peut tourner en meme temps.
# STATIC_EXPORT => output:export + distDir:.next-export ; Next 14 ecrit l'export
# statique DIRECTEMENT dans .next-export/ (pas out/).
rm -rf .next-export
STATIC_EXPORT=1 NEXT_PUBLIC_BOT_URL=https://api.tuveuxun.expert npm run build

echo "== 2/3 transfert =="
tar czf deploy-traefik/tuveuxun-out.tgz -C .next-export .
scp deploy-traefik/tuveuxun-out.tgz "$SRV":/docker/tuveuxun/

echo "== 3/3 mise en ligne =="
ssh "$SRV" "cd /docker/tuveuxun && rm -rf out && mkdir out && tar xzf tuveuxun-out.tgz -C out && rm -f tuveuxun-out.tgz && docker restart tuveuxun-web"
rm -f deploy-traefik/tuveuxun-out.tgz

echo ""
echo "== EN LIGNE : https://tuveuxun.expert =="
