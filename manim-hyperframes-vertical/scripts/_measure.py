"""Natural (pace=1) duration of a scene without rendering: python tools/_measure.py <episode> <Scene>"""
import os
import importlib.util, os, sys
from pathlib import Path
ROOT = Path(os.environ.get("VB_ROOT") or Path.cwd()).resolve()
sys.path.insert(0, str(ROOT))
os.environ.pop("PACE_FILE", None)
os.environ["MEASURE"] = "1"
ep, scene = sys.argv[1], sys.argv[2]
from manim import config, tempconfig
spec = importlib.util.spec_from_file_location("scenes", ROOT / "videos" / ep / "scenes.py")
mod = importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
cls = getattr(mod, scene)
with tempconfig({"dry_run": True, "write_to_movie": False, "disable_caching": True, "progress_bar": "none", "verbosity": "ERROR", "media_dir": str(ROOT / "videos" / ep / "media_dry")}):
    s = cls()
    s.render()
    print(f"DURATION {s.renderer.time:.3f} ANIM {getattr(s, '_A', 0):.3f} WAIT {getattr(s, '_W', 0):.3f} ELASTIC {getattr(s, '_E', 0):.3f}")
