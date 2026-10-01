# April 2026 release video render

Run these commands from the repository root:

```shell
mise exec -- node .agents/skills/summarize-video-releases/scripts/compose-video.js \
  --storyboard projects/site/video/releases/04-2026/storyboard.json \
  --out projects/site/video/releases/04-2026/video.html
mise exec -- node .agents/skills/summarize-video-releases/scripts/render-video.js \
  --html projects/site/video/releases/04-2026/video.html --month 04-2026 --quality 40
```

- Flags that override defaults: `--quality 40` (default 34) to keep the WebM under about 4 MB.
- Output: VP9 WebM, 1920×1080, 30 fps, 30 seconds, 900 frames, 4.04 MB.
- Playwright `1.62.1` with bundled Chromium `151.0.7922.34`.
- The terminal and lint-fix scenes transcribe real `nve api.validate` runs (CLI 2.2.7) on scratch files containing legacy `mlv` markup and the new Tailwind and slotted-popover mistakes. The fixed lint sample passes validation.
- The Data Grid demo sets explicit column widths: without them, the grid's cells fall out of alignment with their headers under the scene's `zoom`.
- Rendering packages: core 2.11.1, code 2.1.0, styles 2.1.3, themes 2.0.1. Core 2.11.1 loads from pinned jsDelivr; Code, Styles, and Themes load from matching local builds.

## Feature snapshots

Capture the selected scenes with the same rendering packages and browser as the video:

```shell
mise exec -- node .agents/skills/summarize-video-releases/scripts/render-video.js \
  --html projects/site/video/releases/04-2026/video.html --stills 7.1,13,19.5 --snapshots \
  --stills-dir /private/tmp/elements-release-snapshots/04-2026
```

| Published WebP                      | Time (seconds) | Scene                                 | Post heading                                       |
| ----------------------------------- | -------------- | ------------------------------------- | -------------------------------------------------- |
| `04-2026-data-grid.webp`            | 7.10           | feature: Smoother Data Grids          | Keep changing Data Grids smooth                    |
| `04-2026-legacy-css-migration.webp` | 13.00          | terminal: No more mlv prefixes        | Finish the legacy CSS migration                    |
| `04-2026-composition-lint.webp`     | 19.50          | fix: Catch composition problems early | Catch composition problems before the browser does |

## WebP poster

Capture the title card at 1.60 seconds as a lossless 1920×1080 WebP. The renderer uses Sharp `0.35.4` with `lossless: true` and `effort: 6`.

```shell
mise exec -- node .agents/skills/summarize-video-releases/scripts/render-video.js \
  --html projects/site/video/releases/04-2026/video.html --stills 1.6 \
  --stills-dir /private/tmp/elements-release-posters/04-2026
cp /private/tmp/elements-release-posters/04-2026/still-1.60.webp \
  projects/site/public/static/video/releases/04-2026.webp
```

Published assets live in `projects/site/public/static/video/releases/`. The poster and selected feature frames have empty overflow reports and no renderer errors.
