# @nvidia-elements/foundations

NVIDIA UI SDK and agent-ready developer toolkit for AI factories, robotics, and autonomous vehicles.

Shared components and utilities for NVIDIA Elements libraries and custom component development. Elements packages use foundations to share components and behavior without depending directly on `@nvidia-elements/core`. Advanced users can also use its utility components and internal helpers when building their own Web Components.

- [Documentation](https://NVIDIA.github.io/elements/)
- [Changelog](https://NVIDIA.github.io/elements/docs/changelog/)
- [GitHub Repo](https://github.com/NVIDIA/elements)
- [npm](https://www.npmjs.com/package/@nvidia-elements/foundations)

## Internal Utilities

Shared helpers support element registration, styling, and other library implementation details. The `/internal` entrypoint provides a semi-public API for Elements packages and advanced component authors but are not API stable:

```javascript
import { define, useStyles } from '@nvidia-elements/foundations/internal';
```

## Public Utility Components

Utility components have separate entrypoints for application and library use. The package currently provides:

| Component | Tag | Description |
| --------- | --- | ----------- |
| [Scroll Box](https://NVIDIA.github.io/elements/docs/elements/scroll-box/) | `nve-scroll-box` | A scrollable container with optional edge shadows and automatic scrolling. |

## Getting Started

Install the package and its peer dependency:

```shell
npm install @nvidia-elements/foundations @nvidia-elements/themes
```

Load the base theme in your application's stylesheet:

```css
@import '@nvidia-elements/themes/index.css';
```

## NVIDIA Elements Skill

Install the Elements agent skill with the open [skills](https://www.skills.sh/nvidia/elements/elements) CLI:

```shell
npx skills add https://github.com/nvidia/elements --skill elements
```
