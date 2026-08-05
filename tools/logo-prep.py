#!/usr/bin/env python3
"""
Prepare a logo bitmap for the site header: knock out the background, tidy the
JPEG artefacts, trim, upscale and sharpen.

    python3 tools/logo-prep.py <source.jpg> [--out assets] [--height 320]

Writes:
    assets/logo.png        header asset, transparent, `--height` tall
    assets/logo-mark.png   192px square, for the favicon and share cards

Why flood fill rather than "make every white pixel transparent": a logo's
interior whites — lettering, highlights, the whites of an eye — are the same
value as the backdrop. Keying globally punches holes through them. Filling
inward from the border only reaches background that is actually connected to
the edge, so interior whites survive.
"""

import argparse
import sys
from collections import deque

try:
    from PIL import Image, ImageFilter
except ImportError:
    sys.exit("Pillow is required:  pip install Pillow")


def background_alpha(img, tol=34, feather=1.2):
    """Alpha channel: 0 where background reaches in from the border, 255 inside."""
    w, h = img.size
    px = img.convert("RGB").load()

    # the corner colour is the backdrop; sampling four corners resists a stray pixel
    corners = [px[0, 0], px[w - 1, 0], px[0, h - 1], px[w - 1, h - 1]]
    bg = tuple(sorted(c[i] for c in corners)[1] for i in range(3))

    def alike(c):
        return all(abs(c[i] - bg[i]) <= tol for i in range(3))

    seen = bytearray(w * h)
    q = deque()
    for x in range(w):
        for y in (0, h - 1):
            if alike(px[x, y]):
                q.append((x, y)); seen[y * w + x] = 1
    for y in range(h):
        for x in (0, w - 1):
            if alike(px[x, y]) and not seen[y * w + x]:
                q.append((x, y)); seen[y * w + x] = 1

    while q:
        x, y = q.popleft()
        for dx, dy in ((1, 0), (-1, 0), (0, 1), (0, -1)):
            nx, ny = x + dx, y + dy
            if 0 <= nx < w and 0 <= ny < h and not seen[ny * w + nx] and alike(px[nx, ny]):
                seen[ny * w + nx] = 1
                q.append((nx, ny))

    mask = Image.frombytes("L", (w, h), bytes(255 if not s else 0 for s in seen))
    # feather so the cut edge does not read as jagged against the page
    return mask.filter(ImageFilter.GaussianBlur(feather)) if feather else mask


def prep(src, out_dir, height, tol, pad):
    src_img = Image.open(src)
    print(f"source            {src_img.width}x{src_img.height}  {src_img.mode}")

    # A source that already carries alpha is finished art — keying it again would
    # only chew at edges the designer already cut. Detect it and leave it alone.
    already_cut = False
    if src_img.mode in ("RGBA", "LA"):
        alpha = src_img.convert("RGBA").getchannel("A")
        clear = alpha.histogram()[0] / (src_img.width * src_img.height)
        already_cut = clear > 0.02
        print(f"existing alpha    {clear:.0%} clear -> "
              f"{'keeping it, no key' if already_cut else 'negligible, keying'}")

    if already_cut:
        rgba = src_img.convert("RGBA")
    else:
        img = src_img.convert("RGB")
        # JPEG mosquito noise sits around the high-contrast outlines; a light
        # median clears it without softening the shapes the way a blur would
        clean = img.filter(ImageFilter.MedianFilter(3))
        rgba = clean.convert("RGBA")
        rgba.putalpha(background_alpha(clean, tol=tol))

    box = rgba.getbbox()
    if box:
        rgba = rgba.crop(box)
        print(f"trimmed to        {rgba.width}x{rgba.height}")

    scale = height / rgba.height
    big = rgba.resize((round(rgba.width * scale), height), Image.LANCZOS)
    if not already_cut:
        big = big.filter(ImageFilter.UnsharpMask(radius=1.6, percent=115, threshold=3))
    print(f"upscaled          {big.width}x{big.height}  ({scale:.2f}x)")

    if pad:
        canvas = Image.new("RGBA", (big.width + pad * 2, big.height + pad * 2), (0, 0, 0, 0))
        canvas.paste(big, (pad, pad), big)
        big = canvas

    out_dir.mkdir(parents=True, exist_ok=True)
    logo = out_dir / "logo.png"
    big.save(logo, optimize=True)
    print(f"wrote             {logo}  {logo.stat().st_size / 1024:.1f} KB")

    side = 192
    sq = Image.new("RGBA", (side, side), (0, 0, 0, 0))
    fit = big.copy()
    fit.thumbnail((side, side), Image.LANCZOS)
    sq.paste(fit, ((side - fit.width) // 2, (side - fit.height) // 2), fit)
    mark = out_dir / "logo-mark.png"
    sq.save(mark, optimize=True)
    print(f"wrote             {mark}  {mark.stat().st_size / 1024:.1f} KB")


if __name__ == "__main__":
    import pathlib

    ap = argparse.ArgumentParser()
    ap.add_argument("source")
    ap.add_argument("--out", default="assets", type=pathlib.Path)
    ap.add_argument("--height", default=320, type=int, help="output height in px")
    ap.add_argument("--tol", default=34, type=int, help="background match tolerance")
    ap.add_argument("--pad", default=0, type=int, help="transparent padding")
    a = ap.parse_args()
    prep(a.source, a.out, a.height, a.tol, a.pad)
