# Ordered feature backlog and continuation checkpoint

Repository: https://github.com/michu173/Jura-Startplatzkompass

Current task branch: `feature/launch-wind-filter`, based on marker PR #6 at `65f07bec1f279fadce10d841db5b0a5aaae6af44`. This is a separate, stacked feature branch; do not merge its parent or deploy without subsequent user authorization. Marker behaviour must remain ungrouped at every zoom, with direction fans only from zoom 11.5.

## Ordered tasks

1. **Launch-wind direction filter — in progress.** Match the expected wind at takeoff separately from grosswetterlage. Shared direction matching is implemented and tested. UI, URL integration and browser acceptance remain.
2. **Independent return-to-car planning — queued.** Present stored landing/access/return descriptions and useful links. Do not invent walking times, transport schedules, landing permissions or shuttle availability.
3. **Compare two or three sites — queued.** Use existing difficulty, wind, access, hazards and return information, preserving uncertainty and variants.
4. **Favourites and personal notes — queued.** Local-device storage with clear/delete controls; no accounts/backend. Keep personal notes separate from canonical facts.
5. **Source freshness and uncertainty — queued.** Show available review dates and unresolved evidence beside relevant facts. Never invent per-site review dates or silently resolve conflicts.
6. **Weather and airspace links — queued.** Relevant official links, without implying live weather/airspace clearance inside the app.
7. **Offline saved descriptions — queued.** Save selected reference descriptions, coordinates and access information; offline tiles require separate provider/technical consideration.

## Task 1 completed checkpoint

- `js/launch-wind.js` now owns the conservative compass parser, shared per-site wind interpretation and `matchesLaunchWind`.
- `js/map-markers.js` consumes the shared interpretation and re-exports its previous parser API. Direction fan semantics are preserved.
- The filter matches eight compass directions, understands stored ranges/German notation and excludes unresolved Tannmatt Ost, unverified/rejected Orvin winds and NW mentioned only as an exclusion in the Chasseral north note. An empty filter retains all records. Matching a stored wind does not establish operating permission.
- All 24 named Node regression tests pass, including exact dataset membership for all eight directions and the existing map/filter/error/variant tests. `git diff --check` passes.
- Dataset SHA-256 stays `68e4e782fecb4b1e48c44b8fc8abcd95ab4868bf85275caaf1ed3de80c609c2a`; architecture/providers and stored facts are unchanged.
- This is not a finished visible filter. No new real-browser or published-feature acceptance is claimed for this checkpoint.

## Next concrete steps for task 1

1. Add `launchWind:''` to the shared default/URL state, validating values against `LAUNCH_WIND_DIRECTIONS`; use a dedicated `wind` URL parameter. Extend `sortAndFilter(items,state,issues=[])` with `matchesLaunchWind`, passing the dataset's comparison issues from both pages.
2. Add accessible, separately labelled launch-wind controls to compass and map. Use canonical direction values with German labels and explain that unresolved sectors are excluded when a direction is selected.
3. Wire initial state, change handling, reset and cross-page navigation on both pages. Preserve existing filters/sorting, all 29 groups/30 positions and Schwengimatt variants.
4. Update cache versions consistently for changed entry/shared modules. Current checkpoint uses map entry `20261021-5`, marker module `20261021-2`, new wind module `20261021-1`; existing common/compass versions have not changed yet.
5. Extend the VM harness linker for any new shared-module imports. Test combined wind/weather filters, unknown/excluded directions, URL validation/persistence, navigation and reset.
6. Run focused real Chromium/SwiftShader checks with live providers against both pages, including phone/tablet layout, matching group/point counts, no grouping, fan zoom threshold and source errors. Do not claim native Safari testing. Record results before making the draft ready for review.
7. Only then advance to task 2 on a coherent branch/PR; retain the earlier backlog order.

## Continuation and allowance constraint

The user requested continuation at 00:35 Europe/Zurich on 22 October 2026. The saved automation targets this backlog. Latest user-provided figures were 4% of the current five-hour window and 44% weekly remaining; these are snapshots, not a live meter.

Stop at 25% weekly remaining to leave a margin above the user's 20% floor if a reliable quota meter is available. Never infer allowance from token counts or elapsed time. Without a live meter, perform only a small bounded task-1 continuation, save/push a checkpoint, then pause for a fresh quota report before sustained further batches. Do not promise an automatic measured cutoff that cannot be observed. Do not keep working solely to consume quota.
