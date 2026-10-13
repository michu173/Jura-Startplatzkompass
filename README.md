# Jura Startplatzkompass v2

Statische Website für GitHub Pages. **Beide Seiten laden dieselbe zentrale Datei** `daten/startplaetze.json`. Dort sind alle 29 Startplatz-Einträge, 30 Startkoordinaten, ursprünglichen Quellfelder, aggregierten Abschnitte sowie die Wetter-Matrix enthalten.

## Dateien

- `index.html` — überarbeiteter, filterbarer Startplatzkompass.
- `karte.html` — MapLibre GL JS Karte mit flüssigem Zoom/Pan, gruppierten Markern, Filterung, OpenFreeMap-/swisstopo-Stilumschaltung und mobiler Detailansicht.
- `styles.css` — gemeinsames responsives Design.
- `js/common.js` — gemeinsamer Datenlader, Filter und Detailansichten.
- `js/index.js` — Listenansicht.
- `js/map.js` — MapLibre, GeoJSON-Clustering, Kartenauswahl und Gesten.
- `daten/startplaetze.json` — einzige Master-Datenbasis für beide Seiten, enthält vorhandene Quellnotizen und `aggregation_abschnitte`.

## Veröffentlichung

Den **Inhalt dieses Ordners** (nicht den Oberordner) in das Hauptverzeichnis des GitHub-Repositories `Jura-Startplatzkompass` kopieren. GitHub Pages veröffentlicht `index.html` unter `/Jura-Startplatzkompass/`, die Karte unter `/Jura-Startplatzkompass/karte.html`.

Wichtig: Die Seiten müssen über `https://` oder einen lokalen HTTP-Server geöffnet werden, z. B. `python3 -m http.server 8000`. Beim direkten Öffnen via `file://` blockieren Browser das Laden der JSON-Datei.

MapLibre GL JS **v5.12.0** wird als fest gepinnte Abhängigkeit über jsDelivr geladen (Fallback auf unpkg). Die kostenfreien Vektorkacheln stammen von OpenFreeMap (Liberty/Positron) und optional von swisstopo (Landeskarte, WMTS) und erfordern Internetverbindung. Die Website hat keinen eigenen Backend-Server und keinen API-Schlüssel. Die Listenansicht bleibt bei einer Kartenstörung nutzbar.

## Daten pflegen

Nur `daten/startplaetze.json` bearbeiten, nicht Daten in HTML einfügen. Jeder Eintrag unter `sites` besitzt die bestehenden Felder, unter anderem `gps` als `[Breitengrad, Längengrad]`, `launch_variants`, `weather`, `aggregation_abschnitte` und `aggregierte_beschreibung`. Die Karte erwartet für jeden sichtbaren Standort gültige `gps`-Werte bzw. `launch_variants`.

Die Materialsammlung ist keine Live-Flugwetterprognose. Lokale Regeln, Luftraum, Anlagenbetrieb, Wind und Landeplatz immer aktuell prüfen.
