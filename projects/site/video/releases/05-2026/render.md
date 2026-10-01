# May 2026 release video render

Run these commands from the repository root:

```shell
mise exec -- node .agents/skills/summarize-video-releases/scripts/compose-video.js \
  --storyboard projects/site/video/releases/05-2026/storyboard.json \
  --out projects/site/video/releases/05-2026/video.html
mise exec -- node .agents/skills/summarize-video-releases/scripts/render-video.js \
  --html projects/site/video/releases/05-2026/video.html --month 05-2026 --quality 54
```

- Flags that override defaults: `--quality 54` (default 34) to keep the WebM under about 4 MB.
- Output: VP9 WebM, 1920×1080, 30 fps, 34.8 seconds, 1044 frames, 3.95 MB.
- Playwright `1.62.1` with bundled Chromium `151.0.7922.34`.
- The terminal scene transcribes a real `nve skills.install` run with CLI 2.2.8. The transcript shows output paths relative to the project.
- The lint scene transcribes real `nve api.validate` output from CLI 2.2.8 (`@nvidia-elements/lint` 2.7.1) for the broken and fixed `toolbar.html`, with messages shortened.
- The Combobox scene renders without `zoom`: under CSS `zoom`, Combobox compares a zoomed input width with an unscaled tag width when it measures overflow, so `tag-layout="wrap"` does not engage.
- Rendering packages: core 2.11.1, code 2.1.0, styles 2.1.3, themes 2.0.1. Core 2.11.1 loads from pinned jsDelivr; Code, Styles, and Themes load from matching local builds.

## Feature snapshots

Capture the selected scenes with the same rendering packages and browser as the video:

```shell
mise exec -- node .agents/skills/summarize-video-releases/scripts/render-video.js \
  --html projects/site/video/releases/05-2026/video.html --stills 7.3,12.5,18.2,24.3 --snapshots \
  --stills-dir /private/tmp/elements-release-snapshots/05-2026
```

| Published WebP               | Time (seconds) | Scene                                | Post heading                                 |
| ---------------------------- | -------------- | ------------------------------------ | -------------------------------------------- |
| `05-2026-format-number.webp` | 7.30           | feature: Localized numbers in markup | Format values where they appear              |
| `05-2026-combobox-tags.webp` | 12.50          | feature: Multi-select that fits      | Make multi-select lists work in tight spaces |
| `05-2026-agent-skills.webp`  | 18.20          | terminal: Skills for your agent      | Bring Elements guidance into agent workflows |
| `05-2026-upgrade-lint.webp`  | 24.30          | fix: Guardrails for every upgrade    | Upgrade with stronger guardrails             |

## WebP poster

Capture the title card at 1.60 seconds as a lossless 1920×1080 WebP. The renderer uses Sharp `0.35.4` with `lossless: true` and `effort: 6`.

```shell
mise exec -- node .agents/skills/summarize-video-releases/scripts/render-video.js \
  --html projects/site/video/releases/05-2026/video.html --stills 1.6 \
  --stills-dir /private/tmp/elements-release-posters/05-2026
cp /private/tmp/elements-release-posters/05-2026/still-1.60.webp \
  projects/site/public/static/video/releases/05-2026.webp
```

Published assets live in `projects/site/public/static/video/releases/`. The poster and selected feature frames have empty overflow reports and no renderer errors.
