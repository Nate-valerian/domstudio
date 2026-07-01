from __future__ import annotations

import html
import re
from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import (
    ListFlowable,
    ListItem,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "SOCIAL_MEDIA_ROADMAP.md"
OUT = ROOT / "SOCIAL_MEDIA_ROADMAP.pdf"
FONT_DIR = Path(r"C:\Windows\Fonts")


def register_fonts() -> tuple[str, str]:
    regular = FONT_DIR / "arial.ttf"
    bold = FONT_DIR / "arialbd.ttf"
    if regular.exists() and bold.exists():
        pdfmetrics.registerFont(TTFont("Roadmap", str(regular)))
        pdfmetrics.registerFont(TTFont("Roadmap-Bold", str(bold)))
        return "Roadmap", "Roadmap-Bold"
    return "Helvetica", "Helvetica-Bold"


FONT, FONT_BOLD = register_fonts()


styles = {
    "title": ParagraphStyle(
        "title",
        fontName=FONT_BOLD,
        fontSize=21,
        leading=25,
        textColor=colors.HexColor("#172033"),
        alignment=TA_CENTER,
        spaceAfter=8,
    ),
    "subtitle": ParagraphStyle(
        "subtitle",
        fontName=FONT,
        fontSize=10,
        leading=13,
        textColor=colors.HexColor("#5C667A"),
        alignment=TA_CENTER,
        spaceAfter=18,
    ),
    "h2": ParagraphStyle(
        "h2",
        fontName=FONT_BOLD,
        fontSize=13,
        leading=16,
        textColor=colors.HexColor("#172033"),
        spaceBefore=11,
        spaceAfter=6,
        keepWithNext=True,
    ),
    "h3": ParagraphStyle(
        "h3",
        fontName=FONT_BOLD,
        fontSize=10.5,
        leading=13,
        textColor=colors.HexColor("#293449"),
        spaceBefore=8,
        spaceAfter=3,
        keepWithNext=True,
    ),
    "body": ParagraphStyle(
        "body",
        fontName=FONT,
        fontSize=9.4,
        leading=12.3,
        textColor=colors.HexColor("#232A36"),
        alignment=TA_LEFT,
        spaceAfter=5,
    ),
    "bullet": ParagraphStyle(
        "bullet",
        fontName=FONT,
        fontSize=9.2,
        leading=12,
        textColor=colors.HexColor("#232A36"),
        leftIndent=10,
        firstLineIndent=0,
        spaceAfter=3,
    ),
    "table": ParagraphStyle(
        "table",
        fontName=FONT,
        fontSize=8.2,
        leading=10.4,
        textColor=colors.HexColor("#232A36"),
    ),
    "table_header": ParagraphStyle(
        "table_header",
        fontName=FONT_BOLD,
        fontSize=8.4,
        leading=10.5,
        textColor=colors.white,
    ),
}


def inline(text: str) -> str:
    text = html.escape(text)
    text = re.sub(r"`([^`]+)`", r'<font name="Courier">\1</font>', text)
    text = re.sub(r"\*\*([^*]+)\*\*", rf'<font name="{FONT_BOLD}">\1</font>', text)
    return text


def paragraph(text: str, style: str = "body") -> Paragraph:
    return Paragraph(inline(text), styles[style])


def flush_paragraph(buffer: list[str], story: list[object]) -> None:
    if not buffer:
        return
    story.append(paragraph(" ".join(part.strip() for part in buffer)))
    buffer.clear()


def make_bullets(items: list[str]) -> ListFlowable:
    return ListFlowable(
        [ListItem(paragraph(item, "bullet"), leftIndent=8) for item in items],
        bulletType="bullet",
        start="circle",
        leftIndent=16,
        bulletFontName=FONT,
        bulletFontSize=7,
        bulletColor=colors.HexColor("#5068A9"),
    )


def table_widths(rows: list[list[str]]) -> list[float]:
    cols = len(rows[0])
    if cols == 2:
        return [0.85 * inch, 5.45 * inch]
    if cols == 3:
        return [2.25 * inch, 0.78 * inch, 3.27 * inch]
    return [6.3 * inch / cols for _ in range(cols)]


def make_table(rows: list[list[str]]) -> Table:
    data = []
    for row_idx, row in enumerate(rows):
        style = "table_header" if row_idx == 0 else "table"
        data.append([Paragraph(inline(cell), styles[style]) for cell in row])
    table = Table(data, colWidths=table_widths(rows), repeatRows=1, hAlign="LEFT")
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#263A6B")),
                ("BACKGROUND", (0, 1), (-1, -1), colors.HexColor("#F7F8FC")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#D5DAE8")),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("LEFTPADDING", (0, 0), (-1, -1), 6),
                ("RIGHTPADDING", (0, 0), (-1, -1), 6),
                ("TOPPADDING", (0, 0), (-1, -1), 5),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 5),
            ]
        )
    )
    return table


