"""
Genere les 8 vignettes pixel art des AGENTS MAISON du marketplace.

Meme pipeline et meme style que scripts/generate-images.py (les 12 du carousel) :
sd_xl_base_1.0, 768x1152, 30 steps, cfg 7.5 — pour que les nouvelles vignettes
soient indiscernables des anciennes.

Chaque prompt decrit une SCENE, pas un logo : c'est ce qui donne aux 12 images
existantes leur caractere de vignette de jeu retro plutot que d'icone plate.

Usage :
    python scripts/generate-agents-images.py
    python scripts/generate-agents-images.py --only tintenfisch
"""
from __future__ import annotations

import argparse
import json
import shutil
import sys
import time
from pathlib import Path

import requests

BASE = "http://127.0.0.1:8000"
TIMEOUT = 900
ROOT = Path(__file__).resolve().parent.parent
CAROUSEL = ROOT / "public" / "carousel"
GENERATED = Path(
    r"C:\Users\naimd\Documents\QISHIM-CORTEX\softwares\studio-ai\assets\generated\images"
)

NEG_PIXEL = (
    "blurry, photorealistic, 3d render, photo, smooth gradients, anti-aliasing, "
    "modern UI, vector art, cartoon, watermark, text, signature, deformed, "
    "low quality, noise, jpeg artifacts, modern photography"
)

PIXEL_CONFIG = {
    "checkpoint": "sd_xl_base_1.0.safetensors",
    "width": 768,
    "height": 1152,
    "steps": 30,
    "cfg": 7.5,
    "sampler": "dpmpp_2m",
    "scheduler": "karras",
}

AGENTS = [
    {
        "slug": "tintenfisch",
        "name": "Tintenfisch",
        "prompt": (
            "16-bit pixel art, magnificent colossal octopus creature made of glowing circuitry "
            "rising from dark water, twelve luminous tentacles each plugged into a different "
            "vintage terminal screen displaying contact lists, bioluminescent teal and amber glow, "
            "majestic and benevolent sea monster, retro sci-fi game illustration, atmospheric depth, "
            "vertical composition, pixel art masterpiece"
        ),
    },
    {
        "slug": "cortex-moderation",
        "name": "Cortex Moderation",
        "prompt": (
            "16-bit pixel art, vast retro surveillance control room, one giant mechanical eye iris "
            "at the center scanning walls of small framed images, rows of CRT monitors flagging "
            "content with warning lights, watchful sentinel atmosphere, deep blues with amber alerts, "
            "isometric three-quarter view, vertical composition, pixel art masterpiece"
        ),
    },
    {
        "slug": "sound-cortex",
        "name": "Sound-Cortex",
        "prompt": (
            "16-bit pixel art, retro 1980s recording studio at night, large analog mixing console "
            "with glowing VU meters and faders, floating luminous waveforms, vinyl records and "
            "reel-to-reel tape machines, warm amber and magenta neon, vertical composition, "
            "pixel art masterpiece"
        ),
    },
    {
        "slug": "voicebox",
        "name": "VoiceBox",
        "prompt": (
            "16-bit pixel art, antique brass gramophone connected by copper cables to a glowing "
            "crystal voice chamber, concentric sound waves rippling outward as luminous rings, "
            "vintage ribbon microphone on a stand, teal and gold palette, retro laboratory, "
            "vertical composition, pixel art masterpiece"
        ),
    },
    {
        "slug": "hub-pilotage",
        "name": "Hub Pilotage IA",
        "prompt": (
            "16-bit pixel art, retro mission control cockpit, single pilot chair facing a semicircle "
            "of screens each displaying a different glowing AI brain, thick cables converging toward "
            "the seat, blues and cyan with warm switch lights, isometric view, vertical composition, "
            "pixel art masterpiece"
        ),
    },
    {
        "slug": "scraper-galerie",
        "name": "Scraper Galerie",
        "prompt": (
            "16-bit pixel art, mechanical harvesting machine with brass articulated arms plucking "
            "framed paintings from an endless museum gallery wall and stacking them into wooden crates, "
            "long corridor with vanishing perspective, warm sepia and teal, retro steampunk, "
            "vertical composition, pixel art masterpiece"
        ),
    },
    {
        "slug": "istqb-trainer",
        "name": "ISTQB Trainer",
        "prompt": (
            "16-bit pixel art, retro examination hall, floating geometric logic puzzles and pattern "
            "sequences hovering above a wooden desk, brass hourglass, chalkboard covered in shapes "
            "and sequences, warm academic lamplight, vertical composition, pixel art masterpiece"
        ),
    },
    {
        "slug": "serie-forge",
        "name": "Serie-Forge Converter",
        "prompt": (
            "16-bit pixel art, blacksmith forge where handwritten script pages are hammered on an "
            "anvil into glowing film strips, flying sparks, bellows and hanging tools, retro workshop "
            "interior, orange forge glow against steel blue shadows, vertical composition, "
            "pixel art masterpiece"
        ),
    },
]


