# July 2026 release video render

Rendered from the repository root:

```shell
mise exec -- node .agents/skills/summarize-video-releases/scripts/render-video.js \
  --html projects/site/video/releases/07-2026/video.html --month 07-2026 --quality 40
```

- Flags that override defaults: `--quality 40` (default 34) to keep the WebM under about 4 MB.
- Output: VP9 WebM, 1920×1080, 30 fps, 25 seconds, 750 frames, 3.95 MB.
- Playwright `1.62.1` with bundled Chromium `151.0.7922.34`.
- Regenerated with the latest published Elements packages at generation time. The end card keeps the July release versions from the post.
- The lint-fix scene transcribes a real `nve api.validate` run (CLI 2.2.7) on a scratch toolbar with a `<label>` inside `nve-search` and three emphasis buttons. The fix leaves Run as the only primary action, and the fixed file passes validation. Button labels stay short so the rendered toolbar fits its column.
- The Gauge scene animates `value` with attribute cues. It depends on the shell's virtual clock holding the gauge's timing-only progress animation at playback rate 0 instead of pausing it; a paused timer stops the gauge's own frame loop and the new value never paints.
- Elements packages served from matching local builds: core 2.11.0, code 2.1.0, styles 2.1.3, themes 2.0.1. No CDN fallbacks.
