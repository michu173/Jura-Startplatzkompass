# Ordered feature backlog and continuation checkpoint

Repository: https://github.com/michu173/Jura-Startplatzkompass

Current task branch: `feature/launch-wind-filter`, based on marker PR #6 at `65f07bec1f279fadce10d841db5b0a5aaae6af44`. This is a separate, stacked feature branch; do not merge its parent or deploy without subsequent user authorization. Marker behaviour must remain ungrouped at every zoom, with direction fans only from zoom 11.5.

## Ordered tasks

1. **Launch-wind direction filter — implemented, ready for review in PR #7.** Separate controls on compass/map, URL persistence, reset/navigation and responsive behaviour are implemented. All 27 regressions and 32 actual Chromium/SwiftShader browser checks pass. See WIND_FILTER.md. Not merged/deployed.
2. **Independent return-to-car planning — queued.** Present stored landing/access/return descriptions and useful links. Do not invent walking times, transport schedules, landing permissions or shuttle availability.
3. **Compare two or three sites — queued.** Use existing difficulty, wind, access, hazards and return information, preserving uncertainty and variants.
4. **Favourites and personal notes — queued.** Local-device storage with clear/delete controls; no accounts/backend. Keep personal notes separate from canonical facts.
5. **Source freshness and uncertainty — queued.** Show available review dates and unresolved evidence beside relevant facts. Never invent per-site review dates or silently resolve conflicts.
6. **Weather and airspace links — queued.** Relevant official links, without implying live weather/airspace clearance inside the app.
7. **Offline saved descriptions — queued.** Save selected reference descriptions, coordinates and access information; offline tiles require separate provider/technical consideration.

## Current saved checkpoint

Task 1 is implemented on `feature/launch-wind-filter` in [PR #7](https://github.com/michu173/Jura-Startplatzkompass/pull/7), stacked on marker PR #6. Browser-tested runtime commit: `1d042c93e46a565f649b9d3ce1afcd9ba15f1d88`; later documentation/evidence commits do not change those runtime files. All 27 named regressions and 32 real-browser checks pass. The draft can become ready after current PR CI passes. WIND_FILTER.md and docs/wind-filter-verification.json contain behaviour, test names, source hashes and previews.

Next task: **2 — independent return-to-car planning**, only after a fresh weekly-allowance report confirms room above the 25% stopping margin. The live quota meter remains unavailable. Do not repeat task 1 or claim the stale 44% report is current. Tasks 2–7 remain queued in the order above.

For release, the unmerged marker parent must be handled before retargeting/merging this stacked PR. No runtime merge/deployment is authorized; await a subsequent user instruction, then check CI, Pages and published-byte parity.

## Continuation and allowance constraint

The user requested continuation at 00:35 Europe/Zurich on 22 October 2026. The saved automation targets this backlog. Latest user-provided figures were 4% of the current five-hour window and 44% weekly remaining; these are snapshots, not a live meter.

Stop at 25% weekly remaining to leave a margin above the user's 20% floor if a reliable quota meter is available. Never infer allowance from token counts or elapsed time. Without a live meter, perform only a small bounded task-1 continuation, save/push a checkpoint, then pause for a fresh quota report before sustained further batches. Do not promise an automatic measured cutoff that cannot be observed. Do not keep working solely to consume quota.
