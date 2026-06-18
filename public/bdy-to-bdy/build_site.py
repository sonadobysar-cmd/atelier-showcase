#!/usr/bin/env python3
"""Extrahuje obrázky a zmenší HTML — odstraní data-URI a PRODUCTS/IMG bloky."""
import base64
import re
import sys
from pathlib import Path

ROOT = Path(__file__).parent
IMG_DIR = ROOT / 'img'
IMG_DIR.mkdir(exist_ok=True)

SHOP_CORE = '<script src="js/shop-core.js"></script>\n'


def extract_product_images(text: str) -> dict:
    mapping = {}
    for pid, _full, mime, b64 in re.findall(
        r"(\d+):'(data:image/([^;]+);base64,([^']+))'", text
    ):
        ext = 'jpg' if mime in ('jpeg', 'jpg') else mime
        fname = f'product-{pid}.{ext}'
        path = IMG_DIR / fname
        if not path.exists():
            path.write_bytes(base64.b64decode(b64))
        mapping[pid] = f'img/{fname}'
    return mapping


def strip_catalog_js(text: str) -> str:
    text = re.sub(r'var PRODUCTS=\[.*?\];\s*', '', text, flags=re.DOTALL)
    text = re.sub(r"var IMG=\{.*?\};\s*", '', text, flags=re.DOTALL)
    if 'shop-core.js' not in text:
        text = text.replace('<script>\n(function(){', SHOP_CORE + '<script>\n(function(){', 1)
        text = text.replace('<script>\r\n(function(){', SHOP_CORE + '<script>\r\n(function(){', 1)
    return text


def replace_data_uris(text: str, replacements: list[tuple[str, str]]) -> str:
    for uri, path in replacements:
        text = text.replace(uri, path)
    return text


def patch_index(text: str) -> str:
    uris = re.findall(r'data:image/[^"\']+', text)
    video_uri = None
    vm = re.search(r'src="(data:video/mp4;base64,[^"]+)"', text)
    if vm:
        video_uri = vm.group(1)
        b64 = video_uri.split(',', 1)[1]
        (IMG_DIR / 'edi-1.mp4').write_bytes(base64.b64decode(b64))

    names = ['hero', 'col-1', 'col-2', 'col-3', 'video-poster', 'editorial-2']
    img_uris = [u for u in uris if u.startswith('data:image')]
    replacements = []
    for i, uri in enumerate(img_uris):
        name = names[i] if i < len(names) else f'extra-{i}'
        mime = re.match(r'data:image/([^;]+)', uri).group(1)
        ext = 'jpg' if mime in ('jpeg', 'jpg') else mime
        fname = f'{name}.{ext}'
        path = IMG_DIR / fname
        if not path.exists():
            path.write_bytes(base64.b64decode(uri.split(',', 1)[1]))
        replacements.append((uri, f'img/{fname}'))

    text = replace_data_uris(text, replacements)
    if video_uri:
        text = text.replace(video_uri, 'img/edi-1.mp4')
    return strip_catalog_js(text)


def patch_page(path: Path) -> None:
    text = path.read_text(encoding='utf-8')
    extract_product_images(text)
    if path.name == 'index.html':
        text = patch_index(text)
    else:
        text = strip_catalog_js(text)
    path.write_text(text, encoding='utf-8')
    print(f'patched {path.name} → {path.stat().st_size // 1024} KB')


def main():
    for name in ('index.html', 'obchod.html', 'produkt.html', 'kosik.html'):
        p = ROOT / name
        if p.exists():
            patch_page(p)
    print('done')


if __name__ == '__main__':
    main()
