#!/bin/bash
# =====================================================================================
# tuveuxun.expert — deploiement du backend sur le VPS Hostinger KVM 2 (Ubuntu/Debian).
#
# Corrige le 07/09/2026 apres audit. Ce que l'ancienne version cassait :
#   1. Elle ne copiait QUE main.py/faq.md/system_prompt.txt/requirements.txt, alors que
#      main.py importe billing, evolution et store -> le service crashait au demarrage
#      (ImportError), silencieusement, a chaque deploiement.
#   2. Aucune variable Stripe dans systemd -> billing.py repondait 503
#      "billing_not_configured" et TOUS les boutons de paiement disparaissaient du site.
#      Zero encaissement possible.
#   3. Le rate limit Nginx (10 req/min) s'appliquait AUSSI a /billing/webhook -> les
#      re-essais de Stripe pouvaient etre rejetes, donc des paiements non enregistres.
#   4. Aucun swap sur une machine 8 Go qui charge un modele de langue : risque d'OOM.
#
# Les SECRETS ne sont plus dans l'unite systemd (lisible par tous) mais dans
# /etc/bot-Tv1E.env (chmod 600). Le script le CREE avec des trous si absent, et ne
# l'ECRASE JAMAIS s'il existe deja : relancer deploy.sh ne detruit pas tes cles.
#
# Pre-requis : SSH root, Nginx installe, DNS api.tuveuxun.expert -> IP du VPS.
# Usage : depuis le dossier backend/ du depot clone sur le serveur :  ./deploy.sh
# =====================================================================================

set -euo pipefail

APP_DIR="/opt/bot-Tv1E"
USER_RUN="bot-Tv1E"
SUBDOMAIN="api.tuveuxun.expert"
ENV_FILE="/etc/bot-Tv1E.env"
REPO_ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"   # racine QISHIM-CORTEX

echo "==> 1/11 · Install Ollama si absent"
if ! command -v ollama &> /dev/null; then
  curl -fsSL https://ollama.ai/install.sh | sh
fi

echo "==> 2/11 · Swap 2 Go (VPS 8 Go sans GPU : evite l'OOM au chargement du modele)"
if ! swapon --show | grep -q .; then
  fallocate -l 2G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
  echo "    swap 2 Go active"
else
  echo "    swap deja present, rien a faire"
fi

echo "==> 3/11 · Pull Qwen2.5 3B Q5_K_M (~3,5 Go en RAM)"
ollama pull qwen2.5:3b-instruct-q5_K_M

echo "==> 4/11 · Ollama : CPU seul, 1 requete a la fois"
mkdir -p /etc/systemd/system/ollama.service.d
cat > /etc/systemd/system/ollama.service.d/override.conf <<'EOF'
[Service]
Environment="OLLAMA_HOST=127.0.0.1:11434"
Environment="OLLAMA_NUM_PARALLEL=1"
Environment="OLLAMA_MAX_LOADED_MODELS=1"
Environment="OLLAMA_KEEP_ALIVE=24h"
EOF
systemctl daemon-reload
systemctl enable --now ollama
systemctl restart ollama

echo "==> 5/11 · Utilisateur systeme sans shell"
id "$USER_RUN" &>/dev/null || useradd -r -s /usr/sbin/nologin "$USER_RUN"

echo "==> 6/11 · Copie du code (TOUS les modules, pas seulement main.py)"
mkdir -p "$APP_DIR"

# main.py importe billing, evolution et store : les oublier = ImportError au boot.
for f in main.py billing.py evolution.py store.py faq_kb.py directions-naim.json \
         faq.md faq-kb.json system_prompt.txt requirements.txt; do
  if [ -f "$f" ]; then
    cp "$f" "$APP_DIR/"
  else
    echo "    ATTENTION : $f introuvable dans le depot" >&2
  fi
done

# Dossier des manifestes d'auto-evolution (produits signes).
[ -d evolution ] && cp -r evolution "$APP_DIR/"

# Socle d'auto-evolution partage : main.py le cherche en remontant les dossiers
# parents jusqu'a trouver shared/evolution/manifest.py. On le place donc DANS $APP_DIR.
if [ -d "$REPO_ROOT/shared/evolution" ]; then
  mkdir -p "$APP_DIR/shared"
  cp -r "$REPO_ROOT/shared/evolution" "$APP_DIR/shared/"
  echo "    socle shared/evolution copie"
else
  echo "    ATTENTION : $REPO_ROOT/shared/evolution absent — /evolution/* repondra 404" >&2
fi

chown -R "$USER_RUN:$USER_RUN" "$APP_DIR"

echo "==> 7/11 · Environnement + SECRETS (/etc/bot-Tv1E.env, chmod 600)"
if [ ! -f "$ENV_FILE" ]; then
  cat > "$ENV_FILE" <<'EOF'
# tuveuxun.expert — secrets et reglages du backend. NE PAS COMMITTER.
# Rempli une seule fois ; deploy.sh ne l'ecrase jamais.

# ---- Modele de langue (VPS 8 Go / 2 vCPU, PAS de GPU) ----
OLLAMA_URL=http://127.0.0.1:11434
BOT_MODEL=qwen2.5:3b-instruct-q5_K_M
BOT_TEMPERATURE=0.5
BOT_MAX_TOKENS=400
BOT_NUM_GPU=0
BOT_NUM_THREAD=2
BOT_KEEP_ALIVE=24h
BOT_OLLAMA_TIMEOUT=180
BOT_WARMUP=1
BOT_THINK=false

# ---- Site ----
SITE_URL=https://tuveuxun.expert

