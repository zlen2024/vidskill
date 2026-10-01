"""Concatenate parts/p*.py into scenes.py (Manim wants every Scene class defined in the file it loads)."""
import json
from pathlib import Path

here = Path(__file__).parent
parts = sorted((here / "parts").glob("p*.py"))
src = "\n".join(p.read_text(encoding="utf-8") for p in parts)
names = list(json.loads((here / "narration.json").read_text(encoding="utf-8"))["scenes"])
(here / "scenes.py").write_text(src + "\n\nSCENES = " + json.dumps(names) + "\n", encoding="utf-8")
print("scenes.py from", [p.name for p in parts])
