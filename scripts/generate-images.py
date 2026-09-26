"""
Batch generation des 18 images tuveuxun.expert via studio-ai.
Studio-ai backend : http://127.0.0.1:8000/api/generate
ComfyUI : RTX 3080 Ti laptop, 16 GB VRAM.

Usage:
    python scripts/generate-images.py
    python scripts/generate-images.py --only portraits
    python scripts/generate-images.py --only pixelart
    python scripts/generate-images.py --skip 1,2,3
"""
from __future__ import annotations
import argparse
import json
import sys
import time
from pathlib import Path

import requests

BASE = "http://127.0.0.1:8000"
TIMEOUT = 600

NEG_PORTRAIT = (
    "color, cartoon, anime, illustration, painting, drawing, blurry, out of focus, "
    "distorted face, asymmetric eyes, extra limbs, deformed hands, malformed, "
    "bad anatomy, low quality, jpeg artifacts, watermark, text, signature, frame, "
    "border, cropped head"
)

NEG_PIXEL = (
    "blurry, photorealistic, 3d render, photo, smooth gradients, anti-aliasing, "
    "modern UI, vector art, cartoon, watermark, text, signature, deformed, "
    "low quality, noise, jpeg artifacts, modern photography"
)

PORTRAITS = [
    {
        "id": "01",
        "slug": "Naïm",
        "name": "Naïm",
        "prompt": (
            "professional black and white portrait photography, 35-40 years old man, "
            "sharp focused gaze, mediterranean features, short dark hair, neatly trimmed stubble, "
            "dark minimalist turtleneck or tech-wear, soft studio rim lighting from upper left, "
            "neutral dark gray background, three-quarter angle, looking slightly off-camera with "
            "quiet confidence, 50mm lens, shallow depth of field, sharp focus on eyes, "
            "monochrome black and white, high contrast cinematic, Leica style, 8k, photorealistic"
        ),
    },
    {
        "id": "02",
        "slug": "eddy",
        "name": "Eddy",
        "prompt": (
            "professional black and white portrait photography, 40-45 years old man, "
            "calm assured smile, european features, clean shaven, slightly graying hair short and neat, "
            "charcoal blazer over open shirt, soft directional studio light, neutral gray gradient background, "
            "three-quarter angle, looking at camera with warmth, 50mm lens, sharp focus on eyes, "
            "monochrome black and white, executive editorial portrait, 8k, photorealistic"
        ),
    },
    {
        "id": "03",
        "slug": "manon",
        "name": "Manon",
        "prompt": (
            "professional black and white portrait photography, 30-35 years old woman, "
            "intelligent focused expression, european features, mid-length straight dark hair, "
            "no makeup natural look, simple dark sweater or blazer, soft window light from left, "
            "neutral background, three-quarter angle, looking slightly off-camera thoughtful, "
            "50mm lens, sharp focus on eyes, monochrome black and white, "
            "editorial tech magazine style, 8k, photorealistic"
        ),
    },
    {
        "id": "04",
        "slug": "alex",
        "name": "Alex",
        "prompt": (
            "professional black and white portrait photography, 28-32 years old androgynous person, "
            "calm intelligent gaze, short tousled hair, simple dark hoodie or tshirt, soft natural light, "
            "plain studio background, frontal slight angle, looking at camera with quiet intensity, "
            "50mm lens, sharp focus, monochrome black and white, "
            "contemporary tech founder portrait, 8k, photorealistic"
        ),
    },
    {
        "id": "05",
        "slug": "june",
        "name": "June",
        "prompt": (
            "professional black and white portrait photography, 30 years old woman, "
            "sharp piercing gaze, asymmetric short undercut hair partially shaved, septum nose ring, "
            "small geometric tattoo on neck, dark technical jacket, dramatic side lighting creating "
            "strong shadows, dark background, three-quarter angle, looking directly at camera with edge, "
            "50mm lens, sharp focus on eyes, monochrome black and white, "
            "high contrast noir, hacker aesthetic, 8k, photorealistic"
        ),
    },
    {
        "id": "06",
        "slug": "orland-opal",
        "name": "Orland Opal",
        "prompt": (
            "professional black and white portrait photography, 60-65 years old man, "
            "wise contemplative expression, salt and pepper neatly trimmed beard, "
            "longer silver hair swept back, dark mandarin collar shirt or knit, soft Rembrandt lighting, "
            "dark studio background, three-quarter angle, looking off-camera reflective, "
            "50mm lens, sharp focus on eyes with depth, monochrome black and white, "
            "mentor philosopher portrait, 8k, photorealistic"
        ),
    },
]

