"""Build data for a Rail Finder game and inline it into the HTML template.

Usage: python3 -I build.py <data_dir> <template.html> <out.html> [variant]
Variants are defined in variants.py (default: denmark).
"""
import csv, html, json, math, re, sys, os

sys.dont_write_bytecode = True
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from network import MANUAL, RENAME, LINES, STOG, M1, M2, M3, M4
from variants import VARIANTS

DATA_DIR, TEMPLATE, OUT = sys.argv[1:4]
V = VARIANTS[sys.argv[4] if len(sys.argv) > 4 else "denmark"]

# ---------------------------------------------------------------- projection
LON0, LON1, LAT0, LAT1 = V["bbox"]
COS = math.cos(math.radians(56))
K = 1000 / ((LON1 - LON0) * COS)
W = 1000
H = round((LAT1 - LAT0) * K)
KM_PER_UNIT = 6371 * math.pi / 180 / K  # north-south distance of one map unit

def proj(lon, lat):
    return ((lon - LON0) * COS * K, (LAT1 - lat) * K)

# ---------------------------------------------------------------- stations
def norm(name):
    n = re.sub(r"\s*\(.*?\)", "", name)
    n = re.sub(r"\s+(St\.?|st|Station)$", "", n.strip())
    return n.strip()

coords = {}
score = {}
with open(os.path.join(DATA_DIR, "stations.csv"), newline="") as f:
    for r in csv.DictReader(f, delimiter=";"):
        if r["country"] != "DK" or not r["latitude"] or r["is_city"] == "t":
            continue
        n = norm(r["name"])
        n = RENAME.get(n, n)
        # Prefer real station records (" St." suffix, UIC code) over aliases.
        s = (" St" in r["name"]) * 2 + bool(r["uic"])
        if n not in coords or s > score[n]:
            coords[n] = (float(r["latitude"]), float(r["longitude"]))
            score[n] = s
coords.update(MANUAL)

missing = [(label, n) for _, label, seq in LINES for n in seq if n not in coords]
if missing:
    for m in missing:
        print("MISSING", m)
    sys.exit(1)

# Stations served by S-tog / Metro form the "Copenhagen" region.
city = {n for kind, _, seq in LINES if kind in (STOG, M1, M2, M3, M4) for n in seq}
region = {n: V["region"](coords[n][0], coords[n][1], n in city)
          for _, _, seq in LINES for n in seq}

# Keep every segment that touches a playable station; the far end of a
# segment leaving the game area stays as a grey context dot.
used, index, lines_out = [], {}, []
def sid(name):
    if name not in index:
        index[name] = len(used)
        used.append(name)
    return index[name]
for kind, label, seq in LINES:
    run = []
    for a, b in zip(seq, seq[1:]):
        if region[a] is None and region[b] is None:
            if len(run) > 1:
                lines_out.append({"t": kind, "n": label, "s": run})
            run = []
            continue
        if not run:
            run = [sid(a)]
        run.append(sid(b))
    if len(run) > 1:
        lines_out.append({"t": kind, "n": label, "s": run})

stations_out = []
for name in used:
    lat, lon = coords[name]
    x, y = proj(lon, lat)
    stations_out.append([name, round(x, 2), round(y, 2), region[name] or "ctx", round(lat, 5), round(lon, 5)])

# ---------------------------------------------------------------- land
def clip_ring(ring, xmin, ymin, xmax, ymax):
    """Sutherland–Hodgman clip of a closed ring against an axis-aligned box."""
    def clip(pts, inside, inter):
        out = []
        n = len(pts)
        for i in range(n):
            cur, prev = pts[i], pts[i - 1]
            if inside(cur):
                if not inside(prev):
                    out.append(inter(prev, cur))
                out.append(cur)
            elif inside(prev):
                out.append(inter(prev, cur))
        return out
    def ix(a, b, x):
        t = (x - a[0]) / (b[0] - a[0]); return (x, a[1] + t * (b[1] - a[1]))
    def iy(a, b, y):
        t = (y - a[1]) / (b[1] - a[1]); return (a[0] + t * (b[0] - a[0]), y)
    pts = ring
    for inside, inter in (
        (lambda p: p[0] >= xmin, lambda a, b: ix(a, b, xmin)),
        (lambda p: p[0] <= xmax, lambda a, b: ix(a, b, xmax)),
        (lambda p: p[1] >= ymin, lambda a, b: iy(a, b, ymin)),
        (lambda p: p[1] <= ymax, lambda a, b: iy(a, b, ymax)),
    ):
        if not pts:
            break
        pts = clip(pts, inside, inter)
    return pts

