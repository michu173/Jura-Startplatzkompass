# Maintained repository inventory

Authority: the current GitHub branch and its commit history, not old handover ZIPs. Repository paths are relative to the root; GitHub Pages serves this root on `main`.

| Path | Purpose |
|---|---|
| `daten/startplaetze.json` | Sole authoritative dataset, including preserved source fields, IDs and launch variants |
| `index.html`, `js/index.js` | Filtered compass/cards and expandable site details |
| `karte.html`, `js/map.js` | Interactive map, layers, filters, controls and detail panel |
| `js/launch-wind.js` | Shared conservative wind parsing and filter matching |
| `tests/launch-wind.test.js` | Exact direction-filter membership and exclusions |
| `FEATURE_ROADMAP.md` | Ordered feature backlog and concrete continuation checkpoint |
| `js/map-markers.js` | Difficulty mapping, conservative launch-direction parsing and generated wind sprites |
| `tests/map-markers.test.js` | Marker semantics, directional pixel geometry and sprite/layer lifecycle regressions |
| `MARKER_FEATURE.md` | Marker candidate design, preservation guarantees and verification checkpoint |
| `docs/marker-preview.jpg`, `docs/marker-detail-preview.jpg`, `docs/marker-verification.json`, `docs/marker-verification-initial.json` | Actual overview/detail screenshots and current/historical browser-check/source-hash evidence; not runtime data |
| `js/common.js` | Dataset validation/loading, shared filters, coordinates and detail presentation |
| `styles.css` | Shared existing design and responsive layouts |
| `package.json` | Dependency-free Node test command; not a website build requirement |
| `tests/data.test.js` | Dataset, filtering, details, references and URL-state tests |
| `tests/browser-harness.js` | DOM/MapLibre API doubles for the real application modules; no WebGL renderer |
| `tests/map.test.js` | Map lifecycle, filter/selection persistence, variants, focus and failure regressions |
| `tests/browser-check.html` | Manual browser viewer of the real pages at phone/tablet/desktop iframe widths; no sample data |
| `.github/workflows/tests.yml` | Read-only GitHub Actions regression checks for PRs and releases |
| `README.md` | Run, maintain, publish and test instructions |
| `HANDOVER.md` | Current status plus explicitly retained historical handover |
| `DATA_SOURCES.md` | Source authority, known conflicts and verification limits |
| `MISSING.md` | Missing evidence and outstanding acceptance checks |
| `WEBGL_ACCEPTANCE.md` | Actual Chromium/SwiftShader map checks, marker-font correction and remaining device/publication acceptance |
| `RELEASE_VERIFICATION.md` | Release commits, test evidence, live checks and acceptance limits |

Old CSV/Excel/JSON exports and the 53 Burnair/SHV screenshots belong to the original handover package, not the runtime repository. They must not replace the maintained JSON. External MapLibre libraries, map styles, tiles and glyphs are runtime dependencies, not missing local files.
