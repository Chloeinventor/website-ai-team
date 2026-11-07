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
                      " learn about the towns in <a href=\"denmark-town-explorer.html\">Denmark Town Explorer</a>,"
                      " or find every town in <a href=\"denmark-map-master.html\">Denmark Map Master</a>.",
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
                  "<br>More map games: <a href=\"denmark-map-master.html\">Denmark Map Master</a> (all 342 towns),"
                  " <a href=\"danish-city-finder.html\">Danish City Finder</a>,"
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

VARIANTS["places"] = {
    "kind": "places",
    "bbox": (7.95, 13.2, 54.52, 57.78),
    "margin": {"dk": 60, "se": 460, "de": 460},
    "eps": {"dk": 0.22, "se": 0.88, "de": 0.88},
    "inset": {"minLon": 14.5, "shift": (-2.05, -0.38), "label": "Bornholm"},
    "places": {
        "cityMin": 40000,
        "majorMin": 10000,
        "rename": {"Copenhagen": "København", "Århus": "Aarhus", "Skaerbaek": "Skærbæk"},
        "drop": ["Christianshavn", "Vanløse"],  # districts of Copenhagen, not towns
        # Well-known places too small for GeoNames' 1,000+ list (taken from towns.py).
        "add": ["Klampenborg", "Gudhjem", "Svaneke", "Blåvand", "Klitmøller"],
    },
    "meta": {
        "title": "Denmark Map Master",
        "tagline": "Every city, major town and minor town in Denmark on one map",
        "description": "A geography puzzle with every Danish city and town: find 342 places, colour-coded as cities, major towns and minor towns.",
        "key": "denmark-map-master",
        "credits": "Places and populations: <a href=\"https://www.geonames.org/\">GeoNames</a> (CC BY 4.0), via the"
                   " all-the-cities package. Population figures are GeoNames estimates and can be a few years old.",
        "footer": "Bornholm is shown in the box at the bottom right; distances use its real position."
                  "<br>More map games: <a href=\"denmark-town-explorer.html\">Denmark Town Explorer</a>,"
                  " <a href=\"danish-rail-finder.html\">Danish Rail Finder</a>,"
                  " <a href=\"danish-rail-finder-sjaelland.html\">Sjælland Rail Finder</a> and"
                  " <a href=\"danish-city-finder.html\">Danish City Finder</a>.",
        "hintKm": {"kbh": 40, "other": 50},
        "revealKm": 20,
        "words": {"one": "place", "many": "places", "kicker": "Find this place"},
        "categories": {
            "city": ["City", "40,000+ people"],
            "major": ["Major town", "10,000–39,999 people"],
            "minor": ["Minor town", "under 10,000 people"],
        },
        "admin": {
            "hov": "Capital Region", "sjl": "Region Zealand", "syd": "Southern Denmark",
            "mid": "Central Jutland", "nord": "North Jutland",
        },
    },
    "regions": [
        ["all", "Everything"],
        ["city", "Cities"],
        ["major", "Major towns"],
        ["minor", "Minor towns"],
    ],
    # Second filter, combined with the type buttons above.
    "areas": [
        ["all", "All of Denmark"],
        ["hov", "Capital Region & Bornholm"],
        ["sjl", "Region Zealand"],
        ["syd", "Southern Denmark"],
        ["mid", "Central Jutland"],
        ["nord", "North Jutland"],
    ],
    "jumps": [
        ["Copenhagen", 55.55, 12.15, 55.9, 12.7],
        ["North Zealand", 55.8, 11.8, 56.15, 12.65],
        ["Funen", 54.8, 9.65, 55.65, 10.95],
        ["Aarhus", 55.95, 9.8, 56.5, 10.95],
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


# ---------------------------------------------------------------- Danish
# Danish versions of each page's texts. The game picks Danish when the
# browser is Danish (or the player chooses DA); English is the default above.
_RAIL_WORDS_DA = {"one": "station", "many": "stationer", "kicker": "Find denne station"}
_RAIL_CREDITS_DA = ('Stationernes placering: <a href="https://github.com/trainline-eu/stations">Trainline stations dataset</a>'
                    " (ODbL) samt håndplacerede metro- og lokalbanestationer.")
_ADMIN_DA = {"hov": "Region Hovedstaden", "sjl": "Region Sjælland", "syd": "Region Syddanmark",
             "mid": "Region Midtjylland", "nord": "Region Nordjylland"}
_AREAS_DA = {"all": "Hele Danmark", "hov": "Region Hovedstaden og Bornholm", "sjl": "Region Sjælland",
             "syd": "Region Syddanmark", "mid": "Region Midtjylland", "nord": "Region Nordjylland"}
_DESC_NOTE_DA = " Bybeskrivelserne findes indtil videre kun på engelsk."

VARIANTS["denmark"]["da"] = {
    "title": "Danmarks togstationer",
    "tagline": "Find alle tog-, S-togs-, metro- og letbanestationer i Danmark",
    "words": _RAIL_WORDS_DA,
    "credits": _RAIL_CREDITS_DA,
    "footer": "Linjerne er tegnet fra station til station, så kurverne er forenklede. Bornholm har ingen jernbane og er derfor ikke med."
              "<br>Start mindre med <a href=\"danish-city-finder.html\">Find byen</a>,"
              " zoom ind på <a href=\"danish-rail-finder-sjaelland.html\">kun Sjælland</a>,"
              " lær byerne at kende i <a href=\"denmark-town-explorer.html\">Byopdageren</a>,"
              " eller find alle byer i <a href=\"denmark-map-master.html\">Kortmester Danmark</a>.",
    "regions": {"all": "Hele Danmark", "kbh": "København: S-tog og metro", "sjl": "Sjælland, Lolland og Falster",
                "fyn": "Fyn", "jyl": "Jylland"},
    "jumps": ["København", "Indre by", "Nordsjælland", "Aarhus", "Odense"],
}
VARIANTS["sjaelland"]["da"] = {
    "title": "Sjællands togstationer",
    "tagline": "Alle tog-, S-togs-, metro- og lokalbanestationer på Sjælland, Lolland og Falster",
    "words": _RAIL_WORDS_DA,
    "credits": _RAIL_CREDITS_DA,
    "footer": "Linjerne er tegnet fra station til station, så kurverne er forenklede. Grå prikker på den anden side af vandet er ikke med i spillet."
              "<br>Vil du have hele landet? Spil <a href=\"danish-rail-finder.html\">Danmarks togstationer</a>,"
              " eller lær byerne at kende i <a href=\"denmark-town-explorer.html\">Byopdageren</a>.",
    "regions": {"all": "Hele Sjælland", "kbh": "København: S-tog og metro", "nord": "Nordsjælland",
                "midt": "Midt- og Vestsjælland", "syd": "Sydsjælland, Lolland og Falster"},
    "jumps": ["København", "Indre by", "Nordsjælland", "Roskilde og Køge", "Lolland-Falster"],
}
VARIANTS["towns"]["da"] = {
    "title": "Byopdageren",
    "tagline": "Find Danmarks byer, og læs hvad hver by er kendt for",
    "words": {"one": "by", "many": "byer", "kicker": "Find denne by"},
    "credits": "Fakta og placeringer er samlet til dette spil.",
    "footer": "Prikkerne markerer bymidten. Bornholm vises i boksen nederst til højre; afstande regnes ud fra øens rigtige placering."
              + _DESC_NOTE_DA +
              "<br>Flere kortspil: <a href=\"denmark-map-master.html\">Kortmester Danmark</a> (alle 342 byer),"
              " <a href=\"danish-city-finder.html\">Find byen</a>,"
              " <a href=\"danish-rail-finder.html\">Danmarks togstationer</a> og"
              " <a href=\"danish-rail-finder-sjaelland.html\">Sjællands togstationer</a>.",
    "regions": _AREAS_DA,
    "jumps": ["København og Nordsjælland", "Fyn", "Sønderjylland", "Bornholm"],
}
VARIANTS["places"]["da"] = {
    "title": "Kortmester Danmark",
    "tagline": "Alle storbyer, større byer og mindre byer i Danmark på ét kort",
    "words": {"one": "sted", "many": "steder", "kicker": "Find dette sted"},
    "credits": "Steder og indbyggertal: <a href=\"https://www.geonames.org/\">GeoNames</a> (CC BY 4.0) via all-the-cities-pakken."
               " Indbyggertallene er GeoNames' skøn og kan være et par år gamle.",
    "footer": "Bornholm vises i boksen nederst til højre; afstande regnes ud fra øens rigtige placering." + _DESC_NOTE_DA +
              "<br>Flere kortspil: <a href=\"denmark-town-explorer.html\">Byopdageren</a>,"
              " <a href=\"danish-rail-finder.html\">Danmarks togstationer</a>,"
              " <a href=\"danish-rail-finder-sjaelland.html\">Sjællands togstationer</a> og"
              " <a href=\"danish-city-finder.html\">Find byen</a>.",
    "regions": {"all": "Alle", "city": "Storbyer", "major": "Større byer", "minor": "Mindre byer"},
    "areas": _AREAS_DA,
    "jumps": ["København", "Nordsjælland", "Fyn", "Aarhus", "Sønderjylland", "Bornholm"],
    "categories": {"city": ["Storby", "40.000+ indbyggere"], "major": ["Større by", "10.000–39.999 indbyggere"],
                   "minor": ["Mindre by", "under 10.000 indbyggere"]},
    "admin": _ADMIN_DA,
}


# ---------------------------------------------------------------- itch.io levels
# "Danmark på kortet" sold on itch.io as levels, easy to hard. Level 1 is free;
# levels 2-8 are 39 kr each, or 149 kr for all of them as a bundle. No place is
# in two levels, so nobody pays twice for the same towns or stations.
# Each level is its own itch.io project at https://<ITCH_USER>.itch.io/<slug>.
import copy
import os

ITCH_USER = os.environ.get("ITCH_USER", "YOUR-ITCH-NAME")
ITCH_BUNDLE = os.environ.get("ITCH_BUNDLE", f"https://{ITCH_USER}.itch.io")
SERIES = "Danmark på kortet"
PRICE = {"en": "39 kr", "da": "39 kr."}
BUNDLE_PRICE = {"en": "149 kr", "da": "149 kr."}

def itch_url(n):
    return f"https://{ITCH_USER}.itch.io/danmark-paa-kortet" + ("" if n == 1 else f"-{n}")

# Where the level links point: "site" (sold on the website, the default) or "itch".
LEVEL_TARGET = os.environ.get("LEVEL_TARGET", "site")
if LEVEL_TARGET == "itch":
    level_url, HOME_URL, BUNDLE_URL = itch_url, f"https://{ITCH_USER}.itch.io", ITCH_BUNDLE
else:
    level_url, HOME_URL, BUNDLE_URL = (lambda n: f"/games/level/{n}"), "/games/levels", "/games/levels#bundle"

LEVELS = [
    # n, base variant, short name (en, da), what it holds (en, da)
    (1, "places", ("Capital Region: major towns", "Region Hovedstaden: større byer"),
        ("22 major towns, one guess each", "22 større byer, ét gæt hver")),
    (2, "places", ("Denmark's cities", "Danmarks storbyer"),
        ("The 18 cities with 40,000+ people", "De 18 byer med over 40.000 indbyggere")),
    (3, "towns", ("Famous towns and their stories", "Kendte byer og deres historier"),
        ("72 towns, each with a fact card", "72 byer, hver med et faktakort")),
    (4, "places", ("Major towns across Denmark", "Større byer i hele Danmark"),
        ("34 major towns outside the Capital Region", "34 større byer uden for Region Hovedstaden")),
    (5, "denmark", ("Copenhagen S-tog & Metro", "København: S-tog og metro"),
        ("122 S-tog and Metro stops", "122 S-togs- og metrostationer")),
    (6, "sjaelland", ("Zealand, Lolland & Falster stations", "Stationer på Sjælland, Lolland og Falster"),
        ("92 train and local-line stations outside Copenhagen", "92 tog- og lokalbanestationer uden for København")),
    (7, "denmark", ("Jutland & Funen stations", "Stationer i Jylland og på Fyn"),
        ("179 train and light-rail stations", "179 tog- og letbanestationer")),
    (8, "places", ("Minor towns of Denmark", "Danmarks mindre byer"),
        ("268 towns with under 10,000 people", "268 byer med under 10.000 indbyggere")),
]

def _rail_level(keep):
    def region(lat, lon, city):
        r = _denmark_region(lat, lon, city)
        return "lvl" if r in keep else None
    return region

def _level_variant(n, base, name, holds):
    v = copy.deepcopy(VARIANTS[base])
    da = v["da"]
    nxt = next((l for l in LEVELS if l[0] == n + 1), None)
    title = (f"Level {n} · {name[0]}", f"Niveau {n} · {name[1]}")
    v["meta"].update({
        "title": title[0],
        "tagline": f"{SERIES}: {holds[0]}",
        "description": f"{SERIES}, level {n}: {holds[0]}. A Danish geography game: find each place on the map.",
        "key": f"danmark-paa-kortet-{n}",
        "footer": f"{SERIES} is a series of Danish map games, from easy to hard."
                  f" Level 1 is free; every other level is {PRICE['en']}, or {BUNDLE_PRICE['en']} for all of them.",
        "level": n,
        "home": {"url": HOME_URL, "en": "← All levels", "da": "← Alle niveauer"},
        "next": nxt and {"n": nxt[0], "url": level_url(nxt[0]), "en": f"Level {nxt[0]} · {nxt[2][0]}", "da": f"Niveau {nxt[0]} · {nxt[2][1]}",
                         "price": PRICE},
        "bundle": {"url": BUNDLE_URL, "price": BUNDLE_PRICE},
    })
    da.update({
        "title": title[1],
        "tagline": f"{SERIES}: {holds[1]}",
        "footer": f"{SERIES} er en serie danske kortspil, fra let til svær."
                  f" Niveau 1 er gratis; hvert af de andre niveauer koster {PRICE['da']}, eller {BUNDLE_PRICE['da']} for dem alle.",
    })
    if base in ("places", "denmark", "sjaelland"):
        # One pool per level: a single region, so the region buttons are hidden.
        v["regions"] = [["all", name[0]]]
        da["regions"] = {"all": name[1]}
    return v

for n, base, name, holds in LEVELS:
    VARIANTS[f"level{n}"] = _level_variant(n, base, name, holds)

# Which places each town level keeps (cat: city/major/minor, admin: region).
VARIANTS["level1"]["places"]["keep"] = lambda cat, admin: cat == "major" and admin == "hov"
VARIANTS["level2"]["places"]["keep"] = lambda cat, admin: cat == "city"
VARIANTS["level4"]["places"]["keep"] = lambda cat, admin: cat == "major" and admin != "hov"
VARIANTS["level8"]["places"]["keep"] = lambda cat, admin: cat == "minor"
for n in (1, 2):  # small levels: no area filter
    VARIANTS[f"level{n}"].pop("areas", None)
    VARIANTS[f"level{n}"]["da"].pop("areas", None)
VARIANTS["level4"]["areas"] = [a for a in VARIANTS["level4"]["areas"] if a[0] != "hov"]

# Level 1, the free taster: 10 towns per round, one guess each, zoomed on the
# Capital Region with Bornholm (Rønne) in a box in the Kattegat.
VARIANTS["level1"].update({
    "bbox": (11.45, 12.95, 55.5, 56.5),
    "inset": {"minLon": 14.5, "shift": (-2.95, 1.15), "label": "Bornholm"},
    "margin": {"dk": 460, "se": 460, "de": 460},
    "eps": {"dk": 0.3, "se": 1.2, "de": 1.2},
    "jumps": [["Copenhagen", 55.6, 12.3, 55.78, 12.68], ["North Zealand", 55.85, 12.0, 56.14, 12.65],
              ["Bornholm", 56.1, 11.8, 56.5, 12.35]],
})
VARIANTS["level1"]["da"]["jumps"] = ["København", "Nordsjælland", "Bornholm"]
VARIANTS["level1"]["meta"].update({"oneGuess": True, "fixedCount": "10", "hintKm": {"kbh": 10, "other": 10}, "revealKm": 5})

# Rail levels: only their own stations are playable; neighbours stay grey.
VARIANTS["level5"]["region"] = _rail_level({"kbh"})
VARIANTS["level6"]["region"] = lambda lat, lon, city: "lvl" if _zealand_region(lat, lon, city) in ("nord", "midt", "syd") else None
VARIANTS["level7"]["region"] = _rail_level({"fyn", "jyl"})
VARIANTS["level5"].update({"bbox": (12.0, 12.75, 55.4, 56.1), "jumps": VARIANTS["denmark"]["jumps"][:2],
                           "deco": [d for d in VARIANTS["sjaelland"]["deco"] if d[0] in ("Øresund", "Sverige", "Køge Bugt")]})
VARIANTS["level5"]["da"]["jumps"] = VARIANTS["denmark"]["da"]["jumps"][:2]
VARIANTS["level5"]["meta"]["hintKm"] = {"kbh": 8, "other": 8}
VARIANTS["level7"].update({"bbox": (7.95, 11.25, 54.7, 57.78),
                           "jumps": [j for j in VARIANTS["denmark"]["jumps"] if j[0] in ("Aarhus", "Odense")]})
VARIANTS["level7"]["da"]["jumps"] = ["Aarhus", "Odense"]
VARIANTS["level6"]["jumps"] = [j for j in VARIANTS["sjaelland"]["jumps"] if j[0] not in ("Copenhagen", "Inner city")]
VARIANTS["level6"]["da"]["jumps"] = [j for j in VARIANTS["sjaelland"]["da"]["jumps"] if j not in ("København", "Indre by")]
