"""
Recherche par mots-cles dans faq-kb.json, AVANT tout appel au modele.

Pourquoi : sur le VPS cible (KVM 2, 2 vCPU, CPU partage), un petit Qwen met
30 a 60 s par reponse. Mesure du 04/09/2026. Or la grande majorite des
questions d'un site vitrine sont les memes vingt questions. On les sert donc
depuis un fichier ecrit et verifie, en quelques millisecondes, sans allumer le
modele. Le modele ne sert plus qu'aux formulations inattendues — et meme la,
on lui injecte les entrees les plus proches pour qu'il raisonne dessus au lieu
d'inventer.

Deux sorties :
  instant(q)  -> une reponse prete, ou None si le doute est permis
  context(q)  -> les meilleures entrees, en texte, a coller dans le prompt

Naim enrichit faq-kb.json au fil des mois : chaque entree ajoutee est une
question de plus qui ne coutera jamais une seconde de CPU.
"""
from __future__ import annotations

import json
import logging
import re
import unicodedata
from pathlib import Path

logger = logging.getLogger("Tv1E-bot")

KB_FILE = Path(__file__).parent / "faq-kb.json"

# Un mot court doit matcher exactement ("qui" ne doit pas matcher "quinze").
# A partir de 4 lettres on tolere le prefixe : cout/coute, tarif/tarifs, delai/delais.
MIN_PREFIX = 4

# Reponse servie directement : il faut un score franc ET un ecart net avec le
# deuxieme. Sinon on prefere laisser le modele trancher avec le contexte.
# 4 = un mot-cle specifique touche (2 + 1 mot) plus le meme mot dans la question
# de reference. Teste le 09/09 : "y a-t-il un abonnement", "pourquoi tu rames",
# "qui va bosser sur mon projet" passent en instantane sans faux positif.
INSTANT_SCORE = 4
INSTANT_MARGIN = 1.5
# En dessous de ce score une entree n'est meme pas donnee en contexte.
CONTEXT_SCORE = 1
CONTEXT_MAX = 3

_STOP = {
    "avec", "vous", "pour", "dans", "cette", "elle", "nous", "votre", "notre",
    "quel", "quels", "quelle", "quelles", "est", "les", "des", "une", "que",
    "qui", "sur", "par", "pas", "plus", "mais", "donc", "car", "ce", "cet",
}


def _norm(s: str) -> str:
    s = unicodedata.normalize("NFD", s.lower())
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    return re.sub(r"[^a-z0-9]+", " ", s).strip()


def _tokens(s: str) -> list[str]:
    return [t for t in _norm(s).split() if t]


def _load() -> list[dict]:
    if not KB_FILE.is_file():
        logger.warning("faq-kb.json absent : le bot repondra uniquement via le modele")
        return []
    try:
        raw = json.loads(KB_FILE.read_text(encoding="utf-8"))
    except Exception as e:  # noqa: BLE001 — un JSON casse ne doit pas empecher le bot de demarrer
        logger.error(f"faq-kb.json illisible ({e}) : le bot repondra uniquement via le modele")
        return []
    out = []
    for e in raw.get("entries", []):
        q, a = str(e.get("q", "")).strip(), str(e.get("a", "")).strip()
        if not q or not a:
            continue
        out.append({
            "id": e.get("id", ""),
            "theme": e.get("theme", ""),
            "q": q,
            "a": a,
            # Les mots-cles ET les mots de la question de reference servent au score.
            "kw": [_tokens(k) for k in e.get("keywords", []) if str(k).strip()],
            "qt": {t for t in _tokens(q) if len(t) > 3 and t not in _STOP},
        })
    return out


ENTRIES = _load()


def _word_hit(kw_word: str, q_tokens: list[str]) -> bool:
    if len(kw_word) < MIN_PREFIX:
        return kw_word in q_tokens
    return any(t.startswith(kw_word) or kw_word.startswith(t) for t in q_tokens if len(t) >= MIN_PREFIX)


def _score(entry: dict, q_tokens: list[str]) -> float:
    score = 0.0
    for kw_words in entry["kw"]:
        # Un mot-cle ne compte que s'il est present EN ENTIER : "petit budget"
        # ne doit pas se declencher sur le seul mot "budget".
        if kw_words and all(_word_hit(w, q_tokens) for w in kw_words):
            score += 2.0 + len(kw_words)
    score += sum(1.0 for t in q_tokens if t in entry["qt"])
    return score


def _ranked(question: str) -> list[tuple[float, dict]]:
    q_tokens = _tokens(question)
    if not q_tokens or not ENTRIES:
        return []
    scored = [(_score(e, q_tokens), e) for e in ENTRIES]
    scored.sort(key=lambda x: x[0], reverse=True)
    return scored


def instant(question: str) -> dict | None:
    """Reponse prete si la question est reconnue sans ambiguite, sinon None."""
    ranked = _ranked(question)
    if not ranked:
        return None
    best_score, best = ranked[0]
    if best_score < INSTANT_SCORE:
        return None
    second = ranked[1][0] if len(ranked) > 1 else 0.0
    # Deux entrees proches = doute reel : on laisse le modele arbitrer.
    if second > 0 and best_score < second * INSTANT_MARGIN:
        return None
    return {"id": best["id"], "answer": best["a"], "score": best_score}


def context(question: str) -> str:
    """Les entrees les plus proches, en texte, pour guider le modele."""
    keep = [(s, e) for s, e in _ranked(question)[:CONTEXT_MAX] if s >= CONTEXT_SCORE]
    if not keep:
        return ""
    lines = [f"- {e['q']}\n  {e['a']}" for _, e in keep]
    return (
        "Elements de reponse deja rediges et verifies, les plus proches de la question. "
        "Appuie-toi dessus en priorite ; reformule si besoin, n'invente aucun chiffre absent.\n"
        + "\n".join(lines)
    )
