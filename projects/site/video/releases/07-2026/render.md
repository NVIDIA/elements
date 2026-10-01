# July 2026 release video render

Run these commands from the repository root:

```shell
mise exec -- node .agents/skills/summarize-video-releases/scripts/compose-video.js \
  --storyboard projects/site/video/releases/07-2026/storyboard.json \
  --out projects/site/video/releases/07-2026/video.html
mise exec -- node .agents/skills/summarize-video-releases/scripts/render-video.js \
  --html projects/site/video/releases/07-2026/video.html --month 07-2026 --quality 40
```

- Flags that override defaults: `--quality 40` (default 34) to keep the WebM under about 4 MB.
- Output: VP9 WebM, 1920×1080, 30 fps, 30 seconds, 900 frames, 4.02 MB.
- Playwright `1.62.1` with bundled Chromium `151.0.7922.34`.
- The lint-fix scene transcribes a real `nve api.validate` run (CLI 2.2.7) on a scratch toolbar with a `<label>` inside `nve-search` and three emphasis buttons. The fix leaves Run as the only primary action, and the fixed file passes validation. Button labels stay short so the rendered toolbar fits its column.
- The Gauge scene animates `value` with attribute cues. It depends on the shell's virtual clock holding the gauge's timing-only progress animation at playback rate 0 instead of pausing it; a paused timer stops the gauge's own frame loop and the new value never paints.
- Rendering packages: core 2.11.1, code 2.1.0, styles 2.1.3, themes 2.0.1. Core 2.11.1 loads from pinned jsDelivr; Code, Styles, and Themes load from matching local builds.

## Feature snapshots

Capture the selected scenes with the same rendering packages and browser as the video:

```shell
mise exec -- node .agents/skills/summarize-video-releases/scripts/render-video.js \
  --html projects/site/video/releases/07-2026/video.html --stills 7.8,14.1,19.7 --snapshots \
  --stills-dir /private/tmp/elements-release-snapshots/07-2026
```

| Published WebP                   | Time (seconds) | Scene                              | Post heading                             |
| -------------------------------- | -------------- | ---------------------------------- | ---------------------------------------- |
| `07-2026-gauge.webp`             | 7.80           | feature: Telemetry at a glance     | Show telemetry with Gauge                |
| `07-2026-design-lint.webp`       | 14.10          | fix: Design feedback before review | Catch design problems during linting     |
| `07-2026-metric-typography.webp` | 19.70          | feature: Metric text that fits     | Improve metadata, typography, and layout |

## WebP poster

Capture the title card at 1.60 seconds as a lossless 1920×1080 WebP. The renderer uses Sharp `0.35.4` with `lossless: true` and `effort: 6`.

```shell
mise exec -- node .agents/skills/summarize-video-releases/scripts/render-video.js \
  --html projects/site/video/releases/07-2026/video.html --stills 1.6 \
  --stills-dir /private/tmp/elements-release-posters/07-2026
cp /private/tmp/elements-release-posters/07-2026/still-1.60.webp \
  projects/site/public/static/video/releases/07-2026.webp
```

Published assets live in `projects/site/public/static/video/releases/`. The poster and selected feature frames have empty overflow reports and no renderer errors.
