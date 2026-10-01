# August 2026 release video render

Run these commands from the repository root:

```shell
mise exec -- node .agents/skills/summarize-video-releases/scripts/compose-video.js \
  --storyboard projects/site/video/releases/08-2026/storyboard.json \
  --out projects/site/video/releases/08-2026/video.html
mise exec -- node .agents/skills/summarize-video-releases/scripts/render-video.js \
  --html projects/site/video/releases/08-2026/video.html --month 08-2026 --channel chrome --quality 50
```

- Flags that override defaults: `--channel chrome` so the media scene decodes the H.264 `particle.mp4` footage, and `--quality 50` (default 34) to keep the video under 5 MB.
- Output: VP9 WebM, 1920×1080, 30 fps, 34.8 seconds, 1044 frames, 4.80 MB.
- Playwright `1.62.1` with Google Chrome `154.0.8037.92`.
- The lint scene transcribes real `nve api.validate` runs on the file before and after the fixes. The scene shortens messages but keeps rule names and locations exact.
- Rendering packages: core 2.11.1, code 2.1.0, styles 2.1.3, themes 2.0.1. Core 2.11.1 loads from pinned jsDelivr; Code, Styles, and Themes load from matching local builds. Media 1.0.1 and its dependencies also load from pinned jsDelivr URLs.

## Feature snapshots

Capture the selected scenes with the same rendering packages and browser as the video:

```shell
mise exec -- node .agents/skills/summarize-video-releases/scripts/render-video.js \
  --html projects/site/video/releases/08-2026/video.html --stills 6.6,10.0,17.9,24.3 --snapshots \
  --stills-dir /private/tmp/elements-release-snapshots/08-2026 --channel chrome
```

| Published WebP                 | Time (seconds) | Scene                               | Post heading                              |
| ------------------------------ | -------------- | ----------------------------------- | ----------------------------------------- |
| `08-2026-standard-icons.webp`  | 6.60           | feature: A new standard icon set    | New Standard Icon Set                     |
| `08-2026-data-formatting.webp` | 10.00          | feature: Operational data, readable | Present Operational Data with Context     |
| `08-2026-media-controls.webp`  | 17.90          | feature: Complete media controls    | Build Complete Media Controls             |
| `08-2026-validation.webp`      | 24.30          | fix: Validation before release      | Check Projects and Layouts Before Release |

## WebP poster

Capture the title card at 1.60 seconds as a lossless 1920×1080 WebP. The renderer uses Sharp `0.35.4` with `lossless: true` and `effort: 6`.

```shell
mise exec -- node .agents/skills/summarize-video-releases/scripts/render-video.js \
  --html projects/site/video/releases/08-2026/video.html --stills 1.6 \
  --stills-dir /private/tmp/elements-release-posters/08-2026 --channel chrome
cp /private/tmp/elements-release-posters/08-2026/still-1.60.webp \
  projects/site/public/static/video/releases/08-2026.webp
```

The data formatting snapshot uses 10.00 seconds, after its entrances finish and before the first byte-value cue at 10.20 seconds, so the rendered value matches the code example.

Published assets live in `projects/site/public/static/video/releases/`. The poster and selected feature frames have empty overflow reports and no renderer errors.