def parse_table(lines: list[str], start: int) -> tuple[list[list[str]], int]:
    rows: list[list[str]] = []
    idx = start
    while idx < len(lines) and lines[idx].lstrip().startswith("|"):
        raw = lines[idx].strip()
        cells = [cell.strip() for cell in raw.strip("|").split("|")]
        if not all(set(cell) <= {"-", ":", " "} for cell in cells):
            rows.append(cells)
        idx += 1
    return rows, idx


def build_story(markdown: str) -> list[object]:
    lines = markdown.splitlines()
    story: list[object] = []
    paragraph_buffer: list[str] = []
    bullet_buffer: list[str] = []
    number_buffer: list[str] = []
    idx = 0

    def flush_lists() -> None:
        if bullet_buffer:
            story.append(make_bullets(bullet_buffer))
            story.append(Spacer(1, 3))
            bullet_buffer.clear()
        if number_buffer:
            story.append(
                ListFlowable(
                    [ListItem(paragraph(item, "bullet"), leftIndent=8) for item in number_buffer],
                    bulletType="1",
                    leftIndent=18,
                    bulletFontName=FONT,
                    bulletFontSize=8,
                )
            )
            story.append(Spacer(1, 3))
            number_buffer.clear()

    while idx < len(lines):
        line = lines[idx]
        stripped = line.strip()

        if not stripped:
            flush_paragraph(paragraph_buffer, story)
            flush_lists()
            idx += 1
            continue

        if stripped.startswith("|"):
            flush_paragraph(paragraph_buffer, story)
            flush_lists()
            rows, idx = parse_table(lines, idx)
            if rows:
                story.append(make_table(rows))
                story.append(Spacer(1, 8))
            continue

        if stripped.startswith("# "):
            flush_paragraph(paragraph_buffer, story)
            flush_lists()
            story.append(Paragraph(inline(stripped[2:]), styles["title"]))
            idx += 1
            continue

        if stripped.startswith("Draft "):
            flush_paragraph(paragraph_buffer, story)
            flush_lists()
            story.append(Paragraph(inline(stripped), styles["subtitle"]))
            idx += 1
            continue

        if stripped.startswith("## "):
            flush_paragraph(paragraph_buffer, story)
            flush_lists()
            if stripped == "## Phase 1 build order":
                story.append(PageBreak())
            if story:
                story.append(Spacer(1, 4))
            story.append(Paragraph(inline(stripped[3:]), styles["h2"]))
            idx += 1
            continue

        if stripped.startswith("### "):
            flush_paragraph(paragraph_buffer, story)
            flush_lists()
            story.append(Paragraph(inline(stripped[4:]), styles["h3"]))
            idx += 1
            continue

        if stripped.startswith("- "):
            flush_paragraph(paragraph_buffer, story)
            number_buffer.clear()
            bullet_buffer.append(stripped[2:])
            idx += 1
            continue

        match = re.match(r"^(\d+)\.\s+(.*)$", stripped)
        if match:
            flush_paragraph(paragraph_buffer, story)
            bullet_buffer.clear()
            number_buffer.append(match.group(2))
            idx += 1
            continue

        if bullet_buffer:
            bullet_buffer[-1] += " " + stripped
        elif number_buffer:
            number_buffer[-1] += " " + stripped
        else:
            paragraph_buffer.append(stripped)
        idx += 1

    flush_paragraph(paragraph_buffer, story)
    flush_lists()
    return story


def draw_footer(canvas, doc) -> None:
    canvas.saveState()
    canvas.setFont(FONT, 8)
    canvas.setFillColor(colors.HexColor("#6D7483"))
    canvas.drawString(doc.leftMargin, 0.45 * inch, "DomStudio Social Media / Influencer Affiliate Roadmap")
    canvas.drawRightString(A4[0] - doc.rightMargin, 0.45 * inch, f"Page {doc.page}")
    canvas.restoreState()


def main() -> None:
    doc = SimpleDocTemplate(
        str(OUT),
        pagesize=A4,
        leftMargin=0.62 * inch,
        rightMargin=0.62 * inch,
        topMargin=0.58 * inch,
        bottomMargin=0.72 * inch,
        title="DomStudio Social Media / Influencer Affiliate Roadmap",
        author="DomStudio",
    )
    story = build_story(SRC.read_text(encoding="utf-8"))
    doc.build(story, onFirstPage=draw_footer, onLaterPages=draw_footer)
    print(OUT)


if __name__ == "__main__":
    main()
