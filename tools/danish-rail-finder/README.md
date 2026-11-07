# Map games: build tools

These pages are generated. Edit the files here, then rebuild.

**On the website, the games are sold as "Danmark på kortet" levels** (see "Levels" below). The older free pages (rail finder, Sjælland, Town Explorer, Map Master, start page) are no longer published: their URLs redirect to `/games/levels`. Their variants still build, for testing.

The files:

- `network.py`: the lines (ordered station lists), stations missing from the dataset (Metro, a few local-line stops) and display-name fixes. Shared by every variant.
- `towns.py`: the towns for Town Explorer, with coordinates, region, "known for" tags and the description shown when a town is found.
- `variants.py`: per-page settings: map extent, which stations are playable, regions, quick-jump buttons, map labels, title and footer, plus each page's Danish texts (`"da"`).
- `template.html`: the game (HTML, CSS, JS). The build fills in `/*__DATA__*/null` and the `__TITLE__`-style tokens. Interface texts in English and Danish are in its `STR` table; the game picks Danish for Danish browsers, and the DA/EN switch remembers the choice.
- `hub.template.html` + `build_hub.py`: the start page, with its own English/Danish texts. Its hero map is drawn from Map Master's data.
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
mkdir -p /tmp/games-preview   # old free variants: preview only, not published
python3 -I tools/danish-rail-finder/build.py /tmp/rail-data tools/danish-rail-finder/template.html /tmp/games-preview/danish-rail-finder.html denmark
python3 -I tools/danish-rail-finder/build.py /tmp/rail-data tools/danish-rail-finder/template.html /tmp/games-preview/danish-rail-finder-sjaelland.html sjaelland
python3 -I tools/danish-rail-finder/build.py /tmp/rail-data tools/danish-rail-finder/template.html /tmp/games-preview/denmark-town-explorer.html towns
python3 -I tools/danish-rail-finder/build.py /tmp/rail-data tools/danish-rail-finder/template.html /tmp/games-preview/denmark-map-master.html places
python3 -I tools/danish-rail-finder/build_hub.py /tmp/games-preview/denmark-map-master.html tools/danish-rail-finder/hub.template.html /tmp/games-preview/index.html
```

Danish City Finder (`tools/danish-city-finder/danish-city-finder.html`) is hand-written, not generated, and no longer published on the website. Its texts are in its own `STR` table.

The build stops and lists the names if a line refers to a station it can't find.

To add another variant, add an entry to `variants.py`. Stations where `region()` returns `None` are left out of the game. Any of those that are next to a playable station still appear as grey context dots.

## Levels ("Danmark på kortet")

Built into `games-private/` (not `public/`), served by the website's routes:

```sh
D=/tmp/rail-data
python3 -I tools/danish-rail-finder/build.py $D tools/danish-rail-finder/template.html games-private/level1.html level1
for n in 2 3 4 5 6 7 8; do
  python3 -I tools/danish-rail-finder/build.py $D tools/danish-rail-finder/template.html games-private/level$n.html level$n games-private/level$n.json
done
```

The 5th argument splits the map data into a JSON file. The paid level's page then has no map in it: it fetches `/api/games/level-data`, which answers only a device that owns the level. Level 1 (free) keeps its data in the page.

The shop, codes, device limit and Stripe checkout are in `lib/games/` and `app/games/`, `app/api/games/`; the database is in `supabase/migrations/20261107_games_purchases.sql`. Setup: see the "Danmark på kortet" section of `.env.local.example`.

## itch.io levels (optional)

`variants.py` also defines `level1` to `level8`: the games cut into levels from easy to hard, with no place in two levels.

- Level 1 is free, with one guess per town and 10 towns per round.
- Levels 2–8 are 39 kr each, or 149 kr for the bundle.

Each level's end screen links to the next level and to the bundle on itch.io.

`package_itch.py` builds all eight levels into ready-to-upload ZIPs:

```sh
ITCH_USER=<your itch.io name> ITCH_BUNDLE=<bundle url> python3 -I tools/danish-rail-finder/package_itch.py /tmp/rail-data dist/itch
```

`ITCH_PAGES.md` has each level's project URL, the upload settings and the page texts in English and Danish.
