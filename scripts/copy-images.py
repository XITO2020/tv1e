"""Copie les images generees vers public/team et public/carousel."""
from __future__ import annotations
import json
import shutil
from pathlib import Path

ROOT = Path(__file__).parent.parent
SOURCE_DIR = Path("C:/Users/naimd/Documents/QISHIM-CORTEX/softwares/studio-ai/assets/generated")
LOG = ROOT / "scripts" / "generation-log-1778013494.json"

PUBLIC_TEAM = ROOT / "public" / "team"
PUBLIC_CAROUSEL = ROOT / "public" / "carousel"
PUBLIC_TEAM.mkdir(parents=True, exist_ok=True)
PUBLIC_CAROUSEL.mkdir(parents=True, exist_ok=True)

data = json.loads(LOG.read_text(encoding="utf-8"))

ok = 0
err = 0
for entry in data:
    typ = entry["type"]
    slug = entry["slug"]
    images = entry.get("result", {}).get("images", [])
    if not images:
        print(f"[ERR] {slug}: no images in result")
        err += 1
        continue
    src_rel = images[0]["rel_path"]
    src = SOURCE_DIR / src_rel
    if not src.exists():
        print(f"[ERR] {slug}: source not found {src}")
        err += 1
        continue

    dest_dir = PUBLIC_TEAM if typ == "portrait" else PUBLIC_CAROUSEL
    dest = dest_dir / f"{slug}.png"
    shutil.copy2(src, dest)
    print(f"[OK] {typ:10} {slug:20} -> {dest.relative_to(ROOT)}")
    ok += 1

print(f"\nDone: {ok} copied, {err} errors")
