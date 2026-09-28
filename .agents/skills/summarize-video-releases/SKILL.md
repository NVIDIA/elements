---
name: summarize-video-releases
description: Create the 20–30 second marketing video for a monthly NVIDIA Elements “What’s New” post, rendered to projects/site/public/static/video/releases/MM-YYYY.webm from real Elements components. Use after the summarize-releases skill creates or updates a post, and whenever someone asks for a release video, what’s new video, monthly recap clip, changelog teaser, social video, or animated summary of Elements releases, even if they do not say “video skill”.
---

# Summarize Video Releases

Turn a monthly What’s New post into a short, fast-paced marketing video that shows the month’s changes with real Elements components, CLI output, and lint results. The post is the source of truth. This skill runs after `summarize-releases` and adds a WebM video, its poster image, and three video metadata fields in the post frontmatter.

The video should make someone who has never used Elements want to read the post. It should be accurate to the release, legible at 1080p, and consistent with the Elements design language.

## How the pieces fit

The scripts own everything that must be exact; you own the story and the markup.

- `scripts/read-post.js` parses the post into a JSON outline and resolves the input and output paths.
- You write a storyboard JSON: scene order, copy, durations, and `nve-*` demo markup. See [references/storyboard.md](references/storyboard.md).
- `scripts/compose-video.js` turns the storyboard into one static HTML page from `assets/video-shell.html`. It computes all timing, escapes code, and rejects videos outside 20–30 seconds.
- `scripts/render-video.js` serves the page with Elements CDN URLs mapped to this repository’s built packages, captures frames on a virtual clock, and encodes VP9 with the browser’s built-in WebCodecs encoder. `scripts/webm.js` writes the WebM file. The workflow uses no external encoder: VP9 and its encoder are royalty-free and BSD-licensed, and everything else is Playwright and code in this skill. Output is deterministic: the same storyboard renders the same video.

## Prerequisites

Run everything from the repository root.

```shell
mise exec -- pnpm run playwright
```

Generate and regenerate videos with the latest published Elements package versions available at generation time, regardless of the release month. Resolve them with `nve packages.list` or `nve packages.get <name>`, then pin the exact versions in the storyboard's `versions` and `imports`. The monthly post determines the story, claims, and release labels; its released-package list does not determine the rendering dependencies. Refresh version pins when adapting an example or regenerating an older month's video.

The renderer serves Elements from this clone’s built packages only when their versions match the storyboard’s pinned versions and a self-contained build exists (`projects/<package>/dist`). It falls back to the public jsDelivr CDN for anything else, listing each fallback under `network` in its output. Build matching packages when available, for example `mise exec -- pnpm --dir projects/core run build`. The `dist/bundles` output comes from the build’s bundle step, which runs only with `VITE_INITIAL_BUILD`, so bundle URLs may still come from the CDN after a plain package build.

Use the Elements CLI through its canonical path, `$HOME/.nve/bin/nve`, falling back to `nve` on `PATH`. Follow the `elements` skill’s authoring workflow for every piece of demo markup.

## 1. Read the post

```shell
mise exec -- node .agents/skills/summarize-video-releases/scripts/read-post.js
mise exec -- node .agents/skills/summarize-video-releases/scripts/read-post.js --month 08-2026
```

Without `--month`, the script picks the newest post. It prints `month`, `monthLabel`, the post URL, every highlight with its prose, links, and code, the released packages, and `output.video` / `output.poster` paths.

Stop and report when:

- no post exists for the month. Tell the user to run `summarize-releases` first.
- `output.exists` is true and the user did not ask to revise the video. A scheduled rerun must not replace a published video.

Read the post itself too. The outline is a map of the post, not a replacement for reading it.

## 2. Plan the story

Read [references/storyboard.md](references/storyboard.md) before planning. It defines the scene types, timing budget, copy rules, and demo markup rules.

Make a short plan before writing JSON:

1. Choose two to four highlights for their own scenes. Favor changes a viewer can see: a new component, a new command, a new lint rule. When the month includes CLI, MCP, lint, or agent-skill changes, give one of them a `terminal` or `fix` scene, because agent tooling is what sets Elements apart.
2. Put the remaining user-facing changes in one `list` scene. Mention breaking changes there only if the post covers them, and keep the wording neutral.
3. Assign each highlight a scene type and layout, and write its headline (six words or fewer) and optional opening line.
4. Add up durations. Stay within 20–30 seconds by cutting scenes rather than shortening them below four seconds.

Every claim, number, and example must trace back to the post or to command output you ran. Leave out anything you cannot trace.

## 3. Build the demos from real APIs

For each scene with markup:

1. Find a starting point with `nve examples.list` and `nve examples.get <id>` when a pattern fits.
2. Check every tag and attribute with `nve api.get <names…>`. Prefer the post’s own example when it has one.
3. Get registrations with `nve api.imports.get '<markup>'`. Core and Code are always loaded; add every other entry point to the storyboard `imports` as a jsDelivr URL pinned to that package's latest published version at generation time.
4. For `terminal` and `fix` scenes, run the real commands in a scratch directory and transcribe the output. For a `fix` scene, write a small file with the mistakes the new rules catch, run `nve api.validate` on it, then run it again on the fixed version and confirm it passes.

## 4. Write the storyboard

