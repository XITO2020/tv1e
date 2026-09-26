# backend/evolution/ — dépôt des mises à jour

Ce dossier est servi par `evolution.py`. **Un sous-dossier par produit** :

```
evolution/
  mairiebot/
    manifest.signed.json    <- ce que les agents lisent tous les 4 mois
    1.2.0.tar.gz            <- l'archive, servie uniquement après paiement
  docusweep/
    ...
```

## Publier une mise à jour, en trois gestes

1. Écrire le manifeste en clair (modèle : `shared/evolution/manifest.example.json`),
   avec le `sha256` de l'archive :
   `python -c "from shared.evolution.signing import sha256_file; print(sha256_file('1.2.0.tar.gz'))"`
2. Le signer — le secret est dans `EVOLUTION_SECRET` (`.env`, jamais commité) :
   `python shared/evolution/manifest.py --publish mairiebot.json --out backend/evolution/mairiebot/manifest.signed.json`
3. Déposer `1.2.0.tar.gz` à côté. C'est en ligne.

## Ce que le serveur garantit

- Le manifeste est public mais **signé** : altéré, il est ignoré par les agents.
- L'archive n'est servie que si une commande `maj-agent` **payée** existe pour ce
  produit, cette version et cette session Stripe (`store.paid_update`).
- Sans manifeste → 404 → l'agent chez le client comprend « rien de nouveau ».

## Ce que ce dossier ne contient jamais

Le secret, une archive non listée dans un manifeste, ou une version « adaptée »
à un client. **Une mise à jour, la même pour tous** — sinon 20 clients = 20 chantiers.
