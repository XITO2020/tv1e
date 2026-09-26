"""
Persistance locale tuveuxun.expert — SQLite (zero service externe, zero cout).

Deux tables :
  - orders : commandes payees via Stripe Checkout (inserees par le webhook,
             idempotentes sur stripe_session_id)
  - leads  : prospects laisses via le chatbot / formulaires (qualification)

Le fichier data.db vit a cote du backend (BASE_DIR), couvert par .gitignore
comme chat.log. Rotation/export : a la main pour l'instant.
"""
from __future__ import annotations

import os
import sqlite3
import time
from pathlib import Path

BASE_DIR = Path(__file__).parent
# BOT_DB_PATH permet de placer la base sur un volume persistant (Docker) sans
# toucher au code : en prod conteneurisee, /app/data/data.db monte en volume.
DB_PATH = Path(os.getenv("BOT_DB_PATH", str(BASE_DIR / "data.db")))
DB_PATH.parent.mkdir(parents=True, exist_ok=True)


def _conn() -> sqlite3.Connection:
    conn = sqlite3.connect(DB_PATH)
    conn.execute("PRAGMA journal_mode=WAL")
    return conn


def init_db() -> None:
    with _conn() as conn:
        conn.execute(
            """CREATE TABLE IF NOT EXISTS orders (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                stripe_session_id TEXT UNIQUE NOT NULL,
                offer_id TEXT NOT NULL,
                label TEXT NOT NULL,
                amount_cents INTEGER NOT NULL,
                currency TEXT NOT NULL DEFAULT 'eur',
                customer_email TEXT,
                status TEXT NOT NULL DEFAULT 'paid',
                created_at INTEGER NOT NULL
            )"""
        )
        # Auto-evolution (02/09/2026) : une commande "maj-agent" sait POUR QUEL
        # produit et QUELLE version elle a ete payee. ALTER idempotent : une base
        # existante recoit les colonnes, une base neuve aussi.
        for col in ("product TEXT", "version TEXT"):
            try:
                conn.execute(f"ALTER TABLE orders ADD COLUMN {col}")
            except sqlite3.OperationalError:
                pass  # colonne deja presente
        conn.execute(
            """CREATE TABLE IF NOT EXISTS leads (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT,
                email TEXT NOT NULL,
                message TEXT,
                source TEXT NOT NULL DEFAULT 'chatbot',
                created_at INTEGER NOT NULL
            )"""
        )


def record_order(
    stripe_session_id: str,
    offer_id: str,
    label: str,
    amount_cents: int,
    currency: str,
    customer_email: str | None,
    product: str | None = None,
    version: str | None = None,
) -> bool:
    """Insere la commande. Renvoie False si deja enregistree (replay webhook)."""
    with _conn() as conn:
        cur = conn.execute(
            "INSERT OR IGNORE INTO orders "
            "(stripe_session_id, offer_id, label, amount_cents, currency, customer_email, "
            " product, version, created_at) "
            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
            (stripe_session_id, offer_id, label, amount_cents, currency, customer_email,
             product, version, int(time.time())),
        )
        return cur.rowcount > 0


def paid_update(stripe_session_id: str, product: str, version: str) -> bool:
    """Une mise a jour a-t-elle ete payee pour CE produit et CETTE version ?
    C'est le verrou du telechargement : sans commande payee, pas d'archive."""
    with _conn() as conn:
        row = conn.execute(
            "SELECT 1 FROM orders WHERE stripe_session_id=? AND product=? AND version=? "
            "AND status='paid' LIMIT 1",
            (stripe_session_id, product, version),
        ).fetchone()
        return row is not None


def record_lead(email: str, name: str | None, message: str | None, source: str) -> int:
    with _conn() as conn:
        cur = conn.execute(
            "INSERT INTO leads (name, email, message, source, created_at) VALUES (?, ?, ?, ?, ?)",
            (name, email, message, source, int(time.time())),
        )
        return int(cur.lastrowid or 0)
