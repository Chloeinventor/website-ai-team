"""Build every level of "Danmark på kortet" and pack each into an itch.io upload.

Usage: ITCH_USER=<your itch.io name> [ITCH_BUNDLE=<bundle url>] \
       python3 -I package_itch.py <data_dir> <out_dir>

Writes <out_dir>/danmark-paa-kortet-<n>.zip for levels 1-8. Each ZIP holds one
index.html, which is what itch.io's "HTML / played in the browser" upload expects.
The level links (next level, bundle, all levels) point at
https://<ITCH_USER>.itch.io/danmark-paa-kortet[-<n>], so create the itch.io
projects with exactly those URLs.
"""
import os, subprocess, sys, tempfile, zipfile

here = os.path.dirname(os.path.abspath(__file__))
data_dir, out_dir = sys.argv[1:3]
if not os.environ.get("ITCH_USER"):
    sys.exit("Set ITCH_USER to your itch.io name, e.g. ITCH_USER=chloe python3 -I package_itch.py ...")
os.makedirs(out_dir, exist_ok=True)
env = dict(os.environ, LEVEL_TARGET="itch")
with tempfile.TemporaryDirectory() as tmp:
    for n in range(1, 9):
        page = os.path.join(tmp, f"level{n}.html")
        subprocess.run([sys.executable, "-I", os.path.join(here, "build.py"), data_dir,
                        os.path.join(here, "template.html"), page, f"level{n}"], check=True, stdout=subprocess.DEVNULL, env=env)
        name = "danmark-paa-kortet.zip" if n == 1 else f"danmark-paa-kortet-{n}.zip"
        with zipfile.ZipFile(os.path.join(out_dir, name), "w", zipfile.ZIP_DEFLATED) as z:
            z.write(page, "index.html")
        print("level", n, "->", name)