PIXEL_ART = [
    {
        "id": "01",
        "slug": "findor",
        "name": "Findor",
        "prompt": (
            "16-bit pixel art, retro game illustration, an investigator agent in a vintage trench coat "
            "with magnifying glass standing in front of a wall of glowing server racks, holographic blue "
            "data streams floating around, finding hidden client leads, neon cyan and orange palette, "
            "isometric three-quarter view, clean pixel lines, vibrant saturated colors, dramatic lighting, "
            "retro futuristic detective aesthetic, vertical composition, pixel art masterpiece"
        ),
    },
    {
        "id": "02",
        "slug": "scrappowin",
        "name": "Scrappowin",
        "prompt": (
            "16-bit pixel art, 1930s noir gangster era hacker scene Dick Tracy style, mysterious figure "
            "in fedora hat and pinstripe suit operating a vintage banknote printing press, fresh dollar bills "
            "and binary code overlapping, art deco room with stained glass window casting colored light, "
            "smoke from cigarette, green digital code raining over old machinery, neon teal accents, "
            "isometric view, vibrant retro game palette, vertical composition, pixel art masterpiece"
        ),
    },
    {
        "id": "03",
        "slug": "studio-antiguo",
        "name": "Studio-antiguo",
        "prompt": (
            "16-bit pixel art, retro 1980s creative studio room, vintage CRT monitors displaying "
            "AI-generated images and video timelines, film reels stacked, drawing tablet glowing, "
            "cassette tapes, neon palm trees through window, synthwave purple and teal palette, "
            "isometric view, vibrant pixel detail, nostalgic vaporwave aesthetic, vertical composition, "
            "pixel art masterpiece"
        ),
    },
    {
        "id": "04",
        "slug": "openclaw",
        "name": "OpenClaw",
        "prompt": (
            "16-bit pixel art, large mechanical robotic claw descending from above grasping a glowing "
            "translucent brain made of flowing binary code and circuits, server farm background with "
            "blinking LED lights, electric blue and cyan glow, isometric view, dark dramatic atmosphere, "
            "retro tech illustration, vibrant pixel detail, vertical composition, pixel art masterpiece"
        ),
    },
    {
        "id": "05",
        "slug": "agentcron",
        "name": "AgentCron",
        "prompt": (
            "16-bit pixel art, ornate antique grandfather clock with golden gears, twelve different "
            "small AI robot agents emerging from each hour position around the clock face, each agent "
            "doing a different task, gothic library background with bookshelves, candle light warm orange "
            "and ticking blue energy, isometric view, vibrant pixel detail, retro fantasy tech, "
            "vertical composition, pixel art masterpiece"
        ),
    },
    {
        "id": "06",
        "slug": "mairiebot",
        "name": "MairieBot",
        "prompt": (
            "16-bit pixel art, beautiful French town hall mairie building with iconic clock tower and "
            "tricolor flag waving, cobblestone village square with small fountain, glowing cyan "
            "holographic chatbot avatars helping pixel-art citizens, warm sunset light, "
            "French village charm with subtle futuristic touches, vibrant retro game palette warm yellows "
            "blues whites, isometric three-quarter view, vertical composition, pixel art masterpiece"
        ),
    },
    {
        "id": "07",
        "slug": "reportium",
        "name": "Reportium",
        "prompt": (
            "16-bit pixel art, Victorian steampunk office, ornate brass typewriter automatically "
            "generating report papers that fly out and stack themselves neatly, brass gears turning, "
            "steam puffs, warm gas lamp light, cluttered cozy office desk with ink wells, "
            "sepia and brass palette with cyan magical glow, isometric view, vibrant pixel detail, "
            "vertical composition, pixel art masterpiece"
        ),
    },
    {
        "id": "08",
        "slug": "docusweep",
        "name": "DocuSweep",
        "prompt": (
            "16-bit pixel art, magical archive library room, hundreds of documents flying through the "
            "air sorting themselves into the correct shelves and drawers, a small android librarian "
            "conducting them like an orchestra, soft golden particles, towering bookshelves, "
            "mystical organized chaos, warm orange and teal magical palette, isometric view, "
            "vibrant pixel detail, vertical composition, pixel art masterpiece"
        ),
    },
    {
        "id": "09",
        "slug": "cortexlab",
        "name": "CortexLab",
        "prompt": (
            "16-bit pixel art, futuristic neural science laboratory, twelve glowing brain cortex displays "
            "arranged in a circle connected by pulsing neon wires, holographic agent figures floating, "
            "scientist in lab coat at central console, dark high-tech room with cyan and electric purple glow, "
            "complex network of cables and screens, isometric view, vibrant pixel detail, "
            "vertical composition, pixel art masterpiece"
        ),
    },
    {
        "id": "10",
        "slug": "hyperframes-studio",
        "name": "HyperFrames Studio",
        "prompt": (
            "16-bit pixel art, retro 1970s film editing suite, vintage video monitors showing video "
            "timelines and effects, multiple film cameras on tripods, director chair, stacked film reels, "
            "projector beam casting light through dust particles, warm amber and red palette with green "
            "editor monitors, isometric three-quarter view, vibrant pixel detail, cinema nostalgia, "
            "vertical composition, pixel art masterpiece"
        ),
    },
    {
        "id": "11",
        "slug": "tabasco-city",
        "name": "TabascoCity",
        "prompt": (
            "16-bit pixel art, cyberpunk Mexican-inspired city skyline at night, neon-lit NFT art market "
            "stalls in foreground with pixelated artwork displayed, hot pepper neon sign glowing red, "
            "holographic crypto symbols floating, retrofuturistic adobe buildings with cybernetic upgrades, "
            "vibrant red orange and electric purple palette, isometric three-quarter view, "
            "atmospheric depth, vertical composition, pixel art masterpiece"
        ),
    },
    {
        "id": "12",
        "slug": "memorial",
        "name": "Memorial",
        "prompt": (
            "16-bit pixel art, ancient mystical archive vault, floating crystal memory orbs glowing "
            "with stored knowledge, holographic historical documents drifting, mystical robed librarian "
            "android with glowing eyes, gothic stone room with stained glass, soft golden and deep blue "
            "palette with sparkling magical particles, isometric view, vibrant pixel detail, "
            "atmospheric depth, vertical composition, pixel art masterpiece"
        ),
    },
]

