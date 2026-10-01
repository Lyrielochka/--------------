from PIL import Image
from pathlib import Path
import os
for p in Path('public/assets/tech').glob('*.png'):
    try:
        Image.open(p).verify()
    except Exception as e:
        print(p.name, os.path.getsize(p), type(e).__name__)
