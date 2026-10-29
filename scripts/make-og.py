"""
Genera las imágenes Open Graph (1200x630) del sitio.

    python scripts/make-og.py

Salida: public/og/*.png. Se commitean: el build no las genera.

Composición centrada a propósito: WhatsApp y otros clientes recortan la vista
previa a cuadrado en algunos contextos, y un layout con texto a la izquierda y
gráfico a la derecha se rompe con ese recorte. Todo lo importante vive dentro
del cuadrado central de 630x630.
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

W, H = 1200, 630
CREAM = "#FCF5ED"
INK = "#29220A"
ORANGE = "#EF5E00"
MUTED = "#7B6D44"
LINE = "#EFE6D4"

FONT_BLACK = r"C:\Windows\Fonts\ariblk.ttf"
FONT_BOLD = r"C:\Windows\Fonts\segoeuib.ttf"

OUT = Path("public/og")

CARDS = [
    {
        "slug": "home-es",
        "kicker": "IDLE DE FÁBRICA · ANDROID",
        "title": ["TOCÁ,", "CONSTRUÍ,", "RELAJATE."],
        "sub": "Gratis. Sin registro. Progreso offline.",
        "url": "tapandbuild.com",
    },
    {
        "slug": "home-en",
        "kicker": "IDLE FACTORY · ANDROID",
        "title": ["TAP,", "BUILD,", "UNWIND."],
        "sub": "Free. No sign-up. Offline progress.",
        "url": "tapandbuild.com",
    },
    {
        "slug": "home-de",
        "kicker": "IDLE-FABRIK · ANDROID",
        "title": ["TIPPEN,", "BAUEN,", "ENTSPANNEN."],
        "sub": "Kostenlos. Ohne Anmeldung.",
        "url": "tapandbuild.com/de",
    },
    {
        "slug": "home-ru",
        "kicker": "IDLE-ФАБРИКА · ANDROID",
        "title": ["ТАПАЙ,", "СТРОЙ,", "ОТДЫХАЙ."],
        "sub": "Бесплатно. Без регистрации.",
        "url": "tapandbuild.com/ru",
    },
    {
        "slug": "home-pt",
        "kicker": "IDLE DE FÁBRICA · ANDROID",
        "title": ["TOQUE,", "CONSTRUA,", "RELAXE."],
        "sub": "Grátis. Sem cadastro.",
        "url": "tapandbuild.com/pt",
    },
    {
        "slug": "press",
        "kicker": "PRESS KIT",
        "title": ["TAP & BUILD", "PRESS KIT"],
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
    return Image.blend(im, grid, 0.5)


def fit_font(path, text, max_width, start):
    size = start
    while size > 40:
        font = ImageFont.truetype(path, size)
        if font.getlength(text) <= max_width:
            return font
        size -= 4
    return ImageFont.truetype(path, 40)


def centered(d, text, font, y, fill):
    width = d.textlength(text, font=font)
    d.text(((W - width) / 2, y), text, font=font, fill=fill)


def render(card):
    im = base_canvas()
    d = ImageDraw.Draw(im)

    kicker_font = ImageFont.truetype(FONT_BOLD, 21)
    sub_font = ImageFont.truetype(FONT_BOLD, 30)
    tiny = ImageFont.truetype(FONT_BOLD, 22)

    # Todo el bloque se mantiene dentro del cuadrado central (x 285..915).
    centered(d, card["kicker"], kicker_font, 96, MUTED)

    lines = card["title"]
    fonts = [fit_font(FONT_BLACK, line, 600, 92) for line in lines]

    y = 132
    for index, (line, font) in enumerate(zip(lines, fonts)):
        centered(d, line, font, y, ORANGE if index == len(lines) - 1 else INK)
        y += font.size + 2

    rule_y = y + 20
    d.rectangle([(W - 60) / 2, rule_y, (W + 60) / 2, rule_y + 4], fill=ORANGE)

    centered(d, card["sub"], sub_font, rule_y + 26, MUTED)
    centered(d, card["url"], tiny, H - 72, MUTED)

    return im


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    for card in CARDS:
        path = OUT / f"{card['slug']}.png"
        render(card).save(path, optimize=True)
        print(f"{path}  {path.stat().st_size // 1024} KB")


if __name__ == "__main__":
    main()
