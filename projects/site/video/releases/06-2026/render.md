# June 2026 release video render

Rendered from the repository root:

```shell
mise exec -- node .agents/skills/summarize-video-releases/scripts/render-video.js \
  --html projects/site/video/releases/06-2026/video.html --month 06-2026 --quality 42
```

- Flags that override defaults: `--quality 42` (default 34) to keep the WebM under about 4 MB.
- Output: VP9 WebM, 1920×1080, 30 fps, 24.5 seconds, 735 frames, 3.75 MB.
- Playwright `1.62.1` with bundled Chromium `151.0.7922.34`.
- The lint scene transcribes real `nve api.validate` runs on the file before and after the fixes. The scene shortens messages but keeps rule names and locations exact.
- The starter scene transcribes a real `nve project.create mcp-app` run, with emoji status markers removed.
- Elements packages served from matching local builds: core 2.11.0, code 2.1.0, styles 2.1.3, themes 2.0.1. No CDN fallbacks.