# ---- Stripe : SANS CES DEUX CLES, AUCUN PAIEMENT N'EST POSSIBLE ----
# Les boutons « Payer en ligne » disparaissent du site tant qu'elles sont vides.
# Tableau de bord Stripe -> Developpeurs -> Cles API (cle SECRETE, pas la publique).
STRIPE_SECRET_KEY=
# Webhook : creer un endpoint sur https://api.tuveuxun.expert/billing/webhook
# puis coller ici le secret de signature (commence par whsec_).
STRIPE_WEBHOOK_SECRET=

# ---- Auto-evolution ----
EVOLUTION_PRODUCT=mairiebot
EOF
  chmod 600 "$ENV_FILE"
  chown root:root "$ENV_FILE"
  echo "    CREE : $ENV_FILE — remplir STRIPE_SECRET_KEY et STRIPE_WEBHOOK_SECRET"
else
  echo "    $ENV_FILE existe deja, conserve tel quel"
fi

echo "==> 8/11 · Environnement Python"
cd "$APP_DIR"
[ -d venv ] || python3 -m venv venv
./venv/bin/pip install --upgrade pip --quiet
./venv/bin/pip install -r requirements.txt --quiet
chown -R "$USER_RUN:$USER_RUN" "$APP_DIR"

echo "==> 9/11 · Service systemd"
cat > /etc/systemd/system/bot-Tv1E.service <<EOF
[Unit]
Description=Bot Tv1E · tuveuxun.expert FastAPI backend
After=network.target ollama.service
Wants=ollama.service

[Service]
Type=simple
User=$USER_RUN
WorkingDirectory=$APP_DIR
# Secrets et reglages hors de l'unite (fichier chmod 600).
EnvironmentFile=$ENV_FILE
ExecStart=$APP_DIR/venv/bin/uvicorn main:app --host 127.0.0.1 --port 8001 --workers 1
Restart=on-failure
RestartSec=10
# Le prechauffage du modele peut prendre plus d'une minute sur 2 vCPU.
TimeoutStartSec=300

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable bot-Tv1E
systemctl restart bot-Tv1E

echo "==> 10/11 · Nginx + HTTPS"
cat > /etc/nginx/sites-available/$SUBDOMAIN <<EOF
server {
    listen 80;
    server_name $SUBDOMAIN;

    # Webhook Stripe : AUCUN rate limit. Stripe re-essaie en rafale apres un echec,
    # et un 503 ici = paiement encaisse cote Stripe mais jamais enregistre chez nous.
    location = /billing/webhook {
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_request_buffering off;
        proxy_read_timeout 60s;
    }

    location / {
        # Rate limit uniquement ici (le chatbot), jamais sur le webhook.
        limit_req zone=bot_zone burst=20 nodelay;
        proxy_pass http://127.0.0.1:8001;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        # Generation CPU d'un modele 3B : compter jusqu'a ~40 s par reponse.
        proxy_read_timeout 300s;
    }
}
EOF

if ! grep -q "bot_zone" /etc/nginx/nginx.conf; then
  sed -i '/http {/a \    limit_req_zone $binary_remote_addr zone=bot_zone:10m rate=10r/m;' /etc/nginx/nginx.conf
fi

ln -sf /etc/nginx/sites-available/$SUBDOMAIN /etc/nginx/sites-enabled/
nginx -t && systemctl reload nginx

if ! command -v certbot &> /dev/null; then
  apt-get update && apt-get install -y certbot python3-certbot-nginx
fi
certbot --nginx -d "$SUBDOMAIN" --non-interactive --agree-tos -m tabascocity@proton.me --redirect

echo "==> 11/11 · Rotation des logs + sauvegarde quotidienne de la base"
cat > /etc/logrotate.d/bot-Tv1E <<EOF
$APP_DIR/chat.log {
    weekly
    rotate 8
    compress
    missingok
    notifempty
    copytruncate
    su $USER_RUN $USER_RUN
}
EOF

# data.db contient les prospects ET les commandes payees : une perte = perte de CA.
mkdir -p /var/backups/bot-Tv1E
cat > /etc/cron.daily/bot-Tv1E-backup <<EOF
#!/bin/sh
d=\$(date +%Y-%m-%d)
sqlite3 "$APP_DIR/data.db" ".backup '/var/backups/bot-Tv1E/data_\$d.db'" 2>/dev/null \\
  || cp "$APP_DIR/data.db" "/var/backups/bot-Tv1E/data_\$d.db" 2>/dev/null || exit 0
find /var/backups/bot-Tv1E -name 'data_*.db' -mtime +30 -delete
EOF
chmod +x /etc/cron.daily/bot-Tv1E-backup

echo ""
echo "==> Verification"
sleep 5
curl -s "https://$SUBDOMAIN/health" || echo "  Health KO — voir : journalctl -u bot-Tv1E -n 50"
echo ""
echo "--- ETAT DU PAIEMENT ---"
if grep -q '^STRIPE_SECRET_KEY=.\+' "$ENV_FILE"; then
  echo "  Stripe configure."
else
  echo "  !! STRIPE_SECRET_KEY VIDE -> aucun bouton de paiement ne s'affichera sur le site."
  echo "     Editer $ENV_FILE puis : systemctl restart bot-Tv1E"
fi
echo ""
echo "==> Termine."
echo "    Service   : systemctl status bot-Tv1E"
echo "    Logs      : journalctl -u bot-Tv1E -f"
echo "    Secrets   : $ENV_FILE"
echo "    Endpoint  : https://$SUBDOMAIN/chat"
echo "    Webhook   : https://$SUBDOMAIN/billing/webhook  (a declarer dans Stripe)"
