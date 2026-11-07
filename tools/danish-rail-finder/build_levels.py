"""Build the eight "Danmark på kortet" levels for the website.

Usage: python3 -I build_levels.py <data_dir> <out_dir>   (out_dir: games-private)

Writes, per level n:
  level<n>.page.json  {"html": "..."}: the level's page
  level<n>.json       the map data (levels 2-8 only: the page fetches it after
                      the purchase check, so the page alone holds no map)
The website imports these as JSON, so they ship inside the server code on any
host (Vercel, Netlify, ...) and are never public files.
"""
import json, os, subprocess, sys, tempfile

here = os.path.dirname(os.path.abspath(__file__))
data_dir, out_dir = sys.argv[1:3]
os.makedirs(out_dir, exist_ok=True)
with tempfile.TemporaryDirectory() as tmp:
    for n in range(1, 9):
        page = os.path.join(tmp, f"level{n}.html")
        args = [sys.executable, "-I", os.path.join(here, "build.py"), data_dir, os.path.join(here, "template.html"), page, f"level{n}"]
        if n > 1:
            args.append(os.path.join(out_dir, f"level{n}.json"))
        subprocess.run(args, check=True, stdout=subprocess.DEVNULL)
        with open(page, encoding="utf-8") as f:
            html = f.read()
        with open(os.path.join(out_dir, f"level{n}.page.json"), "w", encoding="utf-8") as f:
            json.dump({"html": html}, f, ensure_ascii=False, separators=(",", ":"))
        print("level", n)
