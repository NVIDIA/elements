# May 2026 release video render

Rendered from the repository root:

```shell
mise exec -- node .agents/skills/summarize-video-releases/scripts/render-video.js \
  --html projects/site/video/releases/05-2026/video.html --month 05-2026 --quality 54
```

- Flags that override defaults: `--quality 54` (default 34) to keep the WebM under about 4 MB.
- Output: VP9 WebM, 1920×1080, 30 fps, 29 seconds, 870 frames, 3.82 MB.
- Playwright `1.62.1` with bundled Chromium `151.0.7922.34`.
- The terminal scene transcribes a real `nve skills.install` run with the latest published CLI (2.2.8), which replaced the May `nve skills.list` and `nve skills.get` commands. The transcript shows output paths relative to the project.
- The lint scene transcribes real `nve api.validate` output from CLI 2.2.8 (`@nvidia-elements/lint` 2.7.1) for the broken and fixed `toolbar.html`, with messages shortened.
- The Combobox scene renders without `zoom`: under CSS `zoom`, Combobox compares a zoomed input width with an unscaled tag width when it measures overflow, so `tag-layout="wrap"` does not engage.
- Elements packages served from matching local builds: core 2.11.0, code 2.1.0, styles 2.1.3, themes 2.0.1. No CDN fallbacks.
