#!/usr/bin/env python3
"""Regenerates responsive images, logos, favicons and the OG image from source-assets/originals.
Originals are never modified. Requires Pillow.  Run: python3 tools/optimize-images.py"""
import os, glob, json
from collections import Counter
from PIL import Image, ImageDraw

R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
SRC = f'{R}/source-assets/originals'
OUT = f'{R}/public/assets/img'
os.makedirs(OUT, exist_ok=True)
SKIP = {'11', '32', '39', '53'}  # 11 casual selfie, 32 duplicate of 29, 39 dark/soft, 53 near-duplicate of 45
WIDTHS = [400, 800, 1200]

MANIFEST = {}
for f in sorted(glob.glob(f'{SRC}/photos/project-*.webp')):
    n = os.path.basename(f)[8:10]
    if n in SKIP:
        continue
    im = Image.open(f).convert('RGB')
    w, h = im.size
    ws = sorted({min(x, w) for x in WIDTHS})  # never upscale
    for x in ws:
        im.resize((x, round(h * x / w)), Image.LANCZOS).save(f'{OUT}/p{n}-{x}.webp', 'WEBP', quality=76, method=6)
    MANIFEST[n] = {'w': w, 'h': h, 'widths': ws}
    print(n, im.size, ws)

# Regenerate brand assets from the current approved logo.
import subprocess, sys
subprocess.run([sys.executable, f'{R}/tools/build-brand.py'], check=True)

os.makedirs(f'{R}/src', exist_ok=True)
json.dump(MANIFEST, open(f'{R}/src/image-manifest.json', 'w'), indent=1)
