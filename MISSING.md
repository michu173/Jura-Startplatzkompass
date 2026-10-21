# Outstanding evidence and acceptance

No known local runtime source/data files are missing. A network connection is required for external MapLibre JS/CSS, OpenFreeMap vector maps/fonts and swisstopo raster tiles. No credentials or backend are required by the existing application.

Still needed for a full operational-data audit: exact source-to-field evidence, current official clarification of the two unresolved site records, measured Falaise heights, and evidence for the copied comparison-resolution text. Historical Excel parity remains unverified. Do not infer missing facts or permissions from map markers.

Fresh published-byte and public-browser verification now passes against `main` at `1f601cbb75e4a6c550e55ac5b84faa53cbf7ac73`: eight published files match, all 42 actual Chromium/SwiftShader checks pass, and all 18 regressions pass. All three basemaps, repeated/rapid switches, rendered marker/cluster selection, both Schwengimatt variants, filters, zoom/pan/fit and 390/768/1440-pixel layouts were checked directly on GitHub Pages with live providers. See WEBGL_ACCEPTANCE.md and RELEASE_VERIFICATION.md. The previous public-hostname block is resolved in the newly configured environment. Still required: real iPhone Safari gestures/safe areas/orientation, hardware rendering/performance and intended Windows Edge acceptance. Viewport and API-double tests do not establish native-device behavior.

The GitHub connector cannot read the Pages settings endpoint. Deployment workflows and live file parity can be verified independently; do not claim direct inspection of unavailable settings. PR #1 is merged and its release is published through the existing `main`-based Pages deployment.

No offline tile cache, live weather/airspace feed, ingestion pipeline or bidirectional spreadsheet sync is implemented or required for this stability release.
