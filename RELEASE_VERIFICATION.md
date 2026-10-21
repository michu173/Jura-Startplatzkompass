# Release verification — 21 October 2026

Later continuation: WEBGL_ACCEPTANCE.md records actual local Chromium/SwiftShader rendering with live map providers and a proposed marker-font correction. The release evidence below describes the earlier published release; native devices and fresh publication verification remain separate.

Website: https://michu173.github.io/Jura-Startplatzkompass/

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

## Acceptance still required

Priority 1: a WebGL-capable browser must visually confirm all three basemaps, marker/cluster visibility after repeated switching, selected-point/popup behavior and zoom/pan/fit. This cloud browser has WebGL disabled, so passing event tests cannot establish those visual results. Check real iPhone Safari touch/pinch, safe areas and orientation as well; iframe widths are responsive layout checks only.

Priority 2: resolve documented Tannmatt Ost and Niederwiler Stierenberg Nord uncertainties from authoritative sources, copied comparison-resolution metadata, approximate Falaise heights and field-level screenshot/source provenance. These are preserved and listed in DATA_SOURCES.md; no missing operational facts were invented.

No critical failures were found in the tested paths. Complete visual/native-device acceptance remains outstanding. Recommended next task: perform the bounded WebGL/Safari acceptance above before data-source reconciliation or optional improvements.
