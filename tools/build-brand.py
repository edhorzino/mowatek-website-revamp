"""Build website logo variants from the supplied logo, preserving its colours and shape."""
from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'source-assets/originals/logos/mowatek-new-logo.jpg'
OUT = ROOT / 'public/assets/img'
OUT.mkdir(parents=True, exist_ok=True)
logo = Image.open(SOURCE).convert('RGB')
for width in (360, 720):
    logo.resize((width, width), Image.Resampling.LANCZOS).save(OUT / f'logo-{width}.webp', quality=94, method=6)
for size in (32, 180, 192, 512):
    logo.resize((size, size), Image.Resampling.LANCZOS).save(OUT / f'mark-{size}.png', optimize=True)
logo.resize((256, 256), Image.Resampling.LANCZOS).save(ROOT / 'public/favicon.ico', sizes=[(16, 16), (32, 32), (48, 48), (64, 64)])

# Preserve the existing social-card photograph and overlay treatment.
bg = Image.open(ROOT / 'source-assets/originals/photos/project-91.webp').convert('RGB').resize((1200, 900)).crop((0, 150, 1200, 780))
overlay = Image.new('RGBA', bg.size)
draw = ImageDraw.Draw(overlay)
for x in range(1200):
    draw.line([(x, 0), (x, 630)], fill=(8, 43, 84, int(235 - 150 * x / 1200)))
bg = Image.alpha_composite(bg.convert('RGBA'), overlay)
card = Image.new('RGBA', (640, 260), 'white')
card.paste(logo.resize((200, 200), Image.Resampling.LANCZOS), (220, 30))
bg.paste(card, (60, 185), card)
bg.convert('RGB').save(OUT / 'og-image.jpg', quality=82, optimize=True)
print('Updated logo, favicon, touch icons and social preview.')
