from pathlib import Path
from collections import deque
from PIL import Image, ImageFilter
import numpy as np

ROOT = Path('public/assets/tech')

def cutout(path: Path):
    im = Image.open(path).convert('RGBA')
    # Segment on a small proxy image; this keeps the batch quick while
    # retaining a smooth full-resolution alpha edge.
    proxy = im.convert('RGB')
    proxy.thumbnail((512, 512), Image.Resampling.BILINEAR)
    rgb = np.asarray(proxy).astype(np.float32)
    mx, mn = rgb.max(2), rgb.min(2)
    lum = rgb.mean(2)
    sat = (mx - mn) / np.maximum(mx, 1)
    # The generated catalog art uses a neutral charcoal studio backdrop.
    candidate = (lum < 105) & (sat < 0.28)
    h, w = candidate.shape
    seen = np.zeros((h, w), dtype=bool)
    q = deque()
    for x in range(w):
        if candidate[0, x]: q.append((0, x)); seen[0, x] = True
        if candidate[h-1, x]: q.append((h-1, x)); seen[h-1, x] = True
    for y in range(h):
        if candidate[y, 0]: q.append((y, 0)); seen[y, 0] = True
        if candidate[y, w-1]: q.append((y, w-1)); seen[y, w-1] = True
    while q:
        y, x = q.popleft()
        for yy, xx in ((y-1,x),(y+1,x),(y,x-1),(y,x+1)):
            if 0 <= yy < h and 0 <= xx < w and candidate[yy, xx] and not seen[yy, xx]:
                seen[yy, xx] = True
                q.append((yy, xx))
    small_alpha = np.full(seen.shape, 255, dtype=np.uint8)
    small_alpha[seen] = 0
    alpha = np.asarray(im.getchannel('A')).copy()
    alpha = np.asarray(Image.fromarray(small_alpha, 'L').resize(im.size, Image.Resampling.BICUBIC))
    # Soften the cut edge without erasing the vehicle silhouette.
    edge = Image.fromarray(alpha, 'L').filter(ImageFilter.GaussianBlur(0.7))
    im.putalpha(edge)
    im.save(path, optimize=True)

if __name__ == '__main__':
    for file in ROOT.glob('*.png'):
        if file.name in {'t-34-85-poster.png', 'is-2-poster.png', 'fascine.png'}:
            continue
        existing = Image.open(file)
        if existing.mode == 'RGBA' and existing.getchannel('A').getextrema() != (255, 255):
            continue
        cutout(file)
        print(file.name)
