# WebGL acceptance — 21 October 2026

## Published map — current verification

Tested URL: https://michu173.github.io/Jura-Startplatzkompass/karte.html

Baseline: remote `main` at `1f601cbb75e4a6c550e55ac5b84faa53cbf7ac73`, matching the clean checkout and expected PR #3 merge. Public HTTPS access returned 200, and published runtime/data bytes matched this commit before browser checks (hashes in RELEASE_VERIFICATION.md). The former hostname block is resolved in this new environment.

Run: `2026-10-21T19:45:43.224Z` to `2026-10-21T19:49:34.917Z` (UTC). Linux headless Chromium `154.0.8037.57` / Playwright, WebGL 2 via ANGLE/Vulkan SwiftShader. The browser used the configured HTTPS proxy with its CA trusted in the Chromium NSS store; TLS verification remained enabled. It navigated directly to public Pages URLs, loading real MapLibre 5.12.0 and live OpenFreeMap/swisstopo resources, without localhost substitution, request interception or map/DOM doubles. A constructor proxy only observed the real Map instance and its errors. Checks waited for camera/source/tile completion and rendered symbol placement. Inspection included screenshots of all three desktop basemaps and tablet/phone layouts.

All **42 public-browser checks passed**. This is a new published-site run, separate from the earlier 40 localhost checks below. After the 40 map checks, an ambiguous automation selector matched two valid compass-to-map links; selecting the first navigation link allowed the remaining two checks to pass without application changes.

| Published check | Result |
|---|---|
| Initial Liberty map | 29 site groups, 30 source positions, four overlay layers, actual circles/category letters/cluster counts |
| Three complete Positron → Topo CH → Liberty cycles | Overlays, source positions and zoom retained |
| Real rendered cluster and unclustered-marker clicks | Cluster zoom increased; matching site details and selected point opened |
| Both Schwengimatt variants on all three styles | Correct IDs, coordinates and 1097/1044 m; two separate rendered markers at zoom 15; correct selection |
| Priority A, severe-weather filter and Reset | Four positions; zero/empty state; restored 29 groups and 30 positions |
| Zoom buttons, mouse wheel, mouse drag and Fit | Camera changed correctly; fitted bounds contained every launch |
| Six immediate basemap clicks ending on Liberty | All positions and overlays restored |
| 1440×1000, 768×1024 and 390×844 | Positive visible canvas and no horizontal overflow; tablet suitable-weather checkbox visible |
| All three styles at phone/tablet sizes | Live basemaps, circles and labels rendered |
| Phone/tablet lower Schwengimatt details | Correct lower-variant selection and 1044 m |
| Phone dialog, keyboard focus and Escape | Modal semantics, inert map background, focus trapping and restored row focus/background |
| Public compass and navigation to map | 29 cards; Schwengimatt search preserved through navigation |
| JavaScript, MapLibre and map-resource failures | No uncaught JavaScript errors, MapLibre error events or map-resource HTTP failures |

Non-blocking diagnostics and cancelled requests are described in RELEASE_VERIFICATION.md. Node `v24.19.0` also passed all 18 regression tests. The dataset SHA-256 remains `68e4e782fecb4b1e48c44b8fc8abcd95ab4868bf85275caaf1ed3de80c609c2a`.

Real iPhone Safari gestures, safe areas and orientation, hardware rendering/performance and Windows Edge still need their intended devices. Desktop Chromium viewport/keyboard/mouse checks establish no native touch acceptance. Existing data uncertainties remain unchanged.

## Earlier localhost run — historical evidence

The following records the previous local run and its then-blocked public hostname. Its public-access limitation is superseded by the direct published checks above; its device limitations still apply.

## Scope and method

Baseline: `main` at `f1da3c914693d2e3f81a4ce26fa4ba289c3bce87`, unchanged since the previous release. Checks ran against the existing checkout served over HTTP on localhost, with the real MapLibre GL JS 5.12.0 CDN library, OpenFreeMap styles/fonts/vector tiles and swisstopo raster tiles. No map, source, worker or DOM doubles supplied rendering or interaction behavior.

Environment: Linux headless Chromium 154.0.0.0, Playwright, WebGL 2.0 via ANGLE/Vulkan SwiftShader. This is actual software WebGL rendering, not hardware-GPU or native-device performance acceptance. Browser automation observed the real Map instance by wrapping its constructor, preserving its arguments and behavior. It used DOM clicks, real rendered-feature hit testing, mouse drag/wheel and keyboard input. Source/layer state, rendered circles and labels, selected feature, map center/zoom, page overflow, network responses and uncaught JavaScript errors were checked. Readiness waited for map loading, camera settling and label placement. Screenshots were inspected for all three desktop basemaps and phone/tablet layout.

