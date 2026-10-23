"""Pull Denmark, Sweden and Germany out of the geo-maps world land file.

Usage: python3 -I extract_neighbours.py <map.geo.json> <out nbrs.json>
"""
import json, sys

src, out = sys.argv[1:3]
world = json.load(open(src))
keep = {}
for feature in world["features"]:
    code = feature["properties"].get("A3")
    if code in ("DNK", "SWE", "DEU"):
        keep[code] = feature["geometry"]
missing = {"DNK", "SWE", "DEU"} - keep.keys()
if missing:
    sys.exit(f"missing countries: {sorted(missing)}")
json.dump(keep, open(out, "w"))
