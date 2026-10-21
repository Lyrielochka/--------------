"""Compute motion vectors between painted poses; never change the artwork."""
import sys, os, json
from pathlib import Path
sys.path.insert(0, os.path.join(os.environ['TEMP'], 'murvik-motion-tools'))
import cv2
import numpy as np

root = Path(__file__).resolve().parent.parent
out = root / 'public/assets/murvik-flow'
out.mkdir(exist_ok=True)
wave = [0, 2, 1, 3, 1, 2, 0]
curious = [0, 8, 9, 10, 11, 12, 13, 14, 15, 0]
pairs = sorted({tuple(sorted(pair)) for seq in (wave, curious) for pair in zip(seq, seq[1:]) if pair[0] != pair[1]})
frames = []
for i in range(16):
    rgba = cv2.imdecode(np.fromfile(str(root / f'public/assets/murvik-frames/{i:02d}.webp'), dtype=np.uint8), cv2.IMREAD_UNCHANGED)
    rgba = cv2.resize(rgba, (214, 320), interpolation=cv2.INTER_AREA)
    alpha = rgba[:, :, 3:4].astype(np.float32) / 255
    rgb = rgba[:, :, :3] * alpha + np.array([57, 52, 32]) * (1-alpha)
    frames.append(cv2.cvtColor(rgb.astype(np.uint8), cv2.COLOR_BGR2GRAY))
dis = cv2.DISOpticalFlow_create(cv2.DISOPTICAL_FLOW_PRESET_MEDIUM)
dis.setFinestScale(0)
dis.setGradientDescentIterations(40)
dis.setVariationalRefinementIterations(10)
for a, b in pairs:
    forward = dis.calc(frames[a], frames[b], None)
    backward = dis.calc(frames[b], frames[a], None)
    packed = np.concatenate([cv2.resize(forward, (54, 80)), cv2.resize(backward, (54, 80))], axis=2)
    packed = np.clip(np.rint((packed / 32 + 1) * 127.5), 0, 255).astype(np.uint8)
    (out / f'{a:02d}-{b:02d}.bin').write_bytes(packed.tobytes())
print(f'MURVIK_FLOW: {len(pairs)} bidirectional vector fields, artwork unchanged')
