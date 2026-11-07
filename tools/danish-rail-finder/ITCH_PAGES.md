# Danmark på kortet: itch.io pages

One itch.io project per level. Create them with **exactly these URLs**, because each
level's end screen links to the next level, to the bundle and to your itch.io page:

| Level | Project URL (`https://<you>.itch.io/…`) | Upload | Price |
|---|---|---|---|
| 1 | `danmark-paa-kortet` | `danmark-paa-kortet.zip` | Free (no payment, or "Name your own price" with 0 minimum) |
| 2 | `danmark-paa-kortet-2` | `danmark-paa-kortet-2.zip` | 39 kr (set as USD/EUR equivalent, e.g. $5.99 / €4.99) |
| 3 | `danmark-paa-kortet-3` | `danmark-paa-kortet-3.zip` | 39 kr |
| 4 | `danmark-paa-kortet-4` | `danmark-paa-kortet-4.zip` | 39 kr |
| 5 | `danmark-paa-kortet-5` | `danmark-paa-kortet-5.zip` | 39 kr |
| 6 | `danmark-paa-kortet-6` | `danmark-paa-kortet-6.zip` | 39 kr |
| 7 | `danmark-paa-kortet-7` | `danmark-paa-kortet-7.zip` | 39 kr |
| 8 | `danmark-paa-kortet-8` | `danmark-paa-kortet-8.zip` | 39 kr |
| Bundle | (itch.io bundle of levels 2–8) | – | 149 kr |

Build the ZIPs after you know your itch.io name and the bundle's URL:

```sh
ITCH_USER=<you> ITCH_BUNDLE=<bundle url> python3 -I tools/danish-rail-finder/package_itch.py /tmp/rail-data dist/itch
```

## Upload settings (same for every level)

- **Kind of project:** HTML
- **Upload:** the level's ZIP, ticked **"This file will be played in the browser"**
- **Embed options:** viewport **1280 × 800**, tick **Mobile friendly** (orientation: Default), **Fullscreen button**, and **Automatically start on page load**
- **Classification:** Game · Genre: Puzzle / Educational · Tags: `geography`, `denmark`, `map`, `quiz`, `trains`, `educational`, `danish`, `html5`
- **Payments (levels 2–8):** Paid · minimum price as above · "Collected by itch.io, paid later" (itch.io handles the VAT)

---

## Level 1 (free)

**Title:** Danmark på kortet · Level 1 · Capital Region: major towns

**Short description:** How well do you know the map of Denmark? Free first level: 22 towns, one guess each.

> Find Denmark's towns on a real map. Level 1 is free: 10 major towns from the Capital Region per round, from Helsingør to Rønne, and **only one guess each**. Miss, and the game shows where the town really is and how far off you were.
>
> Enjoyed it? Seven more levels go from Denmark's cities to every S-tog and Metro stop and all 268 minor towns. Each level is 39 kr, or 149 kr for all of them.
>
> No login, no ads, no tracking. Plays in Danish and English, on phone or computer.

> **Dansk:** Hvor godt kender du Danmarkskortet? Niveau 1 er gratis: 10 større byer i Region Hovedstaden pr. runde, fra Helsingør til Rønne, og **kun ét gæt pr. by**. Rammer du forbi, viser spillet, hvor byen ligger, og hvor langt væk du var. Syv niveauer mere venter, fra Danmarks storbyer til alle S-togs- og metrostationer og alle 268 mindre byer. Hvert niveau koster 39 kr., eller 149 kr. for dem alle. Intet login, ingen reklamer, ingen sporing.

## Level 2 · Denmark's cities (39 kr)

**Short description:** Find all 18 Danish cities with 40,000+ people on the map.

> København, Aarhus, Odense, Aalborg and the rest: the 18 Danish cities with more than 40,000 inhabitants. A quick, satisfying level that teaches you the shape of the country.

> **Dansk:** København, Aarhus, Odense, Aalborg og resten: de 18 danske byer med over 40.000 indbyggere. Et hurtigt niveau, der lærer dig landets form.

## Level 3 · Famous towns and their stories (39 kr)

**Short description:** 72 Danish towns, and what each one is famous for.

> Find a town, then read why it matters: Kronborg in Helsingør, LEGO in Billund, the Jelling stones, the Skagen painters. 72 towns across all five regions, each with a fact card you can read again later. (Fact cards are in English.)

> **Dansk:** Find en by, og læs hvorfor den er kendt: Kronborg i Helsingør, LEGO i Billund, Jellingstenene, Skagensmalerne. 72 byer i alle fem regioner, hver med et faktakort. (Faktakortene er indtil videre på engelsk.)

## Level 4 · Major towns across Denmark (39 kr)

**Short description:** 34 major towns outside the Capital Region.

> From Esbjerg to Frederikshavn: the 34 towns with 10,000–40,000 people outside the Capital Region. Play them all, or one region at a time.

> **Dansk:** Fra Esbjerg til Frederikshavn: de 34 byer med 10.000–40.000 indbyggere uden for Region Hovedstaden. Spil dem alle, eller én region ad gangen.

## Level 5 · Copenhagen S-tog & Metro (39 kr)

**Short description:** Every S-tog and Metro stop in Copenhagen: 122 to find.

> All 122 S-tog and Metro stops, with every line drawn in: M1 to M4 and the S-tog fan from Køge to Hillerød. Zoom in on the inner city when the dots get close.

> **Dansk:** Alle 122 S-togs- og metrostationer med linjerne tegnet ind: M1 til M4 og S-togsnettet fra Køge til Hillerød. Zoom ind på indre by, når prikkerne kommer tæt på hinanden.

## Level 6 · Zealand, Lolland & Falster stations (39 kr)

**Short description:** 92 train and local-line stations outside Copenhagen.

> The main lines, the regional trains and the local lines of North Zealand, Odsherred, Østbanen and Lolland: 92 stations from Gilleleje to Nakskov.

> **Dansk:** Hovedstrækninger, regionaltog og lokalbaner i Nordsjælland, Odsherred, på Østbanen og Lolland: 92 stationer fra Gilleleje til Nakskov.

## Level 7 · Jutland & Funen stations (39 kr)

**Short description:** 179 train and light-rail stations in Jutland and on Funen.

> From Skagen to Padborg and across Funen: 179 stations, including the Aarhus light rail and the small lines in Thy and Vestjylland.

> **Dansk:** Fra Skagen til Padborg og over Fyn: 179 stationer, også Aarhus Letbane og de små baner i Thy og Vestjylland.

## Level 8 · Minor towns of Denmark (39 kr)

**Short description:** The final challenge: 268 towns with under 10,000 people.

> The hardest level: every Danish town with 1,000–10,000 inhabitants that GeoNames lists, plus a few famous small ones like Gudhjem and Klitmøller. Play them all, or one region at a time.

> **Dansk:** Det sværeste niveau: alle danske byer med 1.000–10.000 indbyggere, som GeoNames kender, plus nogle kendte små byer som Gudhjem og Klitmøller. Spil dem alle, eller én region ad gangen.

## Bundle · All levels (149 kr)

**Title:** Danmark på kortet · All levels

> Levels 2 to 8 in one go: 785 places to find, from Denmark's 18 cities to all 393 train, S-tog and Metro stops. 149 kr instead of 273 kr.

> **Dansk:** Niveau 2 til 8 på én gang: 785 steder at finde, fra Danmarks 18 storbyer til alle 393 tog-, S-togs- og metrostationer. 149 kr. i stedet for 273 kr.
