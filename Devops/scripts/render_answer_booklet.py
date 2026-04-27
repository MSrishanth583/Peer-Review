#!/usr/bin/env python3

from __future__ import annotations

import re
import sys
import textwrap
from dataclasses import dataclass
from pathlib import Path


PAGE_WIDTH = 595
PAGE_HEIGHT = 842
LEFT_MARGIN = 54
RIGHT_MARGIN = 54
TOP_MARGIN = 54
BOTTOM_MARGIN = 54
CONTENT_WIDTH = PAGE_WIDTH - LEFT_MARGIN - RIGHT_MARGIN


@dataclass
class DrawLine:
    text: str
    font: str
    size: int
    leading: int


def escape_pdf_text(text: str) -> str:
    return (
        text.replace("\\", "\\\\")
        .replace("(", "\\(")
        .replace(")", "\\)")
    )


def wrap_text(text: str, width_chars: int) -> list[str]:
    text = re.sub(r"\s+", " ", text).strip()
    if not text:
        return [""]
    return textwrap.wrap(
        text,
        width=width_chars,
        break_long_words=False,
        break_on_hyphens=False,
    )


def parse_markdown(markdown: str) -> list[DrawLine]:
    lines = markdown.splitlines()
    out: list[DrawLine] = []
    in_code = False

    for raw in lines:
        line = raw.rstrip()

        if line.startswith("```"):
            in_code = not in_code
            if not in_code:
                out.append(DrawLine("", "Helvetica", 11, 16))
            continue

        if in_code:
            for wrapped in wrap_text(line, 72):
                out.append(DrawLine(wrapped, "Courier", 9, 13))
            continue

        if not line.strip():
            out.append(DrawLine("", "Helvetica", 11, 16))
            continue

        if line.startswith("# "):
            for wrapped in wrap_text(line[2:].strip(), 48):
                out.append(DrawLine(wrapped, "Helvetica-Bold", 20, 28))
            out.append(DrawLine("", "Helvetica", 11, 14))
            continue

        if line.startswith("## "):
            for wrapped in wrap_text(line[3:].strip(), 56):
                out.append(DrawLine(wrapped, "Helvetica-Bold", 16, 22))
            out.append(DrawLine("", "Helvetica", 11, 12))
            continue

        if line.startswith("### "):
            for wrapped in wrap_text(line[4:].strip(), 62):
                out.append(DrawLine(wrapped, "Helvetica-Bold", 13, 18))
            continue

        if re.match(r"^\d+\.\s", line):
            prefix, body = line.split(".", 1)
            wrapped = wrap_text(body.strip(), 72)
            for i, part in enumerate(wrapped):
                leader = f"{prefix}. " if i == 0 else "   "
                out.append(DrawLine(f"{leader}{part}", "Helvetica", 11, 16))
            continue

        if line.lstrip().startswith("- "):
            body = line.lstrip()[2:].strip()
            wrapped = wrap_text(body, 72)
            for i, part in enumerate(wrapped):
                leader = "- " if i == 0 else "  "
                out.append(DrawLine(f"{leader}{part}", "Helvetica", 11, 16))
            continue

        paragraph_width = 78
        for wrapped in wrap_text(line, paragraph_width):
            out.append(DrawLine(wrapped, "Helvetica", 11, 16))

    return out


def paginate(lines: list[DrawLine]) -> list[list[DrawLine]]:
    pages: list[list[DrawLine]] = []
    current: list[DrawLine] = []
    y = PAGE_HEIGHT - TOP_MARGIN

    for line in lines:
        if y - line.leading < BOTTOM_MARGIN:
            pages.append(current)
            current = []
            y = PAGE_HEIGHT - TOP_MARGIN
        current.append(line)
        y -= line.leading

    if current:
        pages.append(current)

    return pages


def build_page_stream(lines: list[DrawLine], page_num: int, page_count: int) -> bytes:
    parts: list[str] = []
    y = PAGE_HEIGHT - TOP_MARGIN

    for line in lines:
        if line.text:
            parts.append(
                f"BT /{line.font.replace('-', '')} {line.size} Tf "
                f"1 0 0 1 {LEFT_MARGIN} {y} Tm "
                f"({escape_pdf_text(line.text)}) Tj ET"
            )
        y -= line.leading

    footer = f"Page {page_num} of {page_count}"
    parts.append(
        f"BT /Helvetica 10 Tf 1 0 0 1 {PAGE_WIDTH - RIGHT_MARGIN - 70} 28 Tm "
        f"({escape_pdf_text(footer)}) Tj ET"
    )
    return "\n".join(parts).encode("latin-1", "replace")


def write_pdf(lines: list[DrawLine], output_path: Path) -> None:
    pages = paginate(lines)
    page_streams = [
        build_page_stream(page_lines, idx + 1, len(pages))
        for idx, page_lines in enumerate(pages)
    ]

    objects: list[bytes] = []

    def add_object(data: bytes | str) -> int:
        blob = data.encode("latin-1") if isinstance(data, str) else data
        objects.append(blob)
        return len(objects)

    font_helvetica = add_object("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>")
    font_bold = add_object("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>")
    font_courier = add_object("<< /Type /Font /Subtype /Type1 /BaseFont /Courier >>")

    content_ids = []
    for stream in page_streams:
        content_ids.append(
            add_object(
                b"<< /Length "
                + str(len(stream)).encode("ascii")
                + b" >>\nstream\n"
                + stream
                + b"\nendstream"
            )
        )

    page_ids = []
    pages_obj_id_placeholder = len(objects) + len(content_ids) + 1
    for content_id in content_ids:
        page_ids.append(
            add_object(
                (
                    "<< /Type /Page /Parent {parent} 0 R "
                    "/MediaBox [0 0 595 842] "
                    "/Resources << /Font << "
                    f"/Helvetica {font_helvetica} 0 R "
                    f"/HelveticaBold {font_bold} 0 R "
                    f"/Courier {font_courier} 0 R "
                    ">> >> "
                    f"/Contents {content_id} 0 R >>"
                ).format(parent=pages_obj_id_placeholder)
            )
        )

    kids = " ".join(f"{pid} 0 R" for pid in page_ids)
    pages_id = add_object(f"<< /Type /Pages /Count {len(page_ids)} /Kids [{kids}] >>")
    catalog_id = add_object(f"<< /Type /Catalog /Pages {pages_id} 0 R >>")

    pdf = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets = [0]

    for idx, obj in enumerate(objects, start=1):
        offsets.append(len(pdf))
        pdf.extend(f"{idx} 0 obj\n".encode("latin-1"))
        pdf.extend(obj)
        pdf.extend(b"\nendobj\n")

    xref_start = len(pdf)
    pdf.extend(f"xref\n0 {len(objects)+1}\n".encode("latin-1"))
    pdf.extend(b"0000000000 65535 f \n")
    for off in offsets[1:]:
        pdf.extend(f"{off:010d} 00000 n \n".encode("latin-1"))
    pdf.extend(
        (
            f"trailer\n<< /Size {len(objects)+1} /Root {catalog_id} 0 R >>\n"
            f"startxref\n{xref_start}\n%%EOF\n"
        ).encode("latin-1")
    )
    output_path.write_bytes(pdf)


def main() -> int:
    if len(sys.argv) != 3:
        print("Usage: render_answer_booklet.py <input.md> <output.pdf>", file=sys.stderr)
        return 1

    input_path = Path(sys.argv[1])
    output_path = Path(sys.argv[2])

    markdown = input_path.read_text(encoding="utf-8")
    lines = parse_markdown(markdown)
    write_pdf(lines, output_path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
