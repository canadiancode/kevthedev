# Opening film manifest

Higgsfield job IDs for the scroll-driven opening film. Generated files live in
`raw/keyframes/` and `raw/video/` (git-ignored); these IDs can be reused as
`medias[].value` in new Higgsfield generations.

## Approved keyframes (gpt_image_2_5, 16:9, 2k)

| Key | Role | Job ID |
|---|---|---|
| K0 | Garage hero, lowered on deep-dish wheels (option B) — first frame | `573f2df0-b264-463b-af09-8a3dd42dab3f` |
| K1 | Headlight bloom — end 01 / start 02 | `181707b4-f388-4c7a-b45a-c618ac53a679` |
| A1 | CRF on forest trail — mid 02 reference | `8063f149-561f-409b-bb31-be3862fab06e` |
| K2 | Red CRF fairing wipe — end 02 / start 03 | `61d68367-0162-440e-963f-f98dbe579235` |
| A2 | Enduro chase in real MTB gear — mid 03 reference | `7b47d573-9433-4233-aab2-efae5b80974f` |
| A2b | Dirt jumper launch (alternate) | `0f2e2e97-a44e-43a4-8b5d-52cd7af410b3` |
| K3 | White sky + first snow — end 03 / start 04 | `1a33b118-5818-4c72-94b3-a58b331ea33f` |
| A3 | Snowboarder drop-in — mid 04 reference | `f03c6e64-fecc-4db1-bdd0-ba8731e3955e` |
| A4 | Powder carve — mid 04 reference | `17985cdb-55ad-4b92-91c6-93c1c45a947c` |
| K4 | Powder wall to white — end 04 / Three.js handoff | `98237923-ba47-465a-9f13-5e213c7245b1` |

## Clips (round 1)

| Clip | Start → End | minimax_h3 (2K) | flux_3_video (1080p) |
|---|---|---|---|
| 01 garage | K0 → K1 (10s) | `65984346-8323-4b90-8b46-bb6a6814ff0d`, `6a8d099a-1a8d-4d86-85c8-a30e141e0531` | `f7fb4d55-6d5e-40cb-8188-dbd54906e7d5` |
| 02 crf-trail | K1 → K2 (12s) | `863f6b35-a308-4f9a-a72f-fe5728564815`, `99200041-e7e0-457d-b52e-0d6fdebfcdae` | `cc69126d-1372-4576-995d-dd746245fe07` |
| 03 mtb-trail | K2 → K3 (12s) | `7d4bb509-af48-4cca-931e-433a66955bcf`, `e0282b4b-37d1-4904-8b15-2ad4fe4604c2` | `bb19dc2f-1d7b-419a-8a79-d435570a9ff2` |
| 04 snowboard | K3 → K4 (12s) | `0bcbfb95-55f8-43bd-8f01-a087109f1c74`, `423c5f87-fc9c-4504-b014-9dd837ee4dd9` | `d93e0c9d-9fac-4046-9050-9e28d879464e` |

Notes: minimax_h3 can't combine start/end frames with extra reference images, so
its clips rely on the prompt for subject detail; flux_3_video gets the mid-scene
stills as references too.

## Round 1 review notes (2026-10-07)

- **flux_3_video treats `image_references` as storyboard frames** — clip 03 (`bb19dc2f`)
  literally cut to the real bike-wall photo at 8.0–10.8s. Only pass generated,
  in-scene stills as FLUX references, never real photos.
- 01 FLUX (`f7fb4d55`): lovely, but holds static 0–6.5s then hard-cuts to the headlight.
- 03 FLUX (`bb19dc2f`): 0–7.8s excellent (red wipe → chase → jump over valley); unusable after.
- 04 FLUX (`d93e0c9d`): good; quick sky→ridge morph at ~1.5s, angle jump at ~7s.
- Re-runs with in-scene references only: 02 FLUX `cc69126d` (original, real photo ref),
  `3a87d7ab` (failed, no reason), `77f68170` (retry, no brand names); 03 FLUX `a72024d3`.

## Round 1 picks → `raw/video/film-preview-v1.mp4` (~45.5s, 1080p)

| Clip | Pick | Why | Runner-up |
|---|---|---|---|
| 01 garage | minimax `65984346` | continuous push-in wide → hood → headlight ignites → bloom | minimax `6a8d099a` (also continuous); FLUX `f7fb4d55` hard-cuts at 6.5s |
| 02 crf-trail | minimax `863f6b35` | headlight glow → canopy → CRF approaches → red bodywork fills lens; CRF very accurate | minimax `99200041` hard-cuts at 6.2s and doesn't end on red |
| 03 mtb-trail | FLUX `a72024d3` | starts on the exact red wipe, accurate gear + Enduro, epic launch over valley; hard cut to clouds at ~11.2s hidden with a 0.4s crossfade | minimax `e0282b4b` (no cuts, lake-valley reveal, but generic gear and a ~4s static sky tail) |
| 04 snowboard | minimax `0bcbfb95` | one unbroken move: clouds → ridge → drop-in → carves → powder wall | FLUX `d93e0c9d` (angle jump ~7s); minimax `423c5f87` (odd seated pose, cut ~6s) |

minimax_h3 holds continuous camera moves much better; FLUX gives better subject fidelity.
