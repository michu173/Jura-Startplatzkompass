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
