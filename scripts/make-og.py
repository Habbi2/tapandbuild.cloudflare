"""
Genera las imágenes Open Graph (1200x630) del sitio.

    python scripts/make-og.py

Salida: public/og/*.png. Se commitean: el build no las genera.

Para una campaña nueva, agregá una entrada a CARDS y volvé a correrlo.
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
CREAM = "#FCF5ED"
INK = "#29220A"
ORANGE = "#EF5E00"
MUTED = "#7B6D44"
WHITE = "#FFFFFF"
LINE = "#EFE6D4"
BORDER = "#E2D8BE"

FONT_BLACK = r"C:\Windows\Fonts\ariblk.ttf"
FONT_BOLD = r"C:\Windows\Fonts\segoeuib.ttf"

OUT = Path("public/og")

CARDS = [
    {
        "slug": "home-es",
        "kicker": "IDLE DE FÁBRICA · ANDROID",
        "title": ("TOCÁ,", "CONSTRUÍ,"),
        "accent": "RELAJATE.",
        "sub": "Gratis. Sin registro. Progreso offline.",
        "url": "tapandbuild.com/es",
    },
    {
        "slug": "home-en",
        "kicker": "IDLE FACTORY · ANDROID",
        "title": ("TAP,", "BUILD,"),
        "accent": "UNWIND.",
        "sub": "Free. No sign-up. Offline progress.",
        "url": "tapandbuild.com",
    },
    {
        "slug": "press",
        "kicker": "PRESS KIT",
        "title": ("PRESS", "KIT"),
        "accent": "",
        "sub": "Fact sheet, contact and media assets.",
        "url": "tapandbuild.com/prensa",
    },
]


def base_canvas():
    im = Image.new("RGB", (W, H), CREAM)
    grid = Image.new("RGB", (W, H), CREAM)
    gd = ImageDraw.Draw(grid)
    for x in range(0, W, 56):
        gd.line([(x, 0), (x, H)], fill=LINE)
    for y in range(0, H, 56):
        gd.line([(0, y), (W, y)], fill=LINE)
    return Image.blend(im, grid, 0.55)


def draw_phone(d, x, y, size):
    d.rounded_rectangle([x, y, x + size, y + size], radius=46, fill=WHITE, outline=BORDER, width=3)
    d.rounded_rectangle([x + 16, y + 16, x + size - 16, y + size - 16], radius=34, fill=CREAM)
    d.rounded_rectangle([x + size // 2 - 35, y + 34, x + size // 2 + 35, y + 44], radius=6, fill=BORDER)
    r = int(size * 0.3)
    cx, cy = x + size // 2, y + int(size * 0.55)
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=ORANGE, outline="#C2410C", width=4)


def render(card):
    im = base_canvas()
    d = ImageDraw.Draw(im)

    black = ImageFont.truetype(FONT_BLACK, 104)
    small = ImageFont.truetype(FONT_BOLD, 21)
    mid = ImageFont.truetype(FONT_BOLD, 28)
    tiny = ImageFont.truetype(FONT_BOLD, 20)

    d.rectangle([56, 54, 62, 88], fill=ORANGE)
    d.text((78, 58), card["kicker"], font=small, fill=MUTED)

    y = 140
    for line in card["title"]:
        d.text((56, y), line, font=black, fill=INK)
        y += 112
    if card["accent"]:
        d.text((56, y), card["accent"], font=black, fill=ORANGE)
        y += 118

    d.text((58, y + 14), card["sub"], font=mid, fill=MUTED)

    size = 300 if card["accent"] else 240
    draw_phone(d, W - size - 96, (H - size) // 2, size)

    d.text((56, H - 66), card["url"], font=tiny, fill=MUTED)
    return im


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for card in CARDS:
        path = OUT / f"{card['slug']}.png"
        render(card).save(path, optimize=True)
        print(f"{path}  {path.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
