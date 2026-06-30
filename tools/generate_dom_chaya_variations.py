from __future__ import annotations

import asyncio
import base64
import io
import sys
from dataclasses import dataclass
from pathlib import Path
from types import SimpleNamespace

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
BACKEND = ROOT / "domstudio-backend"
DOWNLOADS = Path(r"C:\Users\nate-\Downloads")
OUT_DIR = ROOT / "temp-preview" / "dom-chaya-variations"

sys.path.insert(0, str(BACKEND))
from services.comfy_client import generate_image_with_comfy  # noqa: E402


@dataclass(frozen=True)
class Item:
    slug: str
    label: str
    source: Path
    subject: str
    crop: tuple[float, float, float, float] | None = None


@dataclass(frozen=True)
class Variation:
    slug: str
    label: str
    mode: str
    prompt: str
    style: str
    seed_offset: int


ITEMS = [
    Item(
        "porcelain-vase",
        "Porcelain vase",
        DOWNLOADS / "IMG_4058.JPG",
        "the exact porcelain vases and tea display from the uploaded photo",
    ),
    Item(
        "gold-display",
        "Gold display",
        DOWNLOADS / "IMG_4055.JPG",
        "the exact gold ornate bottles and display arrangement from the uploaded photo",
    ),
    Item(
        "khachapuri",
        "Khachapuri",
        DOWNLOADS / "IMG_4056.JPG",
        "the exact khachapuri dish with egg and melted cheese from the uploaded photo",
    ),
    Item(
        "tea-ceremony",
        "Tea ceremony",
        DOWNLOADS / "IMG_4060.JPG",
        "the exact tea ceremony objects, teapot, bell, and carved head from the uploaded photo",
    ),
    Item(
        "iced-tea",
        "Cafe drink",
        DOWNLOADS / "IMG_4061.JPG",
        "the exact iced tea glass with foam from the uploaded photo",
    ),
    Item(
        "facade",
        "Tea house facade",
        DOWNLOADS / "IMG_4062.JPG",
        "the exact Dom Chaya i Praktik storefront facade from the uploaded photo",
    ),
    Item(
        "blue-porcelain",
        "Blue porcelain",
        DOWNLOADS / "IMG_4059.JPG",
        "the exact blue and red porcelain vessels and tea shelf from the uploaded photo",
    ),
    Item(
        "necklace",
        "Necklace",
        DOWNLOADS / "IMG_4053.jpeg",
        "the exact round gold necklace pendant and chain from the uploaded photo",
        crop=(0.0, 0.03, 1.0, 0.44),
    ),
]


VARIATIONS = [
    Variation(
        "catalog",
        "Catalog",
        "product",
        "Create a clean marketplace catalog image of {subject}. Pure white background, centered composition, accurate shape, material, color, pattern, and every visible detail. No new text, no extra props.",
        "marketplace-ready, sharp edges, soft contact shadow, premium clean ecommerce",
        11,
    ),
    Variation(
        "product",
        "Product",
        "product",
        "Create a premium commercial product photo of {subject}. Refined studio surface, controlled boutique lighting, elegant shadows, high-end product photography. Preserve the item exactly.",
        "sophisticated tea-house brand mood, realistic texture, no wine, no fake labels",
        22,
    ),
    Variation(
        "creative",
        "Creative",
        "creative",
        "Create a scroll-stopping campaign creative for {subject}. Rich but tasteful composition, premium editorial mood, warm highlights, strong visual hierarchy. Preserve the item exactly.",
        "luxury tea-house campaign, cinematic warmth, no text overlay, no logos added",
        33,
    ),
    Variation(
        "lifestyle",
        "Lifestyle",
        "image",
        "Place {subject} in a believable Dom Chaya i Praktik environment. Natural tea-house interior, tactile table surface, warm window light, contextual props that do not cover the item. Preserve the item exactly.",
        "natural lifestyle product photography, realistic shadows, boutique cafe atmosphere",
        44,
    ),
    Variation(
        "context",
        "Scale/context",
        "fitting",
        "Show {subject} in a realistic use-context scene that communicates scale and purpose. If wearable, place it naturally on a model; if food or decor, show it in service/use context. Preserve the item exactly.",
        "realistic context, human-scale cue where appropriate, premium but not fake",
        55,
    ),
    Variation(
        "story",
        "Story",
        "mobile",
        "Create a vertical mobile story visual for {subject}. Keep the subject clear in the safe area with space around it, social-ready crop, polished but authentic. Preserve the item exactly.",
        "9:16 story composition, elegant tea-house social content, no text overlay",
        66,
    ),
]


