"""Writes narration.json + plan.json for the episode. Edit the text, run `python narration.py`, then synthesise voice with ANY TTS
into audio/<Scene>.wav (or `vbuild.py placeholders <ep>` for silent stand-ins while you build layout).
Language rule used on this channel: Malay storytelling, common science terms stay in English."""
import json
from pathlib import Path

SCENES = {
    "S01_Hook": "Bayangkan... satu chip yang guna noise untuk berfikir! Hari ini kita bongkar rahsia dia. Jom!",
    "S02_Idea": "Guli dalam energy landscape suka duduk di lembah. Goncang meja sikit, dan guli itu melompat. Kerap di lembah, jarang di bukit. Itulah distribution!",
}
# palette per scene (names come from vbuild_assets/hf_bg/palettes.json), chapter label, optional FX: {"k": "burst|rain|sweep", "t": seconds | "f": fraction of scene}
PLAN = {
    "S01_Hook": {"pal": "sunrise", "chapter": "Pembukaan", "fx": [{"k": "burst", "t": 0.4}]},
    "S02_Idea": {"pal": "lilac", "chapter": "Idea", "fx": [{"k": "rain", "f": 0.8}]},
}

if __name__ == "__main__":
    here = Path(__file__).parent
    cfg = {"lead_in": 0.4, "scenes": SCENES}      # add "voice"/"style" keys if your TTS tool wants them
    (here / "narration.json").write_text(json.dumps(cfg, ensure_ascii=False, indent=2), encoding="utf-8")
    (here / "plan.json").write_text(json.dumps(PLAN, indent=1), encoding="utf-8")
    print(len(SCENES), "scenes,", sum(len(v) for v in SCENES.values()), "chars")
