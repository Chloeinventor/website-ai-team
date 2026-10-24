"""Pull Danish places out of the all-the-cities data file (GeoNames, places with 1,000+ inhabitants).

Usage: python3 -I extract_places.py <all-the-cities/cities.pbf> <out dk_places.json>

The file is a stream of length-prefixed protobuf messages with delta-encoded
coordinates. This reads it directly, so the package's own code never runs.
"""
import json, sys

src, out = sys.argv[1:3]
data = open(src, "rb").read()
pos = 0

def varint():
    global pos
    result = shift = 0
    while True:
        b = data[pos]
        pos += 1
        result |= (b & 0x7F) << shift
        shift += 7
        if b < 0x80:
            return result

def svarint():
    v = varint()
    return (v >> 1) ^ -(v & 1)

STRINGS = {2: "name", 3: "country", 4: "alt", 5: "muni", 6: "muniSub", 7: "fcode", 8: "admin"}
last_lon = last_lat = 0
places = []
while pos < len(data):
    end = varint() + pos
    place = {"pop": 0}
    while pos < end:
        key = varint()
        tag = key >> 3
        if tag == 1:
            place["id"] = svarint()
        elif tag in STRINGS:
            n = varint()
            place[STRINGS[tag]] = data[pos:pos + n].decode("utf-8")
            pos += n
        elif tag == 9:
            place["pop"] = varint()
        elif tag == 10:
            last_lon += svarint()
            place["lon"] = last_lon / 1e5
        elif tag == 11:
            last_lat += svarint()
            place["lat"] = last_lat / 1e5
        else:
            sys.exit(f"unexpected field {tag}")
    if place.get("country") == "DK":
        places.append(place)

json.dump(places, open(out, "w"), ensure_ascii=False)
print(len(places), "Danish places")
