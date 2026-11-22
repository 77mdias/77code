"""Gera as imagens da abertura a partir das fontes em design/ e public/static/frames2/.

Uso: python3 -I scripts/make-images.py  (Pillow; mesma entrada, mesma saída)
"""
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
BG = ROOT / 'design/fundo-hero/delegacia-noir-gemini.jpeg'
HUMANE = ROOT / 'design/fonts/HUMANE Typeface/HUMANE Typeface/Web-TT/Humane-Bold.ttf'
FRAMES = ROOT / 'public/static/frames2'
OPENING = ROOT / 'public/static/opening'
INK, PAPER = (13, 13, 13), (243, 240, 232)


def resize_width(img, width):
    return img.resize((width, round(img.height * width / img.width)), Image.LANCZOS)


def background():
    OPENING.mkdir(exist_ok=True)
    bg = Image.open(BG).convert('RGB')
    for width in (1920, 2752):
        resize_width(bg, width).save(OPENING / f'bg-{width}.webp', quality=82, method=6)


def mobile_frames():
    (FRAMES / 'm').mkdir(exist_ok=True)
    for n in range(1, 41):
        frame = Image.open(FRAMES / f'Image{n}.webp')
        resize_width(frame, 960).save(FRAMES / 'm' / f'Image{n}.webp', quality=82, method=6)


def og():
    w, h = 1200, 630
    bg = resize_width(Image.open(BG).convert('RGB'), w)
    card = bg.crop((0, (bg.height - h) // 2, w, (bg.height - h) // 2 + h))
    # Quadro 40: o Jean já virado para a câmera, à direita como na abertura.
    jean = Image.open(FRAMES / 'Image40.webp').convert('RGBA')
    jean = jean.resize((round(jean.width * h / jean.height), h), Image.LANCZOS)
    card.paste(jean, (w - jean.width + 260, 0), jean)
    draw = ImageDraw.Draw(card)
    font = ImageFont.truetype(str(HUMANE), 340)
    # Mesmo título da abertura: letra papel, contorno e sombra chapada de nanquim.
    draw.text((75, 45), 'DIAS77', font=font, fill=INK, stroke_width=2, stroke_fill=INK)
    draw.text((70, 40), 'DIAS77', font=font, fill=PAPER, stroke_width=2, stroke_fill=INK)
    card.save(ROOT / 'public/og.jpg', quality=85, optimize=True)


if __name__ == '__main__':
    background()
    mobile_frames()
    og()
