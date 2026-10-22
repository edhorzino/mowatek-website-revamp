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

# Logos: tight crop of the horizontal lockup
L = Image.open(f'{SRC}/logos/lockup-original.png').convert('RGB')
bb = L.point(lambda v: 255 - v).convert('L').point(lambda v: 255 if v > 14 else 0).getbbox()
pad = 24
lock = L.crop((bb[0] - pad, bb[1] - pad, bb[2] + pad, bb[3] + pad))
print('lockup', lock.size)
for w in (360, 720):
    lock.resize((w, round(lock.height * w / lock.width)), Image.LANCZOS).save(f'{OUT}/logo-{w}.webp', 'WEBP', quality=94, method=6)

M = Image.open(f'{SRC}/logos/mark-transparent-original.png').convert('RGBA')
mb = M.getbbox(); p = 14
M = M.crop((mb[0] - p, mb[1] - p, mb[2] + p, mb[3] + p))
s = max(M.size)
sq = Image.new('RGBA', (s, s), (0, 0, 0, 0))
sq.paste(M, ((s - M.width) // 2, (s - M.height) // 2), M)
for n in (32, 180, 192, 512):
    sq.resize((n, n), Image.LANCZOS).save(f'{OUT}/mark-{n}.png', optimize=True)
sq.resize((256, 256), Image.LANCZOS).save(f'{R}/public/favicon.ico', sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])

# Palette sample from the lockup (informational only)
c = Counter((r // 16 * 16, g // 16 * 16, b // 16 * 16) for r, g, b in lock.resize((200, 70)).getdata()
            if not (r > 225 and g > 225 and b > 225))
print('palette', [('#%02x%02x%02x' % k, v) for k, v in c.most_common(8)])

# OG image 1200x630
bg = Image.open(f'{SRC}/photos/project-91.webp').convert('RGB').resize((1200, 900)).crop((0, 150, 1200, 780))
ov = Image.new('RGBA', bg.size, (8, 43, 84, 0))
d = ImageDraw.Draw(ov)
for x in range(1200):
    d.line([(x, 0), (x, 630)], fill=(8, 43, 84, int(235 - 150 * x / 1200)))
bg = Image.alpha_composite(bg.convert('RGBA'), ov)
card = Image.new('RGBA', (640, 260), (255, 255, 255, 255))
lk = lock.copy(); lk.thumbnail((560, 200))
card.paste(lk, ((640 - lk.width) // 2, (260 - lk.height) // 2))
bg.paste(card, (60, 185), card)
bg.convert('RGB').save(f'{OUT}/og-image.jpg', 'JPEG', quality=82, optimize=True)

os.makedirs(f'{R}/src', exist_ok=True)
json.dump(MANIFEST, open(f'{R}/src/image-manifest.json', 'w'), indent=1)
