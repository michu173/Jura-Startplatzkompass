# HANDOVER — current Work development status

Updated: 14 October 2026. Development continues in the existing Paragliding Project and Work conversation. The user works exclusively through GitHub Pages and does not maintain a local clone. Apply future fixes to the GitHub repository and check the Pages deployment; local-server instructions are optional developer instructions.

## Current authoritative files

The repository root contains index.html, karte.html, styles.css, README.md, HANDOVER.md, js/common.js, js/index.js, js/map.js and daten/startplaetze.json. The JSON remains the sole application database. Historical extraction exports remain evidence only.

## Map startup fix

Code revisions ff5f36a251f3df334c092ba760a1d30c8306dd1b and bbab4c6d05be1c6ffc4e993085f5c1e8fd8ca460 remove the obsolete maplibregl.supported() guard and version the map-module URL to refresh browser caches. MapLibre remains at 5.12.0. Constructor exceptions and missing-library fallback remain supported. No site data, coordinates, IDs, relationships, CSS, compass code or map-style definitions changed.

Validation: JavaScript syntax passes. A targeted startup regression check using the actual initialiseMap function confirms initialization with a library lacking supported(), fallback on a constructor exception, and fallback for a missing library. Unrelated runtime files and canonical JSON were checked byte-for-byte against the original baseline. The Pages workflow for both code revisions completed successfully.

The published page loaded the versioned script and reached the real MapLibre constructor. This testing browser reported GPU/WebGL disabled and failed WebGL context creation. This is an environment limitation after the fixed guard, not the original false WebGL warning. Rendered tiles, clusters, markers, zoom/pan, all three basemaps, real iPhone Safari and Windows Edge remain unverified. Do not claim that a rendered map was acceptance-tested here.

## Remaining work

First check the published map in a browser with working WebGL, including default rendering, clusters/markers, zoom/pan, fit, style switching and mobile gestures. Preserve the dataset while investigating. Existing unresolved Tannmatt Ost and Niederwiler Stierenberg Nord records, approximate Falaise altitudes, provenance gaps and audit metadata issues remain unchanged. No data re-extraction or resolution was performed.

## Follow-up: zero-height map container

The user reported that the startup warning disappeared but the map remained invisible. Live DOM measurements confirmed `.map-pane` at 998 × 808 pixels but `#map.maplibregl-map` at 998 × 0 pixels with `position: relative` and `overflow: hidden`. The MapLibre class rule overrode the original absolute `.map-canvas` rule. The CSS selector now targets `.map-pane > .map-canvas`, preserving absolute positioning across both the local and CDN CSS. The map page versions its stylesheet URL to refresh cached CSS. This follow-up addresses a separate visibility defect missed in the initial startup fix. Site data and map behavior are unchanged.

## Original handover — historical snapshot

The complete original handover follows unchanged. Its pinned commit, package-relative website/ paths, verification limitations and next-step recommendations describe the 13 October baseline. The current amendment above supersedes only its map-startup and deployment status. It does not replace the original data decisions or evidence limitations.

---

# HANDOVER — Jura-Startplatzkompass

