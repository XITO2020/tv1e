# -*- coding: utf-8 -*-
"""
Genere les 22 vignettes carrees des agents des trois tours du marketplace
(OpenClaw, Claude API, DIY Dev), dans le style des images existantes.

Meme recette que scripts/generate-images.py et generate-agents-images.py
(sd_xl_base_1.0, 30 steps, cfg 7.5, dpmpp_2m karras, "16-bit pixel art ... retro
sci-fi game illustration") — mais en CARRE : generation 768x768, puis reduction
Lanczos en 300x300, la taille demandee pour le coin bas-droit des cartes.

Parle DIRECTEMENT a ComfyUI (http://127.0.0.1:8199, lance par Naim via Pinokio) :
studio-ai n'est pas necessaire. Chaque prompt decrit une SCENE tiree de la
description de l'agent, pas un logo.

Sortie : public/agents-cards/<slug>.png  (300x300). Les fichiers existants sont
sautes : relancer le script ne regenere que ce qui manque.

Usage :
    python scripts/generate-cards-images.py
    python scripts/generate-cards-images.py --only faq-chatbot-rgpd
    python scripts/generate-cards-images.py --force        (regenere tout)
"""
from __future__ import annotations

import argparse
import io
import json
import sys
import time
import urllib.parse
import urllib.request
from pathlib import Path

from PIL import Image

COMFY = "http://127.0.0.1:8199"
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "agents-cards"
SIZE = 300
GEN = 768

CKPT = "sd_xl_base_1.0.safetensors"
STEPS, CFG, SAMPLER, SCHED = 30, 7.5, "dpmpp_2m", "karras"

STYLE = (
    "16-bit pixel art, {scene}, bioluminescent teal and amber glow, dark background, "
    "retro sci-fi game illustration, atmospheric depth, centered square composition, "
    "pixel art masterpiece"
)
NEG = (
    "blurry, photorealistic, 3d render, photo, smooth gradients, anti-aliasing, "
    "modern UI, vector art, cartoon, watermark, text, letters, signature, deformed, "
    "low quality, noise, jpeg artifacts, modern photography"
)

# slug -> scene. Une scene par agent, ecrite depuis SA description sur la page.
#
# Reecrit le 11/09/2026 : le premier jet mettait "a robot doing X" dans les
# 22 prompts — Naim l'a signale ("toujours des robots"), a raison, et casse
# le style des images d'origine (Tintenfisch, Cortex Moderation...) qui sont
# des SCENES symboliques construites autour d'un objet central, jamais un
# personnage generique qui agit. Meme grammaire ici : un objet, un lieu, une
# lumiere — le robot n'apparait plus que la ou aucune autre image n'aurait de
# sens (aucun cas ici).
AGENTS: dict[str, str] = {
    # ── Tour A · OpenClaw (souverain, tout en local) ──
    "chatbot-citoyen-souverain": "small stone town hall building at night, a single glowing window "
        "with a terminal screen, heavy padlocked chest on the front steps, closed iron gates, "
        "no wires leaving the building, warm light inside cold blue night outside",
    "classification-documents-internes": "brass rotary archive vault, a great rotating drum sorter "
        "pulling paper files and folders into labelled slots, mechanical gears, sealed vault door, "
        "dust motes in a single shaft of light",
    "faq-chatbot-rgpd": "a single glowing document floating inside a sealed glass reliquary case, "
        "heavy chains and padlocks wrapped around the glass, a small brass oracle lens beside it "
        "for questions, thick stone walls",
    "transcription-audio-sensible": "a closed wooden confessional booth, sound waves drifting inside "
        "and turning into handwritten ink lines on parchment, no cables leaving the booth, "
        "warm lamp glow through the lattice door",
    "recherche-dans-archives": "vast underground library stacks receding into darkness, a single "
        "floating lantern casting luminous threads that connect distant related books, "
        "dust and deep shadow, teal and amber glow",
    "extraction-infos-contrats": "antique brass press stamping a paper contract, glowing numeric "
        "tokens and dates lifting off the page like sparks, gears and levers, workshop light",
    "suggestion-reponses-rh": "a wise owl perched on a thick leather labour-code tome, glowing reply "
        "scrolls unfurling from beneath its wing, quiet office lamp, bookshelves in shadow",
    "agent-veille-interne": "a lighthouse beam sweeping over a nighttime harbor of small paper-boat "
        "chat bubbles, one faint red flare catching the light among the calm blue fleet",
    # ── Tour B · Claude API (cloud) ──
    "redacteur-juridique": "a fountain pen made of light writing glowing legal seals onto an "
        "unrolling parchment scroll, wax stamps floating beside stacked law books",
    "reponse-mail-commerciale": "brass mail-sorting carousel launching folded paper letters with "
        "glowing trails toward distant lit mailboxes on the horizon, retro post office",
    "veille-concurrentielle": "a watchtower telescope aimed at distant rival banners on the "
        "skyline, newspapers and ticker tape streaming down into an open logbook",
    "traduction-professionnelle": "four floating rune-stones engraved with FR EN ES AR glyphs "
        "orbiting an open glossary book, thin bridges of light connecting each stone",
    "analyse-sentiment-rs": "a brass weathervane shaped from speech-bubble vanes, needle swinging "
        "between a stormy red quadrant and a calm green one, small alarm lamp glowing red",
    "rapport-mensuel-narratif": "a tabletop orrery where each orbiting planet is a small glowing "
        "bar chart, a parchment scroll unrolling automatically beneath the first-of-month moon",
    "assistant-developpeur": "two mechanical typewriters facing each other sharing one glowing "
        "ribbon of code between them, warm desk lamp, scattered custom tool parts",
    "generateur-fiches-produit": "a conveyor belt of blank wooden product boxes passing beneath a "
        "stamping die that brands each one with a glowing title and price tag, retro factory",
    # ── Tour C · DIY Dev (autonomie) ──
    "pack-onboarding-dev": "a locksmith's workbench, one glowing skeleton key being handed across "
        "the bench toward an empty stool, a single custom skill-card blueprint pinned above",
    "skill-md-telechargeable": "a single luminous scroll sliding out from a tall shelf of identical "
        "scrolls, descending gently toward an open hand reaching from below",
    "bibliotheque-complete": "a grand circular library rotunda, twenty-two glowing tomes ringing "
        "the shelves, a brass master key floating and turning slowly at the centre",
    "coaching-ad-hoc": "an hourglass with one hour of glowing sand, a single question mark hovering "
        "above a small round table with two facing chairs, warm evening lamp",
    "skill-custom-sur-brief": "a tailor's workshop, a bespoke glowing skill-card garment being cut "
        "from cloth against a pinned written pattern, shears and chalk on the table",
    "audit-skills-existants": "a magnifying glass inspecting a shelf of scrolls, some marked with a "
        "glowing green checkmark seal, one set aside with a small warning ribbon",
}


