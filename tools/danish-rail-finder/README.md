# Danish Rail Finder: build tools

`public/games/danish-rail-finder.html` is generated. Edit the files here, then rebuild.

- `network.py`: the lines (ordered station lists), stations missing from the dataset (Metro, a few local-line stops) and display-name fixes.
- `template.html`: the game (HTML, CSS, JS). The build replaces `/*__DATA__*/null` with the map data.
- `build.py`: projects station coordinates, simplifies the coastline and writes the final single-file page.
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
python3 -I tools/danish-rail-finder/build.py /tmp/rail-data tools/danish-rail-finder/template.html public/games/danish-rail-finder.html
```

The build stops and lists the names if a line refers to a station it can't find.
