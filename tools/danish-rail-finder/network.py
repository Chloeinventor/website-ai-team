# Danish rail network definition for the Rail Finder game.
# Lines are ordered station lists; names refer to normalised station names
# (dataset name without " St." / parenthetical suffix) or to MANUAL entries.

# Stations missing from the Trainline dataset (mostly Copenhagen Metro and a
# few local-line termini). Coordinates are approximate (±150 m).
MANUAL = {
    # Metro M1/M2 shared section and branches
    "Lindevang": (55.6837, 12.5133),
    "Fasanvej": (55.6815, 12.5234),
    "Frederiksberg": (55.6812, 12.5317),
    "Forum": (55.6818, 12.5525),
    "Kongens Nytorv": (55.6796, 12.5856),
    "Christianshavn": (55.6721, 12.5915),
    "Islands Brygge": (55.6634, 12.5852),
    "DR Byen": (55.6557, 12.5889),
    "Sundby": (55.6452, 12.5858),
    "Bella Center": (55.6380, 12.5830),
    "Vestamager": (55.6193, 12.5756),
    "Amagerbro": (55.6636, 12.6029),
    "Lergravsparken": (55.6622, 12.6166),
    "Øresund": (55.6611, 12.6290),
    "Amager Strand": (55.6560, 12.6320),
    "Femøren": (55.6450, 12.6380),
    "Kastrup": (55.6355, 12.6474),
    # Metro M3 Cityringen
    "Rådhuspladsen": (55.6762, 12.5689),
    "Gammel Strand": (55.6779, 12.5797),
    "Marmorkirken": (55.6852, 12.5891),
    "Trianglen": (55.6990, 12.5765),
    "Poul Henningsens Plads": (55.7047, 12.5674),
    "Vibenshus Runddel": (55.7065, 12.5615),
    "Skjolds Plads": (55.7031, 12.5497),
    "Nørrebros Runddel": (55.6940, 12.5390),
    "Nuuks Plads": (55.6884, 12.5435),
    "Aksel Møllers Have": (55.6861, 12.5320),
    "Frederiksberg Allé": (55.6763, 12.5380),
    "Enghave Plads": (55.6672, 12.5466),
    # Metro M4
    "Orientkaj": (55.7115, 12.5951),
    "Havneholmen": (55.6614, 12.5602),
    "Enghave Brygge": (55.6556, 12.5539),
    "Sluseholmen": (55.6458, 12.5451),
    "Mozarts Plads": (55.6487, 12.5329),
    # S-tog: Carlsberg replaced Enghave station in 2016
    "Carlsberg": (55.6652, 12.5352),
    # Local lines on Zealand
    "Helsinge": (56.0225, 12.1983),
    "Tisvildeleje": (56.0560, 12.0726),
    "Frederiksværk": (55.9703, 12.0236),
    "Hundested": (55.9650, 11.8510),
    "Svinninge": (55.7213, 11.4653),
    "Hørve": (55.7547, 11.4537),
    "Asnæs": (55.8125, 11.5000),
    "Vig": (55.8485, 11.5848),
    "Nykøbing Sjælland": (55.9232, 11.6705),
    "Hårlev": (55.3497, 12.2330),
    "Store Heddinge": (55.3108, 12.3896),
    "Faxe": (55.2560, 12.1179),
    "Faxe Ladeplads": (55.2187, 12.1572),
    "Dianalund": (55.5303, 11.4943),
    "Nærum": (55.8156, 12.5397),
    # Jutland local lines
    "Lemvig": (56.5486, 8.3102),
    "Nørre Nebel": (55.7843, 8.2934),
}

# Display-name overrides: normalised dataset name -> name shown in the game.
RENAME = {
    "København": "København H",
    "Kastrup Lufthavn": "Københavns Lufthavn",
    "Kb Hallen": "KB Hallen",
    "Goedstrup": "Gødstrup",
    "Viby Jylland": "Viby J",
    "Langeskov": "Langeskov",
    "Svenstrup": "Svenstrup",
    "Skødstrup": "Skødstrup",
    "Ålborg Vestby": "Aalborg Vestby",
    "Vestre Strandalle": "Vestre Strandallé",
    "Hurup Thy": "Hurup",
    "Bedsted Thy": "Bedsted",
    "Døstrup": "Døstrup",
    "Firhøj": "Firhøj",
    "Søborg": "Søborg",
    "Mårum": "Mårum",
    "Kagerup": "Kagerup",
    "Ans Station": "Ans",
}

