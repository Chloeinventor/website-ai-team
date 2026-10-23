# Per-page settings for the Rail Finder games. Each variant becomes one HTML file.
#
# region(lat, lon, city) returns the region id of a playable station, or None
# when the station is outside the game. `city` is True for S-tog/Metro stops.
# Stations outside the game that sit next to a playable one are kept as grey
# context dots so lines don't just stop at the edge.

def _in_copenhagen(lat, lon, city):
    # S-tog/Metro stops, plus regional-only stops in the city itself (Tårnby).
    return city or (55.6 <= lat <= 55.75 and 12.45 <= lon <= 12.7)


def _denmark_region(lat, lon, city):
    if _in_copenhagen(lat, lon, city):
        return "kbh"
    if lon > 10.95:
        return "sjl"
    if lat < 55.62 and lon > 9.72 and not (lon < 9.80 and lat > 55.53):
        return "fyn"
    return "jyl"


def _zealand_region(lat, lon, city):
    if lon <= 10.95:
        return None
    if _in_copenhagen(lat, lon, city):
        return "kbh"
    if lon >= 11.8 and lat >= 55.8:
        return "nord"
    if lat >= 55.38 or (lat >= 55.3 and lon < 11.5):
        return "midt"
    return "syd"


VARIANTS = {
    "denmark": {
        "bbox": (7.95, 13.0, 54.52, 57.78),  # lon0, lon1, lat0, lat1
        "margin": {"dk": 60, "se": 460, "de": 460},
        "eps": {"dk": 0.22, "se": 0.88, "de": 0.88},
        "region": _denmark_region,
        "meta": {
            "title": "Danish Rail Finder",
            "tagline": "Find every train, S-tog, metro and light-rail stop in Denmark",
            "description": "A geography puzzle: find every train, S-tog, metro and light-rail stop in Denmark on the map.",
            "key": "danish-rail-finder",
            "footer": "Lines are drawn station to station, so curves are simplified. Bornholm has no railway, so it isn't shown."
                      "<br>Start smaller with <a href=\"danish-city-finder.html\">Danish City Finder</a>,"
                      " zoom in on <a href=\"danish-rail-finder-sjaelland.html\">Sjælland only</a>,"
                      " or learn about the towns in <a href=\"denmark-town-explorer.html\">Denmark Town Explorer</a>.",
            "hintKm": {"kbh": 12, "other": 28},
            "revealKm": 9,
        },
        "regions": [
            ["all", "All of Denmark"],
            ["kbh", "Copenhagen S-tog & Metro"],
            ["sjl", "Zealand, Lolland & Falster"],
            ["fyn", "Funen"],
            ["jyl", "Jutland"],
        ],
        "jumps": [
            ["Copenhagen", 55.60, 12.42, 55.76, 12.66],
            ["Inner city", 55.645, 12.50, 55.715, 12.61],
            ["North Zealand", 55.85, 12.0, 56.14, 12.65],
            ["Aarhus", 56.05, 9.85, 56.45, 10.95],
            ["Odense", 55.0, 9.7, 55.62, 10.9],
        ],
        "deco": [
            ["Jylland", 9.25, 56.25, "region-lbl", 20], ["Fyn", 10.35, 55.24, "region-lbl", 15],
            ["Sjælland", 11.55, 55.47, "region-lbl", 17], ["Sverige", 12.95, 56.2, "region-lbl", 13],
            ["Deutschland", 9.6, 54.6, "region-lbl", 12], ["Kattegat", 11.4, 56.75, "sea-lbl", 14],
            ["Skagerrak", 9.2, 57.65, "sea-lbl", 14], ["Nordsøen", 8.3, 57.3, "sea-lbl", 14],
            ["Østersøen", 12.6, 54.65, "sea-lbl", 13],
        ],
    },
    "sjaelland": {
        "bbox": (10.8, 12.85, 54.55, 56.2),
        "margin": {"dk": 460, "se": 460, "de": 460},
        "eps": {"dk": 0.3, "se": 1.2, "de": 1.2},
        "region": _zealand_region,
        "meta": {
            "title": "Sjælland Rail Finder",
            "tagline": "Every train, S-tog, metro and local-line stop on Zealand, Lolland and Falster",
            "description": "A geography puzzle: find every train, S-tog, metro and local-line stop on Zealand (Sjælland), Lolland and Falster.",
            "key": "sjaelland-rail-finder",
            "footer": "Lines are drawn station to station, so curves are simplified. Grey dots across the water are outside this game."
                      "<br>Want the whole country? Play <a href=\"danish-rail-finder.html\">Danish Rail Finder</a>,"
                      " or learn about the towns in <a href=\"denmark-town-explorer.html\">Denmark Town Explorer</a>.",
            "hintKm": {"kbh": 8, "other": 16},
            "revealKm": 6,
        },
        "regions": [
            ["all", "All of Sjælland"],
            ["kbh", "Copenhagen S-tog & Metro"],
            ["nord", "North Zealand"],
            ["midt", "Mid & West Zealand"],
            ["syd", "South Zealand, Lolland & Falster"],
        ],
        "jumps": [
            ["Copenhagen", 55.60, 12.42, 55.76, 12.66],
            ["Inner city", 55.645, 12.50, 55.715, 12.61],
            ["North Zealand", 55.85, 12.0, 56.14, 12.65],
            ["Roskilde & Køge", 55.42, 11.95, 55.70, 12.32],
            ["Lolland-Falster", 54.62, 11.0, 55.05, 12.1],
        ],
        "deco": [
            ["Sjælland", 11.75, 55.5, "region-lbl", 20], ["Lolland", 11.3, 54.73, "region-lbl", 13],
            ["Falster", 11.97, 54.8, "region-lbl", 12], ["Møn", 12.35, 54.97, "region-lbl", 11],
            ["Fyn", 10.9, 55.2, "region-lbl", 13], ["Sverige", 12.95, 55.95, "region-lbl", 14],
            ["Kattegat", 11.3, 56.1, "sea-lbl", 14], ["Øresund", 12.75, 55.82, "sea-lbl", 12],
            ["Storebælt", 10.93, 55.63, "sea-lbl", 12], ["Østersøen", 12.5, 54.7, "sea-lbl", 13],
            ["Køge Bugt", 12.45, 55.47, "sea-lbl", 11], ["Isefjord", 11.78, 55.88, "sea-lbl", 10],
        ],
    },
}

