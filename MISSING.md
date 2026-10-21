# Outstanding evidence and acceptance

No known local runtime source/data files are missing. A network connection is required for external MapLibre JS/CSS, OpenFreeMap vector maps/fonts and swisstopo raster tiles. No credentials or backend are required by the existing application.

Still needed for a full operational-data audit: exact source-to-field evidence, current official clarification of the two unresolved site records, measured Falaise heights, and evidence for the copied comparison-resolution text. Historical Excel parity remains unverified. Do not infer missing facts or permissions from map markers.

Actual software-WebGL rendering now passes on the local checkout in Chromium 154 / SwiftShader with live map providers: all three basemaps, repeated/rapid switches, marker/cluster selection, both Schwengimatt variants, filters, zoom/pan/fit and 390/768/1440-pixel layouts. See WEBGL_ACCEPTANCE.md. Still required: real iPhone Safari gestures/safe areas/orientation, hardware rendering/performance and intended Windows Edge acceptance. The public Pages hostname is blocked by this environment's network policy, so the new font correction still needs published-byte and public-browser verification after merge/deployment. The earlier release's published iframe checks remain historical evidence. Dependency-free API-double tests remain distinct from this real-renderer run.

The GitHub connector cannot read the Pages settings endpoint. Deployment workflows and live file parity can be verified independently; do not claim direct inspection of unavailable settings. PR #1 is merged and its release is published through the existing `main`-based Pages deployment.

No offline tile cache, live weather/airspace feed, ingestion pipeline or bidirectional spreadsheet sync is implemented or required for this stability release.