PORTRAIT_CONFIG = {
    "checkpoint": "RealVisXL_V5.0_fp16.safetensors",
    "width": 1024,
    "height": 1280,
    "steps": 30,
    "cfg": 6.5,
    "sampler": "dpmpp_2m",
    "scheduler": "karras",
}

PIXEL_CONFIG = {
    "checkpoint": "sd_xl_base_1.0.safetensors",
    "width": 768,
    "height": 1152,
    "steps": 30,
    "cfg": 7.5,
    "sampler": "dpmpp_2m",
    "scheduler": "karras",
}


def submit(prompt_data: dict, config: dict, neg: str) -> dict:
    payload = {
        "prompt": prompt_data["prompt"],
        "negative_prompt": neg,
        **config,
    }
    print(f"  -> POST /api/generate ({config['width']}x{config['height']}, {config['steps']} steps, {config['checkpoint']})")
    t0 = time.time()
    r = requests.post(f"{BASE}/api/generate", json=payload, timeout=TIMEOUT)
    dt = time.time() - t0
    if r.status_code != 200:
        print(f"  [ERR] HTTP {r.status_code} : {r.text[:200]}")
        return {"error": r.text}
    j = r.json()
    print(f"  [OK] done in {dt:.1f}s — job_id={j.get('job_id')}, images={len(j.get('images', []))}")
    return j


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--only", choices=["portraits", "pixelart"], help="Run only one batch")
    parser.add_argument("--skip", default="", help="Comma-separated IDs to skip (e.g. '01,03')")
    args = parser.parse_args()

    skip_ids = set(s.strip() for s in args.skip.split(",") if s.strip())

    # Health check
    try:
        h = requests.get(f"{BASE}/api/health", timeout=5).json()
        if h.get("comfyui", {}).get("status") != "online":
            print(f"[ERR] ComfyUI not online: {h}")
            sys.exit(1)
        print(f"[OK] Backend OK · ComfyUI online · GPU {h['comfyui']['data']['devices'][0]['name']}\n")
    except Exception as e:
        print(f"[ERR] Cannot reach studio-ai backend at {BASE}: {e}")
        sys.exit(1)

    results = []

    if args.only != "pixelart":
        print("=" * 60)
        print("BATCH A — Portraits N&B (6)")
        print("=" * 60)
        for p in PORTRAITS:
            if p["id"] in skip_ids:
                print(f"\n[SKIP] {p['id']} — {p['name']}")
                continue
            print(f"\n[PORTRAIT {p['id']}] {p['name']} ({p['slug']})")
            r = submit(p, PORTRAIT_CONFIG, NEG_PORTRAIT)
            results.append({"type": "portrait", "slug": p["slug"], "result": r})

    if args.only != "portraits":
        print("\n" + "=" * 60)
        print("BATCH B — Pixel art carousel (12)")
        print("=" * 60)
        for p in PIXEL_ART:
            if p["id"] in skip_ids:
                print(f"\n[SKIP] {p['id']} — {p['name']}")
                continue
            print(f"\n[PIXEL {p['id']}] {p['name']} ({p['slug']})")
            r = submit(p, PIXEL_CONFIG, NEG_PIXEL)
            results.append({"type": "pixelart", "slug": p["slug"], "result": r})

    # Save log
    log = Path(__file__).parent / f"generation-log-{int(time.time())}.json"
    log.write_text(json.dumps(results, indent=2, ensure_ascii=False))
    print(f"\n[OK] Done — log: {log}")
    print(f"  Total: {len([r for r in results if 'error' not in r['result']])} success / {len(results)} attempts")


if __name__ == "__main__":
    main()
