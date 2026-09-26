# ADR-001: Architecture chatbot agent Tv1E

**Status:** Proposed
**Date:** 2026-05-05
**Deciders:** Naim (proprietaire SASU Tabasco City)

## Context

Le site tuveuxun.expert (positionnement : Consultant IA pour PME / mairies / associations)
doit afficher un chatbot fonctionnel pour signaler la credibilite ("si je vends de l'IA
et que mon site n'a pas de bot, ca ne fait pas serieux").

**Contraintes :**
- **Budget = 0€/mois** : pas d'API payante OpenAI/Anthropic, tout doit tourner local
- **VPS dispo** : Hostinger KVM2 (OpenClaw deja installe)
- **Cible publique** : PME/mairies/asso, **tech-anxieuse** — le bot doit etre ultra-cadre,
 zero hallucination sur les prix/delais, refus poli des questions hors-sujet
- **Delai MVP** : 2–3 sessions de travail
- **Frontend deja fait** : `Chatbot.tsx` en mode mocked, structure complete (FAB, window,
 conversation, suggested questions, typing indicator, footer mock_mode)

**Forces en jeu :**
- Risque commercial si le bot hallucine un prix → client signe puis decouvre ecart → litige
- Risque image si le bot dit "je ne sais pas" sur 50% des questions
- Risque securite si jailbreak (data leak, output toxique attribue a Naim)

## Decision

**Option C retenue : Qwen 2.5 3B (q5_K_M) + system prompt strict + FAQ inlined (~6k tokens).**

Migration vers Option B (RAG vectoriel sentence-transformers + FAISS) quand la FAQ
depasse 6k tokens (typiquement >100 entrees).

## Options considered

### Option A — System prompt seul (sans FAQ)
| Dimension | Assessment |
|-----------|------------|
| Complexity | Low |
| Cost | 0€ |
| Scalability | Medium |
| Team familiarity | High (Ollama+OpenClaw deja en place) |
| Robustesse refus | **Faible** — jailbreak facile, hallucinations frequentes |

**Pros** : Setup minimal, deploiement instant
**Cons** : Le modele invente des prix et delais → **inacceptable** pour un site commercial

### Option B — RAG strict (sentence-transformers + FAISS)
| Dimension | Assessment |
|-----------|------------|
| Complexity | Medium |
| Cost | 0€ (tout local) |
| Scalability | High |
| Team familiarity | Medium (LangChain a apprendre) |
| Robustesse refus | **Excellente** — citations strictes depuis FAQ |

**Pros** : Aucune hallucination, deterministe, scale a 1000+ entrees
**Cons** : Setup vector DB, re-embedding a chaque modif FAQ, dependances Python supp.

### Option C — RAG simple (FAQ inlined dans system prompt)
| Dimension | Assessment |
|-----------|------------|
| Complexity | Low |
| Cost | 0€ |
| Scalability | Low (FAQ doit tenir dans le contexte) |
| Team familiarity | High |
| Robustesse refus | **Bonne** — Qwen voit toute la FAQ et peut s'y referer |

**Pros** : Zero infra (juste prompt + Qwen), edition FAQ.md = redeploiement instantane,
deterministe
**Cons** : Limite a ~6k tokens de FAQ, perf degradee si FAQ trop grosse

### Option D — Fine-tuning LoRA sur Qwen
| Dimension | Assessment |
|-----------|------------|
| Complexity | High |
| Cost | 0€ (training local mais GPU lourd) |
| Scalability | High |
| Team familiarity | Low |
| Robustesse refus | **Excellente** |

**Pros** : Bot ultra-specialise
**Cons** : 4-8h training par iteration, GPU requis, complexe a itérer
**Verdict** : Trop tard pour V1, garder pour V2 si bug observe en prod

## Trade-off analysis

- **A vs C** : C a les memes avantages que A + la robustesse refus de B (a moindre cout
 que B). A elimine pour risque hallucination.
- **B vs C** : B est plus robuste a long terme, mais C est suffisant tant que FAQ < 6k
 tokens (~50–80 entrees, largement ce dont Naim a besoin V1).
- **C vs D** : D est over-engineering pour V1. Si jailbreak observe en prod, on ajoute
 output filter (LLM judge) avant de passer en D.

**Decision : C en V1, B en V2 (si scale), D en V3 (si jailbreak resistant aux options 1-2).**

## Architecture livree

```
[Browser Next.js Chatbot.tsx] 
 ↓ POST /chat { question }
[api.tuveuxun.expert (Nginx + Let's Encrypt)]
 ↓ proxy
[FastAPI :8001 /chat]
 ├── Rate limit (8 req/min/IP via slowapi)
 ├── Sanitize input (strip injection patterns)
 ├── Build prompt (system prompt + FAQ.md inlined + question)
 ↓
[Ollama :11434 Qwen 2.5 3B (q5_K_M)]
 ↓ raw response
[Output filter regex] (refus si patterns sensibles : tarif invente, donnees client, jailbreak)
 ↓ filtered response
[Browser <- JSON { answer }]
```

## Securite — 3 couches

1. **System prompt strict** (~500 tokens) : role, perimetre, refus pattern, persona Tv1E
2. **FAQ.md inlined** (~5k tokens) : seule source de verite pour prix/delais/process
3. **Output filter regex** : si la reponse contient des patterns interdits (api keys,
 prix non listes, contenus toxiques), on remplace par message de refus type

## Consequences

**Plus facile** :
- Edition FAQ = redeploiement instantane (pas de re-embedding)
- Iteration rapide sur le system prompt
- Aucun cout cloud

**Plus difficile** :
- Si FAQ depasse 6k tokens, il faut migrer vers RAG (Option B)
- Latence plus elevee qu'une API cloud (~2–5s par reponse sur KVM2)

**A revisiter** :
- Ajout output filter LLM judge si regex insuffisant
- Migration vers FAISS RAG si FAQ grossit
- Fine-tuning si jailbreak persiste

## Action items

1. [ ] Setup Ollama + Qwen 2.5 3B (q5_K_M) sur VPS KVM2 (1–2h)
2. [ ] Rediger `FAQ.md` (50–80 entrees : prestations, tarifs, delais, process, refus) (1–2h)
3. [ ] System prompt strict + persona Tv1E (30min)
4. [ ] FastAPI endpoint POST /chat avec rate-limit + sanitize input (1–2h)
5. [ ] Output filter regex (patterns refus + remplacement) (30min)
6. [ ] Nginx reverse proxy + Let's Encrypt sur api.tuveuxun.expert (1h)
7. [ ] Brancher frontend `Chatbot.tsx` : remplacer `mockBotResponse` par fetch (30min)
8. [ ] Test adversarial (10–20 attempts : prix invente, jailbreak, sujet sensible) (1h)
9. [ ] Monitoring basique : log toutes les questions + reponses dans `chat.log` (30min)

**Total estime : 7–11h** reparti sur **2–3 sessions de 3–4h**.

## Sessions proposees

| Session | Duree | Livrables |
|---|---|---|
| **S1** | 3–4h | Ollama+Qwen sur VPS, FAQ.md V1 (30 entrees), System prompt, test local |
| **S2** | 3–4h | FastAPI + output filter, Nginx HTTPS, branchement frontend, test bout-en-bout |
| **S3** | 1–3h | Test adversarial, ajustements FAQ, monitoring, release prod |
