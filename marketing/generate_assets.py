#!/usr/bin/env python3
"""
Genera los assets de marca de La Navaja Suiza en estilo brutalista
(papel crema, tinta negra, bordes duros, sombra dura desplazada; sin glow ni morado).

Salidas:
  ../public/og-image.png        1200x630  (preview al compartir el link)
  story-1-pagina.png            1080x1920 (IG: página/link-in-bio nuevo)
  story-2-formulas.png          1080x1920 (IG: herramienta 06)
  story-3-discord.png           1080x1920 (IG: CTA Discord)

Reutilizable: edita los textos y vuelve a correr `python3 generate_assets.py`.
"""
import os
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))

# ── Paleta (igual que src/theme.js) ──────────────────────────────
PAPER = (251, 247, 236)
PANEL = (255, 255, 255)
INK   = (22, 22, 22)
MUTE  = (92, 92, 84)
FAINT = (154, 154, 140)
GRID  = (234, 228, 214)
ACC = {
    "green":  (47, 125, 79),
    "blue":   (43, 74, 204),
    "yellow": (224, 163, 46),
    "pink":   (207, 59, 107),
    "cyan":   (28, 126, 150),
    "orange": (217, 72, 15),
    "red":    (176, 37, 37),
    "brown":  (122, 82, 48),
}

F_DIR = "/usr/share/fonts/truetype/liberation/"
SANS_B  = F_DIR + "LiberationSans-Bold.ttf"     # ≈ Helvetica/Arial Bold
SANS_R  = F_DIR + "LiberationSans-Regular.ttf"
MONO_B  = F_DIR + "LiberationMono-Bold.ttf"     # ≈ Courier Bold
MONO_R  = F_DIR + "LiberationMono-Regular.ttf"

def font(path, size):
    return ImageFont.truetype(path, size)

def text_on(rgb):
    r, g, b = rgb
    L = (0.299 * r + 0.587 * g + 0.114 * b) / 255
    return INK if L > 0.6 else (255, 255, 255)

# ── helpers de dibujo ─────────────────────────────────────────────
def grid(draw, w, h, step=90):
    for x in range(0, w + 1, step):
        draw.line([(x, 0), (x, h)], fill=GRID, width=1)
    for y in range(0, h + 1, step):
        draw.line([(0, y), (w, y)], fill=GRID, width=1)

def spaced_width(draw, s, f, ls):
    return sum(draw.textlength(c, font=f) + ls for c in s) - (ls if s else 0)

def spaced(draw, pos, s, f, fill, ls=0):
    x, y = pos
    for c in s:
        draw.text((x, y), c, font=f, fill=fill)
        x += draw.textlength(c, font=f) + ls

def chip(draw, pos, text, f, ls=5, padx=20, pady=12, bg=INK, fg=PAPER):
    x, y = pos
    tw = spaced_width(draw, text, f, ls)
    asc, desc = f.getmetrics()
    th = asc + desc
    w, h = tw + padx * 2, th + pady * 2
    draw.rectangle([x, y, x + w, y + h], fill=bg)
    spaced(draw, (x + padx, y + pady), text, f, fg, ls)
    return w, h

def shadow_box(draw, x, y, w, h, fill, off=16, bw=6, border=INK):
    draw.rectangle([x + off, y + off, x + w + off, y + h + off], fill=INK)
    draw.rectangle([x, y, x + w, y + h], fill=fill, outline=border, width=bw)

def wrap(draw, text, f, max_w):
    words, lines, cur = text.split(), [], ""
    for wd in words:
        test = (cur + " " + wd).strip()
        if draw.textlength(test, font=f) <= max_w:
            cur = test
        else:
            if cur:
                lines.append(cur)
            cur = wd
    if cur:
        lines.append(cur)
    return lines

def draw_block(draw, x, y, text, f, fill, max_w, leading=1.12):
    asc, desc = f.getmetrics()
    lh = int((asc + desc) * leading)
    for ln in wrap(draw, text, f, max_w):
        draw.text((x, y), ln, font=f, fill=fill)
        y += lh
    return y

# ── 1) OG IMAGE (1200x630) ────────────────────────────────────────
def og_image():
    W, H = 1200, 630
    img = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(img)
    grid(d, W, H)
    M = 70
    chip(d, (M, 64), "INDUSTRIAS MUÑECO  /  @DAMIANVLAB", font(MONO_B, 26), ls=4)
    y = draw_block(d, M, 150, "La navaja suiza", font(SANS_B, 96), INK, W - 2 * M, 1.0)
    y = draw_block(d, M, y + 4, "del ingeniero", font(SANS_B, 96), INK, W - 2 * M, 1.0)
    d.text((M, y + 22), "6 herramientas de cálculo  -  gratis  -  sin filtros",
           font=font(MONO_R, 30), fill=MUTE)
    # firma: 6 cuadritos de color con numero
    order = ["blue", "green", "orange", "pink", "cyan", "yellow"]
    sz, gap, sx, sy = 64, 18, M, H - 70 - 64
    for i, k in enumerate(order):
        x = sx + i * (sz + gap)
        d.rectangle([x, sy, x + sz, y + 0 if False else sy + sz], fill=ACC[k], outline=INK, width=4)
        n = f"0{i+1}"
        fn = font(MONO_B, 26)
        tw = d.textlength(n, font=fn)
        d.text((x + (sz - tw) / 2, sy + 16), n, font=fn, fill=text_on(ACC[k]))
    dom = "navaja.industriasmuneco.com"
    fd = font(MONO_B, 30)
    d.text((W - M - d.textlength(dom, font=fd), H - 70 - 44), dom, font=fd, fill=INK)
    img.save(os.path.join(HERE, "..", "public", "og-image.png"))
    print("OK  public/og-image.png")