The environment's restricted network policy does not permit `michu173.github.io`; opening the published map failed with `ERR_TUNNEL_CONNECTION_FAILED`. This run therefore establishes checkout behavior with live map services, not fresh published-byte parity or production acceptance. Existing successful Pages/CI runs for `f1da3c9` were independently confirmed before the checks.

## Finding and focused correction

The baseline passed 38 browser checks, but every style load requested `Open Sans Bold,Arial Unicode MS Bold/0-255.pbf` from OpenFreeMap and received HTTP 404. Marker letters and cluster counts remained visible through font fallback in this browser. Both application symbol layers now request `Noto Sans Bold`, which the existing OpenFreeMap styles and glyph service use. The map entry-module URL advances to `20261021-2`; unchanged CSS, compass entry module and shared imports retain `20261021-1`.

No map provider, attribution, dataset bytes, coordinates, IDs or relationships changed. Full style reloads with `{diff:false}`, idempotent overlay restoration and effective map sizing remain intact.

## Results after the correction

All 40 browser checks passed after the correction; no native touch behavior is inferred from viewport size.

| Check | Result |
|---|---|
| Initial Liberty map: tiles, circles, category letters and cluster counts | Passed; 29 groups, 30 source positions, four overlay layers |
| Three rounds of Positron → swisstopo → Liberty | Passed; overlays, source positions and camera zoom retained |
| Click a real rendered cluster | Passed; expansion increased zoom from about 9.92 to 11 |
| Click a real unclustered marker | Passed; matching site details and selected feature opened |
| Search Schwengimatt and select each variant across all three styles | Passed; one list row, two source positions, selected ID and height retained |
| Zoom to 15 for both Schwengimatt selections | Passed; two separate rendered markers, correct selected marker |
| Priority A filtering | Passed; four groups/positions in list and map source |
| Severe-weather filtering and Reset | Passed; zero positions/empty state, then all 29 groups/30 positions restored |
| Zoom buttons, mouse-wheel zoom, mouse-drag pan and Fit | Passed |
| Six immediate style changes ending on Liberty | Passed; all positions and overlays restored |
| Viewports 1440×1000, 768×1024 and 390×844 | Passed; visible map, positive canvas size, no horizontal page overflow |
| All three styles at tablet and phone widths | Passed; rendered circles and labels retained |
| Tablet/phone Schwengimatt details | Passed; lower variant and 1044 m shown |
| Phone modal, inert map background, Escape and restored row focus | Passed |
| Application/network errors after correction | No uncaught JavaScript errors, MapLibre error events or map-resource HTTP errors |

Non-blocking diagnostics were retained: rapid switches intentionally cancelled three superseded style requests; the absent local favicon returned 404; SwiftShader logged screenshot readback stalls; external basemap styles logged null-value expression warnings and missing POI sprites. No launch-overlay rendering failure accompanied these warnings. Provider styles were left unchanged.

The dependency-free suite also passed: `npm test` on Node 24.19.0. An explicit run with `node --experimental-vm-modules --test --test-isolation=none --test-reporter=spec tests/*.test.js` reported all 18 named tests passing. Existing Node 22 GitHub CI remains the release regression check.

Dataset SHA-256 remains `68e4e782fecb4b1e48c44b8fc8abcd95ab4868bf85275caaf1ed3de80c609c2a`. Schwengimatt remains `10-0` at 47.28883, 7.67441, 1097 m and `10-1` at 47.29128, 7.67795, 1044 m.

## Remaining acceptance and release boundary

- On real iPhone Safari: drag, pinch, cluster/site selection, detail-sheet scrolling, safe-area spacing and portrait/landscape changes. Viewport tests used desktop Chromium input, not an iPhone or Safari engine.
- On hardware-backed browsers, including the intended Windows Edge: rendering and gesture/performance confirmation. SwiftShader timings are not device performance evidence.
- PR #2 was merged as `4f7ad0091ce17610908d9083f47203705bde5aba`; merge CI and Pages deployment succeeded (runs `39657941849` and `39657942132`). The merged runtime matches these tested files. Fresh published `js/map.js` / `karte.html` byte parity and public-browser checks remain blocked by this environment's hostname allowlist. See RELEASE_VERIFICATION.md for deployment evidence.
- Operational-data uncertainties remain unchanged; see DATA_SOURCES.md.

To repeat manually, open `karte.html` over HTTP(S), cycle Karte/Hell/Topo CH three times, click clusters and individual markers, search Schwengimatt and select both variants, zoom in to separate them, change filters/reset, then exercise zoom/pan/fit and rapid style switches. Repeat at phone/tablet widths. Check the browser Network/Console panels for glyph/tile errors and inspect marker letters/counts, not only background tiles.
