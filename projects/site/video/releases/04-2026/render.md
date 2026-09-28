# April 2026 release video render

Rendered from the repository root:

```shell
mise exec -- node .agents/skills/summarize-video-releases/scripts/render-video.js \
  --html projects/site/video/releases/04-2026/video.html --month 04-2026 --quality 40
```

- Flags that override defaults: `--quality 40` (default 34) to keep the WebM under about 4 MB.
- Output: VP9 WebM, 1920×1080, 30 fps, 25 seconds, 750 frames, 3.99 MB.
- Playwright `1.62.1` with bundled Chromium `151.0.7922.34`.
- Regenerated with the latest published Elements packages at generation time. The end card keeps the April release versions from the post.
- The terminal and lint-fix scenes transcribe real `nve api.validate` runs (CLI 2.2.7) on scratch files containing legacy `mlv` markup and the new Tailwind and slotted-popover mistakes. The fixed lint sample passes validation.
- The Data Grid demo sets explicit column widths: without them, the grid's cells fall out of alignment with their headers under the scene's `zoom`.
- Elements packages served from matching local builds: core 2.11.0, code 2.1.0, styles 2.1.3, themes 2.0.1. No CDN fallbacks.
