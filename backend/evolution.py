"""
Auto-evolution — cote serveur tuveuxun.expert.

Deux routes, rien de plus :

  GET /evolution/manifest/{product}
      Sert le manifeste SIGNE du produit. C'est ce que chaque produit livre
      consulte tous les 4 mois (cf. shared/evolution/manifest.py). Public :
      il ne contient rien de secret, et la signature empeche toute alteration.

  GET /evolution/download/{product}/{version}?session=cs_...
      Sert l'archive de mise a jour, UNIQUEMENT si une commande "maj-agent"
      payee existe pour ce produit, cette version et cette session Stripe.
      Le verrou est en base (store.paid_update), pas dans un token devinable.

Ou Naim depose les fichiers : backend/evolution/<product>/
  - manifest.signed.json     produit par `python shared/evolution/manifest.py --publish`
  - <version>.tar.gz         l'archive de mise a jour, dont le sha256 est dans le manifeste

Decision Naim 02/09/2026 : mise a jour proposee tous les 4 mois, 120 EUR a
l'acte, JAMAIS d'abonnement. Refuser ne degrade rien : ce serveur ne sait meme
pas qui a refuse, il ne sert que ceux qui ont paye.
"""
import logging
import re
from pathlib import Path

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import FileResponse, JSONResponse

from store import paid_update

logger = logging.getLogger("bot-Tv1E")
router = APIRouter(prefix="/evolution")

EVOLUTION_DIR = Path(__file__).parent / "evolution"
PRODUCT_RE = re.compile(r"^[a-z0-9][a-z0-9_-]{1,63}$")
VERSION_RE = re.compile(r"^v?\d+(\.\d+){0,3}(-[\w.]+)?$")
SESSION_RE = re.compile(r"^cs_(test_|live_)?[A-Za-z0-9]{8,}$")


def _safe(product: str) -> Path:
    """Refuse toute traversee de repertoire : le nom est valide ET le chemin
    resolu reste sous EVOLUTION_DIR."""
    if not PRODUCT_RE.match(product):
        raise HTTPException(404, "unknown_product")
    p = (EVOLUTION_DIR / product).resolve()
    if EVOLUTION_DIR.resolve() not in p.parents:
        raise HTTPException(404, "unknown_product")
    return p


@router.get("/manifest/{product}")
async def manifest(product: str):
    f = _safe(product) / "manifest.signed.json"
    if not f.is_file():
        # Pas de manifeste = pas de mise a jour. Le produit chez le client
        # traite un 404 exactement comme "rien de nouveau".
        raise HTTPException(404, "no_manifest")
    return FileResponse(
        f,
        media_type="application/json",
        headers={"Cache-Control": "public, max-age=3600"},
    )


@router.get("/download/{product}/{version}")
async def download(product: str, version: str, session: str = Query(..., max_length=128)):
    if not VERSION_RE.match(version) or not SESSION_RE.match(session):
        raise HTTPException(404, "not_found")
    if not paid_update(session, product, version):
        # Meme reponse qu'un fichier absent : on ne confirme pas l'existence
        # d'une archive a quelqu'un qui n'a pas paye.
        logger.warning(f"EVOLUTION refus · {product} {version} · session={session[:14]}…")
        raise HTTPException(404, "not_found")
    f = _safe(product) / f"{version.lstrip('vV')}.tar.gz"
    if not f.is_file():
        logger.error(f"EVOLUTION payee mais archive absente : {f}")
        return JSONResponse(
            status_code=503,
            content={"error": "archive_not_ready", "message": "Paiement enregistre. L'archive sera disponible sous peu."},
        )
    logger.info(f"EVOLUTION livraison · {product} {version} · session={session[:14]}…")
    return FileResponse(f, media_type="application/gzip", filename=f"{product}-{version}.tar.gz")
