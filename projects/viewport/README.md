# @nvidia-elements/viewport

NVIDIA Design System and UI Agent Harness for AI/ML Factories, Robotics, and Autonomous Vehicles.

Web Components for navigating spatial content with pan, zoom, content fitting, background grids, and a minimap.

- [Documentation](https://NVIDIA.github.io/elements/docs/viewport/)
- [Changelog](https://NVIDIA.github.io/elements/docs/changelog/)
- [GitHub Repo](https://github.com/NVIDIA/elements)
- [npm](https://www.npmjs.com/package/@nvidia-elements/viewport)

## Components

| Component                                                               | Tag                      | Description                                                               |
| ----------------------------------------------------------------------- | ------------------------ | ------------------------------------------------------------------------- |
| [Viewport](https://NVIDIA.github.io/elements/docs/viewport/)            | `nve-viewport`           | A spatial surface with optional pan, zoom, and content fitting.           |
| [Gridlines](https://NVIDIA.github.io/elements/docs/viewport/gridlines/) | `nve-viewport-gridlines` | A background grid with lines, dots, or crosses that adapts to zoom.       |
| [Minimap](https://NVIDIA.github.io/elements/docs/viewport/minimap/)     | `nve-viewport-minimap`   | A content overview with a visible region indicator and direct navigation. |

## Getting Started

Install the package and its peer dependencies:

```shell
npm install @nvidia-elements/viewport @nvidia-elements/core @nvidia-elements/themes
```

Load the base theme in your application's stylesheet:

```css
@import '@nvidia-elements/themes/index.css';
```

## Usage

Register each component your application uses through its own entrypoint:

```javascript
import '@nvidia-elements/viewport/viewport/define.js';
import '@nvidia-elements/viewport/gridlines/define.js';
import '@nvidia-elements/viewport/minimap/define.js';
```

```html
<nve-viewport autofit fit-inset="24" behavior-pan behavior-zoom style="height: 420px;">
  <nve-viewport-gridlines pattern="dots"></nve-viewport-gridlines>

  <svg
    role="img"
    aria-label="Spatial content"
    width="900"
    height="600"
    viewBox="0 0 900 600"
    style="position: absolute; left: 0; top: 0;"
  >
    <circle cx="200" cy="400" r="100" fill="var(--nve-sys-support-accent-color)"></circle>
    <rect x="350" y="100" width="200" height="200" rx="24" fill="var(--nve-sys-text-muted-color)"></rect>
  </svg>

  <nve-viewport-minimap></nve-viewport-minimap>
</nve-viewport>
```

Place spatial content in the default slot. Gridlines and Minimap must be direct children of the viewport; they use the `background` and `overlay` slots automatically.

`behavior-pan` and `behavior-zoom` enable user navigation. Use `behavior-pan="space"` to require Space for primary pointer panning when content handles its own drag interactions. `autofit` frames the initial content, and `fit-inset` controls the space around it.

Gridlines supports `lines`, `dots`, and `crosses` patterns. Minimap draws rectangles for the viewport's content elements; provide content in its `preview` slot to replace them with a custom preview.

## Programmatic Navigation

Use `reveal()` to frame a content region and `fitContents()` to frame all content:

```javascript
const viewport = document.querySelector('nve-viewport');

viewport.reveal({ x: 0, y: 0, width: 900, height: 600 }, { animated: true });
viewport.fitContents({ animated: true });
```

Listen for `viewportchange` to observe committed transform changes. The event detail contains the current `x`, `y`, and `scale` values.

## NVIDIA Elements Skill

Install the Elements agent skill with the open [skills](https://www.skills.sh/nvidia/elements/elements) CLI:

```shell
npx skills add https://github.com/nvidia/elements --skill elements
```
