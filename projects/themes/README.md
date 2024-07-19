# @nvidia-elements/themes

Built in design tokens and theme for Elements

[![Latest Release](https://github.com/NVIDIA/elements/-/badges/release.svg)](https://github.com/NVIDIA/elements/-/releases)
[![pipeline status](https://github.com/NVIDIA/elements/badges/main/pipeline.svg)](https://github.com/NVIDIA/elements/-/commits/main)

## Getting Started

```bash
# local .npmrc file
registry=https://registry.npmjs.org

# https://registry.npmjs.org
npm login

# install core dependencies
npm install @nvidia-elements/themes
```

```css
/* import the theme CSS into your project */
@import '@nvidia-elements/themes/dist/index.css';
```

| Theme                            | Description          |
| -------------------------------- | -------------------- |
| `@nvidia-elements/themes/index.css`          | Default theme        |
| `@nvidia-elements/themes/high-contrast.css`  | High contrast theme  |
| `@nvidia-elements/themes/reduced-motion.css` | Reduced motion theme |
| `@nvidia-elements/themes/compact.css`        | Compact theme        |
| `@nvidia-elements/themes/dark.css`           | Dark theme           |

## Development

- `ci`: run full build/lint/test
- `build`: run library build
