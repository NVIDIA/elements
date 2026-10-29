# October 2026 release video

Run from the repository root after building the site and its package dependencies:

```shell
mise exec -- node projects/site/video/releases/10-2026/build-demos.mjs
mise exec -- node .agents/skills/summarize-video-releases/scripts/compose-video.js \
  --storyboard projects/site/video/releases/10-2026/storyboard.json \
  --out projects/site/video/releases/10-2026/video.html --allow-duration
mise exec -- node .agents/skills/summarize-video-releases/scripts/render-video.js \
  --html projects/site/video/releases/10-2026/video.html --month 10-2026 \
  --offline --channel chrome --quality 56
```

The helper bundles the matching generated Viewport, Foundations, and Media registrations into self-contained modules in their ignored build directories. This avoids unresolved bare imports and relative imports beneath the CDN transformation URL. Run the helper again after rebuilding packages. It changes no package source files.

Rendering dependencies include Core 2.20.0, Code 2.2.1, Styles 2.1.3, Themes 2.0.1, Viewport 1.1.4, Foundations 1.1.0, and Media 1.2.2. The CLI package catalog supplied the first four versions; component API metadata supplied Viewport and Foundations versions because the package catalog omitted those packages. `projects/media/package.json` and the `@nvidia-elements/media-v1.2.2` release tag confirm Media 1.2.2. Every version matches this clone's package metadata and release tags. All assets load from matching local builds. Rendering reports no network fallbacks or browser errors.

- Playwright `1.63.0` with installed Google Chrome `156.0.8078.74`. The `--channel chrome` flag enables H.264 decoding in the media scene.
- Sharp 0.35.5; lossless WebP, effort 6, for poster and snapshots.
- Output: VP9 WebM, 1920×1080, 30 fps, 65.6 seconds, 1,968 frames, 6.98 MB.
- Overrides: `--offline` requires local assets; `--quality 56` reduces file size from the default quality of 34. The user authorized the longer cut; `--allow-duration` permits composition beyond 60 seconds.
- Poster: title scene at 1.6 seconds, `10-2026.webp`.

## Feature snapshots

```shell
mise exec -- node .agents/skills/summarize-video-releases/scripts/render-video.js \
  --html projects/site/video/releases/10-2026/video.html \
  --stills 7.4,13.4,22.4,33.2,38.4,46.4,54.4 --snapshots --offline --channel chrome \
  --stills-dir /tmp/oct-shorter-snapshots
```

To regenerate only the media snapshot after the playback correction, use `--stills 54.4` and `--stills-dir /tmp/oct-linear-media-snapshots` with the same flags.

Copy the selected lossless WebP files into `projects/site/public/static/video/releases/` using these names:

| Published file                | Seconds | Scene                     | Post heading                                 |
| ----------------------------- | ------- | ------------------------- | -------------------------------------------- |
| `10-2026-zoom-controls.webp`  | 7.4     | Zoom in sync              | Navigate Spatial Views with Shared Controls  |
| `10-2026-joystick.webp`       | 13.4    | Choose your direction     | Choose Direction and Intensity with Joystick |
| `10-2026-tab-actions.webp`    | 22.4    | Tab actions               | Put Actions Beside Workspace Navigation      |
| `10-2026-scroll-box.webp`     | 33.2    | Follow the reply          | Follow Growing Content with Scroll Box       |
| `10-2026-progress-dot.webp`   | 38.4    | Show work in progress     | Show Ongoing Work with Progress Dot          |
| `10-2026-drag-handle.webp`    | 46.4    | Give items a move control | Give Movable Items a Drag Handle             |
| `10-2026-media-controls.webp` | 54.4    | Loop or pop out           | Repeat Playback or Keep Video in View        |

The list scene covers Tree slots and Invoker commands, beta Iframe previews, Icon Button appearance, shared internationalization support, and Monaco editor updates. These remain prose in the post, without a list-scene snapshot. Title, list, and end scenes also passed still review. All reviewed frames have empty overflow reports.

## Motion review

Viewport zoom appears first, from 3.6 to 10 seconds, followed by Joystick from 10 to 18 seconds. The media scene leads into the list scene at 57.2 seconds and the end card at 61.4 seconds.

Joystick coordinates follow eased positions sampled at 60 updates per second. Cue times precede each sample by a small offset so floating-point rounding cannot delay an update by one captured frame. Both movement and turn controls move continuously and return to center. Its scene tag reads `Beta: Joystick`. The round control shows signed X and Y values to two decimal places, synchronized with each position update. Zoom starts at an explicit scale of one. Its 1.6-second zoom-in and 1.5-second zoom-out transitions keep the connected slider synchronized. The scene lasts 6.4 seconds.

The chat demo appends each incoming text fragment to a native text node. Scroll Box handles scrolling as the response grows beyond its fixed visible height. Browser review confirmed that the response grows, scrolling advances, and the newest text stays at the bottom. No cue writes the scroll position.

The Drag Handle scene animates application-owned rows while showing the handle's pressed state. Progress Dot uses its own animation; the busy button says “Saving” without a trailing ellipsis. The media scene advances real video frames in discrete 1/30-second steps on the recording clock, enables the native loop state, and shows the available picture-in-picture control. It does not simulate a separate operating-system picture-in-picture window.

Iframe appears as a note in “Also in October.” See [feature coverage](coverage.md) for the audit of all October feature commits.

## Halloween emoji edition

The opening subtitle remains “Directional input, spatial controls, and more flexible workspaces.” The spatial view zooms into pumpkin and ghost emojis, tab labels include the same characters, and a crystal ball appears beside “Thinking.” The Drag Handle scene reorders pumpkin, ghost, and treat rows. Feature names, beta labels, timing, and technical explanations remain the same. The save button reads “Saving” without an ellipsis.