def rdp(pts, eps):
    """Iterative Ramer–Douglas–Peucker simplification."""
    if len(pts) < 4:
        return pts
    keep = [False] * len(pts)
    keep[0] = keep[-1] = True
    stack = [(0, len(pts) - 1)]
    while stack:
        a, b = stack.pop()
        ax, ay = pts[a]; bx, by = pts[b]
        dx, dy = bx - ax, by - ay
        L = math.hypot(dx, dy) or 1e-12
        best, bi = -1, -1
        for i in range(a + 1, b):
            px, py = pts[i]
            d = abs(dy * px - dx * py + bx * ay - by * ax) / L
            if d > best:
                best, bi = d, i
        if best > eps:
            keep[bi] = True
            stack.append((a, bi)); stack.append((bi, b))
    return [p for p, k in zip(pts, keep) if k]

def simplify_ring(pts, eps):
    """RDP for a closed ring: split at the point farthest from the start."""
    x0, y0 = pts[0]
    far = max(range(len(pts)), key=lambda i: (pts[i][0] - x0) ** 2 + (pts[i][1] - y0) ** 2)
    a = rdp(pts[: far + 1], eps)
    b = rdp(pts[far:] + [pts[0]], eps)
    return a[:-1] + b[:-1]

def area(pts):
    return abs(sum(pts[i - 1][0] * pts[i][1] - pts[i][0] * pts[i - 1][1] for i in range(len(pts)))) / 2

def ring_path_abs(pts):
    return "M" + "L".join("%.1f %.1f" % p for p in pts) + "Z"

geo = json.load(open(os.path.join(DATA_DIR, "nbrs.json")))
MARGIN = V["margin"]
HOLE_MIN_AREA = float(os.environ.get("HOLE_MIN_AREA", "20"))
MIN_AREA = float(os.environ.get("MIN_AREA", "0.6"))
land_out = {}
npts = 0
for code, key in (("DNK", "dk"), ("SWE", "se"), ("DEU", "de")):
    parts = []
    for poly in geo[code]["coordinates"]:
        for ri, ring in enumerate(poly):
            pts = [proj(lon, lat) for lon, lat in ring]
            m = MARGIN[key]
            pts = clip_ring(pts, -m, -m, W + m, H + m)
            if len(pts) < 3:
                continue
            if area(pts) < (MIN_AREA * (1 if key == "dk" else 15) if ri == 0 else HOLE_MIN_AREA):
                continue
            pts = simplify_ring(pts, V["eps"][key])
            if len(pts) < 3:
                continue
            npts += len(pts)
            parts.append(ring_path_abs(pts))
    land_out[key] = "".join(parts)

data = {
    "W": W, "H": H,
    "proj": {"lon0": LON0, "lat1": LAT1, "k": K, "cos": COS, "kmPerUnit": KM_PER_UNIT},
    "meta": {k: v for k, v in V["meta"].items() if k not in ("title", "tagline", "description", "footer")},
    "regions": V["regions"],
    "jumps": V["jumps"],
    "deco": V["deco"],
    "land": land_out,
    "stations": stations_out,
    "lines": lines_out,
}
blob = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
tpl = open(TEMPLATE, encoding="utf-8").read()
meta = V["meta"]
for token, value in (
    ("/*__DATA__*/null", blob),
    ("__TITLE__", html.escape(meta["title"])),
    ("__TAGLINE__", html.escape(meta["tagline"])),
    ("__DESCRIPTION__", html.escape(meta["description"])),
    ("__FOOTER_NOTE__", meta["footer"]),
):
    assert token in tpl, token
    tpl = tpl.replace(token, value)
open(OUT, "w", encoding="utf-8").write(tpl)

counts = {}
for s in stations_out:
    counts[s[3]] = counts.get(s[3], 0) + 1
print("stations", len(stations_out), counts, "lines", len(lines_out))
print("per-country", {k: len(v) for k, v in land_out.items()}); print("land points", npts, "land bytes", sum(len(v) for v in land_out.values()), "blob", len(blob))
