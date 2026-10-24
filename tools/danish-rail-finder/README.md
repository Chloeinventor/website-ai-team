# Map games: build tools

These pages are generated. Edit the files here, then rebuild:

- `public/games/danish-rail-finder.html` (variant `denmark`)
- `public/games/danish-rail-finder-sjaelland.html` (variant `sjaelland`)
- `public/games/denmark-town-explorer.html` (variant `towns`)
- `public/games/denmark-map-master.html` (variant `places`)

The files:

- `network.py`: the lines (ordered station lists), stations missing from the dataset (Metro, a few local-line stops) and display-name fixes. Shared by every variant.
- `towns.py`: the towns for Town Explorer, with coordinates, region, "known for" tags and the description shown when a town is found.
- `variants.py`: per-page settings: map extent, which stations are playable, regions, quick-jump buttons, map labels, title and footer.
- `template.html`: the game (HTML, CSS, JS). The build fills in `/*__DATA__*/null` and the `__TITLE__`-style tokens.
- `build.py`: projects station coordinates, simplifies the coastline and writes one self-contained page.
- `extract_neighbours.py`: cuts Denmark, Sweden and Germany out of the world land file.
- `extract_places.py`: pulls every Danish place (GeoNames, 1,000+ inhabitants, with population) out of the all-the-cities data file. Map Master sorts these into cities (40,000+), major towns (10,000–39,999) and minor towns.

## Rebuild

```sh
mkdir -p /tmp/rail-data && cd /tmp/rail-data
# Station coordinates (ODbL)
curl -sSLO https://raw.githubusercontent.com/trainline-eu/stations/master/stations.csv
# Coastline, derived from OpenStreetMap (ODbL)
npm pack @geo-maps/countries-land-100m@0.6.0 && tar xzf geo-maps-countries-land-100m-0.6.0.tgz
# Towns and populations, from GeoNames (CC BY 4.0)
mkdir -p atc && npm pack all-the-cities@3.1.0 && tar xzf all-the-cities-3.1.0.tgz -C atc
cd -
python3 -I tools/danish-rail-finder/extract_neighbours.py /tmp/rail-data/package/map.geo.json /tmp/rail-data/nbrs.json
python3 -I tools/danish-rail-finder/extract_places.py /tmp/rail-data/atc/package/cities.pbf /tmp/rail-data/dk_places.json
python3 -I tools/danish-rail-finder/build.py /tmp/rail-data tools/danish-rail-finder/template.html public/games/danish-rail-finder.html denmark
python3 -I tools/danish-rail-finder/build.py /tmp/rail-data tools/danish-rail-finder/template.html public/games/danish-rail-finder-sjaelland.html sjaelland
python3 -I tools/danish-rail-finder/build.py /tmp/rail-data tools/danish-rail-finder/template.html public/games/denmark-town-explorer.html towns
python3 -I tools/danish-rail-finder/build.py /tmp/rail-data tools/danish-rail-finder/template.html public/games/denmark-map-master.html places
```

The build stops and lists the names if a line refers to a station it can't find.

To add another variant, add an entry to `variants.py`. Stations where `region()` returns `None` are left out of the game. Any of those that are next to a playable station still appear as grey context dots.
