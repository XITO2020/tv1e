# Passation → session tuveuxun : page « Les nouveautés de septembre 2026 » (15/09/2026)

> Écrit par la session « Briques de croissance ». **Aucun build, aucun déploiement lancé ici**
> (consigne Naim : la session tuveuxun s'en charge après ses correctifs mobile). Tout est prêt.

## Ce qui a été ajouté au site

| Fichier | Rôle | État |
|---|---|---|
| `app/monthly-agents/page.tsx` | nouvelle page, édition de cartes, 23 agents (10 prêts + 13 pré-commande 2027) | `tsc` 0 erreur, **rendu non vérifié** (pas de dev server, pas de build) |
| `app/agents/b2b-agents.ts` | données GÉNÉRÉES (ne pas éditer) par `agents/_chassis/export_catalogue.py` depuis `agents/<slug>/README.md` + `agents/_chassis/cards.json` | 23 entrées |
| `app/agents/page.tsx` | restaurée à ses 20 fiches d'origine + **un lien** « Les nouveautés de septembre 2026 : 23 agents » sous le hero | tsc OK |
| `app/sitemap.ts` | route `/monthly-agents` ajoutée | OK |
| `public/monthly/<slug>.webp` | 23 covers 640×960, RealVisXL 5 via ComfyUI, style photoréaliste éco-tech vert d'eau | génération en cours au moment de l'écriture, voir `ls public/monthly` |
| `public/carousel/_placeholder-agent.webp` | placeholder honnête si une cover manque (la page teste l'existence au build) | OK |

## Décisions de Naim encodées

- Prix des cartes plafonnés à **1 770 €** (`agents/_chassis/cards.json`) : Devis-Relance 490/990,
  Guichet-Mail 490/990, Asso-Mobilise 690/1 190, Edge-Optimizer 690/1 190, Marchés-Subventions
  990/1 470, Factur-Agent 1 270/1 770, MairieBot 1 470 (souverain seul), Délib-Scribe 1 470,
  Conformité-Agent 1 770, Traffic-Sentinel 1 770. Toujours « MAJ 120 € / 4 mois · sans abonnement ».
- Agents 2027 (dont les 3 add-ons MegaStudio) : mention imposée **« En vente en 2027 selon
  puissance du marché et Qbits »**, CTA « Être prévenu en 2027 ».
- Cinq propriétés par carte (1 à 5) : Autonomie, Souveraineté, Intégration, Impact, Installation.
- `/tarifs` n'a pas été touché (690 / 1 900 / 3 900 pour les forfaits).

## À faire côté session tuveuxun

1. Vérifier le rendu de `/monthly-agents` desktop + mobile (grille 1 / 2 / 3 colonnes, cartes en
   `aspect-[2/3]`, ancres rapides = 23 puces, stats à 5 segments). Le hero de `/agents` dit encore
   « 30 agents / 37 outils » : à ajuster ou non.
2. Si une cover est ratée : `python agents/_chassis/generate_covers.py --style realistic --only <slug> --force`
   (ComfyUI allumé). Modifier la scène dans `agents/<slug>/covers/prompt.txt` (objet, lieu, lumière,
   jamais « a robot »).
3. Si un texte de carte est à changer : éditer le `README.md` de l'agent, puis relancer
   `python agents/_chassis/export_catalogue.py` (jamais `b2b-agents.ts` à la main).
4. Build + déploiement habituels (`deploy-traefik/deploy.bat`).

## Preuves disponibles

- 10 agents × 4 tests verts (`FAKE_LLM=1 python -m pytest tests -q` dans chaque `agents/<slug>/`).
- `npx tsc --noEmit` = 0 erreur après ajout de la page.
