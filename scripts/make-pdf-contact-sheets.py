from pathlib import Path
from PIL import Image, ImageDraw

root = Path(__file__).resolve().parent.parent
pages = sorted((root / "tmp" / "pdf-pages").glob("page-*.png"))
target_dir = root / "tmp" / "pdf-contact-sheets"
target_dir.mkdir(parents=True, exist_ok=True)

chunk_size = 13
thumb_width = 360
for sheet_index in range(0, len(pages), chunk_size):
    chunk = pages[sheet_index:sheet_index + chunk_size]
    thumbs = []
    for page_number, page_path in enumerate(chunk, start=sheet_index + 1):
        with Image.open(page_path) as source:
            height = round(source.height * thumb_width / source.width)
            image = source.resize((thumb_width, height))
        panel = Image.new("RGB", (thumb_width + 16, height + 42), "#d9ddd9")
        panel.paste(image, (8, 30))
        ImageDraw.Draw(panel).text((10, 8), f"Page {page_number}", fill="#17211c")
        thumbs.append(panel)
    columns = 4
    rows = (len(thumbs) + columns - 1) // columns
    cell_width = max(item.width for item in thumbs)
    cell_height = max(item.height for item in thumbs)
    sheet = Image.new("RGB", (cell_width * columns, cell_height * rows), "#bfc6c1")
    for index, image in enumerate(thumbs):
        x = (index % columns) * cell_width
        y = (index // columns) * cell_height
        sheet.paste(image, (x, y))
    sheet.save(target_dir / f"contact-{sheet_index // chunk_size + 1}.jpg", quality=90)

print(len(pages), len(list(target_dir.glob("contact-*.jpg"))))