MAIN, REGIONAL, LOCAL, STOG = "main", "regional", "local", "stog"
M1, M2, M3, M4 = "m1", "m2", "m3", "m4"

LINES = [
    # ---------------- Main lines ----------------
    (MAIN, "København H – Odense – Fredericia", [
        "København H", "Valby", "Høje Taastrup", "Hedehusene", "Trekroner", "Roskilde",
        "Ringsted", "Sorø", "Slagelse", "Korsør", "Nyborg", "Langeskov", "Odense",
        "Holmstrup", "Tommerup", "Skalbjerg", "Bred", "Årup", "Gelsted", "Ejby",
        "Nørre Aaby", "Kauslunde", "Middelfart", "Fredericia"]),
    (MAIN, "København – Ringsted (high-speed)", ["København H", "Ny Ellebjerg", "Køge Nord", "Ringsted"]),
    (MAIN, "Øresund line", ["København H", "Ørestad", "Tårnby", "Københavns Lufthavn"]),
    (MAIN, "Fredericia – Aarhus – Aalborg", [
        "Fredericia", "Børkop", "Brejning", "Vejle", "Hedensted", "Horsens", "Skanderborg",
        "Hørning", "Viby J", "Aarhus", "Hinnerup", "Hadsten", "Langå", "Randers", "Hobro",
        "Arden", "Skørping", "Støvring", "Svenstrup", "Skalborg", "Aalborg"]),
    (MAIN, "Aalborg – Frederikshavn", [
        "Aalborg", "Aalborg Vestby", "Lindholm", "Brønderslev", "Vraa", "Hjørring", "Sindal",
        "Tolne", "Kvissel", "Frederikshavn"]),
    (MAIN, "Fredericia – Padborg", [
        "Fredericia", "Taulov", "Kolding", "Lunderskov", "Vamdrup", "Vojens", "Rødekro",
        "Tinglev", "Padborg"]),
    (MAIN, "Lunderskov – Esbjerg", [
        "Lunderskov", "Vejen", "Brørup", "Holsted", "Gørding", "Bramming", "Tjæreborg", "Esbjerg"]),
    (MAIN, "Ringsted – Nykøbing F", [
        "Ringsted", "Glumsø", "Næstved", "Lundby", "Vordingborg", "Orehoved", "Nørre Alslev",
        "Eskilstrup", "Nykøbing Falster"]),

    # ---------------- Regional lines ----------------
    (REGIONAL, "Kystbanen", [
        "Østerport", "Hellerup", "Klampenborg", "Skodsborg", "Vedbæk", "Rungsted Kyst",
        "Kokkedal", "Nivå", "Humlebæk", "Espergærde", "Snekkersten", "Helsingør"]),
    (REGIONAL, "Kystbanen (city)", ["København H", "Nørreport", "Østerport"]),
    (REGIONAL, "Roskilde – Ringsted", ["Roskilde", "Viby Sjælland", "Borup", "Ringsted"]),
    (REGIONAL, "Nordvestbanen", [
        "Roskilde", "Lejre", "Hvalsø", "Tølløse", "Vipperød", "Holbæk", "Regstrup",
        "Knabstrup", "Mørkøv", "Jyderup", "Svebølle", "Kalundborg"]),
    (REGIONAL, "Køge – Næstved", ["Køge", "Herfølge", "Tureby", "Haslev", "Holme-Olstrup", "Næstved"]),
    (REGIONAL, "Svendborgbanen", [
        "Odense", "Odense Sygehus", "Fruens Bøge", "Hjallese", "Højby Fyn", "Årslev",
        "Pederstrup", "Ringe", "Rudme", "Kværndrup", "Stenstrup", "Stenstrup Syd",
        "Svendborg Vest", "Svendborg"]),
    (REGIONAL, "Sønderborgbanen", ["Tinglev", "Kliplev", "Gråsten", "Sønderborg"]),
    (REGIONAL, "Marskbanen", [
        "Bramming", "Sejstrup", "Gredstedbro", "Ribe Nørremark", "Ribe", "Hviding", "Rejsby",
        "Brøns", "Skærbæk", "Døstrup", "Bredebro", "Visby", "Tønder Nord", "Tønder"]),
    (REGIONAL, "Den vestjyske længdebane", [
        "Esbjerg", "Spangsbjerg", "Gjesing", "Guldager", "Varde Kaserne", "Varde", "Sig",
        "Tistrup", "Gaarde", "Ølgod", "Tarm", "Skjern", "Lem", "Ringkøbing", "Hee", "Tim",
        "Ulfborg", "Vemb", "Holstebro", "Hjerm", "Struer"]),
    (REGIONAL, "Skjern – Herning", [
        "Skjern", "Borris", "Troldhede", "Kibæk", "Studsgaard", "Herning Messecenter", "Herning"]),
    (REGIONAL, "Aarhus – Herning", [
        "Skanderborg", "Alken", "Ry", "Laven", "Svejbæk", "Silkeborg", "Engesvang", "Bording",
        "Ikast", "Hammerum", "Birk Centerpark", "Herning"]),
    (REGIONAL, "Vejle – Herning – Struer", [
        "Vejle", "Vejle Sygehus", "Jelling", "Give", "Thyregod", "Brande", "Herning", "Gødstrup",
        "Vildbjerg", "Aulum", "Holstebro"]),
    (REGIONAL, "Thybanen", [
        "Struer", "Humlum", "Oddesund Nord", "Uglev", "Hvidbjerg", "Lyngs", "Ydby", "Hurup",
        "Bedsted", "Hørdum", "Snedsted", "Sjørring", "Thisted"]),
    (REGIONAL, "Struer – Langå", [
        "Struer", "Vinderup", "Skive", "Højslev", "Stoholm", "Viborg", "Rødkærsbro",
        "Bjerringbro", "Ulstrup", "Langå"]),

    # ---------------- Local lines ----------------
    (LOCAL, "Skagensbanen", [
        "Frederikshavn", "Strandby", "Rimmen", "Jerup", "Ålbæk", "Bunken", "Hulsig", "Skagen"]),
    (LOCAL, "Hirtshalsbanen", ["Hjørring", "Hirtshals"]),
    (LOCAL, "Lemvigbanen", ["Vemb", "Bur", "Lemvig"]),
    (LOCAL, "Vestbanen", ["Varde", "Varde Nord", "Nørre Nebel"]),
    (LOCAL, "Aarhus Letbane – Grenaa", [
        "Aarhus", "Skolebakken", "Østbanetorvet", "Vestre Strandallé", "Torsøvej", "Lystrup",
        "Hovmarken", "Hjortshøj", "Skødstrup", "Løgten", "Hornslet", "Mørke", "Ryomgård",
        "Kolind", "Trustrup", "Grenaa"]),
    (LOCAL, "Aarhus Letbane – Odder", ["Aarhus", "Odder"]),
    (LOCAL, "Lollandsbanen", ["Nykøbing Falster", "Sakskøbing", "Maribo", "Søllested", "Nakskov"]),
    (LOCAL, "Lille Syd", ["Roskilde", "Gadstrup", "Havdrup", "Lille Skensved", "Ølby", "Køge"]),
    (LOCAL, "Østbanen", ["Køge", "Hårlev", "Store Heddinge"]),
    (LOCAL, "Østbanen (Faxe)", ["Hårlev", "Faxe", "Faxe Ladeplads"]),
    (LOCAL, "Odsherredsbanen", ["Holbæk", "Svinninge", "Hørve", "Asnæs", "Vig", "Nykøbing Sjælland"]),
    (LOCAL, "Tølløsebanen", ["Tølløse", "Dianalund", "Slagelse"]),
    (LOCAL, "Lille Nord", [
        "Hillerød", "Fredensborg", "Langerød", "Kvistgaard", "Mørdrup", "Snekkersten"]),
    (LOCAL, "Gribskovbanen", [
        "Hillerød", "Slotspavillonen", "Kagerup", "Mårum", "Saltrup", "Græsted Syd", "Græsted",
        "Paarup", "Fjellenstrup", "Gilleleje"]),
    (LOCAL, "Tisvildebanen", ["Kagerup", "Helsinge", "Tisvildeleje"]),
    (LOCAL, "Frederiksværkbanen", ["Hillerød", "Frederiksværk", "Hundested"]),
    (LOCAL, "Hornbækbanen", [
        "Helsingør", "Grønnehave", "Marienlyst", "Højstrup", "Hellebæk", "Ålsgårde",
        "Skibstrup", "Saunte", "Karinebæk", "Hornbæk", "Horneby Sand", "Kildekrog",
        "Dronningmølle", "Firhøj", "Søborg", "Stæremosen", "Gilleleje Øst", "Gilleleje"]),
    (LOCAL, "Nærumbanen", ["Jægersborg", "Nærum"]),

    # ---------------- S-tog ----------------
    (STOG, "S-tog city tunnel", [
        "Valby", "Carlsberg", "Dybbølsbro", "København H", "Vesterport", "Nørreport",
        "Østerport", "Nordhavn", "Svanemøllen", "Hellerup"]),
    (STOG, "S-tog Klampenborg", ["Hellerup", "Charlottenlund", "Ordrup", "Klampenborg"]),
    (STOG, "S-tog Hillerød", [
        "Hellerup", "Bernstorffsvej", "Gentofte", "Jægersborg", "Lyngby", "Sorgenfri", "Virum",
        "Holte", "Birkerød", "Allerød", "Hillerød"]),
    (STOG, "S-tog Farum", [
        "Svanemøllen", "Ryparken", "Emdrup", "Dyssegård", "Vangede", "Kildebakke", "Buddinge",
        "Stengården", "Bagsværd", "Skovbrynet", "Hareskov", "Værløse", "Farum"]),
    (STOG, "S-tog Ringbanen", [
        "Hellerup", "Ryparken", "Bispebjerg", "Nørrebro", "Fuglebakken", "Grøndal", "Flintholm",
        "KB Hallen", "Ålholm", "Danshøj", "Vigerslev Alle", "Ny Ellebjerg"]),
    (STOG, "S-tog Frederikssund", [
        "Valby", "Langgade", "Peter Bangs Vej", "Flintholm", "Vanløse", "Jyllingevej", "Islev",
        "Husum", "Herlev", "Skovlunde", "Malmparken", "Ballerup", "Måløv", "Kildedal", "Veksø",
        "Stenløse", "Egedal", "Ølstykke", "Frederikssund"]),
    (STOG, "S-tog Høje Taastrup", [
        "Valby", "Danshøj", "Hvidovre", "Rødovre", "Brøndbyøster", "Glostrup", "Albertslund",
        "Taastrup", "Høje Taastrup"]),
    (STOG, "S-tog Køge", [
        "Dybbølsbro", "Sydhavn", "Sjælør", "Ny Ellebjerg", "Åmarken", "Friheden", "Avedøre",
        "Brøndby Strand", "Vallensbæk", "Ishøj", "Hundige", "Greve", "Karlslunde",
        "Solrød Strand", "Jersie", "Køge Nord", "Ølby", "Køge"]),

    # ---------------- Metro ----------------
    (M1, "M1", [
        "Vanløse", "Flintholm", "Lindevang", "Fasanvej", "Frederiksberg", "Forum", "Nørreport",
        "Kongens Nytorv", "Christianshavn", "Islands Brygge", "DR Byen", "Sundby",
        "Bella Center", "Ørestad", "Vestamager"]),
    (M2, "M2", [
        "Vanløse", "Flintholm", "Lindevang", "Fasanvej", "Frederiksberg", "Forum", "Nørreport",
        "Kongens Nytorv", "Christianshavn", "Amagerbro", "Lergravsparken", "Øresund",
        "Amager Strand", "Femøren", "Kastrup", "Københavns Lufthavn"]),
    (M3, "M3 Cityringen", [
        "København H", "Rådhuspladsen", "Gammel Strand", "Kongens Nytorv", "Marmorkirken",
        "Østerport", "Trianglen", "Poul Henningsens Plads", "Vibenshus Runddel", "Skjolds Plads",
        "Nørrebro", "Nørrebros Runddel", "Nuuks Plads", "Aksel Møllers Have", "Frederiksberg",
        "Frederiksberg Allé", "Enghave Plads", "København H"]),
    (M4, "M4", [
        "Orientkaj", "Nordhavn", "Østerport", "Marmorkirken", "Kongens Nytorv", "Gammel Strand",
        "Rådhuspladsen", "København H", "Havneholmen", "Enghave Brygge", "Sluseholmen",
        "Mozarts Plads", "Ny Ellebjerg"]),
]
