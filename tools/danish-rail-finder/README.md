# Map games: build tools

These pages are generated. Edit the files here, then rebuild:

- `public/games/danish-rail-finder.html` (variant `denmark`)
- `public/games/danish-rail-finder-sjaelland.html` (variant `sjaelland`)
- `public/games/denmark-town-explorer.html` (variant `towns`)

The files:

- `network.py`: the lines (ordered station lists), stations missing from the dataset (Metro, a few local-line stops) and display-name fixes. Shared by every variant.
- `towns.py`: the towns for Town Explorer, with coordinates, region, "known for" tags and the description shown when a town is found.
- `variants.py`: per-page settings: map extent, which stations are playable, regions, quick-jump buttons, map labels, title and footer.
- `template.html`: the game (HTML, CSS, JS). The build fills in `/*__DATA__*/null` and the `__TITLE__`-style tokens.
- `build.py`: projects station coordinates, simplifies the coastline and writes one self-contained page.
- `extract_neighbours.py`: cuts Denmark, Sweden and Germany out of the world land file.

## Rebuild

```sh
mkdir -p /tmp/rail-data && cd /tmp/rail-data
# Station coordinates (ODbL)
curl -sSLO https://raw.githubusercontent.com/trainline-eu/stations/master/stations.csv
# Coastline, derived from OpenStreetMap (ODbL)
npm pack @geo-maps/countries-land-100m@0.6.0 && tar xzf geo-maps-countries-land-100m-0.6.0.tgz
cd -
python3 -I tools/danish-rail-finder/extract_neighbours.py /tmp/rail-data/package/map.geo.json /tmp/rail-data/nbrs.json
python3 -I tools/danish-rail-finder/build.py /tmp/rail-data tools/danish-rail-finder/template.html public/games/danish-rail-finder.html denmark
python3 -I tools/danish-rail-finder/build.py /tmp/rail-data tools/danish-rail-finder/template.html public/games/danish-rail-finder-sjaelland.html sjaelland
python3 -I tools/danish-rail-finder/build.py /tmp/rail-data tools/danish-rail-finder/template.html public/games/denmark-town-explorer.html towns
```

The build stops and lists the names if a line refers to a station it can't find.

To add another variant, add an entry to `variants.py`. Stations where `region()` returns `None` are left out of the game. Any of those that are next to a playable station still appear as grey context dots.
