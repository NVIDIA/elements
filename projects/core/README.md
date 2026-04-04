# @nvidia-elements/core

The design language for AI/ML factories. Provides a set of accessible, theme-ready UI elements.

- [Documentation](https://NVIDIA.github.io/elements/)
- [Changelog](https://NVIDIA.github.io/elements/docs/changelog/)
- [GitHub Repo](https://github.com/NVIDIA/elements)
- [NPM](https://registry.npmjs.org

## Getting Started

```shell
# local .npmrc file
registry=https://registry.npmjs.org

# https://registry.npmjs.org
npm login

npm install @nvidia-elements/themes @nvidia-elements/styles @nvidia-elements/core
```

Elements ships as many small packages. This allows you to choose what tools your application needs and omit anything unnecessary, improving application performance.

## Usage

```css
/* base theme */
@import '@nvidia-elements/themes/fonts/inter.css';
@import '@nvidia-elements/themes/index.css';

/* optional themes */
@import '@nvidia-elements/themes/high-contrast.css';
@import '@nvidia-elements/themes/reduced-motion.css';
@import '@nvidia-elements/themes/compact.css';
@import '@nvidia-elements/themes/dark.css';
@import '@nvidia-elements/themes/debug.css';

/* optional CSS utilities */
@import '@nvidia-elements/styles/typography.css';
@import '@nvidia-elements/styles/layout.css';
@import '@nvidia-elements/styles/view-transitions.css';
```

```typescript
// Load via typescript imports to make available in HTML templates
import '@nvidia-elements/core/button/define.js';
import '@nvidia-elements/core/dot/define.js';
...
```

```html
<!-- set global theme -->
<html nve-theme="dark" nve-transition="auto">
```

```html
<!-- use component in HTML template -->
<nve-button>hello there</nve-button>
```

## Framework Integrations

- [Angular](https://NVIDIA.github.io/elements/docs/integrations/angular/)
- [Lit](https://NVIDIA.github.io/elements/docs/integrations/lit/)
- [Preact](https://NVIDIA.github.io/elements/docs/integrations/preact/)
- [React](https://NVIDIA.github.io/elements/docs/integrations/react/)
- [TypeScript](https://NVIDIA.github.io/elements/docs/integrations/typescript/)
- [Vue](https://NVIDIA.github.io/elements/docs/integrations/vue/)