Keep the editable sources in the repository, outside the site's public assets and Eleventy input:

```shell
VIDEO_DIR="projects/site/video/releases/<month>"
mkdir -p "$VIDEO_DIR"
```

Write `$VIDEO_DIR/storyboard.json`. [assets/example-storyboard.json](assets/example-storyboard.json) shows a zoomed demo, a split code and demo scene with cues, a media demo, a lint fix, counters, and the end card. Adapt its structure; do not copy its copy.

Keep demo images, media, and other local inputs in `$VIDEO_DIR/assets/` and reference them as `/__video/assets/<file>`. Reuse tracked `/static/…` assets without copying them. Keep `storyboard.json`, its local assets, and the final composed `video.html` under source control with the video and poster. The HTML preserves the page used for that render when the shared composer or shell changes. See the [source archive guide](../../../projects/site/video/releases/README.md) for replay commands.

## 5. Compose and lint

```shell
mise exec -- node .agents/skills/summarize-video-releases/scripts/compose-video.js \
  --storyboard "$VIDEO_DIR/storyboard.json" --out "$VIDEO_DIR/video.html"
$HOME/.nve/bin/nve api.validate --stdin < "$VIDEO_DIR/video.html"
```

The composer prints each scene’s start and end times and any warnings. Treat warnings as errors: long headlines, code lines that would scroll, or terminal output that runs past its scene. Fix the storyboard and compose again until there are no warnings and validation passes.

## 6. Review stills

Render stills near the end of each scene, after its entrances finish, using the start and end times from the composer output:

```shell
mise exec -- node .agents/skills/summarize-video-releases/scripts/render-video.js \
  --html "$VIDEO_DIR/video.html" --stills 2,6.5,11,15.5,20.5,24,27 \
  --stills-dir "${TMPDIR:-/tmp}/elements-release-video/<month>/stills"
```

The script steps the clock forward to each time, so transitions and component animations match the final video. It writes PNG files to the temporary stills directory and prints, for each still, an overflow report of text, code, or demos that clip, leave the frame, or outgrow their column. Always use this script for stills: jumping straight to a time freezes transitions that start at that moment.

Open every still and work through the review checklist in the storyboard reference. Fix the storyboard, compose, and review again until every overflow report is empty and every still passes. Expect two or three rounds.

The script also reports `network`: pinned CDN URLs it could not serve from a matching local build. An empty list means the video uses matching builds in this clone. If the list has entries, build those versions when available, or confirm that the pinned CDN versions are the latest published versions selected for this generation and mention them in your report.

## 7. Render

```shell
mise exec -- node .agents/skills/summarize-video-releases/scripts/render-video.js \
  --html "$VIDEO_DIR/video.html" --month <month>
```

Add `--channel chrome` when a scene includes a `<video>` element without a poster frame. Rendering takes a few minutes. The script writes `output.video` (VP9 in WebM, 1920×1080, 30 fps) and `output.poster`, then prints the duration, frame count, encoding mode, and file size.

Confirm that:

- the duration is between 20 and 30 seconds.
- the file is under about 5 MB. For a larger file, render again with a higher `--quality` value (default 34; the range is 0–63, higher is smaller).
- `errors` and `network` are empty, or you can explain them.
- the poster shows the title scene cleanly.

## 8. Finish

Check the new video, poster, and post metadata:

```shell
git status --short projects/site/video/releases projects/site/public/static/video/releases
git diff --check
```

The shared What’s New layout displays `releases/<month>.webm` automatically. The monthly Markdown frontmatter must include `videoPublishedAt` (the video’s first public date), `videoDuration` (ISO 8601 seconds, such as `PT28S`), and `videoSummary` (one sentence describing the clip). Use the duration reported by the renderer. Include the matching JPG poster. The layout uses these fields for the caption, share image, video schema, and sitemap. Do not embed a second video player in the post.

Record the render command, any flags that override defaults, and the Playwright and browser versions in `$VIDEO_DIR/render.md`. Keep this file under source control too. Keep review stills and intermediate renders in temporary storage. Confirm every local URL resolves to a tracked asset, and include the sources in the same change as the published video and poster.

Report the source and output paths, duration, size, the scenes you chose, and which post changes went into the `list` scene. Revisions start from the saved storyboard, then compose and render again.

When the task explicitly asks for a pull request, follow the host’s authorized Git workflow after review.

## Troubleshooting

- **“Undefined elements” error.** A tag has no registration. Run `nve api.imports.get` on the scene markup and add the missing `imports`.
- **A demo is empty or shows raw text.** Check the page errors in the render output. A misspelled attribute value renders nothing; `nve api.validate` catches most of these.
- **A video demo is black.** Bundled Chromium cannot decode H.264. Add a `poster` frame or pass `--channel chrome`.
- **“Cannot encode 1080p VP9”.** The browser lacks WebCodecs VP9 support. Reinstall Playwright’s browser with `mise exec -- pnpm run playwright`, or pass `--channel chrome`.
- **A component does not truncate or fill its space.** Its column needs `align:horizontal-stretch`, and its wrapper must be a block element.
- **Text is too small to read.** Add `zoom` to the scene rather than resizing components with CSS.
- **Playwright is not available.** Run `mise run install` from the repository root, then `mise exec -- pnpm run playwright`.