# ── plantilla story ───────────────────────────────────────────────
def story_base():
    W, H = 1080, 1920
    img = Image.new("RGB", (W, H), PAPER)
    d = ImageDraw.Draw(img)
    grid(d, W, H, step=108)
    return img, d, W, H

def footer(d, W, H, M, text="navaja.industriasmuneco.com"):
    fd = font(MONO_B, 30)
    d.text((M, H - 150), text, font=fd, fill=INK)
    d.text((M, H - 108), "Link en mi bio", font=font(MONO_R, 26), fill=MUTE)

# ── 2) STORY 1 — pagina nueva ─────────────────────────────────────
def story_pagina():
    img, d, W, H = story_base()
    M = 90
    chip(d, (M, 140), "MUY IMPORTANTE", font(MONO_B, 30), ls=6)
    y = draw_block(d, M, 300, "Muñecos, traemos noticias", font(SANS_B, 96), INK, W - 2 * M, 1.04)
    body = ("Le di nueva cara a mi página: por primera vez compré un dominio web. "
            "Empezamos por cambiar el link de La Navaja Suiza:")
    y = draw_block(d, M, y + 28, body, font(MONO_R, 34), MUTE, W - 2 * M, 1.4)
    # caja con el dominio nuevo
    bx, by, bw, bh = M, y + 44, W - 2 * M, 205
    shadow_box(d, bx, by, bw, bh, PANEL)
    d.text((bx + 40, by + 44), "navaja", font=font(SANS_B, 82), fill=INK)
    d.text((bx + 40, by + 132), ".industriasmuneco.com", font=font(MONO_B, 38), fill=MUTE)
    cap = "Herramientas, comunidad y contenido. Todo en un solo lugar."
    draw_block(d, M, by + bh + 64, cap, font(MONO_R, 34), MUTE, W - 2 * M, 1.4)
    footer(d, W, H, M)
    img.save(os.path.join(HERE, "story-1-pagina.png"))
    print("OK  marketing/story-1-pagina.png")

# ── 3) STORY 2 — herramienta 06 ───────────────────────────────────
def story_formulas():
    img, d, W, H = story_base()
    M = 90
    chip(d, (M, 150), "¡Y NO SOLO ESO!", font(MONO_B, 30), ls=5, bg=ACC["yellow"], fg=INK)
    d.text((M, 248), "También agregué una herramienta nueva:", font=font(MONO_R, 34), fill=MUTE)
    y = draw_block(d, M, 322, "Biblioteca de Fórmulas", font(SANS_B, 108), INK, W - 2 * M, 1.04)
    # numero gigante 43
    d.text((M, y + 30), "43", font=font(SANS_B, 300), fill=INK)
    d.text((M + 8, y + 350), "fórmulas buscables  -  gratis", font=font(MONO_B, 40), fill=MUTE)
    # chips de categorias con su color
    cats = [("Fluidos", "cyan"), ("Termo", "orange"), ("Resistencia", "blue"),
            ("GD&T", "pink"), ("Metrología", "green"), ("Cálculo", "yellow"),
            ("Eléctrica", "red"), ("Estática", "brown")]
    fx = font(MONO_B, 28)
    x, yy = M, y + 470
    for name, col in cats:
        tw = spaced_width(d, name.upper(), fx, 3)
        w, h = tw + 36, 64
        if x + w > W - M:
            x = M
            yy += h + 18
        d.rectangle([x, yy, x + w, yy + h], fill=ACC[col], outline=INK, width=4)
        spaced(d, (x + 18, yy + 16), name.upper(), fx, text_on(ACC[col]), 3)
        x += w + 18
    footer(d, W, H, M)
    img.save(os.path.join(HERE, "story-2-formulas.png"))
    print("OK  marketing/story-2-formulas.png")

# ── 4) STORY 3 — Discord ──────────────────────────────────────────
def story_discord():
    img, d, W, H = story_base()
    M = 90
    chip(d, (M, 150), "CONSTRUYÁMOSLA JUNTOS", font(MONO_B, 30), ls=4)
    y = draw_block(d, M, 330, "¿Qué fórmula le falta?", font(SANS_B, 116), INK, W - 2 * M, 1.04)
    sub = "Esta biblioteca crece contigo. Dime cuál agregar y la subo: quiero que también sea TU herramienta."
    draw_block(d, M, y + 46, sub, font(MONO_R, 38), MUTE, W - 2 * M, 1.4)
    # CTA Discord (azul de marca)
    bw, bh = W - 2 * M, 180
    bx, by = M, y + 400
    shadow_box(d, bx, by, bw, bh, ACC["blue"])
    txt = "ÚNETE AL DISCORD"
    fb = font(MONO_B, 52)
    tw = spaced_width(d, txt, fb, 4)
    spaced(d, (bx + (bw - tw) / 2, by + 58), txt, fb, (255, 255, 255), 4)
    footer(d, W, H, M)
    img.save(os.path.join(HERE, "story-3-discord.png"))
    print("OK  marketing/story-3-discord.png")

if __name__ == "__main__":
    og_image()
    story_pagina()
    story_formulas()
    story_discord()
    print("\nListo. Assets en marketing/ y public/og-image.png")
