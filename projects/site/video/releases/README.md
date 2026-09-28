# Release video sources

Keep each month's editable inputs in `MM-YYYY/`, alongside the composed page used for its render. This directory sits outside the site's public assets and Eleventy input, so the site only publishes the WebM and JPG from `projects/site/public/static/video/releases/`.

## Files

- `storyboard.json`: scene copy, timing, demo markup, and exact Elements package versions.
- `video.html`: the composed page. Keep this snapshot so changes to the shared composer and shell do not change an existing render's input.
- `assets/`: local demo inputs, such as poster frames, images, or media. Reference these as `/__video/assets/<file>`.
- `render.md`: the render command, flags that override defaults, and Playwright and browser versions used for the published clip.

Reuse assets already tracked under `projects/site/public/static/` through `/static/…` URLs. Keep review stills, logs, and intermediate renders in temporary storage.

## Replay or edit

Run from the repository root. Retrieve Git LFS assets and install the pinned toolchain and Playwright browser first, following `AGENTS.md`.

Render the saved page into temporary storage to preview it:

```shell
VIDEO_DIR="projects/site/video/releases/<month>"
PREVIEW_DIR="${TMPDIR:-/tmp}/elements-release-video/<month>"
mkdir -p "$PREVIEW_DIR"
mise exec -- node .agents/skills/summarize-video-releases/scripts/render-video.js \
  --html "$VIDEO_DIR/video.html" --out "$PREVIEW_DIR/preview.webm"
```

Replace `<month>` with `MM-YYYY` and apply the flags from the month's `render.md`. Use `--channel chrome` when a scene includes H.264 media without a poster frame. Pinned packages load from matching local builds when available and otherwise from the CDN. Inspect the renderer's `network` and `errors` output. Reusing the same repository revision, package versions, assets, and browser reduces differences between renders; the archive does not guarantee identical encoded bytes across browser versions.

To edit, change `storyboard.json`, regenerate the page, and follow the release-video skill's validation and still-review steps before rendering:

```shell
mise exec -- node .agents/skills/summarize-video-releases/scripts/compose-video.js \
  --storyboard "$VIDEO_DIR/storyboard.json" --out "$VIDEO_DIR/video.html"
```

Commit the updated source files with the published WebM and JPG. Review stills stay in temporary storage.