def workflow(scene: str, seed: int) -> dict:
    p = STYLE.format(scene=scene)
    return {
        "1": {"class_type": "CheckpointLoaderSimple", "inputs": {"ckpt_name": CKPT}},
        "2": {"class_type": "CLIPTextEncode", "inputs": {"text": p, "clip": ["1", 1]}},
        "3": {"class_type": "CLIPTextEncode", "inputs": {"text": NEG, "clip": ["1", 1]}},
        "4": {"class_type": "EmptyLatentImage", "inputs": {"width": GEN, "height": GEN, "batch_size": 1}},
        "5": {
            "class_type": "KSampler",
            "inputs": {
                "seed": seed, "steps": STEPS, "cfg": CFG, "sampler_name": SAMPLER, "scheduler": SCHED,
                "denoise": 1.0, "model": ["1", 0], "positive": ["2", 0], "negative": ["3", 0], "latent_image": ["4", 0],
            },
        },
        "6": {"class_type": "VAEDecode", "inputs": {"samples": ["5", 0], "vae": ["1", 2]}},
        "7": {"class_type": "SaveImage", "inputs": {"filename_prefix": "tve-cards", "images": ["6", 0]}},
    }


def post(path: str, body: dict) -> dict:
    req = urllib.request.Request(f"{COMFY}{path}", data=json.dumps(body).encode(), headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=60) as r:
        return json.loads(r.read().decode())


def get(path: str) -> bytes:
    with urllib.request.urlopen(f"{COMFY}{path}", timeout=60) as r:
        return r.read()


def generate(slug: str, scene: str, seed: int) -> Path:
    pid = post("/prompt", {"prompt": workflow(scene, seed)})["prompt_id"]
    t0 = time.time()
    while True:
        time.sleep(2)
        hist = json.loads(get(f"/history/{pid}").decode())
        if pid in hist:
            out = hist[pid]["outputs"]
            imgs = [i for node in out.values() for i in node.get("images", [])]
            if not imgs:
                raise RuntimeError(f"{slug}: aucune image dans la sortie ComfyUI")
            i = imgs[0]
            q = urllib.parse.urlencode({"filename": i["filename"], "subfolder": i.get("subfolder", ""), "type": i.get("type", "output")})
            raw = get(f"/view?{q}")
            break
        if time.time() - t0 > 900:
            raise TimeoutError(f"{slug}: ComfyUI n'a pas repondu en 15 min")
    im = Image.open(io.BytesIO(raw)).convert("RGB")
    im = im.resize((SIZE, SIZE), Image.LANCZOS)
    OUT.mkdir(parents=True, exist_ok=True)
    dest = OUT / f"{slug}.png"
    im.save(dest, optimize=True)
    return dest


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", default="")
    ap.add_argument("--force", action="store_true")
    a = ap.parse_args()
    try:
        get("/system_stats")
    except Exception as e:  # noqa: BLE001
        print(f"[ERREUR] ComfyUI injoignable sur {COMFY} : {e}\n  -> lance ComfyUI depuis Pinokio, puis relance.")
        return 1
    todo = [(s, sc) for s, sc in AGENTS.items() if not a.only or s == a.only]
    done = 0
    for n, (slug, scene) in enumerate(todo, 1):
        dest = OUT / f"{slug}.png"
        if dest.exists() and not a.force:
            print(f"[{n:02d}/{len(todo)}] {slug:36s} deja la, saute")
            continue
        t0 = time.time()
        try:
            generate(slug, scene, seed=1000 + n)
        except Exception as e:  # noqa: BLE001
            print(f"[{n:02d}/{len(todo)}] {slug:36s} ECHEC : {e}")
            continue
        done += 1
        print(f"[{n:02d}/{len(todo)}] {slug:36s} ok en {time.time() - t0:5.1f} s -> {dest.relative_to(ROOT)}")
    print(f"\n{done} image(s) generee(s) dans {OUT}")
    return 0


if __name__ == "__main__":
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    sys.exit(main())
