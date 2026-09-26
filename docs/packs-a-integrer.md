# tuveuxun.expert — 3 packs "Souveraineté IA"

Vitrine consultant Naim, orientée particuliers + TPE. Prix TTC, facturation **SASU TabascoCity** (SIREN 980 463 798, RCS Versailles).

Voir aussi : [[project_ai_expert_service_3sites]], [[project_cours_ia_two_track]].

---

## Pack A — Kit Pilote IA installé chez vous

**Prix : 297€ TTC (one-shot)**

### Ce que le client reçoit
- Installation du **Hub de Pilotage des IA** sur sa machine (Open WebUI + OpenRouter + Ollama si voulu)
- Configuration de sa clé OpenRouter (accompagnée, jamais visible côté Naim)
- 6 presets prêts à l'emploi (Écriture pro, Réflexion profonde, Rapide économique, Privé, Code, Vision)
- 1h d'appel visio pour la prise en main
- Guide PDF de 15 pages : glossaire 15 termes + FAQ + dépannage
- 15 jours de support asynchrone (email, borné à 15 min de réponse)

### Pour qui
Particuliers curieux qui veulent quitter ChatGPT Plus, TPE qui veulent une station IA privée et souveraine sur leur machine.

### Argument de vente
> *"Vous avez chez vous une station IA privée qui coûte 5-15€/mois en API et remplace 80% de vos usages ChatGPT Plus (22€/mois), avec accès à 200+ modèles au choix."*

### Coût mensuel client APRÈS installation
5-15€ d'API OpenRouter en usage moyen (vs 22€/mois ChatGPT Plus, vs 40€/mois ChatGPT Pro).

---

## Pack B — Formation IA 10h + Kit

**Prix : 990€ TTC (one-shot)** — négociable dans la fourchette **500 à 1500€** selon profil client.

### Plancher : 500€
Ce que l'on facture au client #1 en août 2026 (finance le déploiement TC).
**Ne JAMAIS descendre en-dessous** (perte de crédibilité + retour au piège formateur, cf. [[feedback_job_target]]).

### Ce que le client reçoit
- **Tout le contenu du Pack A** (installation, hub, presets, 15 j support)
- **10 heures d'accompagnement** (5 séances × 2h, présentiel Yvelines ou visio)
- Cas d'usage sur-mesure (influenceuse IA pour shop / usage pro / créatif / autre)
- **Guide PDF étendu 25 pages** (glossaire 30 termes + 5 chapitres complets)
- **1 mois de support asynchrone** (email + 30 min/semaine en visio)
- **Bonus démo Blender MCP** en séance 4 (génération 3D live, aucun formateur FR équivalent)

### Pour qui
E-commerçants, créateurs de contenu, indépendants qui veulent monter une capacité IA vraiment maîtrisée en un mois.

### Objectif à H+30 jours
Le client produit seul 5 posts/semaine sur son compte pro (photos + captions + vidéos courtes), avec un persona IA verrouillé et un pipeline reproductible.

### Coûts outils annoncés séparément (transparents)
| Poste | Coût mensuel client |
|---|---|
| OpenRouter (LLM captions) | 5-15€ |
| Higgsfield Lite (persona + vidéo) | 10-20€ |
| ElevenLabs Creator (voix) | 22€ |
| **Total outillage / mois** | **~40-55€** |

Ces coûts sont **du client**, jamais fondus dans le prix des cours.

---

## Pack C — Agent Influenceuse IA

**Prix : 149€/mois TTC (abonnement)**

### ⚠️ Statut : À CONSTRUIRE (4-8 semaines de développement)

Dépend d'un nouveau projet dans `agents/influenceuse-ia/`, chantier séparé à valider par Naim.
Ne PAS commercialiser Pack C tant que l'agent n'est pas fonctionnel et testé sur 2-3 comptes réels.

### Ce que le client recevra (à terme)
- Agent autonome qui **génère 5 posts/semaine** sur son influenceuse (photos + captions + vidéos courtes)
- Publication semi-auto (le client valide avant de publier, ou active le mode auto-publish)
- **Catalogue produits synchronisé** (client ajoute un produit → agent le met en avant)
- Dashboard perso pour piloter le tempo, les thèmes, les hashtags
- Support inclus

### Pour qui
E-commerçants qui n'ont pas le temps de gérer un compte IG/TikTok mais qui veulent une présence pro régulière.

### Modèle éco
- 149€/mois × 10 clients = **1490€ MRR** = seul chemin scale-able vers rentabilité IA hors TC

---

## Doctrine tarifaire (règles gravées)

| Règle | Pourquoi |
|---|---|
| Facturer toujours SASU TabascoCity | Cohérence banque/vitrine, cf. [[legal_tabascocity_sasu]] et [[feedback_external_docs_framing]] |
| Pack A et B = prestation ponctuelle (pas de récurrent) | Évite le piège "support à vie gratuit" |
| Pack C = seul récurrent (MRR) | Seul chemin scale-able |
| Coûts outils toujours annoncés séparément | Transparence = crédibilité consultant |
| 1 client Pack B (990€) = 3-5 mois d'infra TC financés | Justifie l'effort en cash flow |

## Anti-pièges (cf. [[feedback_job_target]])

- Ne JAMAIS descendre Pack B sous 500€ (retour piège formateur pur)
- Ne JAMAIS proposer "cours à volume" en Pack B, garder hi-touch
- Ne JAMAIS packager Pack B en "40h de formation OPCO" (canal formation classique = perte identité consultant)
- Pack C = seul chemin de sortie du hi-touch, tout doit converger vers lui à terme

## Livrables tuveuxun.expert (côté site à coder)

Quand le site tuveuxun.expert sera live :
- Page `/packs` : les 3 cartes ci-dessus
- Bouton "Réserver un appel" (Calendly ou intégré)
- FAQ : Coûts outils / Qui est Naim / Comment ça marche / Combien de temps ça prend
- Testimonial client #1 (à récupérer après la 10e heure)
- Footer : mentions SASU TabascoCity

Les composants front seront à cabler dans `sites/tuveuxun-expert/` (à créer) — hors scope de ce cours particulier.