VARIANTS["towns"] = {
    "kind": "towns",
    "bbox": (7.95, 13.2, 54.52, 57.78),
    "margin": {"dk": 60, "se": 460, "de": 460},
    "eps": {"dk": 0.22, "se": 0.88, "de": 0.88},
    # Bornholm is drawn in a box in the Baltic, south-east of Møn.
    "inset": {"minLon": 14.5, "shift": (-2.05, -0.38), "label": "Bornholm"},
    "meta": {
        "title": "Denmark Town Explorer",
        "tagline": "Find Denmark's cities and towns, and discover what each one is famous for",
        "description": "A geography puzzle: find 72 Danish cities and towns on the map and learn what each one is famous for.",
        "key": "denmark-town-explorer",
        "footer": "Dots mark town centres. Bornholm is shown in the box at the bottom right; distances use its real position."
                  "<br>More map games: <a href=\"danish-city-finder.html\">Danish City Finder</a>,"
                  " <a href=\"danish-rail-finder.html\">Danish Rail Finder</a> and"
                  " <a href=\"danish-rail-finder-sjaelland.html\">Sjælland Rail Finder</a>.",
        "hintKm": {"kbh": 40, "other": 60},
        "revealKm": 25,
        "words": {"one": "town", "many": "towns", "kicker": "Find this town"},
        "credits": "Town facts and positions compiled for this game.",
    },
    "regions": [
        ["all", "All of Denmark"],
        ["hov", "Capital Region & Bornholm"],
        ["sjl", "Region Zealand"],
        ["syd", "Southern Denmark"],
        ["mid", "Central Jutland"],
        ["nord", "North Jutland"],
    ],
    "jumps": [
        ["Copenhagen & North Zealand", 55.5, 12.0, 56.15, 12.75],
        ["Funen", 54.8, 9.65, 55.65, 10.95],
        ["South Jutland", 54.85, 8.0, 55.8, 9.95],
        ["Bornholm", 54.58, 12.6, 54.95, 13.15],
    ],
    "deco": [
        ["Jylland", 9.25, 56.25, "region-lbl", 20], ["Fyn", 10.35, 55.24, "region-lbl", 15],
        ["Sjælland", 11.55, 55.47, "region-lbl", 17], ["Sverige", 12.95, 56.2, "region-lbl", 13],
        ["Deutschland", 9.6, 54.6, "region-lbl", 12], ["Kattegat", 11.4, 56.75, "sea-lbl", 14],
        ["Skagerrak", 9.2, 57.65, "sea-lbl", 14], ["Nordsøen", 8.3, 57.3, "sea-lbl", 14],
        ["Østersøen", 12.3, 54.56, "sea-lbl", 13],
    ],
}
