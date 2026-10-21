# Jura Startplatzkompass v2

Statische Website auf GitHub Pages mit einer gemeinsamen Startplatzdatenbank und einer interaktiven MapLibre-Karte.

## Ordnerstruktur

```text
/
├── index.html
├── karte.html
├── styles.css
├── README.md
├── js/
│   ├── common.js
│   ├── index.js
│   └── map.js
└── daten/
    └── startplaetze.json
```

- `index.html` zeigt den Startplatzkompass und dessen Filter.
- `karte.html` zeigt die interaktive MapLibre-Karte.
- `styles.css` ist das gemeinsame Design.
- `js/common.js` lädt die gemeinsame Datenbank und enthält geteilte Hilfsfunktionen.
- `js/index.js` und `js/map.js` steuern die beiden Ansichten.
- `daten/startplaetze.json` ist die **zentrale Datenquelle**. Beide Seiten lesen dieselben 29 Startplatz-Einträge und 30 GPS-Startpositionen.

## Datenpflege

Startplatzangaben ausschliesslich in `daten/startplaetze.json` ändern. Bestehende Original-/Quellenfelder und die redaktionell aggregierten Felder getrennt erhalten. Die Links in `index.html` und `karte.html` erwarten die hier beschriebene Ordnerstruktur.

## Veröffentlichen

Das GitHub-Repository `michu173/Jura-Startplatzkompass` veröffentlicht den Inhalt des Branchs `main` über GitHub Pages:

- https://michu173.github.io/Jura-Startplatzkompass/
- https://michu173.github.io/Jura-Startplatzkompass/karte.html

Die Seiten funktionieren nur über HTTP(S), nicht beim lokalen Öffnen über `file://`, da die JSON-Daten mit `fetch()` geladen werden. Karte und Vektorkacheln benötigen eine Internetverbindung.

**Flugplanung:** Quellenangaben und Wetterbewertungen sind keine aktuelle Startfreigabe. Vor jedem Flug Luftraum, Flugwetter und lokale Regeln eigenständig prüfen.

## Kartenstart — Korrektur vom 14. Oktober 2026

Die Karte verwendet MapLibre GL JS 5.12.0. Diese Version exportiert keine `supported()`-Funktion. Die bisherige Vorabprüfung verhinderte deshalb jeden Kartenstart. `js/map.js` lässt nun den Kartenkonstruktor die WebGL-Initialisierung durchführen; echte Initialisierungsfehler werden weiterhin abgefangen und die Startplatzliste bleibt verfügbar. Datenmodell, Startplatzangaben und Kartenstile bleiben unverändert.

Der Modulverweis in `karte.html` enthält für diese Korrektur eine Versionskennung, damit Browser die geänderte Kartendatei statt einer bis zu zehn Minuten zwischengespeicherten Version laden.

## Unsichtbare Karte — Layoutkorrektur vom 14. Oktober 2026

MapLibre ergänzt am Kartencontainer die Klasse `maplibregl-map`. Deren `position: relative` überschrieb die bisherige `.map-canvas`-Regel, sodass der Container auf 0 Pixel Höhe zusammenfiel und den Karteninhalt abschnitt. Der präzisere Selektor `.map-pane > .map-canvas` hält den Container nun absolut über die gesamte Kartenfläche positioniert. `karte.html` verwendet eine neue Stylesheet-Versionskennung gegen zwischengespeicherte CSS-Dateien.

## Startplatzmarker beim Kartenwechsel

MapLibre kann beim standardmässigen Stil-Diff die zusätzlichen Startplatzlayer entfernen, ohne ein neues `style.load` auszulösen. Der Kartenwechsel verwendet deshalb nun `setStyle(..., {diff: false})`. Nach jedem `style.load` werden die Startplatzquelle und alle vier Marker-/Clusterlayer wiederhergestellt und mit den aktuellen Filtern sowie der Auswahl synchronisiert. Die Karte wird danach sofort wieder bedienbar; sie wartet dafür nicht mehr auf `idle`. Fehlende Layer werden auch dann ergänzt, wenn die Quelle bereits besteht. Wiederholte und schnelle Wechsel sowie Filter und Auswahl wurden mit einem Ereignis-Regressionscheck geprüft.

## Stabilisierung — 21. Oktober 2026 (veröffentlicht)

Die Website bleibt statisches HTML/CSS/JavaScript mit derselben JSON-Datenquelle. Kein Build und keine Installation sind zum Betrieb auf GitHub Pages nötig. Die Stabilisierung verändert keine Startplatzdaten.

- Gemeinsame Filter-Grundwerte; Filter bleiben beim Wechsel zwischen Liste und Karte über die URL erhalten. Die Kartenliste zeigt dieselbe Sortierung, wenn sie aus der Kompassansicht übernommen wird.
- Daten-/Koordinatenprüfung, Zeitlimits, verständliche Lade-/Fehlerzustände und erneuter Versuch desselben Kartenstils; ein einzelner Kachelfehler verdeckt keine nutzbare Karte.
- Marker und Auswahl bleiben beim Kartenwechsel erhalten. Topo CH nutzt denselben externen OpenFreeMap-Schriftdienst für Markerbeschriftungen.
- Beide gespeicherten Schwengimatt-Positionen sind im Detailpanel auswählbar. Kanonische Schwierigkeit wird auch in der Kompassansicht ausdrücklich angezeigt.
- Tastaturfokus und modaler Hintergrundschutz auf kleinen Bildschirmen; Bedienbarkeit der Filter auf Tabletbreiten; dynamische sichtbare Datensatz-Zähler.

