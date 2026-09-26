"""
Facturation tuveuxun.expert — Stripe Checkout hebergee (paiement en ligne des
forfaits et modules de la page /tarifs).

Catalogue = source de verite SERVEUR (jamais confiance au montant client).
Les prix refletent app/tarifs/page.tsx — toute modif de prix doit etre faite
DANS LES DEUX (page tarifs + ici).

Env requises (sinon 503 billing_not_configured — le site garde le flux mailto) :
  - STRIPE_SECRET_KEY      sk_live_... / sk_test_...
  - STRIPE_WEBHOOK_SECRET  whsec_... (endpoint: https://api.tuveuxun.expert/billing/webhook)
  - SITE_URL               https://tuveuxun.expert (defaut)

Geste Naim (dashboard Stripe) : declarer l'endpoint webhook ci-dessus avec
l'evenement checkout.session.completed.
"""
# Pas de `from __future__ import annotations` : casse la resolution des
# modeles Pydantic dans les routes FastAPI (cf. note en tete de main.py).
import logging
import os

from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel, Field

from store import record_order

logger = logging.getLogger("bot-Tv1E")

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
SITE_URL = os.getenv("SITE_URL", "https://tuveuxun.expert")

router = APIRouter(prefix="/billing")

# ─── Catalogue (montants en centimes, HT) ───────────────────────────
OFFERS: dict[str, dict] = {
    "audit-ia": {"label": "Diagnostic IA — forfait 1 jour", "amount_cents": 69_000},
    "agent-metier": {"label": "Agent métier — forfait 3 jours", "amount_cents": 190_000},
    "agent-souverain": {"label": "Agent souverain sur mesure — forfait 5 jours", "amount_cents": 390_000},
    "skill-pack": {"label": "Skill pack métier additionnel", "amount_cents": 29_000},
    "module-pipeline": {"label": "Module — Pipeline IA générative com", "amount_cents": 290_000},
    "module-chatbot": {"label": "Module — Chatbot citoyen/adhérent", "amount_cents": 190_000},
    "module-formation": {"label": "Formation IA équipe — 1 jour", "amount_cents": 150_000},
    "conseil-2h": {"label": "Conseil stratégique — RDV 2h", "amount_cents": 45_000},
    # Auto-evolution (decision Naim 02/09/2026) : mise a jour proposee tous les
    # 4 mois, payee A L'ACTE. Jamais d'abonnement. Produit et version voyagent
    # dans les metadonnees Stripe pour que le webhook sache quoi ouvrir.
    "maj-agent": {"label": "Mise à jour d'agent — évolution 4 mois", "amount_cents": 12_000},
}


def _stripe():
    """Import paresseux : le backend chatbot doit tourner meme sans lib/cle Stripe."""
    if not STRIPE_SECRET_KEY:
        raise HTTPException(503, "billing_not_configured")
    try:
        import stripe  # type: ignore
    except ImportError:
        raise HTTPException(503, "billing_not_configured")
    stripe.api_key = STRIPE_SECRET_KEY
    return stripe


class CheckoutRequest(BaseModel):
    offer_id: str = Field(..., min_length=1, max_length=64)
    # Pattern simple volontaire (pas de dependance email-validator) ;
    # Stripe re-valide l'email de toute facon sur sa page Checkout.
    email: str | None = Field(None, max_length=254, pattern=r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
    # Uniquement pour l'offre maj-agent : quel produit, quelle version.
    product: str | None = Field(None, max_length=64, pattern=r"^[a-z0-9][a-z0-9_-]{1,63}$")
    version: str | None = Field(None, max_length=32, pattern=r"^v?\d+(\.\d+){0,3}(-[\w.]+)?$")


@router.get("/offers")
async def offers():
    """Catalogue public + etat de config (le front masque le bouton si off)."""
    return {
        "configured": bool(STRIPE_SECRET_KEY),
        "offers": [
            {"id": oid, "label": o["label"], "amount_cents": o["amount_cents"]}
            for oid, o in OFFERS.items()
        ],
    }


@router.post("/checkout")
async def checkout(req: CheckoutRequest):
    offer = OFFERS.get(req.offer_id)
    if not offer:
        raise HTTPException(404, "offer_not_found")
    if req.offer_id == "maj-agent" and not (req.product and req.version):
        raise HTTPException(422, "maj_agent_requires_product_and_version")
    stripe = _stripe()
    try:
        session = stripe.checkout.Session.create(
            mode="payment",
            line_items=[
                {
                    "quantity": 1,
                    "price_data": {
                        "currency": "eur",
                        "unit_amount": offer["amount_cents"],
                        "product_data": {"name": offer["label"]},
                    },
                }
            ],
            customer_email=req.email,
            metadata={
                "offer_id": req.offer_id,
                **(
                    {"product": req.product, "version": req.version}
                    if req.offer_id == "maj-agent" and req.product and req.version
                    else {}
                ),
            },
            success_url=f"{SITE_URL}/tarifs?paiement=succes",
            cancel_url=f"{SITE_URL}/tarifs?paiement=annule",
        )
    except Exception as e:  # noqa: BLE001 — on ne fuit pas les details Stripe au client
        logger.exception(f"Stripe checkout failed: {e}")
        raise HTTPException(502, "checkout_failed")
    return {"url": session.url}


@router.post("/webhook")
async def webhook(request: Request):
    if not STRIPE_WEBHOOK_SECRET:
        raise HTTPException(500, "webhook_secret_missing")
    stripe = _stripe()
    payload = await request.body()
    signature = request.headers.get("stripe-signature", "")
    try:
        event = stripe.Webhook.construct_event(payload, signature, STRIPE_WEBHOOK_SECRET)
    except Exception:
        raise HTTPException(400, "invalid_signature")

    if event["type"] == "checkout.session.completed":
        session = event["data"]["object"]
        meta = session.get("metadata") or {}
        offer_id = meta.get("offer_id", "inconnu")
        offer = OFFERS.get(offer_id, {})
        inserted = record_order(
            stripe_session_id=session["id"],
            offer_id=offer_id,
            label=offer.get("label", offer_id),
            amount_cents=session.get("amount_total") or 0,
            currency=session.get("currency") or "eur",
            customer_email=(session.get("customer_details") or {}).get("email")
            or session.get("customer_email"),
            product=meta.get("product"),
            version=meta.get("version"),
        )
        if inserted:
            logger.info(
                f"ORDER · {offer_id} · {session.get('amount_total')} {session.get('currency')} "
                f"· {(session.get('customer_details') or {}).get('email')}"
            )
    return {"received": True}
