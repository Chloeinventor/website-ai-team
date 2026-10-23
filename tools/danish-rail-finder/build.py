"""Build data for the Danish Rail Finder game and inline it into the HTML template.

Usage: python3 -I build.py <data_dir> <template.html> <out.html>
"""
import csv, json, math, re, sys, os

sys.dont_write_bytecode = True
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from network import MANUAL, RENAME, LINES, STOG, M1, M2, M3, M4

DATA_DIR, TEMPLATE, OUT = sys.argv[1:4]

# ---------------------------------------------------------------- projection
LON0, LON1, LAT0, LAT1 = 7.95, 13.0, 54.52, 57.78
COS = math.cos(math.radians(56))
K = 1000 / ((LON1 - LON0) * COS)
W = 1000
H = round((LAT1 - LAT0) * K)

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

used = []
index = {}
missing = []
lines_out = []
for kind, label, seq in LINES:
    ids = []
    for name in seq:
        if name not in coords:
            missing.append((label, name))
            continue
        if name not in index:
            index[name] = len(used)
            used.append(name)
        ids.append(index[name])
    lines_out.append({"t": kind, "n": label, "s": ids})
if missing:
    for m in missing:
        print("MISSING", m)
    sys.exit(1)

# Which stations are served by S-tog / Metro (the "Copenhagen" region).
city = set()
for l in lines_out:
    if l["t"] in (STOG, M1, M2, M3, M4):
        city.update(l["s"])

def region(i, lat, lon):
    if i in city:
        return "kbh"
    if lon > 10.95:
        return "sjl"
    if lat < 55.62 and lon > 9.72 and not (lon < 9.80 and lat > 55.53):
        return "fyn"
    return "jyl"

stations_out = []
for i, name in enumerate(used):
    lat, lon = coords[name]
    x, y = proj(lon, lat)
    stations_out.append([name, round(x, 2), round(y, 2), region(i, lat, lon), round(lat, 5), round(lon, 5)])

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
MARGIN = {"dk": 60, "se": 460, "de": 460}
HOLE_MIN_AREA = float(os.environ.get("HOLE_MIN_AREA", "20"))
EPS = float(os.environ.get("EPS", "0.22"))
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
            pts = simplify_ring(pts, EPS if key == "dk" else EPS * 4)
            if len(pts) < 3:
                continue
            npts += len(pts)
            parts.append(ring_path_abs(pts))
    land_out[key] = "".join(parts)

data = {
    "W": W, "H": H,
    "land": land_out,
    "stations": stations_out,
    "lines": lines_out,
}
blob = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
tpl = open(TEMPLATE, encoding="utf-8").read()
assert "/*__DATA__*/null" in tpl
open(OUT, "w", encoding="utf-8").write(tpl.replace("/*__DATA__*/null", blob))

counts = {}
for s in stations_out:
    counts[s[3]] = counts.get(s[3], 0) + 1
print("stations", len(stations_out), counts, "lines", len(lines_out))
print("per-country", {k: len(v) for k, v in land_out.items()}); print("land points", npts, "land bytes", sum(len(v) for v in land_out.values()), "blob", len(blob))