def wait_backend(max_wait: int = 240) -> bool:
    """Naim relance studio-ai a la main : on patiente au lieu d'echouer."""
    t0 = time.time()
    while time.time() - t0 < max_wait:
        try:
            h = requests.get(f"{BASE}/api/health", timeout=5).json()
            if h.get("comfyui", {}).get("status") == "online":
                print(f"[OK] backend + ComfyUI en ligne apres {int(time.time()-t0)}s\n")
                return True
        except Exception:
            pass
        print(f"  … attente studio-ai ({int(time.time()-t0)}s)")
        time.sleep(10)
    return False


def newest_png(before: set[Path]) -> Path | None:
    """Le PNG apparu depuis le lancement du job."""
    if not GENERATED.exists():
        return None
    now = {p for p in GENERATED.glob("*.png")}
    fresh = now - before
    if not fresh:
        return None
    return max(fresh, key=lambda p: p.stat().st_mtime)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--only", help="slug unique a generer")
    args = ap.parse_args()

    todo = [a for a in AGENTS if not args.only or a["slug"] == args.only]
    if not todo:
        print(f"[ERR] slug inconnu : {args.only}")
        return 1

    if not wait_backend():
        print(f"[ERR] studio-ai injoignable sur {BASE} — lance start.bat et reessaie.")
        return 1

    CAROUSEL.mkdir(parents=True, exist_ok=True)
    results = []

    for i, a in enumerate(todo, 1):
        dest = CAROUSEL / f"{a['slug']}.png"
        if dest.exists():
            print(f"[{i}/{len(todo)}] {a['name']} — deja presente, on garde")
            continue
        print(f"\n[{i}/{len(todo)}] {a['name']} ({a['slug']})")
        before = {p for p in GENERATED.glob("*.png")} if GENERATED.exists() else set()
        payload = {"prompt": a["prompt"], "negative_prompt": NEG_PIXEL, **PIXEL_CONFIG}
        t0 = time.time()
        try:
            r = requests.post(f"{BASE}/api/generate", json=payload, timeout=TIMEOUT)
        except Exception as e:
            print(f"  [ERR] {e}")
            results.append({"slug": a["slug"], "error": str(e)})
            continue
        dt = time.time() - t0
        if r.status_code != 200:
            print(f"  [ERR] HTTP {r.status_code} : {r.text[:200]}")
            results.append({"slug": a["slug"], "error": r.text[:200]})
            continue
        print(f"  [OK] genere en {dt:.0f}s")
        src = newest_png(before)
        if src:
            shutil.copy2(src, dest)
            print(f"  -> {dest}")
            results.append({"slug": a["slug"], "file": str(dest)})
        else:
            print("  [!] image generee mais fichier introuvable — a copier a la main")
            results.append({"slug": a["slug"], "error": "png introuvable"})

    ok = len([x for x in results if "file" in x])
    print(f"\n[FIN] {ok}/{len(todo)} vignettes posees dans {CAROUSEL}")
    log = Path(__file__).parent / f"agents-images-log-{int(time.time())}.json"
    log.write_text(json.dumps(results, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"  log : {log}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
