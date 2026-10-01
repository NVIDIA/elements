# September 2026 release video render

Run these commands from the repository root:

```shell
mise exec -- node .agents/skills/summarize-video-releases/scripts/compose-video.js \
  --storyboard projects/site/video/releases/09-2026/storyboard.json \
  --out projects/site/video/releases/09-2026/video.html
mise exec -- node .agents/skills/summarize-video-releases/scripts/render-video.js \
  --html projects/site/video/releases/09-2026/video.html --month 09-2026 --quality 46
```

- Flags that override defaults: `--quality 46` (default 34) to keep the WebM under about 4 MB.
- Output: VP9 WebM, 1920×1080, 30 fps, 30 seconds, 900 frames, 3.84 MB.
- Playwright `1.62.1` with bundled Chromium `151.0.7922.34`.
- The Pi terminal scene transcribes a real `pi install -l npm:@nvidia-elements/pi` run, with Pi package version 1.0.0.
- Rendering packages: core 2.11.1, code 2.1.0, styles 2.1.3, themes 2.0.1. Core 2.11.1 loads from pinned jsDelivr; Code, Styles, and Themes load from matching local builds.
- The Viewport scene eases its pan and zoom with cue durations and moves a hand icon in the viewport's overlay slot to show the drag.

## Feature snapshots

Capture the selected scenes with the same rendering packages and browser as the video:

```shell
mise exec -- node .agents/skills/summarize-video-releases/scripts/render-video.js \
  --html projects/site/video/releases/09-2026/video.html --stills 7.8,13.4,19.5 --snapshots \
  --stills-dir /private/tmp/elements-release-snapshots/09-2026
```

| Published WebP              | Time (seconds) | Scene                                  | Post heading                           |
| --------------------------- | -------------- | -------------------------------------- | -------------------------------------- |
| `09-2026-viewport.webp`     | 7.80           | feature: Pan and zoom anything         | Navigate Spatial Content with Viewport |
| `09-2026-pi-extension.webp` | 13.40          | terminal: Elements tools, native in Pi | Use Elements Tools Natively in Pi      |
| `09-2026-slot-lint.webp`    | 19.50          | fix: Catch misplaced markup            | Catch More Issues During Linting       |

## WebP poster

Capture the title card at 1.60 seconds as a lossless 1920×1080 WebP. The renderer uses Sharp `0.35.4` with `lossless: true` and `effort: 6`.

```shell
mise exec -- node .agents/skills/summarize-video-releases/scripts/render-video.js \
  --html projects/site/video/releases/09-2026/video.html --stills 1.6 \
  --stills-dir /private/tmp/elements-release-posters/09-2026
cp /private/tmp/elements-release-posters/09-2026/still-1.60.webp \
  projects/site/public/static/video/releases/09-2026.webp
```

Published assets live in `projects/site/public/static/video/releases/`. The poster and selected feature frames have empty overflow reports and no renderer errors.
