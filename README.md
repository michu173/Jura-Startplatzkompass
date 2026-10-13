# Jura Startplatzkompass v2 – iPhone-Einzeldateien

**Alle 8 Dateien gehören direkt ins Hauptverzeichnis (`main`) des GitHub-Repositories. Es werden keine Unterordner benötigt.**

Diese Version ist funktional identisch mit dem v2-Paket mit Unterordnern. Lediglich die relativen Pfade wurden angepasst:

- `index.html` und `karte.html`: Website und interaktive MapLibre-Karte
- `styles.css`: Gemeinsames Design
- `index.js`, `map.js`, `common.js`: Funktionen, Filter und Kartendarstellung
- `startplaetze.json`: zentrale vollständige Startplatzdatenbank
- `README.md`: Diese Anleitung

## Upload auf dem iPhone

1. ZIP in die **Dateien-App** laden und dort einmal antippen, um sie zu entpacken.
2. Auf GitHub `michu173/Jura-Startplatzkompass` öffnen → `Add file` → `Upload files` (Safari ggf. Desktop-Website anfordern).
3. `choose your files` antippen, in der Dateien-App den entpackten Ordner öffnen und über **Auswählen** alle 8 Dateien markieren.
4. Hochladen lassen und mit `Commit changes` / `Propose changes` bestätigen. **Nicht die ZIP selbst hochladen.**
5. Danach die GitHub-Pages-Seiten neu laden.

**Datenpflege:** `startplaetze.json` ist die einzige Datenquelle für beide Ansichten. 29 Startplatz-Einträge und 30 Startpositionen.

**Hinweis:** Der Kartenhintergrund benötigt eine Internetverbindung; die HTML-Dateien müssen über GitHub Pages/Webserver und nicht lokal per `file://` geöffnet werden.

## Pflege der Website

Die acht Dateien wurden für GitHub Pages geprüft. `startplaetze.json` ist die gemeinsame Datenquelle für Startplatzkompass und Karte. Änderungen an Beschreibungen, Startplätzen und Wetterangaben sollen dort erfolgen, damit beide Ansichten synchron bleiben.
