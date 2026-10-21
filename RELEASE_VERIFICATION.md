# Release verification — 21 October 2026

Current continuation: direct public-file parity and actual published-map WebGL checks now pass. The current verification below supersedes the older blocked-public-access and WebGL-disabled records. Native-device acceptance remains separate.

Website: https://michu173.github.io/Jura-Startplatzkompass/

## Published deployment — current verification

Confirmed remote `main` at the expected `1f601cbb75e4a6c550e55ac5b84faa53cbf7ac73`; PRs [#2](https://github.com/michu173/Jura-Startplatzkompass/pull/2) and [#3](https://github.com/michu173/Jura-Startplatzkompass/pull/3) are merged. [Stability tests 39658687635](https://github.com/michu173/Jura-Startplatzkompass/actions/runs/39658687635) and [Pages 39658687484](https://github.com/michu173/Jura-Startplatzkompass/actions/runs/39658687484) succeeded for that exact SHA. The deploy job log confirmed success and the existing production URL. The application requires no build; the existing Pages workflow uses Jekyll to package the repository root.

The newly configured environment can access the public hostname. Both homepage and map returned HTTP 200 over HTTPS. Fetching the following published files produced byte-for-byte matches to the clean checkout at that SHA:

| File | Bytes | Published/main SHA-256 |
|---|---:|---|
| `index.html` | 4102 | `fcdbb19372f64c2b799c62bc32875b0f5be944e92cefa8a11b49dcccf68f2b94` |
| `karte.html` | 5191 | `758eafc56d8cf2c9b81e8da8446c11d0aa75f19f4dc7a7814cdc616de0a13e9d` |
| `styles.css` | 16980 | `80ec163fea4093181b04c4af22acaf46ce0fa9fa5e33ef4d7f80710a20298104` |
| `js/common.js` | 8169 | `e8f91e7996ae5699ef3aaaf4ecc737084981bf73d10b03eb3c79baf486c92c32` |
| `js/index.js` | 3542 | `eb90671d3632267abe91c9a7b02a61bbbe944b0c8c8e5004225ded055e826141` |
| `js/map.js` | 14996 | `6ac6f30dbf7aabd7c21b4299646f0942d30d12efb70fbbb7fb7f1049a911abfe` |
| `daten/startplaetze.json` | 226579 | `68e4e782fecb4b1e48c44b8fc8abcd95ab4868bf85275caaf1ed3de80c609c2a` |
| `tests/browser-check.html` | 2073 | `e5a9eacc780b504cd86781a0cce0e3fd6a9849446b00f9eff835110b48de5301` |

The browser-referenced URLs were also compared directly: `styles.css?v=20261021-1`, `js/index.js?v=20261021-1`, `js/map.js?v=20261021-2` and `js/common.js?v=20261021-1` all matched the corresponding main files.

All **42 actual public Chromium/SwiftShader WebGL checks** passed, covering all three live basemaps, repeated/rapid switching, rendered marker/cluster clicks, both Schwengimatt variants, filtering, zoom/pan/fit, desktop/tablet/phone layouts, phone focus/modal behavior and public compass-to-map navigation. See WEBGL_ACCEPTANCE.md for method and detailed results. All **18 regression tests** also passed locally on Node 24.19.0. No application changes were required; this follow-up updates documentation only. Runtime/data parity is checked again after its merge and Pages deployment; exact final SHA and workflow links are retained in the documentation PR description.

No uncaught JavaScript errors, MapLibre error events or map-resource HTTP errors occurred. 28 superseded camera/style requests were cancelled with `net::ERR_ABORTED`; external basemap null-value-expression and missing-POI-sprite warnings did not prevent launch-overlay rendering. A browser-console resource-404 diagnostic was also observed; the captured application/map-resource responses had no HTTP errors. These are not native-device or performance results.

Dataset bytes, architecture, CDN/provider choices, attribution and cache versions are unchanged: map entry module `20261021-2`; CSS, compass module and shared imports `20261021-1`. Real iPhone Safari touch/pinch/safe areas/orientation and hardware/Windows Edge acceptance remain unverified. DATA_SOURCES.md retains the unresolved operational-data evidence.

## Earlier release evidence

The records below describe the previous verification environments. Statements about blocked public access or disabled WebGL are historical and are superseded by the current verification above.

## Runtime release — PR #2

PR https://github.com/michu173/Jura-Startplatzkompass/pull/2 was merged as `4f7ad0091ce17610908d9083f47203705bde5aba`. Its runtime files match the version exercised by the 40 actual Chromium/SwiftShader browser checks in WEBGL_ACCEPTANCE.md. All 18 regression tests passed again on the merged checkout; merge CI run `39657941849` succeeded. The canonical dataset hash remains unchanged.

Pages deployment run https://github.com/michu173/Jura-Startplatzkompass/actions/runs/39657942132 succeeded for that exact merge SHA. Its deploy log reported success and the environment URL `https://michu173.github.io/Jura-Startplatzkompass/`. This verifies GitHub's deployment outcome, not a new public-browser check. Fresh public-file parity/browser checks remain blocked by the cloud environment's enforced hostname allowlist; the separate web-fetch tool also could not access the public URLs. Native iPhone Safari gestures/safe areas and hardware/Windows Edge testing remain unverified. No critical application failures were found in the tested paths. The later documentation-only follow-up does not alter the tested runtime.

The application remains static HTML/CSS and native JavaScript modules, with `daten/startplaetze.json` as its only database. There is no server, user account, build requirement or runtime package installation. GitHub Pages publishes the repository root; optional developer checks use Node >=20 and `npm test`.

## Traceable changes

- Audited current baseline: `dc238574e687634afd2732c65c045415b9ea3cc2`; actual files took precedence over older handover text.
- Runtime fixes: `8055e8a6b2ddca686bc40a19311e6b3c8a44572c`.
- Tests and maintained handover: `880815b129a086edfbb84af5c450104b61876411`.
- Automated regression CI: `97835182bfbc975760fe5dd71a4e508c6f512de5`.
- PR https://github.com/michu173/Jura-Startplatzkompass/pull/1 merged as `a7261a0199b7a46087a610bb1323fe2f36054110`.
- Published responsive viewer: `ad655a0f3b2e90e5ce614a2d60658b572dc7c30f`.

## Verified

18 automated tests passed locally and in GitHub Actions on Node 22. Coverage includes 360 filter combinations, dataset/reference checks, strict coordinates, stable variant IDs, URL filter persistence, existing details, loader errors, repeated/rapid map style changes, all 30 points/four overlays, selection, both Schwengimatt variants, stale cluster requests, partial tile errors, retry/timeout and mobile keyboard/fallback behavior. Map tests execute actual modules with API doubles; they are not WebGL rendering tests.

For `ad655a0`, Stability tests run `39651251901` and Pages deployment run `39651251423` completed successfully. Merge-commit test/deployment runs `39650894648` and `39650894393` also succeeded. No Pages settings change was needed; the connector cannot read that settings endpoint.

Published `index.html`, `karte.html`, `styles.css`, all three JavaScript modules, the canonical JSON and `tests/browser-check.html` were fetched over HTTPS and matched the release files byte-for-byte. Both entry modules and their common import use cache release `20261021-1`.

Live browser checks loaded the actual public compass/map inside `tests/browser-check.html` at 390/768/1440-pixel widths. Both pages had no horizontal page overflow; the map had positive height. Search produced one Schwengimatt record, filter URL state followed navigation, both stored launch positions and their distinct GPS/heights displayed correctly, difficulty was visible, severe-weather filtering produced a useful empty state, and Reset restored 29 rows. The suitable-weather checkbox remained visible on tablets. Phone details had modal semantics, inert backgrounds and Close focus; Escape restored row focus/backgrounds. Desktop details allowed normal background interaction. The WebGL-unavailable path retained working lists/details and disabled unusable controls. Browser extension metadata errors were observed; they are separate from the site's explicit WebGL fallback.

The canonical JSON remains unchanged: SHA-256 `68e4e782fecb4b1e48c44b8fc8abcd95ab4868bf85275caaf1ed3de80c609c2a`; 29 site groups and 30 geographic positions. No source values, keys, IDs or relationships were reconstructed or silently reconciled.

## Acceptance outstanding at the earlier release

Priority 1: a WebGL-capable browser must visually confirm all three basemaps, marker/cluster visibility after repeated switching, selected-point/popup behavior and zoom/pan/fit. This cloud browser has WebGL disabled, so passing event tests cannot establish those visual results. Check real iPhone Safari touch/pinch, safe areas and orientation as well; iframe widths are responsive layout checks only.

Priority 2: resolve documented Tannmatt Ost and Niederwiler Stierenberg Nord uncertainties from authoritative sources, copied comparison-resolution metadata, approximate Falaise heights and field-level screenshot/source provenance. These are preserved and listed in DATA_SOURCES.md; no missing operational facts were invented.

No critical failures were found in the tested paths. Complete visual/native-device acceptance remains outstanding. Recommended next task: perform the bounded WebGL/Safari acceptance above before data-source reconciliation or optional improvements.