**Read-only snapshot:** 2026-10-13. No website/repository changes were made when preparing this package.  
**Current code snapshot:** [https://github.com/michu173/Jura-Startplatzkompass](https://github.com/michu173/Jura-Startplatzkompass), `main` at exact commit [`51259ad29ace3ddd2cc730f4ca8ec9a28900efe1`](https://github.com/michu173/Jura-Startplatzkompass/commit/51259ad29ace3ddd2cc730f4ca8ec9a28900efe1).  
**Verification:** All eight files under `website/` match the GitHub tree's blob SHA-1 values **byte-for-byte** (see `GITHUB_SNAPSHOT.tsv`). Data JSON parses and contains 29 site records, 30 coordinates/individual launch positions, and seven editorial detail sections per site. **This does not prove that the live Pages deployment or map CDN loads successfully on an iPhone.**

## Purpose and user requirements

A static, responsive flight-site reference and map for Swiss Jura paragliding. The site helps a recently licensed pilot choose feasible launch locations for local soaring/thermics and eventual XC, considering suitable launch wind, general synoptic weather, difficulty, hazards, landing options, and **independent return to the car using public transport, gondolas or a manageable hike**. A club shuttle is not assumed. The design targets **iPhone Safari** and **Windows Edge**, with smoother map zooming/panning inspired by Burnair. The interface is currently in German; this handover is in English.

Maintain independent fields for **start-wind direction** versus **grosswetterlage / thermic suitability**; their apparent agreement is not a flight-safety approval. Preserve original Burnair/SHV/ParaglidingMap/club fields and user-decided conflict resolutions; show deduplicated, semantically aggregated descriptions (seven sections) rather than concatenating raw descriptions. A-D categories reflect personal priority / suitability, not official flying-site ratings. The content is reference material, **not current weather or airspace clearance**.

## Architecture and authoritative source

`website/index.html` → `website/js/index.js` → `website/js/common.js` → `website/daten/startplaetze.json`  
`website/karte.html` → `website/js/map.js` → `website/js/common.js` → `website/daten/startplaetze.json`  
Both HTML pages share `website/styles.css`. **The only canonical site database** is `website/daten/startplaetze.json` (JSON version `2026-10-12.aggregated-5`, UI version `2.0`, last_updated `2026-10-13`). It holds original and canonical per-site fields, metadata, weather assessments, comparison issues, source notes, and seven aggregated descriptions. Preserve all keys, IDs, WGS84 `[latitude,longitude]` values, and `launch_variants` relationships. Schwengimatt is one site-group with two geographic launch variants, yielding 30 map positions across 29 groups.

No application backend, accounts, live weather service, persistent database, app API key, service worker, browser `localStorage` or IndexedDB are implemented in the current tracked code. Browser filters and map state are in memory only. The geolocation button requests device position but project code does not store it. The map depends at runtime on MapLibre GL JS v5.12.0 loaded via CDN, OpenFreeMap vector map styles (Liberty/Positron), and optional swisstopo WMTS raster tiles. These third-party libraries, fonts and map tiles are **not bundled** and require network availability and adherence to the relevant providers' terms.

## Run locally (without changing files)

From the extracted package, use a terminal:

```bash
cd website
python3 -m http.server 8000
```

Open `http://localhost:8000/` for the compass and `http://localhost:8000/karte.html` for the map. Direct `file://` opening does not work reliably because the app loads JSON with `fetch()`. To deploy, upload **contents of `website/`** to root of `main` in `https://github.com/michu173/Jura-Startplatzkompass`; the package's other documentation/evidence directories are **not required** for GitHub Pages. Existing publication URLs: `https://michu173.github.io/Jura-Startplatzkompass/` and `/karte.html`. **Do not deploy this handover archive or archived references over existing website files.**

## Design decisions / canonical user resolutions

- Burnair screenshots are the baseline for GPS and readable takeoff altitudes; SHV supplements missing data; when neither is available, use marked club or explicit user values. Les Roches d'Orvin is **1195 m** from explicit user input. Falaise upper/lower share an **approximate 1550 m club reference**, not individually measured altitudes.
- **Weissenstein**: very light Bise can be conditionally possible per SHV, but requires local rotor/wind checks; stronger Bise is not approved. **Röti**: Bise excluded as a suitable weather category and warned as a Lee/rotor hazard.
- **Bözingenberg West**: canonical launch direction SE–SW. **Chasseral Croix N**: conservative *difficult* rating and short-launch/light-north-wind warning; the club's differing assessment remains historical source context.
- **Chasseral Süd**: retain the chosen club-sector judgement rather than a conflicting narrower ParaglidingMap sector. **Chasseral Falaise**: retain conservative suitability (advanced) despite Burnair's medium difficulty.
- **Walenmatt**: N/NW chosen, access via permitted Malsenberg parking with about 30 minutes' walk; do not assume private direct vehicle access. **Obere Wengi**: use current club's limited private-car/parking arrangement rather than superseded ParaglidingMap claims.
- **Bettlachberg, Röti, Hasenmatt**: retain conservative suitability judgments. **Les Roches d'Orvin**: reject N and W; do not silently infer an approved wind sector.
- Separate the upper/lower Schwengimatt **map positions and altitudes**; preserve the single group for filtering and descriptions unless the data model is deliberately redesigned later.

## Code-implemented features (not all runtime-tested)

- Responsive search/sort/filter interface with 29 grouped locations, expandable seven-section descriptions, XC/access/priority indicators and weather suitability ratings.
- MapLibre navigation/pinch-zoom/pan, category colour markers, clustering, cluster expansion, selected launch fly-to, fit view, location button, and grouped-site list.
- Base map selector: OpenFreeMap Liberty, OpenFreeMap Positron, swisstopo national raster.
- Mobile detail sheet and desktop panel; graceful fallback to launch list if MapLibre/CDN/WebGL fails.
- All displayed launch-site descriptions loaded from central JSON, with a URL link to original club info and Google Maps for GPS locations where present.

## Known problems, uncertainty, unfinished work

1. `comparison_issues` in the JSON explicitly labels **Tannmatt Ost wind sector** and **Niederwiler Stierenberg Nord's independent public operating/landing status** `unresolved`.
2. A confirmed **audit metadata error**: the Schwengimatt comparison issue repeats the Obere Wengi vehicle-access resolution, instead of documenting the variant split. This is **not fixed** in the supplied source.
3. Provenance mismatch: `Tannmatt Ost` reports SHV integrated, while its `aggregation_quellen` string omits SHV. Many evidence claims are not linked to individual source screenshot coordinates/pages. Review the exact source rather than guessing.
4. Falaise altitudes are estimates, and the site's local operating rules and restrictions must be rechecked before flying. The dataset's source review was **October 2026**; it is not automatically updated.
5. Full iPhone Safari, actual CDN tile/glyph rendering, zoom/panning performance, swisstopo style switching and GitHub Pages deployment **were not verified** during package creation. Some mobile/desktop browser-layout tests were reported in prior work, not a replacement for current acceptance testing.
6. Some descriptive headings/counts are currently hardcoded for 29/30. They can become stale if new launches are added.
7. No automated tests, CI, data schema validator, provenance per fact, map-layer availability monitoring, or automated synchronised Excel export exists in the committed source.
8. The last aggregated Excel snapshot in `evidence/historical_exports/` is **not the live source of truth**, and its byte-level parity to this GitHub JSON has not been verified.

## Recommended next steps for a new ChatGPT Work conversation

1. Connect GitHub and **verify the expected commit** before making modifications. Open the real deployed site in iPhone Safari and desktop Edge or equivalent browser automation, and reproduce any gesture or map-style issues.
2. Add tests for JSON field integrity, unique IDs, exact 29→30 launch variant mapping, JS imports and relative asset paths. Resolve the identified metadata errors with user approval and documentation.
3. Reconcile the two explicitly unresolved launch records against current club/SHV regulations, recording evidence links and review dates. Do not infer permissions from a map marker.
4. Add per-field provenance without losing original source fields; establish an optional one-way Excel export **from JSON**.
5. Only after behaviour is validated consider further mapping UX improvements, offline caching if permitted by providers, optional new weather/airspace integrations, and an explicit refresh policy.

## Notes on packaging

`website/` is the exact tracked project source at the pinned commit. `evidence/` is historical reference material (raw user screenshots, older generated reconciliations and spreadsheet, prior UI test captures), not files loaded by this website. `DATA_SOURCES.md` and `MISSING.md` describe what the archive does **not** independently validate or contain.
