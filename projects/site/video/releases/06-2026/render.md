# June 2026 release video render

Run these commands from the repository root:

```shell
mise exec -- node .agents/skills/summarize-video-releases/scripts/compose-video.js \
  --storyboard projects/site/video/releases/06-2026/storyboard.json \
  --out projects/site/video/releases/06-2026/video.html
mise exec -- node .agents/skills/summarize-video-releases/scripts/render-video.js \
  --html projects/site/video/releases/06-2026/video.html --month 06-2026 --quality 42
```

- Flags that override defaults: `--quality 42` (default 34) to keep the WebM under about 4 MB.
- Output: VP9 WebM, 1920×1080, 30 fps, 29.4 seconds, 882 frames, 3.80 MB.
- Playwright `1.62.1` with bundled Chromium `151.0.7922.34`.
- The lint scene transcribes real `nve api.validate` runs on the file before and after the fixes. The scene shortens messages but keeps rule names and locations exact.
- The starter scene transcribes a real `nve project.create mcp-app` run, with emoji status markers removed.
- Rendering packages: core 2.11.1, code 2.1.0, styles 2.1.3, themes 2.0.1. Core 2.11.1 loads from pinned jsDelivr; Code, Styles, and Themes load from matching local builds.

## Feature snapshots

Capture the selected scenes with the same rendering packages and browser as the video:

```shell
mise exec -- node .agents/skills/summarize-video-releases/scripts/render-video.js \
  --html projects/site/video/releases/06-2026/video.html --stills 8.1,13.7,19.4 --snapshots \
  --stills-dir /private/tmp/elements-release-snapshots/06-2026
```

| Published WebP                | Time (seconds) | Scene                        | Post heading                        |
| ----------------------------- | -------------- | ---------------------------- | ----------------------------------- |
| `06-2026-stable-upgrade.webp` | 8.10           | fix: Upgrade to stable 2.0   | Upgrade to the stable 2.0 line      |
| `06-2026-form-mixins.webp`    | 13.70          | feature: Shared form mixins  | Build controls from shared behavior |
| `06-2026-starters.webp`       | 19.40          | terminal: Three new starters | Start the right kind of project     |

## WebP poster

Capture the title card at 1.60 seconds as a lossless 1920×1080 WebP. The renderer uses Sharp `0.35.4` with `lossless: true` and `effort: 6`.

```shell
mise exec -- node .agents/skills/summarize-video-releases/scripts/render-video.js \
  --html projects/site/video/releases/06-2026/video.html --stills 1.6 \
  --stills-dir /private/tmp/elements-release-posters/06-2026
cp /private/tmp/elements-release-posters/06-2026/still-1.60.webp \
  projects/site/public/static/video/releases/06-2026.webp
```

Published assets live in `projects/site/public/static/video/releases/`. The poster and selected feature frames have empty overflow reports and no renderer errors.
