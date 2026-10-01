# Storyboard reference

A storyboard is one JSON file that `compose-video.js` turns into the video page. It holds copy, scene order, durations, and Elements markup. It never holds absolute times, CSS for components, or layout math; the composer owns those.

## Contents

- [File shape](#file-shape)
- [Scene types](#scene-types)
- [Timing budget](#timing-budget)
- [Copy rules](#copy-rules)
- [Demo markup rules](#demo-markup-rules)
- [Visual rules](#visual-rules)
- [Review checklist](#review-checklist)

## File shape

```json
{
  "month": "08-2026",
  "title": "What’s new in NVIDIA Elements: August 2026",
  "versions": { "core": "2.6.0", "code": "2.0.4", "styles": "2.1.3", "themes": "2.0.1" },
  "imports": ["https://cdn.jsdelivr.net/npm/@nvidia-elements/media@1.0.0/controller/define.js/+esm"],
  "poster": 1.6,
  "css": "",
  "scenes": [{ "type": "title", "month": "August 2026" }]
}
```

- `versions`: exact Core, Code, Styles, and Themes versions, using each package's latest published version at generation time regardless of the release month. Resolve versions with `nve packages.list` or `nve packages.get <name>`. Refresh the pins for each new or regenerated video, including videos for older months. The composer pins these URLs. The renderer substitutes a local build only when its package version matches the pinned version.
- `imports`: extra component registrations beyond the Core and Code bundles, which are always loaded. Get the entry points from `nve api.imports.get '<markup>'` and turn each into a jsDelivr URL: `https://cdn.jsdelivr.net/npm/<package>@<exact version>/<subpath>/+esm`. Pin each package's latest published version at generation time. The renderer serves these from the local build when it can.
- `poster`: optional time in seconds for the lossless WebP poster frame, saved as `<month>.webp`. Defaults to 1.6 seconds into the title scene.
- `css`: optional storyboard-specific motion. Use it rarely; every value must be an Elements token (`var(--nve-…)`) and no selector may target an `nve-*` element.

Every scene accepts `duration` in seconds to override its default.

The version numbers in the example above illustrate the file shape. Resolve current versions before using it. Keep release labels and claims tied to the monthly post even when the rendering dependencies use newer versions.

## Scene types

### `title` (default 3.6 seconds)

Opens the video: logo, “What’s new in NVIDIA Elements”, the month in hero type, and an optional one-line summary.

```json
{ "type": "title", "month": "August 2026", "line": "New icons, data formatting, media controls, and stricter validation." }
```

Optional `kicker` replaces “What’s new in NVIDIA Elements”. Keep `line` under about 70 characters.

### `hook` (default 3.6 seconds)

Optional cold open before the title: one or two large lines and optional code chips that get a red squiggle and shake. Use it only when the month has a sharp agent-tooling story, such as lint catching invented markup.

```json
{ "type": "hook", "lines": ["Agents write UI now.", "Most of it is guessed."], "chips": ["<nv-button>", "status=\"green\""] }
```

### `feature` (default 5.4 seconds)

One highlight. `layout` is `demo` (headline beside a rendered component), `split` (headline above code and the rendered component), or `code` (headline beside a code block). The composer picks `split` when both `html` and `code` are present.

```json
{
  "type": "feature",
  "layout": "demo",
  "tag": "New: @nvidia-elements/media 1.0.0",
  "headline": "Complete media controls",
  "lede": "Compose Elements controls around your own video or audio element.",
  "html": "<nve-gauge id=\"g\" value=\"20\" aria-label=\"GPU usage\">20%</nve-gauge>",
  "zoom": 1.6,
  "cues": [{ "at": 1.2, "target": "#g", "attr": "value", "value": "72" }]
}
```

- `tag`: short context shown as a tag above the headline, such as the component or package name. Optional.
- `html`: real `nve-*` markup rendered in a quiet demo surface.
- `surface`: set to `false` to drop the demo surface when the markup brings its own container, such as an `nve-card`, so the demo does not show a card inside a card.
- `zoom`: scales the demo for legibility. Components use compact sizes for dense UIs, so most demos need 1.4–2. Use zoom instead of CSS that resizes components.
- `code`: `{ "language": "html" | "shell" | "js" | "json", "source": "…" }`. Base it on the post’s example. The composer escapes it.
- `cues`: timed changes relative to the scene start. Each cue sets `attr`, `prop`, or (with neither) the text of every element matching `target`. The first cue restores the original value before playback, so scrubbing works. Use cues to make a demo feel alive: a gauge rising, a value reformatting, a status changing.
  - `duration` (seconds) eases a numeric value from the previous one instead of jumping, which suits continuous motion such as panning or zooming a viewport. Components that animate their own changes, such as a gauge, don't need it.
  - `style` with an optional `unit` sets an inline custom property on a native wrapper, for example `{ "at": 1.4, "target": "#hand", "style": "--hand-x", "value": 150, "unit": "px", "duration": 1.1 }`. Use it to move a pointer or hand icon that demonstrates a gesture, and keep that wrapper's position driven by the property.

### `terminal` (default 5.4 seconds)

A headline beside an agent terminal that types commands and prints output. Use it for CLI and MCP features.

```json
{
  "type": "terminal",
  "headline": "The CLI knows every API",
  "lede": "Agents look up components, icons, and tokens instead of guessing.",
  "title": "agent session",
  "commands": [
    { "cmd": "nve api.get nve-badge", "out": [{ "text": "  status   'accent' | 'danger' | 'success' ...", "tone": "hl" }] }
  ],
  "stats": [{ "value": 267, "label": "icons" }]
}
```

`tone` is `hl`, `ok`, or `bad`. `stats` count up beneath the opening line. The composer warns when typing runs past the scene; trim output rather than speeding it up.

### `fix` (default 6.6 seconds)

Lint catching problems and the agent fixing them in place. This is the strongest scene for lint and validation features.

```json
{
  "type": "fix",
  "headline": "Validation before release",
  "lede": "New rules flag misplaced full-width containers and too many primary actions.",
  "file": "toolbar.html",
  "lines": [
    "<nve-card>",
    ["  <nve-toolbar", { "bad": " container=\"full\"", "good": "" }, ">"],
    "</nve-card>"
  ],
  "problems": [{ "level": "error", "loc": "2:16", "rule": "no-restricted-container-full", "message": "Requires the template root or a direct child of nve-page." }],
  "pass": "Validation passed. 1 file, 0 errors, 0 warnings.",
  "html": "<nve-button interaction=\"emphasis\">Deploy</nve-button>"
}
```

Each line is a string or an array of strings and `{ bad, good, level }` swaps. Swaps get a squiggle, then shrink and grow into the fix; widths are exact because the editor uses a fixed-width font. `good` may be empty to show a removal. Optional `html` renders the fixed result after the pass message.

### `list` (default 4.2 seconds)

Rapid-fire secondary changes as stamped cards, two to four items. Items take `icon` (an `nve-icon` name) or `stat` (`{ prefix, value, suffix, decimals }`, which counts up), plus `text`.

```json
{ "type": "list", "headline": "Also in August", "items": [{ "stat": { "prefix": "−", "value": 22, "suffix": "%" }, "text": "Core JavaScript" }] }
```

### `end` (default 4.2 seconds)

Logo, headline (defaults to “NVIDIA Elements”), a call to read the post, the post URL, and optional `command` and `packages` tags.

```json
{ "type": "end", "line": "Read the August 2026 update", "url": "nvidia.github.io/elements/docs/whats-new/08-2026/", "packages": ["core 2.6.0", "media 1.0.0"] }
```

## Timing budget

The composer rejects videos outside 24–36 seconds. Scene defaults hold each view 20% longer than the earlier pacing. Entrance animations, typing, and cue offsets keep their normal speed, giving viewers more time to read the completed content before the next transition. A typical month:

| Scene                                 | Seconds      |
| ------------------------------------- | ------------ |
| `title`                               | 3.6          |
| 2–4 × `feature`, `terminal`, or `fix` | 4.8–6.6 each |
| `list`                                | 4.2          |
| `end`                                 | 4.2          |

Allow at least 4.8 seconds for a feature and check that its completed content stays visible long enough to read. If the month has more than four headline changes, move the rest into the `list` scene rather than shortening scenes. When revising older pacing, multiply each existing scene duration by 1.2, including explicit `duration` overrides. Update snapshot times from the recomposed scene starts; select the same completed demo state within each scene.

## Copy rules

- Take every claim from the post. The video is a teaser for the post, never a source of new information.
- Headlines state the user outcome in six words or fewer and 34 characters or fewer. Rewrite post headings rather than copying them; “Present Operational Data with Context” becomes “Operational data, readable”.
- Use sentence case. Some components apply their own casing: `nve-button` and `nve-steps-item` title-case their labels, so keep those labels to one or two words.
- Opening lines are one sentence of 60–90 characters. Skip the opening line when the demo explains itself.
- Numbers must come from the post or from real command output. Counters are for measured values such as bundle savings or icon counts, never for decoration.
- Lead with the most visible new capability. When the month includes CLI, MCP, lint, or agent-skill changes, give them a `terminal` or `fix` scene: Elements is the UI toolkit built for AI agents, and tooling is the story that sets it apart.
- Terminal output and lint diagnostics must be real. Run the command, then shorten long lines without changing their meaning, and keep rule names exact.

## Demo markup rules

Demo markup follows the `elements` skill: look up every tag, attribute, and value with the CLI before writing it.

- Time demo entrances relative to the scene with `style="--at: +0.8s"` on a native wrapper element using the `pop`, `rise`, or `stamp` classes. The composer converts these to absolute times.
- Animate native wrapper elements, never `nve-*` elements; components keep their own styles.
- `nve-layout` needs a gap on `row`, `column`, and `grid`, or lint fails.
- `column` layouts size children to their content. Components that fit to available width, such as `nve-format-truncate`, need `align:horizontal-stretch` on each ancestor column and a block wrapper (`div`, not `span`).
- Badges inside grid cells need `container="flat"`.
- `container="full"` is valid only at the template root or directly inside `nve-page`.
- Wrap long attributes onto new lines in `code` so no line exceeds 52 characters in `split` and 64 in `code`; the composer warns otherwise.
- Playwright’s bundled Chromium cannot decode H.264 video. For `<video>` demos, render with `--channel chrome` (an installed Google Chrome decodes H.264), or set `poster` to an existing still, either from `projects/site/public/static/` or saved into the working directory and referenced as `poster="/__video/<file>.webp"`.

- The renderer serves `/static/…` from `projects/site/public/static/` and `/__video/…` from the storyboard’s working directory.

## Visual rules

The shell template already implements these; follow them in any `css` or demo markup.

- Dark theme, token colors only. No gradients, blur glows, or hard-coded colors.
- Brand green belongs to the logo. Motion and emphasis use neutral emphasis borders and text; the semantic danger, warning, and success colors mean exactly that.
- Large type scales with `--nve-ref-font-size-1200`; everything else uses the type, space, radius, and shadow tokens.
- One idea per scene, a clear focal point, and generous empty space. If a still looks busy, cut an element.

## Review checklist

Check every still from `render-video.js --stills`:

- The overflow report is empty for every still.
- Headlines fit on one or two lines and never break a short phrase awkwardly.
- Every component rendered; no empty demo surfaces or raw tag text.
- Demo content is large enough to read at 1080p without pausing.
- Code blocks show all lines without horizontal scrolling.
- Terminal typing and fix swaps finish before the scene fades.
- The end card shows the correct month and post URL.

For each feature snapshot selected for the monthly post, also check that it shows the relevant demo state or completed command result, makes sense without playback, and remains readable at the post's content width. Publish snapshots only from `feature`, `terminal`, and `fix` scenes, using `render-video.js --stills <times> --snapshots`. Review `list` scenes such as “Also in …” for the video; the post covers their smaller updates in Markdown text. Match each published image to the paragraph explaining its contents.
