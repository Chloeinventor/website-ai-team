"""Build the games start page (public/games/index.html) from hub.template.html.

The hero map is drawn from Map Master's own data, so build Map Master first.
Usage: python3 -I build_hub.py <denmark-map-master.html> <hub.template.html> <out index.html>
"""
import json, re, sys

src, template, out = sys.argv[1:4]
page = open(src, encoding="utf-8").read()
data = json.loads(re.search(r"const DATA = (\{.*?\});\n", page, re.S).group(1))

order = {"minor": 0, "major": 1, "city": 2}  # cities drawn last, on top
radius = {"city": 9, "major": 6, "minor": 4}
dots = "".join(
    f'<circle class="d {s[3]}" cx="{s[1]:.1f}" cy="{s[2]:.1f}" r="{radius[s[3]]}"/>'
    for s in sorted(data["stations"], key=lambda s: order[s[3]]))
f = data["inset"]
counts = {c: sum(1 for s in data["stations"] if s[3] == c) for c in order}
svg = (f'<svg class="hero-map" viewBox="40 60 960 1060" role="img" aria-label="Map of Denmark with all '
       f'{len(data["stations"])} towns from the games: {counts["city"]} cities in red, {counts["major"]} major towns '
       f'in orange and {counts["minor"]} minor towns in blue.">'
       f'<path class="land" d="{data["land"]["dk"]}"/>'
       f'<rect class="inset" x="{f["x"]}" y="{f["y"]}" width="{f["w"]}" height="{f["h"]}" rx="8"/>'
       f'<path class="land" d="{data["land"]["bh"]}"/>'
       f'<text class="inset-lbl" x="{f["x"] + 8}" y="{f["y"] + 18}">Bornholm</text>'
       f'<g>{dots}</g></svg>')
html = open(template, encoding="utf-8").read()
assert html.count("__HERO_MAP__") == 1
open(out, "w", encoding="utf-8").write(html.replace("__HERO_MAP__", svg))
print("hub built:", counts)
