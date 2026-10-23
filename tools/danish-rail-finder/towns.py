# Cities and towns for the Town Explorer game.
# (name, lat, lon, region id, [known for], description)
# Coordinates are town centres (±1 km). Region ids are Denmark's five regions.

TOWNS = [
    # ---------------- Region Hovedstaden ----------------
    ("København", 55.6761, 12.5683, "hov", ["Capital city", "Tivoli", "Nyhavn", "The Little Mermaid"],
     "Denmark's capital and largest city. Tivoli Gardens, opened in 1843, is one of the world's oldest amusement parks, "
     "and the colourful houses of Nyhavn line a 17th-century canal. The Little Mermaid statue honours Hans Christian Andersen's "
     "fairy tale, Christiansborg Palace houses the Danish Parliament, and the royal family lives at Amalienborg."),
    ("Frederiksberg", 55.6786, 12.5320, "hov", ["City within a city", "Frederiksberg Gardens", "Copenhagen Zoo"],
     "An independent municipality completely surrounded by Copenhagen. It is known for the romantic Frederiksberg Gardens, "
     "the hilltop Frederiksberg Palace and Copenhagen Zoo, one of the oldest zoos in Europe."),
    ("Kongens Lyngby", 55.7704, 12.5038, "hov", ["Frilandsmuseet", "DTU"],
     "A northern suburb of Copenhagen, home to the Technical University of Denmark (DTU). Nearby Frilandsmuseet is one of the "
     "largest and oldest open-air museums in the world, with farms and houses moved here from all over Denmark."),
    ("Klampenborg", 55.7720, 12.5900, "hov", ["Bakken", "Dyrehaven", "Bellevue Beach"],
     "Seaside suburb north of Copenhagen. Bakken, in the deer park Dyrehaven, is considered the world's oldest operating "
     "amusement park, dating back to 1583. Bellevue Beach, with lifeguard towers by Arne Jacobsen, is a summer favourite."),
    ("Dragør", 55.5942, 12.6721, "hov", ["Yellow skipper houses", "Old harbour"],
     "A charming old fishing and skipper town on Amager, right next to Copenhagen Airport. Its cobbled lanes of yellow "
     "houses with red-tiled roofs are among the best preserved in Denmark."),
    ("Humlebæk", 55.9633, 12.5331, "hov", ["Louisiana Museum of Modern Art"],
     "A small coastal town on the Øresund, world famous for the Louisiana Museum of Modern Art. The museum's galleries and "
     "sculpture park look out over the water towards Sweden."),
    ("Helsingør", 56.0361, 12.6136, "hov", ["Kronborg Castle", "Hamlet's Elsinore", "Ferry to Sweden"],
     "Home of Kronborg Castle, the 'Elsinore' of Shakespeare's Hamlet and a UNESCO World Heritage Site. For centuries "
     "every ship passing through the narrow Øresund had to pay the Sound Dues here. Sweden is only 4 km away by ferry."),
    ("Fredensborg", 55.9757, 12.4040, "hov", ["Fredensborg Palace", "Lake Esrum"],
     "A small town built around Fredensborg Palace, a royal residence often used by the Danish royal family in spring and "
     "autumn. The palace gardens run down to Esrum Sø, one of Denmark's largest lakes."),
    ("Hillerød", 55.9273, 12.3008, "hov", ["Frederiksborg Castle", "Museum of National History"],
     "Known for Frederiksborg Castle, a Renaissance palace built by King Christian IV on three islands in a lake. Today it "
     "houses the Museum of National History, with portraits from 500 years of Danish history."),
    ("Gilleleje", 56.1225, 12.3108, "hov", ["Fishing harbour", "Northernmost town on Zealand"],
     "Zealand's northernmost town, a lively fishing harbour with fresh fish sold straight off the boats. Its beaches and "
     "thatched fishermen's houses make it a classic Danish summer destination."),
    ("Frederikssund", 55.8396, 12.0689, "hov", ["Viking plays", "Roskilde Fjord"],
     "A fjord town known for its Viking plays (Vikingespil), performed every summer since 1952 by local volunteers in an "
     "open-air theatre by the water."),
    ("Rønne", 55.1009, 14.7066, "hov", ["Bornholm's main town", "Ceramics", "Ferry port"],
     "The largest town on Bornholm, the rocky Baltic island far east of the rest of Denmark. Ferries arrive here from Køge "
     "and from Ystad in Sweden, and the town has a long tradition of ceramics and clockmaking."),
    ("Gudhjem", 55.2104, 14.9709, "hov", ["Smokehouses", "'Sol over Gudhjem'", "Round churches nearby"],
     "A picturesque fishing village built on steep rocks on Bornholm's north coast. Its herring smokehouses gave name to "
     "the dish 'Sol over Gudhjem' (smoked herring with an egg yolk), and the round church at Østerlars is close by."),
    ("Svaneke", 55.1355, 15.1414, "hov", ["Denmark's easternmost town", "Caramels", "Local brewery"],
     "Denmark's easternmost town, on the coast of Bornholm. Its well-preserved half-timbered houses, local caramels, smoked "
     "fish and microbrewery attract visitors all summer."),

    # ---------------- Region Sjælland ----------------
    ("Roskilde", 55.6415, 12.0803, "sjl", ["Roskilde Cathedral", "Viking Ship Museum", "Roskilde Festival"],
     "One of Denmark's oldest towns. Roskilde Cathedral, a UNESCO World Heritage Site, is the burial place of Danish "
     "monarchs. The Viking Ship Museum displays five Viking ships raised from the fjord, and Roskilde Festival is one of "
     "Europe's largest music festivals."),
    ("Køge", 55.4580, 12.1821, "sjl", ["Medieval town centre", "Battle of Køge Bay"],
     "A market town with one of Denmark's best-preserved medieval centres, full of half-timbered houses. In 1677 Admiral "
     "Niels Juel won a famous naval victory over Sweden in Køge Bay just offshore."),
    ("Kalundborg", 55.6805, 11.0880, "sjl", ["Five-towered church", "Industrial symbiosis"],
     "A port town known for its Church of Our Lady, a 12th-century church with five towers. Kalundborg is also famous for "
     "its 'industrial symbiosis', where local factories share energy, water and by-products."),
    ("Slagelse", 55.4028, 11.3546, "sjl", ["Trelleborg Viking fortress", "Hans Christian Andersen's school"],
     "West Zealand's largest town. Just outside lies Trelleborg, one of Harald Bluetooth's circular Viking fortresses, and "
     "the young Hans Christian Andersen went to grammar school here."),
    ("Korsør", 55.3300, 11.1400, "sjl", ["Great Belt Bridge", "Fortress tower"],
     "A harbour town on the Great Belt where the Great Belt Fixed Link, one of the world's longest suspension bridges, "
     "reaches Zealand. Until the bridge opened in the late 1990s, Korsør was the busy ferry port for trains and cars heading west."),
    ("Sorø", 55.4318, 11.5555, "sjl", ["Sorø Academy", "Absalon's grave", "Lakeside town"],
     "A quiet lakeside town known for Sorø Academy, a boarding school founded on the site of a medieval abbey. Bishop "
     "Absalon, the founder of Copenhagen, is buried in Sorø's abbey church."),
    ("Ringsted", 55.4426, 11.7903, "sjl", ["St. Bendt's Church", "Royal burial site"],
     "A medieval royal town in the middle of Zealand. St. Bendt's Church holds the graves of several Valdemar-era kings and "
     "queens. Today Ringsted is a major railway junction."),
    ("Næstved", 55.2299, 11.7609, "sjl", ["South Zealand's largest town", "Gavnø Castle", "Herlufsholm"],
     "The largest town in South Zealand. Nearby Gavnø Castle is known for its huge spring tulip displays, and Herlufsholm "
     "is one of Denmark's oldest boarding schools."),
    ("Vordingborg", 55.0080, 11.9100, "sjl", ["Goose Tower", "Valdemar castle ruins"],
     "Gateway to the islands of Møn and Falster. The Goose Tower (Gåsetårnet) is the best-preserved part of a mighty "
     "castle used by the Valdemar kings in the Middle Ages."),
    ("Stege", 54.9870, 12.2840, "sjl", ["Møns Klint", "Medieval town gate"],
     "The main town on the island of Møn, with a medieval town gate, Mølleporten. Møn is famous for Møns Klint, white chalk "
     "cliffs rising more than 100 metres above the Baltic Sea."),
    ("Nykøbing Falster", 54.7691, 11.8743, "sjl", ["Medieval Centre", "Falster's main town"],
     "The largest town on Falster. Its Middelaldercentret is a living medieval village with knights, a working trebuchet "
     "and craftspeople, and the long white beach at Marielyst is nearby."),
    ("Maribo", 54.7760, 11.5010, "sjl", ["Maribo Cathedral", "Lakes", "Knuthenborg Safari Park"],
     "Lolland's cathedral town, set beside the Maribo Lakes. Knuthenborg Safari Park, Northern Europe's largest safari park, "
     "is just north of town."),
    ("Rødby", 54.6946, 11.3893, "sjl", ["Ferry to Germany", "Fehmarn Belt tunnel"],
     "A town on southern Lolland. From Rødbyhavn, ferries cross to Puttgarden in Germany, and the Fehmarn Belt tunnel, one "
     "of the world's longest immersed road and rail tunnels, is being built here."),

    # ---------------- Region Syddanmark ----------------
    ("Odense", 55.4038, 10.4024, "syd", ["Hans Christian Andersen", "Carl Nielsen", "Odense Zoo"],
     "Denmark's third-largest city and the birthplace of Hans Christian Andersen. The museum H.C. Andersens Hus brings his "
     "fairy tales to life. Composer Carl Nielsen grew up nearby, and Odense Zoo is one of the country's most popular."),
    ("Nyborg", 55.3122, 10.7896, "syd", ["Nyborg Castle", "Great Belt Bridge"],
     "Nyborg Castle is Scandinavia's oldest preserved royal castle, where the medieval Danehof parliament met and Denmark's "
     "first constitution-like charter was signed in 1282. The Great Belt Bridge reaches Funen just outside town."),
    ("Kerteminde", 55.4497, 10.6576, "syd", ["Ladby Viking ship", "Porpoises", "Painter Johannes Larsen"],
     "A charming fishing town on Funen's east coast. Nearby is the Ladby Ship, the only Viking ship grave found in Denmark, "
     "and the Fjord&Bælt centre lets you watch harbour porpoises up close."),
    ("Middelfart", 55.5058, 9.7302, "syd", ["Little Belt Bridge walk", "Porpoise safaris"],
     "A town on the Little Belt where you can walk over the top of the Old Little Belt Bridge from 1935. The narrow strait "
     "is one of the best places in the world to see harbour porpoises."),
    ("Faaborg", 55.0951, 10.2420, "syd", ["Faaborg Museum", "South Funen Archipelago"],
     "A well-preserved harbour town in the South Funen Archipelago. Faaborg Museum showcases the Funen Painters, and ferries "
     "leave for the small islands of Lyø, Avernakø and Bjørnø."),
    ("Svendborg", 55.0598, 10.6068, "syd", ["Maritime town", "Mærsk's birthplace", "Island ferries"],
     "A maritime town in the South Funen Archipelago where the shipping company that became Mærsk was founded in 1904. "
     "Ferries from Svendborg sail to Ærø and the smaller islands."),
    ("Ærøskøbing", 54.8880, 10.4110, "syd", ["Fairy-tale town", "Cobbled streets", "Wedding island"],
     "A beautifully preserved 18th-century town on the island of Ærø, with cobbled streets and tiny painted houses. Ærø is "
     "popular for weddings, especially with couples from abroad."),
    ("Esbjerg", 55.4765, 8.4594, "syd", ["'Man Meets the Sea'", "Offshore energy", "Fisheries museum"],
     "A young city founded in 1868 as a North Sea port. Today it is Denmark's energy hub for offshore oil, gas and wind. "
     "On the beach stand 'Man Meets the Sea', four 9-metre-tall white figures by Svend Wiig Hansen."),
    ("Nordby", 55.4440, 8.4040, "syd", ["Island of Fanø", "Kite festival", "Wide sandy beaches"],
     "The main town on Fanø, a 12-minute ferry ride from Esbjerg. Fanø's huge sandy beaches host one of Europe's biggest "
     "kite festivals, and its old skipper houses recall a great sailing-ship era."),
    ("Blåvand", 55.5580, 8.1320, "syd", ["Denmark's westernmost point", "Lighthouse", "Bunkers"],
     "A holiday area by Blåvandshuk, the westernmost point of Denmark, marked by a tall lighthouse. The dunes are dotted with "
     "German WWII bunkers, and the Tirpitz museum tells their story."),
    ("Ribe", 55.3280, 8.7600, "syd", ["Denmark's oldest town", "Ribe Cathedral", "Vikings"],
     "Denmark's oldest town, founded as a Viking-age trading place in the early 700s. Its cathedral towers over crooked "
     "medieval streets, the night watchman still makes his rounds, and the Wadden Sea National Park lies just west."),
    ("Tønder", 54.9330, 8.8670, "syd", ["Tønder Festival", "Lace-making", "Black Sun starlings"],
     "A marshland town famous for Tønder Festival, a leading folk and roots music festival, and for its historic lace-making. "
     "In spring and autumn, huge flocks of starlings create the 'Black Sun' (sort sol) over the nearby marshes."),
    ("Aabenraa", 55.0443, 9.4174, "syd", ["Ring riding festival", "Fjord town"],
     "A fjord town in South Jutland with a strong seafaring history. Its summer ring riding festival (Ringriderfest), where "
     "riders spear small rings at a gallop, is one of the biggest in Denmark."),
    ("Sønderborg", 54.9138, 9.7922, "syd", ["Sønderborg Castle", "Dybbøl 1864", "Danfoss"],
     "The main town on the island of Als. The Battle of Dybbøl in 1864, a defining moment in Danish history, was fought just "
     "outside town, and Sønderborg Castle tells the story of the region. Global company Danfoss is based on Als."),
    ("Haderslev", 55.2530, 9.4890, "syd", ["Haderslev Cathedral", "Fjord"],
     "A town at the head of Haderslev Fjord, dominated by its tall Gothic cathedral. The old town is full of well-kept "
     "merchants' houses."),
    ("Christiansfeld", 55.3570, 9.4830, "syd", ["Moravian Church town", "UNESCO", "Honey cakes"],
     "Founded in 1773 by the Moravian Church, a Protestant community. The town's simple, harmonious plan is a UNESCO World "
     "Heritage Site, and it is famous for its spiced honey cakes (honningkager)."),
    ("Kolding", 55.4904, 9.4722, "syd", ["Koldinghus", "Trapholt", "Design"],
     "A city known for Koldinghus, a royal castle that burned in 1808 and was later rebuilt as a museum, and for Trapholt "
     "museum of art and design. Kolding promotes itself as a city of design."),
    ("Fredericia", 55.5657, 9.7526, "syd", ["Ramparts", "Landsoldaten", "Railway junction"],
     "A fortress town founded in 1650, still surrounded by large earthen ramparts. The statue 'Landsoldaten' honours the "
     "Danish victory at the Battle of Fredericia in 1849."),
    ("Vejle", 55.7093, 9.5357, "syd", ["Vejle Fjord", "'The Wave' building", "Hilly city"],
     "A city at the head of Vejle Fjord, surrounded by unusually steep hills for Denmark. The waterfront apartment building "
     "'Bølgen' (The Wave) has become a modern landmark."),
    ("Jelling", 55.7560, 9.4190, "syd", ["Jelling Stones", "Harald Bluetooth", "UNESCO"],
     "A small town with huge historical importance. The Jelling Stones, raised by King Gorm and his son Harald Bluetooth "
     "around 965, are called Denmark's birth certificate. The stones, mounds and church are a UNESCO World Heritage Site."),
    ("Billund", 55.7310, 9.1150, "syd", ["LEGO", "LEGOLAND", "LEGO House"],
     "The home town of LEGO, founded here in 1932. LEGOLAND Billund opened in 1968, LEGO House is the 'home of the brick', "
     "and Billund Airport is Denmark's second-busiest."),

    # ---------------- Region Midtjylland ----------------
    ("Aarhus", 56.1572, 10.2107, "mid", ["ARoS", "Den Gamle By", "Moesgaard Museum"],
     "Denmark's second-largest city. ARoS Aarhus Art Museum is crowned by 'Your rainbow panorama' by Olafur Eliasson, Den "
     "Gamle By is an open-air museum of historic town houses, and Moesgaard Museum displays the Grauballe Man. Aarhus was a "
     "European Capital of Culture in 2017."),
    ("Horsens", 55.8607, 9.8503, "mid", ["Prison museum", "Vitus Bering", "Concerts"],
     "Known for its former state prison, now a museum and a concert venue. The explorer Vitus Bering, who gave his name to "
     "the Bering Strait, was born here in 1681."),
    ("Skanderborg", 56.0340, 9.9300, "mid", ["Smukfest", "Lakes"],
     "A lakeside town best known for Smukfest, 'Denmark's most beautiful festival', held every August in the beech forest "
     "Dyrehaven."),
    ("Silkeborg", 56.1697, 9.5451, "mid", ["Tollund Man", "Lake District", "Hjejlen paddle steamer"],
     "The heart of Denmark's Lake District. Museum Silkeborg displays the Tollund Man, a 2,400-year-old bog body, the paddle "
     "steamer Hjejlen has sailed since 1861, and the hill Himmelbjerget is nearby."),
    ("Herning", 56.1393, 8.9738, "mid", ["Textile history", "MCH conference centre", "Jyske Bank Boxen"],
     "A city that grew rich on the textile industry. Today it hosts major fairs, concerts and sports events at MCH and "
     "Jyske Bank Boxen, and HEART museum of contemporary art."),
    ("Holstebro", 56.3601, 8.6161, "mid", ["Giacometti's 'Maren'", "Odin Theatre", "Public art"],
     "A town known for its public art, above all Giacometti's sculpture 'Woman on a Cart', nicknamed 'Maren'. The world-famous "
     "experimental Odin Theatre has been based here since 1966."),
    ("Struer", 56.4910, 8.5900, "mid", ["Bang & Olufsen", "Limfjord"],
     "A Limfjord town known around the world as the home of Bang & Olufsen, the design-focused audio and TV company founded "
     "nearby in 1925."),
    ("Ringkøbing", 56.0897, 8.2440, "mid", ["Ringkøbing Fjord", "Old market town"],
     "A historic market town on the shore of Ringkøbing Fjord, a large lagoon separated from the North Sea by a narrow "
     "strip of dunes."),
    ("Hvide Sande", 56.0040, 8.1290, "mid", ["Fishing port", "Surfing", "Between sea and fjord"],
     "A fishing town on a narrow strip of land between the North Sea and Ringkøbing Fjord. It is a magnet for windsurfers "
     "and kitesurfers."),
    ("Viborg", 56.4532, 9.4020, "mid", ["Viborg Cathedral", "Ancient royal assembly", "Hærvejen"],
     "One of Denmark's oldest towns. For centuries Danish kings were acclaimed at the assembly here, and its twin-towered "
     "cathedral is decorated with huge frescoes by Joakim Skovgaard. The ancient Hærvejen route passes through."),
    ("Skive", 56.5670, 9.0270, "mid", ["Limfjord", "Spøttrup Castle"],
     "A Limfjord town on the Salling peninsula. Nearby Spøttrup is one of Denmark's best-preserved medieval castles, "
     "complete with moats and ramparts."),
    ("Randers", 56.4607, 10.0364, "mid", ["Randers Regnskov", "Gudenå river"],
     "A city on the Gudenå, Denmark's longest river. Randers Regnskov is a tropical zoo where rainforest animals live under "
     "giant domes."),
    ("Ebeltoft", 56.1944, 10.6821, "mid", ["Frigate Jylland", "Glass Museum", "Tiny old town hall"],
     "A cosy town on the Djursland peninsula with cobbled streets and a tiny old town hall. The wooden warship Fregatten "
     "Jylland is a museum in dry dock, and the Glass Museum shows international glass art."),
    ("Grenaa", 56.4158, 10.8783, "mid", ["Kattegatcentret", "Beaches", "Djursland"],
     "A port town on the east coast of Djursland. Kattegatcentret aquarium has a large shark tank, and the town's long sandy "
     "beaches draw summer visitors."),

    # ---------------- Region Nordjylland ----------------
    ("Aalborg", 57.0488, 9.9217, "nord", ["Jomfru Ane Gade", "Lindholm Høje", "Utzon Center"],
     "North Jutland's largest city, on the Limfjord. Jomfru Ane Gade is a famous nightlife street, Lindholm Høje is a large "
     "Viking-age burial ground, and the Utzon Center celebrates Jørn Utzon, architect of the Sydney Opera House."),
    ("Hobro", 56.6430, 9.7930, "nord", ["Fyrkat Viking fortress", "Mariager Fjord"],
     "A town at the head of Mariager Fjord. Just outside lies Fyrkat, one of Harald Bluetooth's ring-shaped Viking "
     "fortresses, with a reconstructed Viking farm."),
    ("Mariager", 56.6490, 9.9800, "nord", ["City of Roses", "Salt Centre", "Veteran railway"],
     "One of Denmark's smallest towns, nicknamed 'the city of roses' for the flowers along its cobbled streets. It lies on "
     "Mariager Fjord, with a salt centre and a veteran railway."),
    ("Nykøbing Mors", 56.7950, 8.8600, "nord", ["Island of Mors", "Limfjord"],
     "The main town on Mors, an island in the middle of the Limfjord. Mors is famous for its moler clay cliffs, which "
     "contain beautifully preserved fossils from around 55 million years ago."),
    ("Thisted", 56.9552, 8.6946, "nord", ["National Park Thy", "Wild west coast"],
     "The main town of Thy in northwest Jutland. National Park Thy, Denmark's first national park (2008), protects the wild "
     "dunes, heaths and lakes along the North Sea coast."),
    ("Klitmøller", 57.0400, 8.5090, "nord", ["'Cold Hawaii'", "Surfing"],
     "A small fishing village that has become 'Cold Hawaii', one of Europe's best spots for surfing and windsurfing. "
     "International windsurfing competitions are held off its beach."),
    ("Løkken", 57.3700, 9.7150, "nord", ["Beach resort", "Bathing huts", "Rubjerg Knude"],
     "A classic North Sea beach resort, known for its rows of white bathing huts. Nearby Rubjerg Knude lighthouse, half buried "
     "by a moving dune, was rolled 70 metres inland in 2019 to save it from the sea."),
    ("Hirtshals", 57.5880, 9.9590, "nord", ["North Sea Oceanarium", "Ferries to Norway"],
     "A busy fishing and ferry port with frequent sailings to Norway. The North Sea Oceanarium is one of Northern Europe's "
     "largest aquariums."),
    ("Frederikshavn", 57.4407, 10.5366, "nord", ["Ferries to Sweden & Norway", "Naval port"],
     "A harbour town with ferries to Gothenburg and Oslo and an important naval base. It is the gateway to Skagen and the "
     "island of Læsø."),
    ("Skagen", 57.7209, 10.5839, "nord", ["Grenen", "Skagen Painters", "Råbjerg Mile"],
     "Denmark's northernmost town. At Grenen you can stand where the Skagerrak and Kattegat seas meet. The special light "
     "drew the Skagen Painters, such as P.S. Krøyer and Anna and Michael Ancher, and Råbjerg Mile is a huge wandering dune."),
]

