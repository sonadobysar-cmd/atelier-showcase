#!/usr/bin/env python3
"""Generate crisp PNG favicons from project designs (32px + 180px)."""

from __future__ import annotations

import struct
import zlib
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "public"


def hex_rgb(value: str) -> tuple[int, int, int]:
    value = value.lstrip("#")
    return tuple(int(value[i : i + 2], 16) for i in (0, 2, 4))


def scale(value: float, size: int, base: int = 32) -> int:
    return round(value * size / base)


def rounded_rect(
    pixels: list[list[tuple[int, int, int, int]]],
    x0: int,
    y0: int,
    x1: int,
    y1: int,
    radius: int,
    color: tuple[int, int, int, int],
) -> None:
    radius = max(0, min(radius, (x1 - x0) // 2, (y1 - y0) // 2))
    for y in range(y0, y1 + 1):
        for x in range(x0, x1 + 1):
            inside = x0 + radius <= x <= x1 - radius or y0 + radius <= y <= y1 - radius
            if inside:
                pixels[y][x] = color
                continue
            corners = (
                (x0 + radius, y0 + radius, x <= x0 + radius and y <= y0 + radius),
                (x1 - radius, y0 + radius, x >= x1 - radius and y <= y0 + radius),
                (x0 + radius, y1 - radius, x <= x0 + radius and y >= y1 - radius),
                (x1 - radius, y1 - radius, x >= x1 - radius and y >= y1 - radius),
            )
            for cx, cy, test in corners:
                if test and (x - cx) ** 2 + (y - cy) ** 2 <= radius**2:
                    pixels[y][x] = color
                    break


def fill_circle(
    pixels: list[list[tuple[int, int, int, int]]],
    cx: int,
    cy: int,
    radius: int,
    color: tuple[int, int, int, int],
    stroke: int = 0,
) -> None:
    size = len(pixels)
    inner = max(0, radius - stroke)
    for y in range(size):
        for x in range(size):
            dist = (x - cx) ** 2 + (y - cy) ** 2
            if stroke and inner**2 < dist <= radius**2:
                pixels[y][x] = color
            elif not stroke and dist <= radius**2:
                pixels[y][x] = color


def draw_line(
    pixels: list[list[tuple[int, int, int, int]]],
    x0: int,
    y0: int,
    x1: int,
    y1: int,
    color: tuple[int, int, int, int],
    width: int,
) -> None:
    steps = max(abs(x1 - x0), abs(y1 - y0), 1)
    for i in range(steps + 1):
        t = i / steps
        x = round(x0 + (x1 - x0) * t)
        y = round(y0 + (y1 - y0) * t)
        for dy in range(-width // 2, width // 2 + 1):
            for dx in range(-width // 2, width // 2 + 1):
                px, py = x + dx, y + dy
                if 0 <= px < len(pixels) and 0 <= py < len(pixels):
                    pixels[py][px] = color


def draw_polygon(
    pixels: list[list[tuple[int, int, int, int]]],
    points: list[tuple[int, int]],
    color: tuple[int, int, int, int],
) -> None:
    min_y = min(y for _, y in points)
    max_y = max(y for _, y in points)
    for y in range(min_y, max_y + 1):
        intersections: list[float] = []
        for i in range(len(points)):
            x1, y1 = points[i]
            x2, y2 = points[(i + 1) % len(points)]
            if y1 == y2:
                continue
            if min(y1, y2) <= y <= max(y1, y2):
                intersections.append(x1 + (y - y1) * (x2 - x1) / (y2 - y1))
        intersections.sort()
        for i in range(0, len(intersections) - 1, 2):
            x_start = int(intersections[i])
            x_end = int(intersections[i + 1])
            for x in range(x_start, x_end + 1):
                if 0 <= x < len(pixels) and 0 <= y < len(pixels):
                    pixels[y][x] = color


def draw_letter_l(
    pixels: list[list[tuple[int, int, int, int]]],
    size: int,
    color: tuple[int, int, int, int],
) -> None:
    w = max(2, scale(3, size))
    x0, y0 = scale(10, size), scale(8, size)
    x1, y1 = scale(14, size), scale(22, size)
    for y in range(y0, y1 + 1):
        for x in range(x0, x0 + w):
            pixels[y][x] = color
    for y in range(y1 - w + 1, y1 + 1):
        for x in range(x0, scale(22, size) + 1):
            pixels[y][x] = color


def render_masterclass(size: int) -> list[list[tuple[int, int, int, int]]]:
    pixels = [[(0, 0, 0, 0) for _ in range(size)] for _ in range(size)]
    bg = (*hex_rgb("#7C3AED"), 255)
    rounded_rect(pixels, 0, 0, size - 1, size - 1, scale(8, size), bg)
    draw_polygon(
        pixels,
        [
            (scale(12, size), scale(9, size)),
            (scale(12, size), scale(23, size)),
            (scale(24, size), scale(16, size)),
        ],
        (255, 255, 255, 255),
    )
    return pixels


def render_lume(size: int) -> list[list[tuple[int, int, int, int]]]:
    pixels = [[(0, 0, 0, 0) for _ in range(size)] for _ in range(size)]
    rounded_rect(pixels, 0, 0, size - 1, size - 1, scale(6, size), (*hex_rgb("#E7E5DF"), 255))
    draw_letter_l(pixels, size, (*hex_rgb("#262523"), 255))
    y = scale(26, size)
    draw_line(
        pixels,
        scale(9, size),
        y,
        scale(23, size),
        y,
        (*hex_rgb("#B8923F"), 255),
        max(1, scale(2, size)),
    )
    return pixels


def render_klic_estate(size: int) -> list[list[tuple[int, int, int, int]]]:
    pixels = [[(0, 0, 0, 0) for _ in range(size)] for _ in range(size)]
    rounded_rect(pixels, 0, 0, size - 1, size - 1, scale(6, size), (*hex_rgb("#0F0F0E"), 255))
    white = (255, 255, 255, 255)
    w = max(1, scale(2, size))
    # Roof
    draw_line(pixels, scale(16, size), scale(8, size), scale(9, size), scale(14, size), white, w)
    draw_line(pixels, scale(16, size), scale(8, size), scale(23, size), scale(14, size), white, w)
    # Walls
    draw_line(pixels, scale(9, size), scale(14, size), scale(9, size), scale(25, size), white, w)
    draw_line(pixels, scale(23, size), scale(14, size), scale(23, size), scale(25, size), white, w)
    draw_line(pixels, scale(9, size), scale(25, size), scale(23, size), scale(25, size), white, w)
    # Door gap / inner lines
    draw_line(pixels, scale(14, size), scale(18, size), scale(14, size), scale(25, size), white, w)
    draw_line(pixels, scale(18, size), scale(18, size), scale(18, size), scale(25, size), white, w)
    draw_line(pixels, scale(14, size), scale(18, size), scale(18, size), scale(18, size), white, w)
    return pixels


def render_matcha(size: int) -> list[list[tuple[int, int, int, int]]]:
    pixels = [[(0, 0, 0, 0) for _ in range(size)] for _ in range(size)]
    rounded_rect(pixels, 0, 0, size - 1, size - 1, scale(8, size), (*hex_rgb("#3F4F2A"), 255))
    cx, cy = scale(16, size), scale(15, size)
    fill_circle(pixels, cx, cy, scale(8, size), (*hex_rgb("#C7A65C"), 255), stroke=max(1, scale(2, size)))
    cream = (*hex_rgb("#E6EBD4"), 255)
    w = max(1, scale(2, size))
    draw_line(pixels, cx, scale(9, size), cx, scale(22, size), cream, w)
    draw_line(pixels, scale(13, size), scale(13, size), scale(19, size), scale(13, size), cream, w)
    draw_line(pixels, scale(13, size), scale(18, size), scale(19, size), scale(18, size), cream, w)
    return pixels


def render_atelier_void(size: int) -> list[list[tuple[int, int, int, int]]]:
    pixels = [[(0, 0, 0, 0) for _ in range(size)] for _ in range(size)]
    rounded_rect(pixels, 0, 0, size - 1, size - 1, scale(6, size), (*hex_rgb("#14140F"), 255))
    gold = (*hex_rgb("#C9A06B"), 255)
    w = max(1, scale(3, size))
    draw_line(pixels, scale(10, size), scale(11, size), scale(16, size), scale(24, size), gold, w)
    draw_line(pixels, scale(22, size), scale(11, size), scale(16, size), scale(24, size), gold, w)
    draw_line(
        pixels,
        scale(8, size),
        scale(26, size),
        scale(24, size),
        scale(26, size),
        (237, 235, 230, 140),
        max(1, scale(1, size)),
    )
    return pixels


RENDERERS = {
    "masterclass": render_masterclass,
    "lume": render_lume,
    "klic-estate": render_klic_estate,
    "matcha": render_matcha,
    "atelier-void": render_atelier_void,
}


def write_png(path: Path, pixels: list[list[tuple[int, int, int, int]]]) -> None:
    size = len(pixels)
    raw = bytearray()
    for row in pixels:
        raw.append(0)
        for r, g, b, a in row:
            raw.extend((r, g, b, a))

    def chunk(tag: bytes, data: bytes) -> bytes:
        crc = zlib.crc32(tag + data) & 0xFFFFFFFF
        return struct.pack(">I", len(data)) + tag + data + struct.pack(">I", crc)

    ihdr = struct.pack(">IIBBBBB", size, size, 8, 6, 0, 0, 0)
    png = b"\x89PNG\r\n\x1a\n" + chunk(b"IHDR", ihdr) + chunk(b"IDAT", zlib.compress(bytes(raw), 9)) + chunk(b"IEND", b"")
    path.write_bytes(png)


def main() -> None:
    for slug, render in RENDERERS.items():
        out_dir = ROOT / slug
        for size, name in ((32, "favicon-32.png"), (180, "apple-touch-icon.png")):
            write_png(out_dir / name, render(size))
        write_png(out_dir / "favicon-32.png", render(32))
        print(f"generated {slug}")


if __name__ == "__main__":
    main()