def load_source(item: Item) -> bytes:
    img = Image.open(item.source).convert("RGB")
    img = ImageOps.exif_transpose(img)
    if item.crop:
        w, h = img.size
        l, t, r, b = item.crop
        img = img.crop((int(w * l), int(h * t), int(w * r), int(h * b)))
    img.thumbnail((1400, 1400), Image.Resampling.LANCZOS)
    buf = io.BytesIO()
    img.save(buf, "JPEG", quality=92, optimize=True)
    return buf.getvalue()


async def generate_one(item: Item, variation: Variation) -> Path:
    item_dir = OUT_DIR / item.slug
    item_dir.mkdir(parents=True, exist_ok=True)
    out = item_dir / f"{variation.slug}.png"
    if out.exists() and out.stat().st_size > 1000:
        print(f"skip {item.slug}/{variation.slug}")
        return out

    image_b64 = base64.b64encode(load_source(item)).decode()
    prompt = variation.prompt.format(subject=item.subject)
    req = SimpleNamespace(
        mode=variation.mode,
        subject=prompt,
        style_hint=variation.style,
        image=image_b64,
        seed=1782000000 + variation.seed_offset + (abs(hash(item.slug)) % 100000),
        upscale_4k=False,
    )
    print(f"generate {item.slug}/{variation.slug}")
    result = await generate_image_with_comfy(req)
    out.write_bytes(base64.b64decode(result["image"]))
    print(f"done {item.slug}/{variation.slug} prompt_id={result.get('prompt_id')}")
    return out


def make_contact_sheet(item: Item) -> Path:
    paths = [(v.label, OUT_DIR / item.slug / f"{v.slug}.png") for v in VARIATIONS]
    thumb_w, thumb_h, label_h = 320, 320, 38
    cols = 3
    rows = 2
    sheet = Image.new("RGB", (cols * thumb_w, rows * (thumb_h + label_h)), "white")
    draw = ImageDraw.Draw(sheet)
    try:
        font = ImageFont.truetype("arial.ttf", 16)
    except OSError:
        font = ImageFont.load_default()

    for idx, (label, path) in enumerate(paths):
        if not path.exists():
            continue
        img = Image.open(path).convert("RGB")
        img = ImageOps.exif_transpose(img)
        thumb = ImageOps.fit(img, (thumb_w, thumb_h), method=Image.Resampling.LANCZOS)
        x = (idx % cols) * thumb_w
        y = (idx // cols) * (thumb_h + label_h)
        sheet.paste(thumb, (x, y))
        draw.rectangle([x, y + thumb_h, x + thumb_w, y + thumb_h + label_h], fill=(248, 248, 248))
        draw.text((x + 10, y + thumb_h + 10), label, fill=(25, 31, 45), font=font)

    out = OUT_DIR / f"{item.slug}-contact-sheet.jpg"
    sheet.save(out, "JPEG", quality=92, optimize=True)
    return out


async def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)
    selected = set(sys.argv[1:]) if len(sys.argv) > 1 else {item.slug for item in ITEMS}
    for item in ITEMS:
        if item.slug not in selected:
            continue
        for variation in VARIATIONS:
            await generate_one(item, variation)
        sheet = make_contact_sheet(item)
        print(f"sheet {sheet}")


if __name__ == "__main__":
    asyncio.run(main())
