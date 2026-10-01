"""Contact sheet of composited scenes: rows = scenes, columns = frames at fractions of the scene.
  python tools/vsheet.py 05_thermo_full l S05_Compute S06_EBM ... [--fr 0.12 0.3 0.5 0.7 0.9] -o out.png
"""
import os
import argparse
import subprocess
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw

ROOT = Path(os.environ.get("VB_ROOT") or Path.cwd()).resolve()


def dur(p):
    r = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(p)], capture_output=True, text=True)
    return float(r.stdout.strip())


ap = argparse.ArgumentParser()
ap.add_argument("episode")
ap.add_argument("q")
ap.add_argument("scenes", nargs="+")
ap.add_argument("--fr", nargs="+", type=float, default=[0.1, 0.3, 0.5, 0.7, 0.92])
ap.add_argument("-o", default=None)
ap.add_argument("--w", type=int, default=216)
a = ap.parse_args()
d = ROOT / "videos" / a.episode / "out" / f"scenes_{a.q}"
tiles = []
with tempfile.TemporaryDirectory() as td:
    for s in a.scenes:
        p = d / f"{s}.mp4"
        L = dur(p)
        row = []
        for i, f in enumerate(a.fr):
            out = Path(td) / f"{s}_{i}.png"
            subprocess.run(["ffmpeg", "-y", "-v", "error", "-ss", f"{L * f:.2f}", "-i", str(p), "-frames:v", "1", "-vf", f"scale={a.w}:-1", str(out)], check=True)
            row.append(Image.open(out).convert("RGB"))
        tiles.append((s, L, row))
w, h = tiles[0][2][0].size
sheet = Image.new("RGB", (w * len(a.fr), (h + 0) * len(tiles)), "white")
dr = ImageDraw.Draw(sheet)
for r, (s, L, row) in enumerate(tiles):
    for c, im in enumerate(row):
        sheet.paste(im, (c * w, r * h))
    dr.rectangle((0, r * h, 170, r * h + 14), fill=(0, 0, 0))
    dr.text((3, r * h + 2), f"{s} {L:.0f}s", fill=(255, 255, 255))
out = a.o or str(d / "sheet.png")
sheet.save(out)
print(out)
