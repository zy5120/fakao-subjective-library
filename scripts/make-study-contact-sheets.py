#!/usr/bin/env python3
"""Create compact contact sheets for full-PDF visual inspection."""

from pathlib import Path

from PIL import Image, ImageDraw


ROOT = Path(__file__).resolve().parents[1]
INPUT = ROOT / "tmp" / "pdfs" / "study-pages"
OUTPUT = ROOT / "tmp" / "pdfs" / "study-contacts"
PER_SHEET = 16
COLS = 4
ROWS = 4
THUMB_WIDTH = 300
MARGIN = 20
LABEL_HEIGHT = 28


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    pages = sorted(INPUT.glob("page-*.png"))
    if not pages:
        raise SystemExit(f"No rendered pages found in {INPUT}")

    with Image.open(pages[0]) as sample:
        thumb_height = round(sample.height * THUMB_WIDTH / sample.width)

    sheet_width = MARGIN + COLS * (THUMB_WIDTH + MARGIN)
    sheet_height = MARGIN + ROWS * (thumb_height + LABEL_HEIGHT + MARGIN)

    for sheet_index, offset in enumerate(range(0, len(pages), PER_SHEET), start=1):
        canvas = Image.new("RGB", (sheet_width, sheet_height), "#d8dadd")
        draw = ImageDraw.Draw(canvas)
        for index, page_path in enumerate(pages[offset : offset + PER_SHEET]):
            row, col = divmod(index, COLS)
            x = MARGIN + col * (THUMB_WIDTH + MARGIN)
            y = MARGIN + row * (thumb_height + LABEL_HEIGHT + MARGIN)
            with Image.open(page_path) as page:
                thumb = page.convert("RGB")
                thumb.thumbnail((THUMB_WIDTH, thumb_height), Image.Resampling.LANCZOS)
                canvas.paste(thumb, (x, y))
            draw.text((x, y + thumb_height + 5), page_path.stem, fill="#202124")
        target = OUTPUT / f"contact-{sheet_index:02d}.jpg"
        canvas.save(target, quality=88, optimize=True)
        print(target)


if __name__ == "__main__":
    main()
