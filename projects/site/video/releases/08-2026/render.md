# August 2026 release video render

Rendered from the repository root:

```shell
mise exec -- node .agents/skills/summarize-video-releases/scripts/render-video.js \
  --html projects/site/video/releases/08-2026/video.html --month 08-2026 --channel chrome --quality 50
```

- Flags that override defaults: `--channel chrome` so the media scene decodes the H.264 `particle.mp4` footage, and `--quality 50` (default 34). Quality 42 produced 5.2 MB and quality 56 still produced 4.48 MB, because key frames every 2 seconds dominate the file size. Quality 50 keeps text crisp at 4.69 MB.
- Output: VP9 WebM, 1920×1080, 30 fps, 29 seconds, 870 frames, 4.69 MB.
- Playwright `1.62.1` with Google Chrome `154.0.8037.92`.
- The lint scene transcribes real `nve api.validate` runs on the file before and after the fixes. The scene shortens messages but keeps rule names and locations exact.
- Elements packages served from matching local builds: core 2.11.0, code 2.1.0, styles 2.1.3, themes 2.0.1. The media components load `@nvidia-elements/media@1.0.1`, the latest published version, from jsDelivr because the local media build is not self-contained; jsDelivr resolves its Core and Lit dependencies from the CDN.
