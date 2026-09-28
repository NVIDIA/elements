# September 2026 release video render

Rendered from the repository root:

```shell
mise exec -- node .agents/skills/summarize-video-releases/scripts/render-video.js \
  --html projects/site/video/releases/09-2026/video.html --month 09-2026 --quality 46
```

- Flags that override defaults: `--quality 46` (default 34) to keep the WebM under about 4 MB.
- Output: VP9 WebM, 1920×1080, 30 fps, 25 seconds, 750 frames, 3.85 MB.
- Playwright `1.62.1` with bundled Chromium `151.0.7922.34`.
- The Pi terminal scene transcribes a real `pi install -l npm:@nvidia-elements/pi` run, which resolved the latest published version (1.0.0).
- Elements packages served from matching local builds: core 2.11.0, code 2.1.0, styles 2.1.3, themes 2.0.1. No CDN fallbacks.
- The Viewport scene eases its pan and zoom with cue durations and moves a hand icon in the viewport's overlay slot to show the drag. Quality values 42 and 44 produced identical 4.06 MB files, so the render uses 46.
