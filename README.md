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
