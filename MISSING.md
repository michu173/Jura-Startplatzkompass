# Outstanding evidence and acceptance

No known local runtime source/data files are missing. A network connection is required for external MapLibre JS/CSS, OpenFreeMap vector maps/fonts and swisstopo raster tiles. No credentials or backend are required by the existing application.

Still needed for a full operational-data audit: exact source-to-field evidence, current official clarification of the two unresolved site records, measured Falaise heights, and evidence for the copied comparison-resolution text. Historical Excel parity remains unverified. Do not infer missing facts or permissions from map markers.

Still needed before declaring full browser acceptance: actual rendered tiles/markers across all three styles, marker/cluster selection, zoom/pan, phone/tablet layout and real iPhone Safari gestures. The dependency-free tests use the real JS modules with API doubles; they do not render WebGL or establish native touch compatibility. Previous cloud-browser sessions had WebGL disabled. Retest supported browser capabilities during release verification.

The GitHub connector cannot read the Pages settings endpoint. Deployment workflows and live file parity can be verified independently; do not claim direct inspection of unavailable settings. The stabilisation branch must be reviewed/tested and merged before its changes reach the existing `main`-based Pages deployment.

No offline tile cache, live weather/airspace feed, ingestion pipeline or bidirectional spreadsheet sync is implemented or required for this stability release.
