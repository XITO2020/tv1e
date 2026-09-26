# Déploiement tuveuxun.expert sur le KVM 2 Hostinger — guide pas à pas (12/09/2026)

> Tout sur UNE machine : le frontend en HTML statique servi par nginx, le backend du bot
> (FastAPI + Ollama + Stripe) en service systemd derrière `api.tuveuxun.expert`.
> DNS constaté le 12/09 : `tuveuxun.expert` et `api.tuveuxun.expert` → 207.207.210.229,
> `www` → 207.207.210.107. **Vérifier dans hPanel que 207.207.210.229 est bien l'IP du KVM 2**
> et faire pointer `www` sur la même IP (enregistrement A), sinon certbot échouera sur www.

Temps réel estimé : **45 min si tout roule, 1 h 30 avec les accrocs habituels** (DNS, certbot,
pare-feu). Les longues attentes sont des téléchargements, pas du travail.

---

## 0. Avant de commencer (5 min)

- Un terminal Git Bash ouvert dans `sites/tuveuxun-expert/`.
- L'IP du KVM 2 et l'accès SSH root (clé `~/.ssh/id_ed25519` ou mot de passe hPanel).
- Les deux clés Stripe si tu veux le paiement en ligne dès ce soir (sinon le site bascule
  proprement sur le devis par mail, on les ajoutera plus tard sans redéployer).

Remplace `IP_KVM2` dans les commandes ci-dessous.

## 1. Test SSH (2 min)

```bash
ssh root@IP_KVM2 "uname -a && nproc && free -h | head -2 && df -h / | tail -1"
```

Attendu : 2 cœurs, ~8 Go, ~88 Go libres.

## 2. Backend : envoyer l'archive (1 min)

L'archive `_deploy/tuveuxun-backend.tar.gz` (44 Ko) contient `backend/` sans venv ni base, plus
`shared/evolution/` dans l'arborescence que `deploy.sh` attend.

```bash
scp _deploy/tuveuxun-backend.tar.gz root@IP_KVM2:/root/
```

## 3. Backend : lancer deploy.sh (10 à 15 min, surtout de l'attente)

```bash
ssh root@IP_KVM2 "cd /root && tar -xzf tuveuxun-backend.tar.gz && cd QISHIM-CORTEX-lite/sites/tuveuxun-expert/backend && bash deploy.sh"
```

Ce que tu vas voir passer : Ollama (2 min), swap, pull de `qwen2.5:3b` 3,5 Go (2 à 5 min),
copie du code, création de `/etc/bot-Tv1E.env`, venv Python (2 à 3 min), service systemd,
nginx `api.tuveuxun.expert`, certbot, logrotate. Le script s'arrête au premier échec et le dit.

Accroc classique : certbot échoue si le DNS `api.` n'est pas encore propagé ou si le port 80
est fermé. Dans hPanel, vérifier le pare-feu : ports 22, 80, 443 ouverts.

## 4. Clés Stripe (5 min, optionnel ce soir)

```bash
ssh root@IP_KVM2 "nano /etc/bot-Tv1E.env"
```

Remplir `STRIPE_SECRET_KEY=` et `STRIPE_WEBHOOK_SECRET=` puis :

```bash
ssh root@IP_KVM2 "systemctl restart bot-Tv1E && sleep 3 && curl -s http://127.0.0.1:8001/billing/offers"
```

Attendu : `"configured": true`. Côté Stripe, créer le webhook sur
`https://api.tuveuxun.expert/billing/webhook`.

## 5. Frontend : export statique local (3 à 4 min)

```bash
STATIC_EXPORT=1 NEXT_PUBLIC_BOT_URL=https://api.tuveuxun.expert npm run build
```

Résultat : dossier `out/` (~66 Mo), 12 pages, l'URL de l'API cuite dans les chunks JS.
Prouvé le 12/09 sur une copie isolée.

## 6. Frontend : envoyer + nginx + HTTPS (5 min)

```bash
ssh root@IP_KVM2 "mkdir -p /var/www/tuveuxun" && scp -r out/* root@IP_KVM2:/var/www/tuveuxun/
```

```bash
scp deploy-front.sh root@IP_KVM2:/root/ && ssh root@IP_KVM2 "bash /root/deploy-front.sh"
```

## 7. Vérification depuis ton poste (5 min)

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://tuveuxun.expert/tarifs && curl -s https://api.tuveuxun.expert/health
```

Puis dans le navigateur : `/tarifs` affiche 690 / 1 900 / 3 900, le chatbot répond (lent, c'est
annoncé), et les boutons « Payer en ligne » n'apparaissent que si Stripe est configuré.

## Mise à jour ultérieure

- Frontend : refaire l'étape 5 puis `scp -r out/* ...`. Rien d'autre.
- Backend : régénérer l'archive (voir journal du 12/09) puis étapes 2-3 ; `deploy.sh` ne
  touche jamais à `/etc/bot-Tv1E.env`.

## Ce que ce guide ne couvre pas

- Le visuel `carousel/openclaw.png` sert encore la fiche Hermes.
- Les tests `backend/test_bot.py` et `test_intelligence.py` : à lancer contre
  `BOT_TEST_BASE=https://api.tuveuxun.expert` une fois le bot en ligne.