### Regressionstests

Node.js ab Version 20: `npm test`. Es werden keine npm-Abhängigkeiten installiert. 18 Tests prüfen Datensatz, 360 Filterkombinationen, Anzeige, URL-Zustand, Kartenwechsel, Varianten, Fokus und Fehlerpfade. Die MapLibre-/DOM-Doubles führen die echten Anwendungsmodule aus, rendern aber weder WebGL noch native Touch-Gesten. PR #1 wurde mit `main` zusammengeführt; CI und GitHub-Pages-Bereitstellung waren erfolgreich. Live-Layout und Interaktionen wurden bei 390/768/1440 Pixeln geprüft. Die damalige Browserumgebung hatte WebGL deaktiviert; die spätere direkte WebGL-Prüfung der veröffentlichten Karte steht unten. Native Safari-Gesten bleiben offen. Details stehen in RELEASE_VERIFICATION.md. `tests/browser-check.html` dient als manueller Viewer der veröffentlichten Seiten.

Browser-Caches: CSS, beide Einstiegsmodule und deren gemeinsamer Modulimport tragen die Freigabekennung `20261021-1`. Bei späteren Änderungen alle betroffenen Referenzen konsistent aktualisieren. Originale Datenunsicherheiten stehen in DATA_SOURCES.md; eine strukturell gültige Datei ist keine fliegerische Startfreigabe.

Die GitHub-Actions-Konfiguration `.github/workflows/tests.yml` führt `npm test` auf Node.js 22 bei Pull Requests und Änderungen an `main` aus. Sie benötigt nur Lesezugriff auf den Repository-Inhalt, keine Secrets und keine npm-Installation.

## WebGL-Prüfung — Fortsetzung vom 21. Oktober 2026

Die lokale Anwendung wurde mit echtem MapLibre und Live-Kartendiensten in Chromium 154 / SwiftShader (Software-WebGL 2) geprüft: alle drei Kartenstile, wiederholte/schnelle Wechsel, Marker/Cluster, beide Schwengimatt-Positionen, Filter, Zoom/Verschieben/Einpassen und 390/768/1440-Pixel-Layouts funktionieren. Die Markerbeschriftung verwendet nun `Noto Sans Bold` desselben Anbieters; der bisherige Fontaufruf lieferte HTTP 404. Der Kartenmodul-Verweis trägt deshalb `20261021-2`; unveränderte CSS-, Kompass- und gemeinsame Modulverweise behalten `20261021-1`.

Die öffentliche Pages-Adresse ist in der neu konfigurierten Prüfumgebung erreichbar. Verifiziert gegen `main` bei `1f601cbb75e4a6c550e55ac5b84faa53cbf7ac73`: acht veröffentlichte Dateien stimmen bytegenau überein, alle 42 direkten Chromium-/SwiftShader-WebGL-Prüfungen und alle 18 Regressionstests bestehen. Geprüft wurden die drei Live-Kartenstile, wiederholte/schnelle Wechsel, echte Marker-/Cluster-Klicks, beide Schwengimatt-Positionen, Filter, Zoom/Verschieben/Einpassen, Tablet-/Telefonlayouts und der Wechsel von der Kompassansicht zur Karte. CI und Pages-Deployment für diesen Stand waren erfolgreich; die abschliessenden Nachweise zur Dokumentations-PR stehen in deren GitHub-Beschreibung.

Details und Grenzen: WEBGL_ACCEPTANCE.md und RELEASE_VERIFICATION.md. Kein nativer iPhone-/Safari-Test, kein Hardware-Leistungstest und keine Windows-Edge-Abnahme. Datensatz und Quellenunsicherheiten bleiben unverändert.

## Neue Kartenmarker — Feature-Kandidat

Auf `feature/informative-map-markers` zeigt die Kreisfarbe die kanonische Schwierigkeit (grün/gelb/orange), der Buchstabe A–D die persönliche Priorität und ein oranger Fächer die Herkunft des Startwinds. Alle Startpositionen der aktuellen Filter bleiben auch beim Herauszoomen als einzelne Marker sichtbar; es gibt keine Gruppierung mehr. Die Richtungsfächer erscheinen erst beim Hineinzoomen (ab Zoom 11.5). Ungeklärte Richtungen erhalten auch dann keinen Fächer. Die aufklappbare Kartenlegende erklärt diese Trennung. Datensatz und Kartendienste bleiben unverändert. Dieser Kandidat ist noch nicht veröffentlicht; Design und Prüfnachweise stehen in MARKER_FEATURE.md.

## Startwindfilter — Feature-Kandidat

Auf `feature/launch-wind-filter` lässt sich der Wind am Start auf Startplatzliste und Karte getrennt von der Grosswetterlage filtern. Die acht Richtungen, Suche und weitere Filter bleiben beim Ansichtswechsel über die URL erhalten; Zurücksetzen entfernt auch den Startwindfilter. Ungeklärte Startwindsektoren werden nur bei aktiver Richtungswahl ausgeblendet. Eine passende Richtung ist keine Wetter- oder Betriebsfreigabe. Der Kandidat in PR #7 baut auf der noch offenen Marker-PR #6 auf und ist nicht veröffentlicht. Details und Tests: WIND_FILTER.md.
